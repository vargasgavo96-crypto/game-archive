import { supabase } from "@/lib/supabase";
import GaleriaFotos from "@/app/components/GaleriaFotos";

type Evento = {
  id: number;
  nombre: string;
  descripcion: string;
  logo: string | null;
  slug: string;
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

const IMAGEN_GANADOR = "/campeones/campeonhalloween2025.png";
const ID_GANADOR = 4;

function nombreCorto(nombre: string) {
  const partes = nombre.trim().split(/\s+/);

  if (partes.length === 1) {
    return partes[0];
  }

  return `${partes[0]} ${partes[partes.length - 2]}`;
}

function nombreWeb(nombre: string) {
  const nombreNormalizado = nombre.trim().toLowerCase();

  if (
    nombreNormalizado ===
    "ángelo gabriel pérez oyarzo".toLowerCase()
  ) {
    return "Ángelo Pérez";
  }

  return nombreCorto(nombre);
}

function posicionTexto(posicion: number | null) {
  if (posicion === 1) return "1° lugar";
  if (posicion === 2) return "2° lugar";
  if (posicion === 3) return "3° lugar";

  return "Participante";
}

function posicionEmoji(posicion: number | null) {
  if (posicion === 1) return "🥇";
  if (posicion === 2) return "🥈";
  if (posicion === 3) return "🥉";

  return "🎃";
}

export default async function Halloween2025Page() {
  const { data: evento, error: eventoError } = await supabase
    .from("eventos")
    .select("id, nombre, descripcion, logo, slug")
    .eq("slug", "halloween")
    .single();

  if (eventoError || !evento) {
    console.error("Error cargando Halloween:", eventoError);

    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-400">
            No se pudo cargar Halloween
          </h1>

          <p className="mt-3 text-zinc-400">
            El evento no pudo ser encontrado en Supabase.
          </p>
        </div>
      </main>
    );
  }

  const { data: edicion, error: edicionError } = await supabase
    .from("ediciones")
    .select("id, evento_id, año, fecha")
    .eq("evento_id", evento.id)
    .eq("año", "2025")
    .single();

  if (edicionError || !edicion) {
    console.error("Error cargando edición:", edicionError);

    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-400">
            No se pudo cargar Halloween 2025
          </h1>

          <p className="mt-3 text-zinc-400">
            La edición todavía no está registrada.
          </p>
        </div>
      </main>
    );
  }

  const { data: participacionesData, error: participacionesError } =
    await supabase
      .from("participaciones")
      .select("id, persona_id, edicion_id, posicion, puntos_finales")
      .eq("edicion_id", edicion.id)
      .order("posicion", { ascending: true, nullsFirst: false });

  if (participacionesError) {
    console.error(
      "Error cargando participaciones:",
      participacionesError
    );
  }

  const participaciones: Participacion[] =
    participacionesData ?? [];

  const idsPersonas = Array.from(
    new Set([
      ID_GANADOR,
      ...participaciones.map(
        (participacion) => participacion.persona_id
      ),
    ])
  );

  const { data: personasData, error: personasError } = await supabase
    .from("personas")
    .select("id, nombre, imagen")
    .in("id", idsPersonas);

  if (personasError) {
    console.error("Error cargando personas:", personasError);
  }

  const personas: Persona[] = personasData ?? [];

  const personaPorId = new Map(
    personas.map((persona) => [persona.id, persona])
  );

  const campeon =
    personaPorId.get(ID_GANADOR) ??
    ({
      id: ID_GANADOR,
      nombre: "Ángelo Pérez",
      imagen: null,
    } satisfies Persona);

  const listaParticipaciones = [...participaciones];

  if (
    !listaParticipaciones.some(
      (participacion) => participacion.persona_id === ID_GANADOR
    )
  ) {
    listaParticipaciones.unshift({
      id: -1,
      persona_id: ID_GANADOR,
      edicion_id: edicion.id,
      posicion: 1,
      puntos_finales: null,
    });
  }

  const podio = listaParticipaciones
    .filter(
      (participacion) =>
        participacion.posicion !== null &&
        participacion.posicion <= 3
    )
    .sort(
      (a, b) =>
        (a.posicion ?? 99) - (b.posicion ?? 99)
    );

  const participantes = listaParticipaciones
    .map((participacion) => ({
      participacion,
      persona: personaPorId.get(participacion.persona_id),
    }))
    .filter(
      (
        item
      ): item is {
        participacion: Participacion;
        persona: Persona;
      } => Boolean(item.persona)
    );

  return (
    <main
      className="relative min-h-screen bg-cover bg-center bg-fixed text-white"
      style={{
        backgroundImage: "url('/eventos/halloween.png')",
      }}
    >
      <div className="fixed inset-0 z-0 bg-black/65" />

      <div className="relative z-10">
        {/* HERO / PORTADA */}
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,92,0,0.25),_transparent_50%)]" />

          <div className="relative mx-auto flex min-h-[700px] max-w-7xl flex-col items-center justify-center px-6 py-24 text-center">
            {evento.logo && (
              <img
                src={evento.logo}
                alt={evento.nombre}
                className="max-h-[420px] max-w-2xl object-contain drop-shadow-[0_0_45px_rgba(255,100,0,0.3)]"
              />
            )}

            <p className="mt-10 text-sm font-semibold uppercase tracking-[0.4em] text-orange-400">
              Edición 2025
            </p>

            <h1 className="mt-4 text-6xl font-black uppercase tracking-tight md:text-8xl">
              HALLOWEEN
            </h1>

            <p className="mt-4 text-3xl font-bold text-white/80">
              2025
            </p>
          </div>
        </section>

        {/* ¿CÓMO FUE ESTA EDICIÓN? */}
        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400">
            La celebración
          </p>

          <h2 className="mt-4 text-4xl font-bold md:text-5xl">
            ¿Cómo fue esta edición?
          </h2>

          <div className="mt-8 space-y-6 text-lg leading-8 text-zinc-300">
            <p>
              Halloween 2025 fue una nueva edición de nuestra
              celebración de Halloween.
            </p>

            <p>
              Esta edición contó con actividades, juegos y un
              torneo de disfraces para elegir al ganador.
            </p>
          </div>
        </section>

        {/* PARTICIPANTES */}
        <section className="border-y border-white/10 bg-black/40">
          <div className="mx-auto max-w-7xl px-6 py-24">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400">
                La competencia
              </p>

              <h2 className="mt-4 text-5xl font-black md:text-6xl">
                PARTICIPANTES
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-zinc-300">
                Quienes formaron parte de Halloween 2025.
              </p>
            </div>

            {participantes.length === 0 ? (
              <div className="mx-auto mt-14 max-w-xl rounded-3xl border border-white/10 bg-zinc-900/80 p-10 text-center">
                <p className="text-zinc-400">
                  Todavía no hay participantes registrados.
                </p>
              </div>
            ) : (
              <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {participantes.map(
                  ({ participacion, persona }) => (
                    <div
                      key={participacion.id}
                      className="group rounded-3xl border border-white/10 bg-zinc-900/90 p-6 transition duration-300 hover:-translate-y-2 hover:border-orange-500/40"
                    >
                      <div className="flex items-center gap-5">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-black">
                          {persona.imagen ? (
                            <img
                              src={persona.imagen}
                              alt={nombreWeb(persona.nombre)}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl">
                              🎃
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-lg font-bold text-white">
                            {nombreWeb(persona.nombre)}
                          </p>

                          <p className="mt-1 text-sm text-zinc-500">
                            {posicionTexto(
                              participacion.posicion
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </section>

        {/* PODIO */}
        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400">
              Resultados
            </p>

            <h2 className="mt-4 text-5xl font-black md:text-6xl">
              PODIO
            </h2>
          </div>

          {podio.length === 0 ? (
            <div className="mx-auto mt-14 max-w-xl rounded-3xl border border-white/10 bg-zinc-900/80 p-10 text-center">
              <p className="text-zinc-400">
                El podio todavía no está registrado.
              </p>
            </div>
          ) : (
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {podio.map((participacion) => {
                const persona = personaPorId.get(
                  participacion.persona_id
                );

                if (!persona) return null;

                return (
                  <div
                    key={participacion.id}
                    className={`relative overflow-hidden rounded-3xl border p-8 text-center ${
                      participacion.posicion === 1
                        ? "border-orange-500/50 bg-orange-950/30 md:-translate-y-4"
                        : "border-white/10 bg-zinc-900/90"
                    }`}
                  >
                    <div className="text-5xl">
                      {posicionEmoji(
                        participacion.posicion
                      )}
                    </div>

                    <p className="mt-5 text-sm font-bold uppercase tracking-[0.3em] text-orange-400">
                      {posicionTexto(
                        participacion.posicion
                      )}
                    </p>

                    <h3 className="mt-3 text-2xl font-black">
                      {nombreWeb(persona.nombre)}
                    </h3>

                    {participacion.puntos_finales !== null && (
                      <p className="mt-3 text-sm text-zinc-500">
                        {participacion.puntos_finales} puntos
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* GANADOR */}
        <section className="border-y border-orange-500/20 bg-black/40">
          <div className="mx-auto max-w-7xl px-6 py-24">
            <div className="mb-12 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-orange-400">
                El gran ganador
              </p>

              <h2 className="mt-4 text-5xl font-black md:text-6xl">
                GANADOR
              </h2>
            </div>

            <div className="relative mx-auto min-h-[620px] max-w-7xl overflow-hidden rounded-[2rem] border border-orange-500/30 bg-black/75 shadow-[0_0_80px_rgba(255,100,0,0.12)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_50%,_rgba(255,100,0,0.12),_transparent_45%)]" />

              <div className="relative grid min-h-[620px] md:grid-cols-[0.9fr_1.1fr]">
                <div className="relative z-10 flex flex-col justify-center px-10 py-14 text-center md:px-14 md:text-left lg:px-20">
                  <p className="text-sm font-semibold uppercase tracking-[0.4em] text-orange-400">
                    🏆 Campeón
                  </p>

                  <h3 className="mt-5 text-5xl font-black leading-none text-white md:text-6xl lg:text-7xl">
                    Ángelo
                    <br />
                    Pérez
                  </h3>

                  <div className="mt-8 h-px w-24 bg-orange-500/60" />

                  <p className="mt-8 text-2xl font-semibold text-zinc-200">
                    Mejor Disfraz
                  </p>

                  <p className="mt-1 text-2xl font-semibold text-orange-400">
                    Halloween 2025
                  </p>

                  <p className="mt-6 max-w-md text-base leading-7 text-zinc-400">
                    Ganador del torneo de disfraces de Halloween
                    2025.
                  </p>
                </div>

                <div className="relative flex min-h-[500px] items-end justify-center overflow-hidden md:min-h-[620px] md:items-center">
                  <img
                    src={IMAGEN_GANADOR}
                    alt="Ángelo Pérez - Ganador Halloween 2025"
                    className="h-full max-h-[620px] w-full object-contain object-center"
                  />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent md:from-black md:via-black/10 md:to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* GALERÍA */}
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400">
              Recuerdos
            </p>

            <h2 className="mt-4 text-5xl font-black md:text-6xl">
              GALERÍA
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-zinc-400">
              Fotografías de Halloween 2025.
            </p>
          </div>

          <div className="mt-14">
            <GaleriaFotos edicionId={edicion.id} />
          </div>
        </section>
      </div>
    </main>
  );
}