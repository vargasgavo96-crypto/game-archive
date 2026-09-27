import { supabase } from "@/lib/supabase";
import EditarTexto from "@/app/components/EditarTexto";

type Evento = {
  id: number;
  nombre: string;
  descripcion: string | null;
  logo: string | null;
  slug: string;
  historia: string | null;
  como_nacio: string | null;
};

type Edicion = {
  id: number;
  evento_id: number;
  año: string;
  fecha: string;
};

type Persona = {
  id: number;
  nombre: string;
  imagen: string | null;
};

type Participacion = {
  id: number;
  persona_id: number;
  edicion_id: number;
  posicion: number | null;
  puntos_finales: number | null;
};

type Premio = {
  id: number;
  persona_id: number;
  edicion_id: number;
  nombre: string;
  descripcion: string | null;
  imagen: string | null;
};

function nombreCorto(nombre: string) {
  const partes = nombre.trim().split(/\s+/);

  if (partes.length === 1) {
    return partes[0];
  }

  return `${partes[0]} ${partes[partes.length - 2]}`;
}

export default async function PijamadaRealPage() {
  const {
    data: evento,
    error: eventoError,
  } = await supabase
    .from("eventos")
    .select(
      "id, nombre, descripcion, logo, slug, historia, como_nacio"
    )
    .eq("slug", "pijamada-real")
    .single();

  if (eventoError || !evento) {
    console.error(
      "Error cargando La Pijamada Real:",
      eventoError
    );

    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-400">
            No se pudo cargar La Pijamada Real
          </h1>

          <p className="mt-3 text-zinc-400">
            El evento no pudo ser encontrado.
          </p>
        </div>
      </main>
    );
  }

  const {
    data: edicionesData,
    error: edicionesError,
  } = await supabase
    .from("ediciones")
    .select("*")
    .eq("evento_id", evento.id)
    .order("fecha", {
      ascending: false,
    });

  if (edicionesError) {
    console.error(
      "Error cargando ediciones:",
      edicionesError
    );
  }

  const ediciones: Edicion[] = edicionesData ?? [];

  const edicionIds = ediciones.map(
    (edicion) => edicion.id
  );

  const {
    data: premiosData,
    error: premiosError,
  } = edicionIds.length
    ? await supabase
        .from("premios")
        .select(
          "id, persona_id, edicion_id, nombre, descripcion, imagen"
        )
        .in("edicion_id", edicionIds)
    : {
        data: [],
        error: null,
      };

  if (premiosError) {
    console.error(
      "Error cargando premios:",
      premiosError
    );
  }

  const premios: Premio[] = premiosData ?? [];

  const {
    data: participacionesData,
    error: participacionesError,
  } = edicionIds.length
    ? await supabase
        .from("participaciones")
        .select(
          "id, persona_id, edicion_id, posicion, puntos_finales"
        )
        .in("edicion_id", edicionIds)
        .eq("posicion", 1)
    : {
        data: [],
        error: null,
      };

  if (participacionesError) {
    console.error(
      "Error cargando participaciones:",
      participacionesError
    );
  }

  const participacionesGanadoras: Participacion[] =
    participacionesData ?? [];

  const personaIds = [
    ...new Set([
      ...premios.map(
        (premio) => premio.persona_id
      ),
      ...participacionesGanadoras.map(
        (participacion) =>
          participacion.persona_id
      ),
    ]),
  ];

  const {
    data: personasData,
    error: personasError,
  } = personaIds.length
    ? await supabase
        .from("personas")
        .select("id, nombre, imagen")
        .in("id", personaIds)
    : {
        data: [],
        error: null,
      };

  if (personasError) {
    console.error(
      "Error cargando personas:",
      personasError
    );
  }

  const personas: Persona[] = personasData ?? [];

  const personaPorId = new Map(
    personas.map((persona) => [
      persona.id,
      persona,
    ])
  );

  const premioPorEdicion = new Map(
    premios.map((premio) => [
      premio.edicion_id,
      premio,
    ])
  );

  const participacionPorEdicion = new Map(
    participacionesGanadoras.map(
      (participacion) => [
        participacion.edicion_id,
        participacion,
      ]
    )
  );

  const historia =
    evento.historia ??
    "La Pijamada Real es un evento de THE GAME ARCHIVE.";

  const comoNacio =
    evento.como_nacio ??
    "Una instancia para compartir, jugar y crear recuerdos.";

  return (
    <main className="relative min-h-screen text-white">

      {/* ================================================== */}
      {/* FONDO */}
      {/* ================================================== */}

      <div className="fixed inset-0 z-0 overflow-hidden">

        <img
          src="/eventos/pijamada-reall.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-black/55" />

      </div>

      {/* ================================================== */}
      {/* CONTENIDO */}
      {/* ================================================== */}

      <div className="relative z-10">

        {/* ================================================== */}
        {/* HERO */}
        {/* ================================================== */}

        <section className="relative overflow-hidden border-b border-white/10">

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.25),_transparent_50%)]" />

          <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center">

            {evento.logo && (
              <img
                src={evento.logo}
                alt={evento.nombre}
                className="max-h-72 max-w-md object-contain"
              />
            )}

            <p className="mt-12 text-sm font-semibold uppercase tracking-[0.4em] text-violet-400">
              Nuestro evento
            </p>

            <div className="mt-4 w-full">
              <EditarTexto
                valor={evento.nombre}
                campo="nombre"
                eventoId={evento.id}
                claseTexto="text-5xl font-black md:text-7xl"
              />
            </div>

            <div className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-zinc-300">
              <EditarTexto
                valor={evento.descripcion ?? ""}
                campo="descripcion"
                eventoId={evento.id}
                multilinea
              />
            </div>

          </div>

        </section>

        {/* ================================================== */}
        {/* HISTORIA */}
        {/* ================================================== */}

        <section className="mx-auto max-w-5xl px-6 py-24 text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
            La historia
          </p>

          <h2 className="mt-4 text-4xl font-bold md:text-5xl">
            ¿Qué es La Pijamada Real?
          </h2>

          <div className="mt-10 text-lg leading-8 text-zinc-300">
            <EditarTexto
              valor={historia}
              campo="historia"
              eventoId={evento.id}
              multilinea
            />
          </div>

          <div className="mt-8 text-lg leading-8 text-zinc-300">
            <EditarTexto
              valor={comoNacio}
              campo="como_nacio"
              eventoId={evento.id}
              multilinea
            />
          </div>

        </section>

        {/* ================================================== */}
        {/* EDICIONES */}
        {/* ================================================== */}

        <section className="border-y border-white/10 bg-black/40">

          <div className="mx-auto max-w-7xl px-6 py-24">

            <div className="text-center">

              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
                Archivo histórico
              </p>

              <h2 className="mt-4 text-5xl font-black">
                EDICIONES
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-zinc-300">
                Las ediciones de La Pijamada Real aparecerán aquí.
              </p>

            </div>

            {ediciones.length === 0 ? (

              <div className="mx-auto mt-14 max-w-2xl rounded-3xl border border-white/10 bg-zinc-900/90 p-12 text-center">

                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
                  Próximamente
                </p>

                <h3 className="mt-5 text-4xl font-black md:text-5xl">
                  La Pijamada Real
                </h3>

                <p className="mt-5 text-lg text-zinc-300">
                  Las ediciones de La Pijamada Real aparecerán aquí.
                </p>

              </div>

            ) : (

              <div className="mt-14 grid gap-8 md:grid-cols-2">

                {ediciones.map((edicion) => {

                  const premio =
                    premioPorEdicion.get(edicion.id);

                  const participacion =
                    participacionPorEdicion.get(edicion.id);

                  const ganadorId =
                    premio?.persona_id ??
                    participacion?.persona_id;

                  const ganador = ganadorId
                    ? personaPorId.get(ganadorId)
                    : undefined;

                  const imagenGanador =
                    premio?.imagen ??
                    ganador?.imagen;

                  return (
                    <a
                      key={edicion.id}
                      href={`/eventos/pijamada-real/${edicion.año}`}
                      className="group overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/90 transition duration-300 hover:-translate-y-2 hover:border-violet-500/50"
                    >

                      <div className="relative h-[520px] overflow-hidden bg-zinc-900">

                        {imagenGanador && (
                          <div
                            className="absolute inset-0 scale-110 bg-cover bg-center opacity-30 blur-2xl transition duration-700 group-hover:scale-125"
                            style={{
                              backgroundImage: `url('${imagenGanador}')`,
                            }}
                          />
                        )}

                        <div className="absolute inset-0 bg-black/40" />

                        {imagenGanador ? (
                          <img
                            src={imagenGanador}
                            alt={
                              ganador
                                ? nombreCorto(ganador.nombre)
                                : "Ganador de La Pijamada Real"
                            }
                            className="relative z-10 h-full w-full object-cover object-center transition duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <img
                            src={
                              evento.logo ??
                              "/logos/pijamada-real.png"
                            }
                            alt="La Pijamada Real"
                            className="relative z-10 h-full w-full object-contain p-20 opacity-60"
                          />
                        )}

                        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black via-black/30 to-transparent" />

                        <div className="absolute bottom-8 left-8 z-30">

                          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
                            Edición
                          </p>

                          <h3 className="mt-2 text-7xl font-black tracking-tight">
                            {edicion.año}
                          </h3>

                        </div>

                      </div>

                      <div className="border-t border-white/10 bg-zinc-900/95 p-8">

                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                          {premio?.nombre ??
                            "Ganador de la edición"}
                        </p>

                        <p className="mt-2 text-2xl font-bold">
                          {ganador
                            ? nombreCorto(ganador.nombre)
                            : "Por definir"}
                        </p>

                        <p className="mt-6 text-sm font-semibold text-zinc-500 transition group-hover:text-violet-400">
                          VER EDICIÓN →
                        </p>

                      </div>

                    </a>
                  );
                })}

              </div>

            )}

          </div>

        </section>

        {/* ================================================== */}
        {/* FOOTER */}
        {/* ================================================== */}

        <footer className="border-t border-white/10 bg-black/40 px-6 py-10">

          <div className="mx-auto flex max-w-7xl justify-between text-sm text-zinc-500">

            <p>
              THE GAME ARCHIVE
            </p>

            <p>
              Juegos · Eventos · Campeones
            </p>

          </div>

        </footer>

      </div>
    </main>
  );
}