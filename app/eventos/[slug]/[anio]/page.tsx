import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Evento = {
  id: number;
  nombre: string;
  descripcion: string | null;
  logo: string | null;
  slug: string;
  fondo: string | null;
};

type Edicion = {
  id: number;
  evento_id: number;
  año: string;
  fecha: string;
};

type Premio = {
  id: number;
  persona_id: number;
  edicion_id: number;
  nombre: string;
  descripcion: string | null;
  imagen: string | null;
};

type Participacion = {
  id: number;
  persona_id: number;
  edicion_id: number;
  posicion: number | null;
  puntos_finales: number | null;
};

type Persona = {
  id: number;
  nombre: string;
  imagen: string | null;
};

function nombreCorto(nombre: string) {
  const partes = nombre.trim().split(/\s+/);

  if (partes.length === 1) {
    return partes[0];
  }

  return `${partes[0]} ${partes[partes.length - 2]}`;
}

function formatearFecha(fecha: string) {
  const valor = new Date(`${fecha}T00:00:00`);

  if (Number.isNaN(valor.getTime())) {
    return fecha;
  }

  return valor.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function EdicionPage({
  params,
}: {
  params: Promise<{
    slug: string;
    anio: string;
  }>;
}) {
  const { slug, anio } = await params;

  const { data: eventoData, error: eventoError } =
    await supabase
      .from("eventos")
      .select(
        "id, nombre, descripcion, logo, slug, fondo"
      )
      .eq("slug", slug)
      .single();

  if (eventoError || !eventoData) {
    notFound();
  }

  const evento = eventoData as Evento;

  const { data: edicionData, error: edicionError } =
    await supabase
      .from("ediciones")
      .select("id, evento_id, fecha")
      .eq("evento_id", evento.id)
      .filter("año", "eq", anio)
      .single();

  if (edicionError || !edicionData) {
    notFound();
  }

  const edicion = {
    ...edicionData,
    año: anio,
  } as Edicion;

  const [
    { data: premiosData },
    { data: participacionesData },
  ] = await Promise.all([
    supabase
      .from("premios")
      .select(
        "id, persona_id, edicion_id, nombre, descripcion, imagen"
      )
      .eq("edicion_id", edicion.id),
    supabase
      .from("participaciones")
      .select(
        "id, persona_id, edicion_id, posicion, puntos_finales"
      )
      .eq("edicion_id", edicion.id)
      .not("posicion", "is", null)
      .order("posicion", {
        ascending: true,
      }),
  ]);

  const premios = (premiosData ??
    []) as Premio[];

  const participaciones = (participacionesData ??
    []) as Participacion[];

  const personaIds = Array.from(
    new Set([
      ...premios.map((premio) => premio.persona_id),
      ...participaciones.map(
        (participacion) => participacion.persona_id
      ),
    ])
  );

  let personas: Persona[] = [];

  if (personaIds.length > 0) {
    const { data: personasData } = await supabase
      .from("personas")
      .select("id, nombre, imagen")
      .in("id", personaIds);

    personas = (personasData ??
      []) as Persona[];
  }

  const personaPorId = new Map(
    personas.map((persona) => [
      persona.id,
      persona,
    ])
  );

  const premio = premios[0];

  const campeon = premio
    ? personaPorId.get(premio.persona_id)
    : participaciones.find(
        (participacion) =>
          participacion.posicion === 1
      )
      ? personaPorId.get(
          participaciones.find(
            (participacion) =>
              participacion.posicion === 1
          )!.persona_id
        )
      : undefined;

  return (
    <main
      className="relative min-h-screen bg-cover bg-center bg-fixed text-white"
      style={{
        backgroundImage: evento.fondo
          ? `url("${evento.fondo}")`
          : undefined,
        backgroundColor: "#080808",
      }}
    >
      <div className="fixed inset-0 z-0 bg-black/70" />

      <div className="relative z-10">
        <section className="border-b border-white/10">
          <div className="mx-auto max-w-7xl px-6 py-24 text-center">
            {evento.logo && (
              <img
                src={evento.logo}
                alt={evento.nombre}
                className="mx-auto max-h-40 max-w-sm object-contain"
              />
            )}

            <p className="mt-10 text-sm font-semibold uppercase tracking-[0.4em] text-violet-400">
              Edición
            </p>

            <h1 className="mt-4 text-6xl font-black md:text-8xl">
              {edicion.año}
            </h1>

            <p className="mt-5 text-lg text-zinc-400">
              {formatearFecha(edicion.fecha)}
            </p>

            <Link
              href={`/eventos/${evento.slug}`}
              className="mt-8 inline-flex rounded-full border border-white/10 px-6 py-3 text-sm font-semibold transition hover:bg-white/5"
            >
              ← {evento.nombre}
            </Link>
          </div>
        </section>

        {campeon && (
          <section className="mx-auto max-w-5xl px-6 py-24">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/90">
              <div className="grid md:grid-cols-2">
                <div className="flex flex-col justify-center p-10 md:p-14">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-400">
                    Campeón
                  </p>

                  <h2 className="mt-4 text-5xl font-black">
                    {nombreCorto(campeon.nombre)}
                  </h2>

                  {premio?.nombre && (
                    <p className="mt-4 text-lg text-zinc-400">
                      {premio.nombre}
                    </p>
                  )}

                  {premio?.descripcion && (
                    <p className="mt-6 leading-7 text-zinc-300">
                      {premio.descripcion}
                    </p>
                  )}
                </div>

                <div className="relative min-h-[400px] bg-black">
                  {premio?.imagen ? (
                    <img
                      src={premio.imagen}
                      alt={nombreCorto(
                        campeon.nombre
                      )}
                      className="h-full w-full object-cover"
                    />
                  ) : campeon.imagen ? (
                    <img
                      src={campeon.imagen}
                      alt={nombreCorto(
                        campeon.nombre
                      )}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full min-h-[400px] items-center justify-center text-8xl">
                      🏆
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="border-y border-white/10 bg-black/40">
          <div className="mx-auto max-w-7xl px-6 py-24">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
                Resultados
              </p>

              <h2 className="mt-4 text-5xl font-black">
                PODIO
              </h2>
            </div>

            {participaciones.length > 0 ? (
              <div className="mx-auto mt-14 max-w-3xl space-y-4">
                {participaciones
                  .slice(0, 3)
                  .map((participacion) => {
                    const persona =
                      personaPorId.get(
                        participacion.persona_id
                      );

                    if (!persona) return null;

                    const posicion =
                      participacion.posicion;

                    return (
                      <div
                        key={participacion.id}
                        className="flex items-center gap-5 rounded-2xl border border-white/10 bg-zinc-950/80 p-5"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/5 text-xl font-black">
                          {posicion === 1
                            ? "🥇"
                            : posicion === 2
                              ? "🥈"
                              : "🥉"}
                        </div>

                        <div className="flex-1">
                          <p className="text-lg font-bold">
                            {nombreCorto(
                              persona.nombre
                            )}
                          </p>

                          <p className="text-sm text-zinc-500">
                            {posicion}° lugar
                          </p>
                        </div>

                        {participacion.puntos_finales !==
                          null && (
                          <p className="text-sm font-semibold text-violet-400">
                            {
                              participacion.puntos_finales
                            }{" "}
                            pts
                          </p>
                        )}
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="mx-auto mt-14 max-w-2xl rounded-3xl border border-dashed border-white/10 p-12 text-center">
                <p className="text-4xl opacity-20">
                  🏆
                </p>

                <p className="mt-5 text-zinc-500">
                  Todavía no hay resultados registrados
                  para esta edición.
                </p>
              </div>
            )}
          </div>
        </section>

        <footer className="border-t border-white/10 bg-black/60 px-6 py-10">
          <div className="mx-auto max-w-7xl text-sm text-zinc-500">
            THE GAME ARCHIVE · {evento.nombre}{" "}
            {edicion.año}
          </div>
        </footer>
      </div>
    </main>
  );
}