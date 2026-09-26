import Link from "next/link";
import { notFound } from "next/navigation";
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
  fondo: string | null;
};

type Edicion = {
  id: number;
  evento_id: number;
  año: string;
  fecha: string;
};

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

export default async function EventoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const {
    data: eventoData,
    error: eventoError,
  } = await supabase
    .from("eventos")
    .select(
      "id, nombre, descripcion, logo, slug, historia, como_nacio, fondo"
    )
    .eq("slug", slug)
    .single();

  if (eventoError || !eventoData) {
    notFound();
  }

  const evento = eventoData as Evento;

  const {
    data: edicionesData,
    error: edicionesError,
  } = await supabase
    .from("ediciones")
    .select("id, evento_id, año, fecha")
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

  const ediciones = (edicionesData ??
    []) as Edicion[];

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

        {/* ================================================== */}
        {/* HERO */}
        {/* ================================================== */}

        <section className="relative overflow-hidden border-b border-white/10">

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.22),_transparent_50%)]" />

          <div className="mx-auto flex min-h-[680px] max-w-7xl flex-col items-center justify-center px-6 py-28 text-center">

            {/* LOGO */}

            {evento.logo ? (
              <img
                src={evento.logo}
                alt={evento.nombre}
                className="max-h-72 max-w-lg object-contain drop-shadow-[0_0_40px_rgba(139,92,246,0.25)]"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-5xl">
                🎮
              </div>
            )}

            {/* CATEGORÍA */}

            <p className="mt-12 text-sm font-semibold uppercase tracking-[0.4em] text-violet-400">
              Evento
            </p>

            {/* NOMBRE DEL EVENTO */}

            <div className="mt-4 w-full">
              <EditarTexto
                valor={evento.nombre}
                campo="nombre"
                eventoId={evento.id}
                claseTexto="text-6xl font-black tracking-tight md:text-8xl"
              />
            </div>

            {/* DESCRIPCIÓN */}

            {evento.descripcion && (
              <div className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-zinc-300">
                <EditarTexto
                  valor={evento.descripcion}
                  campo="descripcion"
                  eventoId={evento.id}
                  multilinea
                />
              </div>
            )}

          </div>
        </section>

        {/* ================================================== */}
        {/* HISTORIA */}
        {/* ================================================== */}

        {(evento.historia || evento.como_nacio) && (
          <section className="border-b border-white/10 bg-black/50">

            <div className="mx-auto max-w-6xl px-6 py-24">

              {/* CABECERA */}

              <div className="text-center">

                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
                  La historia
                </p>

                <h2 className="mt-4 text-4xl font-black md:text-5xl">
                  EL COMIENZO
                </h2>

                <p className="mx-auto mt-6 max-w-2xl text-zinc-400">
                  Conoce la historia detrás de{" "}
                  {evento.nombre}.
                </p>

              </div>

              {/* TARJETAS */}

              <div className="mt-16 grid gap-6 md:grid-cols-2">

                {/* HISTORIA */}

                {evento.historia && (
                  <article className="rounded-3xl border border-white/10 bg-zinc-950/80 p-8 md:p-10">

                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-400">
                      Historia
                    </p>

                    <h3 className="mt-4 text-3xl font-black">
                      La historia del evento
                    </h3>

                    <div className="mt-7 text-base leading-8 text-zinc-300">
                      <EditarTexto
                        valor={evento.historia}
                        campo="historia"
                        eventoId={evento.id}
                        multilinea
                        claseTexto="whitespace-pre-line"
                      />
                    </div>

                  </article>
                )}

                {/* CÓMO NACIÓ */}

                {evento.como_nacio && (
                  <article className="rounded-3xl border border-white/10 bg-zinc-950/80 p-8 md:p-10">

                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-400">
                      El origen
                    </p>

                    <h3 className="mt-4 text-3xl font-black">
                      ¿Cómo nació?
                    </h3>

                    <div className="mt-7 text-base leading-8 text-zinc-300">
                      <EditarTexto
                        valor={evento.como_nacio}
                        campo="como_nacio"
                        eventoId={evento.id}
                        multilinea
                        claseTexto="whitespace-pre-line"
                      />
                    </div>

                  </article>
                )}

              </div>
            </div>
          </section>
        )}

        {/* ================================================== */}
        {/* EDICIONES */}
        {/* ================================================== */}

        <section className="mx-auto max-w-7xl px-6 py-24">

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
                Archivo
              </p>

              <h2 className="mt-3 text-5xl font-black">
                EDICIONES
              </h2>

            </div>

            <p className="text-sm text-zinc-500">
              {ediciones.length === 1
                ? "1 edición registrada"
                : `${ediciones.length} ediciones registradas`}
            </p>

          </div>

          {ediciones.length > 0 ? (

            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

              {ediciones.map((edicion) => (

                <Link
                  key={edicion.id}
                  href={`/eventos/${evento.slug}/${edicion.año}`}
                  className="group rounded-3xl border border-white/10 bg-zinc-950/90 p-7 transition duration-300 hover:-translate-y-2 hover:border-violet-500/50"
                >

                  <div className="flex items-center justify-between">

                    <span className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-600">
                      Edición
                    </span>

                    <span className="text-sm font-bold text-violet-400">
                      {edicion.año}
                    </span>

                  </div>

                  <h3 className="mt-10 text-4xl font-black">
                    {evento.nombre}
                  </h3>

                  <div className="mt-6 border-t border-white/10 pt-5">

                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">
                      Fecha
                    </p>

                    <p className="mt-2 text-zinc-300">
                      {formatearFecha(edicion.fecha)}
                    </p>

                  </div>

                  <div className="mt-6 text-sm font-semibold text-violet-400 opacity-70 transition group-hover:opacity-100">
                    VER EDICIÓN →
                  </div>

                </Link>

              ))}

            </div>

          ) : (

            <div className="mt-14 rounded-3xl border border-dashed border-white/10 bg-black/30 p-14 text-center">

              <div className="text-5xl opacity-20">
                📁
              </div>

              <h3 className="mt-5 text-xl font-bold">
                Todavía no hay ediciones
              </h3>

              <p className="mt-2 text-zinc-500">
                Las ediciones de este evento aparecerán aquí.
              </p>

            </div>

          )}

        </section>

        {/* ================================================== */}
        {/* FOOTER */}
        {/* ================================================== */}

        <footer className="border-t border-white/10 bg-black/60 px-6 py-10">

          <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between">

            <p>
              THE GAME ARCHIVE
            </p>

            <Link
              href="/eventos"
              className="transition hover:text-white"
            >
              ← Volver a eventos
            </Link>

          </div>

        </footer>

      </div>
    </main>
  );
}