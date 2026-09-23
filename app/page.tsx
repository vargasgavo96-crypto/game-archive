import { supabase } from "@/lib/supabase";

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
  edicion_id: number;
  persona_id: number;
  posicion: number | null;
  puntos_finales: number | null;
};

type Premio = {
  edicion_id: number;
  persona_id: number;
  nombre: string;
  descripcion: string | null;
};

function nombreCorto(nombre: string) {
  const partes = nombre.trim().split(/\s+/);

  if (partes.length === 1) {
    return partes[0];
  }

  return `${partes[0]} ${partes[partes.length - 2]}`;
}

export default async function Home() {
  const [
    { data: eventos, error: eventosError },
    { data: ediciones, error: edicionesError },
    { data: personas, error: personasError },
    { data: participaciones, error: participacionesError },
    { data: premios, error: premiosError },
  ] = await Promise.all([
    supabase
      .from("eventos")
      .select("id, nombre, descripcion, logo, slug")
      .order("nombre"),

    supabase
      .from("ediciones")
      .select("*")
      .order("fecha", { ascending: false }),

    supabase
      .from("personas")
      .select("id, nombre, imagen"),

    supabase
      .from("participaciones")
      .select("edicion_id, persona_id, posicion, puntos_finales"),

    supabase
      .from("premios")
      .select("edicion_id, persona_id, nombre, descripcion"),
  ]);

  if (
    eventosError ||
    edicionesError ||
    personasError ||
    participacionesError ||
    premiosError
  ) {
    console.error({
      eventosError,
      edicionesError,
      personasError,
      participacionesError,
      premiosError,
    });

    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="w-full max-w-3xl">
          <h1 className="text-3xl font-bold text-red-400">
            Error cargando Supabase
          </h1>

          <p className="mt-3 text-zinc-400">
            Una o más tablas no pudieron ser consultadas.
          </p>

          <pre className="mt-6 overflow-auto rounded-2xl border border-red-500/20 bg-zinc-900 p-6 text-sm leading-7 text-red-300">
            {JSON.stringify(
              {
                eventos: eventosError?.message ?? null,
                ediciones: edicionesError?.message ?? null,
                personas: personasError?.message ?? null,
                participaciones: participacionesError?.message ?? null,
                premios: premiosError?.message ?? null,
              },
              null,
              2
            )}
          </pre>
        </div>
      </main>
    );
  }

  const listaEventos: Evento[] = eventos ?? [];
  const listaEdiciones: Edicion[] = ediciones ?? [];
  const listaPersonas: Persona[] = personas ?? [];
  const listaParticipaciones: Participacion[] = participaciones ?? [];
  const listaPremios: Premio[] = premios ?? [];

  const personaPorId = new Map(
    listaPersonas.map((persona) => [persona.id, persona])
  );

  const eventoPorId = new Map(
    listaEventos.map((evento) => [evento.id, evento])
  );

  /*
   * Buscamos específicamente a quien terminó en posición 1.
   */
  const participacionGanadoraPorEdicion = new Map(
    listaParticipaciones
      .filter((participacion) => participacion.posicion === 1)
      .map((participacion) => [
        participacion.edicion_id,
        participacion,
      ])
  );

  const premioPorEdicion = new Map(
    listaPremios.map((premio) => [premio.edicion_id, premio])
  );

  const edicionesOrdenadas = [...listaEdiciones].sort((a, b) =>
    b.fecha.localeCompare(a.fecha)
  );

  const ultimoEvento = edicionesOrdenadas[0];

  /*
   * Hall of Fame:
   * primero buscamos el campeón oficial en premios.
   * Si no existe, usamos la participación con posición 1.
   */
  const hallOfFame = edicionesOrdenadas.slice(0, 3).map((edicion) => {
    const evento = eventoPorId.get(edicion.evento_id);

    const premio = premioPorEdicion.get(edicion.id);

    const participacionGanadora =
      participacionGanadoraPorEdicion.get(edicion.id);

    const persona = premio
      ? personaPorId.get(premio.persona_id)
      : participacionGanadora
        ? personaPorId.get(participacionGanadora.persona_id)
        : undefined;

    return {
      edicion,
      evento,
      persona,
      premio,
    };
  });

  return (
    <main
      className="relative min-h-screen bg-cover bg-center bg-fixed text-white"
      style={{ backgroundImage: "url('/eventos/todos.jfif')" }}
    >
      <div className="fixed inset-0 z-0 bg-black/55" />

      <div className="relative z-10">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.18),_transparent_45%)]" />

          <div className="relative mx-auto flex min-h-[650px] max-w-7xl flex-col items-center justify-center px-6 text-center">
            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.4em] text-violet-400">
              La historia de nuestros eventos y torneos
            </p>

            <h1 className="max-w-5xl text-6xl font-black tracking-tight md:text-8xl">
              EL
              <br />
              <span className="text-violet-400">ARCHIVO DE JUEGOS</span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-300">
              Un archivo de juegos, torneos y eventos.
              <br />
              Historias, campeones y momentos que hicieron historia.
            </p>

            <a
              href="/eventos"
              className="mt-10 rounded-full bg-white px-8 py-4 text-sm font-bold text-black transition hover:scale-105 hover:bg-violet-200"
            >
              EXPLORAR EVENTOS
            </a>
          </div>
        </section>

        {/* LAST EVENT */}
        {ultimoEvento && (
          <section className="border-y border-white/10 bg-black/30">
            <div className="mx-auto max-w-7xl px-6 py-20">
              <div className="mb-10">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
                  Último evento
                </p>

                <h2 className="mt-3 text-4xl font-bold md:text-5xl">
                  {eventoPorId.get(ultimoEvento.evento_id)?.nombre}{" "}
                  {ultimoEvento.año}
                </h2>
              </div>

              {(() => {
                const evento = eventoPorId.get(ultimoEvento.evento_id);

                const premio = premioPorEdicion.get(ultimoEvento.id);

                const participacionGanadora =
                  participacionGanadoraPorEdicion.get(ultimoEvento.id);

                const persona = premio
                  ? personaPorId.get(premio.persona_id)
                  : participacionGanadora
                    ? personaPorId.get(
                        participacionGanadora.persona_id
                      )
                    : undefined;

                return (
                  <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-950/90 via-zinc-900/90 to-black/90">
                    <div className="grid min-h-[420px] md:grid-cols-2">
                      <div className="flex flex-col justify-center p-10 md:p-16">
                        <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">
                          Campeonato {ultimoEvento.año}
                        </p>

                        <h3 className="mt-4 text-5xl font-black md:text-6xl">
                          {evento?.nombre}
                        </h3>

                        <p className="mt-6 max-w-lg leading-7 text-zinc-300">
                          Revive la historia del evento, sus desafíos,
                          participantes y el campeonato que definió esta
                          edición.
                        </p>

                        {persona && (
                          <div className="mt-8 flex items-center gap-5">
                            <span className="text-5xl">👑</span>

                            <div>
                              <p className="text-xs uppercase tracking-widest text-zinc-500">
                                {premio?.nombre ?? "Campeón"}
                              </p>

                              <p className="text-2xl font-bold">
                                {nombreCorto(persona.nombre)}
                              </p>
                            </div>
                          </div>
                        )}

                        <a
                          href={`/eventos/${evento?.slug}/${ultimoEvento.año}`}
                          className="mt-10 w-fit rounded-full border border-white/20 px-7 py-3 text-sm font-semibold transition hover:bg-white hover:text-black"
                        >
                          VER EVENTO →
                        </a>
                      </div>

                      {/* FOTO DEL CAMPEÓN */}
                      <div className="relative min-h-[420px] overflow-hidden bg-black">
                        {persona?.imagen ? (
                          <img
                            src={persona.imagen}
                            alt={nombreCorto(persona.nombre)}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : evento?.logo ? (
                          <div className="flex h-full items-center justify-center">
                            <img
                              src={evento.logo}
                              alt={`Logo ${evento.nombre}`}
                              className="max-h-64 max-w-[70%] object-contain opacity-80"
                            />
                          </div>
                        ) : (
                          <div className="flex h-full items-center justify-center text-8xl">
                            🏆
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {persona && (
                          <div className="absolute bottom-8 left-8">
                            <p className="text-sm uppercase tracking-[0.4em] text-white/60">
                              {premio?.nombre ?? "Campeón"}{" "}
                              {ultimoEvento.año}
                            </p>

                            <p className="mt-2 text-2xl font-bold text-white">
                              {nombreCorto(persona.nombre)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </section>
        )}

        {/* HALL OF FAME */}
        <section
          id="hall-of-fame"
          className="mx-auto max-w-7xl px-6 py-24"
        >
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
              Los campeones
            </p>

            <h2 className="mt-3 text-5xl font-black">
              HALL OF FAME
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-zinc-300">
              Los jugadores que levantaron el trofeo y dejaron su nombre en
              la historia.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {hallOfFame.map((item, index) => {
              if (!item.evento || !item.persona) return null;

              return (
                <a
                  key={item.edicion.id}
                  href={`/eventos/${item.evento.slug}/${item.edicion.año}`}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/90 p-8 transition duration-300 hover:-translate-y-2 hover:border-violet-500/50"
                >
                  <div className="absolute right-5 top-5 text-2xl text-zinc-700">
                    #{index + 1}
                  </div>

                  {/* FOTO DEL CAMPEÓN */}
                  <div className="relative mx-auto flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-4 border-violet-500 bg-black shadow-lg shadow-violet-500/20">
                    {item.persona.imagen ? (
                      <img
                        src={item.persona.imagen}
                        alt={nombreCorto(item.persona.nombre)}
                        className="h-full w-full object-cover"
                      />
                    ) : item.evento.logo ? (
                      <img
                        src={item.evento.logo}
                        alt={item.evento.nombre}
                        className="max-h-24 max-w-24 object-contain"
                      />
                    ) : (
                      <span className="text-5xl">👑</span>
                    )}
                  </div>

                  <p className="mt-8 text-center text-xs uppercase tracking-[0.2em] text-violet-400">
                    {item.edicion.año}
                  </p>

                  <h3 className="mt-2 text-center text-3xl font-bold">
                    {nombreCorto(item.persona.nombre)}
                  </h3>

                  <p className="mt-2 text-center text-sm text-zinc-400">
                    {item.premio?.nombre ?? "Campeón"}{" "}
                    {item.evento.nombre}
                  </p>

                  <div className="mt-8 border-t border-white/10 pt-5 text-center text-sm text-zinc-400">
                    {item.evento.nombre}
                  </div>
                </a>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <a
              href="/hall-of-fame"
              className="inline-block rounded-full border border-white/15 px-7 py-3 text-sm font-semibold transition hover:bg-white hover:text-black"
            >
              VER HALL OF FAME COMPLETO
            </a>
          </div>
        </section>

        {/* EVENTS */}
        <section
          id="eventos"
          className="border-t border-white/10 bg-black/30"
        >
          <div className="mx-auto max-w-7xl px-6 py-24">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
                  Archivo
                </p>

                <h2 className="mt-3 text-5xl font-black">
                  EVENTOS
                </h2>
              </div>

              <p className="max-w-md text-sm leading-6 text-zinc-400">
                Explora la historia de cada torneo, juego y evento.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {listaEventos.map((evento) => {
                const edicionesEvento = listaEdiciones.filter(
                  (edicion) => edicion.evento_id === evento.id
                );

                const ultimaEdicion = [...edicionesEvento].sort((a, b) =>
                  b.fecha.localeCompare(a.fecha)
                )[0];

                const premio = ultimaEdicion
                  ? premioPorEdicion.get(ultimaEdicion.id)
                  : undefined;

                const participacionGanadora = ultimaEdicion
                  ? participacionGanadoraPorEdicion.get(
                      ultimaEdicion.id
                    )
                  : undefined;

                const ganador = premio
                  ? personaPorId.get(premio.persona_id)
                  : participacionGanadora
                    ? personaPorId.get(
                        participacionGanadora.persona_id
                      )
                    : undefined;

                return (
                  <a
                    key={evento.id}
                    href={`/eventos/${evento.slug}`}
                    className="group rounded-2xl border border-white/10 bg-zinc-900/90 p-7 transition hover:border-violet-500/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-20 w-32 items-center justify-start">
                        {evento.logo && (
                          <img
                            src={evento.logo}
                            alt={`Logo ${evento.nombre}`}
                            className="max-h-20 max-w-32 object-contain"
                          />
                        )}
                      </div>

                      <span className="text-sm text-zinc-500">
                        {edicionesEvento.length}{" "}
                        {edicionesEvento.length === 1
                          ? "edición"
                          : "ediciones"}
                      </span>
                    </div>

                    <p className="mt-10 text-xs uppercase tracking-widest text-violet-400">
                      Evento
                    </p>

                    <h3 className="mt-2 text-2xl font-bold group-hover:text-violet-300">
                      {evento.nombre}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                      {evento.descripcion}
                    </p>

                    <div className="mt-8 border-t border-white/10 pt-5">
                      <p className="text-xs uppercase tracking-widest text-zinc-500">
                        Último campeón
                      </p>

                      <p className="mt-1 font-semibold">
                        {ganador
                          ? nombreCorto(ganador.nombre)
                          : "Por definir"}
                      </p>
                    </div>

                    <p className="mt-6 text-sm text-zinc-500">
                      Ver historia →
                    </p>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/10 bg-black/40 px-6 py-10">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-zinc-400 md:flex-row">
            <p>THE GAME ARCHIVE</p>

            <p>Una historia de juegos, competencia y campeones.</p>
          </div>
        </footer>
      </div>
    </main>
  );
}