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

function nombreCorto(nombre: string) {
  const partes = nombre.trim().split(/\s+/);

  if (partes.length === 1) {
    return partes[0];
  }

  return `${partes[0]} ${partes[partes.length - 2]}`;
}

function posicionTexto(posicion: number | null) {
  if (posicion === 1) return "1.º LUGAR";
  if (posicion === 2) return "2.º LUGAR";
  if (posicion === 3) return "3.º LUGAR";
  if (posicion) return `${posicion}.º LUGAR`;
  return "SIN POSICIÓN";
}

export default async function Halloween2024Page() {
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

  const {
    data: edicionesData,
    error: edicionesError,
  } = await supabase
    .from("ediciones")
    .select("*")
    .eq("evento_id", evento.id);

  const ediciones =
    (edicionesData as unknown as Edicion[] | null) ?? [];

  const edicion = ediciones.find(
    (item) => String(item.año) === "2024"
  );

  if (edicionesError || !edicion) {
    console.error(
      "Error cargando edición:",
      edicionesError
    );

    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-400">
            No se encontró Halloween 2024
          </h1>

          <p className="mt-3 text-zinc-400">
            Revisa que la edición 2024 exista en Supabase.
          </p>
        </div>
      </main>
    );
  }

  const edicionId = edicion.id;

  const {
    data: participacionesData,
    error: participacionesError,
  } = await supabase
    .from("participaciones")
    .select(
      "id, persona_id, edicion_id, posicion, puntos_finales"
    )
    .eq("edicion_id", edicionId)
    .order("posicion", {
      ascending: true,
      nullsFirst: false,
    });

  if (participacionesError) {
    console.error(
      "Error cargando participaciones:",
      participacionesError
    );
  }

  const participaciones =
    (participacionesData as unknown as Participacion[] | null) ??
    [];

  const personaIds = participaciones.map(
    (participacion) => participacion.persona_id
  );

  let personas: Persona[] = [];

  if (personaIds.length > 0) {
    const {
      data: personasData,
      error: personasError,
    } = await supabase
      .from("personas")
      .select("id, nombre, imagen")
      .in("id", personaIds);

    if (personasError) {
      console.error(
        "Error cargando personas:",
        personasError
      );
    }

    personas =
      (personasData as unknown as Persona[] | null) ?? [];
  }

  const personaPorId = new Map(
    personas.map((persona) => [
      persona.id,
      persona,
    ])
  );

  const {
    data: premioData,
    error: premioError,
  } = await supabase
    .from("premios")
    .select(
      "id, persona_id, edicion_id, nombre, descripcion, imagen"
    )
    .eq("edicion_id", edicionId)
    .maybeSingle();

  const premio =
    (premioData as unknown as Premio | null) ?? null;

  if (premioError) {
    console.error(
      "Error cargando premio:",
      premioError
    );
  }

  const participacionGanadora =
    participaciones.find(
      (participacion) =>
        participacion.posicion === 1
    );

  const ganadorId =
    premio?.persona_id ??
    participacionGanadora?.persona_id;

  const ganador = ganadorId
    ? personaPorId.get(ganadorId)
    : undefined;

  const nombreGanador = ganador
    ? nombreCorto(ganador.nombre)
    : null;

  const podio = participaciones
    .filter(
      (participacion) =>
        participacion.posicion !== null &&
        participacion.posicion <= 3
    )
    .sort(
      (a, b) =>
        (a.posicion ?? 99) -
        (b.posicion ?? 99)
    );

  const imagenGanador =
    premio?.imagen ??
    ganador?.imagen ??
    null;

  return (
    <main
      className="relative min-h-screen bg-cover bg-center bg-fixed text-white"
      style={{
        backgroundImage:
          "url('/eventos/halloween.png')",
      }}
    >
      <div className="fixed inset-0 z-0 bg-black/65" />

      <div className="relative z-10">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,92,0,0.25),_transparent_50%)]" />

          <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 py-28 text-center">
            <img
              src={
                evento.logo ??
                "/logos/logohalloween.png"
              }
              alt="Halloween"
              className="max-h-72 max-w-lg object-contain drop-shadow-[0_0_35px_rgba(255,120,0,0.35)]"
            />

            <p className="mt-12 text-sm font-semibold uppercase tracking-[0.4em] text-orange-400">
              Primera edición
            </p>

            <h1 className="mt-4 text-6xl font-black md:text-8xl">
              HALLOWEEN
            </h1>

            <p className="mt-4 text-3xl font-bold text-white/80">
              2024
            </p>

            <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-zinc-300">
              Una celebración de Halloween junto a nuestros amigos,
              con juegos, actividades y un torneo de disfraces.
            </p>
          </div>
        </section>

        {/* ¿CÓMO FUE ESTA EDICIÓN? */}
        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400">
            La edición
          </p>

          <h2 className="mt-4 text-4xl font-bold md:text-5xl">
            ¿CÓMO FUE ESTA EDICIÓN?
          </h2>

          <div className="mt-8 space-y-6 text-lg leading-8 text-zinc-300">
            <p>
              Halloween 2024 fue una instancia para celebrar,
              compartir y disfrutar junto a nuestros amigos.
            </p>

            <p>
              Durante la celebración se realizaron diferentes
              actividades y juegos, además de un torneo de disfraces
              para determinar quién destacaría con su caracterización.
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

              <h2 className="mt-4 text-5xl font-black">
                PARTICIPANTES
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-zinc-300">
                Las personas que participaron en Halloween 2024.
              </p>
            </div>

            {participaciones.length === 0 ? (
              <div className="mx-auto mt-14 max-w-2xl rounded-3xl border border-white/10 bg-zinc-900/80 p-12 text-center">
                <p className="text-5xl">👻</p>

                <p className="mt-6 text-lg text-zinc-400">
                  Los participantes todavía no han sido registrados.
                </p>
              </div>
            ) : (
              <div className="mt-14 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {participaciones.map(
                  (participacion) => {
                    const persona =
                      personaPorId.get(
                        participacion.persona_id
                      );

                    if (!persona) return null;

                    return (
                      <div
                        key={participacion.id}
                        className="group overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/90 transition duration-300 hover:-translate-y-2 hover:border-orange-500/40"
                      >
                        <div className="relative h-64 overflow-hidden bg-black">
                          {persona.imagen ? (
                            <img
                              src={persona.imagen}
                              alt={nombreCorto(
                                persona.nombre
                              )}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-6xl">
                              🎃
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                        </div>

                        <div className="p-6">
                          <h3 className="text-2xl font-black">
                            {nombreCorto(
                              persona.nombre
                            )}
                          </h3>

                          {participacion.posicion !==
                            null && (
                            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
                              {posicionTexto(
                                participacion.posicion
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </section>

        {/* PODIO */}
        <section className="mx-auto max-w-6xl px-6 py-28">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400">
              Resultados
            </p>

            <h2 className="mt-4 text-5xl font-black md:text-6xl">
              PODIO
            </h2>
          </div>

          {podio.length === 0 ? (
            <div className="mx-auto mt-14 max-w-2xl rounded-3xl border border-white/10 bg-zinc-900/80 p-12 text-center">
              <p className="text-5xl">🏆</p>

              <p className="mt-6 text-lg text-zinc-400">
                El podio todavía no ha sido registrado.
              </p>
            </div>
          ) : (
            <div className="mt-16 grid items-end gap-6 md:grid-cols-3">
              {podio.map((participacion) => {
                const persona =
                  personaPorId.get(
                    participacion.persona_id
                  );

                if (!persona) return null;

                const posicion =
                  participacion.posicion ?? 0;

                const altura =
                  posicion === 1
                    ? "min-h-[430px]"
                    : posicion === 2
                      ? "min-h-[360px]"
                      : "min-h-[320px]";

                const emoji =
                  posicion === 1
                    ? "🥇"
                    : posicion === 2
                      ? "🥈"
                      : "🥉";

                return (
                  <div
                    key={participacion.id}
                    className={`relative ${altura} overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/90`}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,120,0,0.12),_transparent_55%)]" />

                    <div className="relative flex h-full flex-col items-center justify-center p-8 text-center">
                      <span className="text-6xl">
                        {emoji}
                      </span>

                      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-orange-400">
                        {posicionTexto(posicion)}
                      </p>

                      <h3 className="mt-4 text-4xl font-black">
                        {nombreCorto(
                          persona.nombre
                        )}
                      </h3>

                      {participacion.puntos_finales !==
                        null && (
                        <p className="mt-4 text-zinc-400">
                          {participacion.puntos_finales} puntos
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* GANADOR */}
        <section className="border-y border-white/10 bg-black/40">
          <div className="mx-auto max-w-6xl px-6 py-28">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400">
                Reconocimiento
              </p>

              <h2 className="mt-4 text-5xl font-black md:text-7xl">
                GANADOR
              </h2>
            </div>

            {ganador && nombreGanador ? (
              <div className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-3xl border border-orange-500/20 bg-zinc-900/90">
                <div className="grid min-h-[600px] md:grid-cols-2">
                  {/* INFORMACIÓN */}
                  <div className="flex flex-col justify-center p-10 text-center md:p-14">
                    <p className="text-sm uppercase tracking-[0.3em] text-orange-400">
                      Campeón
                    </p>

                    <h3 className="mt-4 text-5xl font-black">
                      {nombreGanador}
                    </h3>

                    <div className="mt-8 flex justify-center">
                      <span className="text-7xl">
                        🏆
                      </span>
                    </div>

                    {premio?.nombre && (
                      <p className="mt-8 text-xl font-semibold leading-8 text-zinc-200">
                        {premio.nombre}
                      </p>
                    )}

                    {premio?.descripcion && (
                      <p className="mt-5 text-sm leading-6 text-zinc-500">
                        {premio.descripcion}
                      </p>
                    )}
                  </div>

                  {/* FOTO */}
                  <div className="relative min-h-[600px] overflow-hidden bg-black">
                    {imagenGanador ? (
                      <img
                        src={imagenGanador}
                        alt={nombreGanador}
                        className="h-full w-full object-contain object-right"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-8xl">
                        🎃
                      </div>
                    )}

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-zinc-900 via-transparent to-transparent" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mx-auto mt-12 max-w-2xl rounded-3xl border border-white/10 bg-zinc-900/80 p-12 text-center">
                <p className="text-6xl">🏆</p>

                <p className="mt-6 text-lg text-zinc-400">
                  El ganador todavía no ha sido registrado.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* GALERÍA */}
        <GaleriaFotos edicionId={edicionId} />

        {/* FOOTER */}
        <footer className="border-t border-white/10 bg-black/40 px-6 py-10">
          <div className="mx-auto flex max-w-7xl justify-between text-sm text-zinc-500">
            <p>THE GAME ARCHIVE</p>

            <p>
              Halloween · Primera edición · Octubre 2024
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}