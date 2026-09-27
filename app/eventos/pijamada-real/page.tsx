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
        {/* ARCHIVO HISTÓRICO */}
        {/* ================================================== */}

        <section className="border-y border-white/10 bg-black/40">

          <div className="mx-auto max-w-5xl px-6 py-28">

            <div className="relative overflow-hidden rounded-[2rem] border border-violet-400/20 bg-zinc-950/90 px-8 py-16 text-center shadow-2xl md:px-16 md:py-24">

              {/* DECORACIÓN */}

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.18),_transparent_55%)]" />

              <div className="relative">

                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-violet-400">
                  Archivo histórico
                </p>

                <h2 className="mt-5 text-5xl font-black md:text-7xl">
                  REVISA LAS EDICIONES
                </h2>

                <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-zinc-300 md:text-xl">
                  Revisa las distintas ediciones de La Pijamada
                  Real, conoce sus resúmenes y revive los
                  recuerdos de cada una a través de sus
                  fotografías.
                </p>

                <a
                  href="/eventos/pijamada-real/historico"
                  className="mt-12 inline-flex items-center justify-center rounded-full border border-violet-400/40 bg-violet-500/20 px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white transition duration-300 hover:-translate-y-1 hover:border-violet-400 hover:bg-violet-500/30"
                >
                  REVISAR LAS EDICIONES →
                </a>

              </div>
            </div>

          </div>

        </section>

        {/* ================================================== */}
        {/* FOOTER */}
        {/* ================================================== */}

        <footer className="border-t border-white/10 bg-black/40 px-6 py-10">

          <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-zinc-500 md:flex-row md:justify-between">

            <p>
              THE GAME ARCHIVE
            </p>

            <p>
              La Pijamada Real · Archivo histórico
            </p>

          </div>

        </footer>

      </div>
    </main>
  );
}