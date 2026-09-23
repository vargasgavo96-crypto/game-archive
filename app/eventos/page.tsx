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
};

type Participacion = {
  edicion_id: number;
  persona_id: number;
  posicion: number | null;
};

type Premio = {
  edicion_id: number;
  persona_id: number;
  nombre: string;
};

function nombreCorto(nombre: string) {
  const partes = nombre.trim().split(/\s+/);

  if (partes.length === 1) {
    return partes[0];
  }

  return `${partes[0]} ${partes[partes.length - 2]}`;
}

export default async function EventosPage() {
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
      .select("id, nombre"),

    supabase
      .from("participaciones")
      .select("edicion_id, persona_id, posicion"),

    supabase
      .from("premios")
      .select("edicion_id, persona_id, nombre"),
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

  const premioPorEdicion = new Map(
    listaPremios.map((premio) => [premio.edicion_id, premio])
  );

  const participacionGanadoraPorEdicion = new Map(
    listaParticipaciones
      .filter((participacion) => participacion.posicion === 1)
      .map((participacion) => [
        participacion.edicion_id,
        participacion,
      ])
  );

  return (
    <main
      className="relative min-h-screen bg-cover bg-center bg-fixed text-white"
      style={{ backgroundImage: "url('/eventos/todos.jfif')" }}
    >
      <div className="fixed inset-0 z-0 bg-black/55" />

      <div className="relative z-10">
        {/* HEADER */}
        <section className="border-b border-white/10">
          <div className="mx-auto max-w-7xl px-6 py-24">
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-violet-400">
              Archivo
            </p>

            <h1 className="mt-4 text-6xl font-black md:text-8xl">
              EVENTOS
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
              Un recorrido por los eventos que hemos creado,
              sus historias y todas las ediciones que han marcado
              nuestra historia.
            </p>
          </div>
        </section>

        {/* EVENTOS */}
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-8 md:grid-cols-2">
            {listaEventos.map((evento) => {
              const edicionesEvento = listaEdiciones
                .filter((edicion) => edicion.evento_id === evento.id)
                .sort((a, b) => b.fecha.localeCompare(a.fecha));

              const ultimaEdicion = edicionesEvento[0];

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
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/90 transition duration-300 hover:-translate-y-2 hover:border-violet-500/50"
                >
                  {/* LOGO */}
                  <div className="flex h-80 items-center justify-center bg-black/40 p-12">
                    {evento.logo ? (
                      <img
                        src={evento.logo}
                        alt={`Logo ${evento.nombre}`}
                        className="max-h-56 max-w-[80%] object-contain transition duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <span className="text-7xl">🎮</span>
                    )}
                  </div>

                  {/* INFORMACIÓN */}
                  <div className="p-8">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-400">
                        Evento
                      </p>

                      <p className="text-sm text-zinc-500">
                        {edicionesEvento.length}{" "}
                        {edicionesEvento.length === 1
                          ? "edición"
                          : "ediciones"}
                      </p>
                    </div>

                    <h2 className="mt-3 text-4xl font-bold">
                      {evento.nombre}
                    </h2>

                    <p className="mt-5 leading-7 text-zinc-300">
                      {evento.descripcion}
                    </p>

                    {/* ÚLTIMA EDICIÓN */}
                    {ultimaEdicion && (
                      <div className="mt-8 border-t border-white/10 pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-widest text-zinc-500">
                              Última edición
                            </p>

                            <p className="mt-1 text-lg font-semibold">
                              {ultimaEdicion.año}
                            </p>
                          </div>

                          {ganador && (
                            <div className="text-right">
                              <p className="text-xs uppercase tracking-widest text-zinc-500">
                                Último campeón
                              </p>

                              <p className="mt-1 font-semibold text-white">
                                {nombreCorto(ganador.nombre)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-8 border-t border-white/10 pt-6">
                      <span className="text-sm font-semibold transition group-hover:text-violet-400">
                        EXPLORAR EVENTO →
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/10 bg-black/40 px-6 py-10">
          <div className="mx-auto flex max-w-7xl justify-between text-sm text-zinc-500">
            <p>THE GAME ARCHIVE</p>
            <p>Juegos · Eventos · Campeones</p>
          </div>
        </footer>
      </div>
    </main>
  );
}