import { supabase } from "@/lib/supabase";

type Persona = {
  id: number;
  nombre: string;
  apodo: string | null;
  cumpleaños: string | null;
  signo: string | null;
  biografia: string | null;
  etiquetas: string[] | null;
  imagen: string | null;
};

export default async function AmigxsPage() {
  const { data: personas, error } = await supabase
    .from("personas")
    .select("*");

  if (error) {
    console.error("Error cargando personas:", error);

    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-400">
            No se pudo cargar Amigxs
          </h1>

          <p className="mt-3 text-zinc-400">
            No fue posible cargar las personas desde Supabase.
          </p>
        </div>
      </main>
    );
  }

  const personasOrdenadas = [...(personas ?? [])].sort(
    (a, b) =>
      a.nombre.localeCompare(b.nombre, "es", {
        sensitivity: "base",
      })
  );

  return (
    <main
      className="relative min-h-screen bg-cover bg-center bg-fixed text-white"
      style={{
        backgroundImage: "url('/eventos/todos.jfif')",
      }}
    >
      <div className="fixed inset-0 z-0 bg-black/65" />

      <div className="relative z-10">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.25),_transparent_55%)]" />

          <div className="relative mx-auto max-w-7xl px-6 py-28 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-violet-400">
              El archivo
            </p>

            <h1 className="mt-5 text-6xl font-black md:text-8xl">
              AMIGXS
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-zinc-300">
              Las personas que forman parte de la historia detrás
              de los juegos, eventos y recuerdos de este archivo.
            </p>
          </div>
        </section>

        {/* INTRO */}
        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
            Las personas detrás de la historia
          </p>

          <h2 className="mt-4 text-4xl font-black md:text-5xl">
            CONÓCENOS
          </h2>

          <p className="mt-7 text-lg leading-8 text-zinc-400">
            Cada persona tiene su propia historia dentro del
            grupo. Aquí reunimos pequeñas biografías, recuerdos,
            cumpleaños y reconocimientos que forman parte de este
            archivo.
          </p>
        </section>

        {/* TARJETAS */}
        <section className="border-y border-white/10 bg-black/30">
          <div className="mx-auto max-w-7xl px-6 py-24">
            {personasOrdenadas.length > 0 ? (
              <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {personasOrdenadas.map((amigx: Persona) => (
                  <article
                    key={amigx.id}
                    className="group overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/90 transition duration-300 hover:-translate-y-2 hover:border-violet-500/50"
                  >
                    {/* FOTO */}
                    <div className="relative flex h-80 items-center justify-center overflow-hidden bg-zinc-950">
                      {amigx.imagen ? (
                        <img
                          src={amigx.imagen}
                          alt={amigx.nombre}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="text-center">
                          <div className="text-7xl opacity-15">
                            👤
                          </div>

                          <p className="mt-4 text-xs uppercase tracking-[0.3em] text-zinc-700">
                            Foto próximamente
                          </p>
                        </div>
                      )}

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                    </div>

                    {/* INFORMACIÓN */}
                    <div className="p-7">
                      <h3 className="text-2xl font-black leading-tight">
                        {amigx.nombre}
                      </h3>

                      {amigx.apodo && (
                        <p className="mt-1 text-sm font-semibold text-violet-400">
                          &quot;{amigx.apodo}&quot;
                        </p>
                      )}

                      {/* BIOGRAFÍA */}
                      {amigx.biografia && (
                        <p className="mt-5 text-sm leading-6 text-zinc-400">
                          {amigx.biografia}
                        </p>
                      )}

                      {/* CUMPLEAÑOS / SIGNO */}
                      <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-5">
                        {amigx.cumpleaños && (
                          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-zinc-300">
                            🎂 {amigx.cumpleaños}
                          </span>
                        )}

                        {amigx.signo && (
                          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-zinc-300">
                            ♈ {amigx.signo}
                          </span>
                        )}
                      </div>

                      {/* ETIQUETAS */}
                      {amigx.etiquetas &&
                        amigx.etiquetas.length > 0 && (
                          <div className="mt-5 flex flex-wrap gap-2">
                            {amigx.etiquetas.map((etiqueta) => (
                              <span
                                key={etiqueta}
                                className="rounded-full border border-violet-500/30 bg-violet-950/40 px-3 py-1.5 text-xs font-bold tracking-wide text-violet-300"
                              >
                                {etiqueta}
                              </span>
                            ))}
                          </div>
                        )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-white/10 bg-zinc-900/90 p-12 text-center">
                <p className="text-zinc-400">
                  Todavía no hay personas registradas.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* CIERRE */}
        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
            El archivo continúa
          </p>

          <h2 className="mt-4 text-4xl font-black md:text-5xl">
            MUCHAS HISTORIAS POR CONTAR
          </h2>

          <p className="mt-7 text-lg leading-8 text-zinc-400">
            Este archivo seguirá creciendo con nuevos eventos,
            fotografías, historias y recuerdos.
          </p>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/10 bg-black/50 px-6 py-10">
          <div className="mx-auto flex max-w-7xl justify-between text-sm text-zinc-500">
            <p>THE GAME ARCHIVE</p>

            <p>AMIGXS · ARCHIVO</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
