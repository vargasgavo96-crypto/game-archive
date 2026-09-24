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

  const totalPersonas = personasOrdenadas.length;

  return (
    <main
      className="relative min-h-screen bg-cover bg-center bg-fixed text-white"
      style={{
        backgroundImage: "url('/eventos/todos.jfif')",
      }}
    >
      <div className="fixed inset-0 z-0 bg-black/70" />

      <div className="relative z-10">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.35),_transparent_55%)]" />

          <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-violet-600/10 blur-3xl" />

          <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-6 py-28 text-center md:py-36">
            <p className="text-sm font-semibold uppercase tracking-[0.5em] text-violet-400">
              El archivo
            </p>

            <h1 className="mt-5 text-6xl font-black tracking-tight md:text-8xl">
              AMIGXS
            </h1>

            <div className="mx-auto mt-8 h-px w-24 bg-violet-500/50" />

            <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-zinc-300 md:text-xl">
              Las personas detrás de los juegos, eventos,
              competencias y recuerdos que forman parte de
              nuestra historia.
            </p>

            <div className="mt-10 inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/30 px-5 py-3 backdrop-blur">
              <span className="text-xl font-black text-white">
                {totalPersonas}
              </span>

              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                personas en el archivo
              </span>
            </div>
          </div>
        </section>

        {/* INTRO */}
        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
            Las personas detrás de la historia
          </p>

          <h2 className="mt-4 text-4xl font-black md:text-5xl">
            QUIÉNES SOMOS
          </h2>

          <p className="mt-7 text-lg leading-8 text-zinc-400">
            Más que participantes, somos parte de las historias
            que han ido construyendo este archivo. Aquí quedan
            registrados nuestros recuerdos, momentos y pequeñas
            historias.
          </p>
        </section>

        {/* PERSONAS */}
        <section className="border-y border-white/10 bg-black/30">
          <div className="mx-auto max-w-7xl px-6 py-24">
            <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-zinc-600">
                  Archivo de participantes
                </p>

                <h2 className="mt-2 text-3xl font-black md:text-4xl">
                  NUESTRA GENTE
                </h2>
              </div>

              <p className="text-sm text-zinc-500">
                {totalPersonas}{" "}
                {totalPersonas === 1
                  ? "persona registrada"
                  : "personas registradas"}
              </p>
            </div>

            {personasOrdenadas.length > 0 ? (
              <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {personasOrdenadas.map((amigx: Persona) => (
                  <article
                    key={amigx.id}
                    className="group flex h-[720px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 transition duration-500 hover:-translate-y-2 hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-950/20"
                  >
                    {/* FOTO */}
                    <div className="relative h-80 shrink-0 overflow-hidden bg-zinc-900">
                      {amigx.imagen ? (
                        <img
                          src={amigx.imagen}
                          alt={amigx.nombre}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-zinc-950">
                          <div className="text-center">
                            <div className="text-7xl opacity-10">
                              👤
                            </div>

                            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-700">
                              Sin fotografía
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                      <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/50 text-xs font-black text-white opacity-0 backdrop-blur transition duration-300 group-hover:opacity-100">
                        ✦
                      </div>
                    </div>

                    {/* INFORMACIÓN */}
                    <div className="flex min-h-0 flex-1 flex-col p-6">
                      {/* NOMBRE */}
                      <h3 className="text-2xl font-black leading-tight text-white">
                        {amigx.nombre}
                      </h3>

                      {/* APODO */}
                      {amigx.apodo && (
                        <p className="mt-1 text-sm font-semibold text-violet-400">
                          &quot;{amigx.apodo}&quot;
                        </p>
                      )}

                      {/* BIOGRAFÍA */}
                      {amigx.biografia ? (
                        <p className="mt-5 line-clamp-5 text-sm leading-6 text-zinc-400">
                          {amigx.biografia}
                        </p>
                      ) : (
                        <p className="mt-5 text-sm italic text-zinc-700">
                          Historia próximamente...
                        </p>
                      )}

                      {/* CUMPLEAÑOS / SIGNO */}
                      {(amigx.cumpleaños || amigx.signo) && (
                        <div className="mt-auto flex flex-wrap gap-2 border-t border-white/10 pt-5">
                          {amigx.cumpleaños && (
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300">
                              🎂 {amigx.cumpleaños}
                            </span>
                          )}

                          {amigx.signo && (
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300">
                              ♈ {amigx.signo}
                            </span>
                          )}
                        </div>
                      )}

                      {/* ETIQUETAS */}
                      {amigx.etiquetas &&
                        amigx.etiquetas.length > 0 && (
                          <div className="mt-5 flex flex-wrap gap-2">
                            {amigx.etiquetas.map((etiqueta) => (
                              <span
                                key={etiqueta}
                                className="rounded-full border border-violet-500/20 bg-violet-950/30 px-3 py-1.5 text-xs font-bold tracking-wide text-violet-300 transition group-hover:border-violet-500/40 group-hover:bg-violet-950/50"
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
                <div className="text-5xl opacity-20">
                  👥
                </div>

                <p className="mt-5 text-zinc-400">
                  Todavía no hay personas registradas.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* FRASE FINAL */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.12),_transparent_60%)]" />

          <div className="relative mx-auto max-w-4xl px-6 py-28 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-violet-400">
              El archivo continúa
            </p>

            <h2 className="mt-5 text-4xl font-black md:text-6xl">
              MUCHAS HISTORIAS
              <br />
              POR CONTAR
            </h2>

            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-zinc-400">
              Nuevos eventos, fotografías, competencias y
              recuerdos seguirán formando parte de este archivo.
            </p>

            <div className="mx-auto mt-10 flex items-center justify-center gap-3">
              <span className="h-px w-12 bg-white/10" />
              <span className="text-violet-400">✦</span>
              <span className="h-px w-12 bg-white/10" />
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/10 bg-black/50 px-6 py-10">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between">
            <p className="font-semibold tracking-widest">
              THE GAME ARCHIVE
            </p>

            <p>AMIGXS · ARCHIVO</p>
          </div>
        </footer>
      </div>
    </main>
  );
}