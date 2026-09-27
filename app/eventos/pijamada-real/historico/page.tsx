import { supabase } from "@/lib/supabase";
import GaleriaFotos from "@/app/components/GaleriaFotos";
import EditarTextoEdicion from "@/app/components/EditarTextoEdicion";

type Evento = {
  id: number;
  nombre: string;
  descripcion: string | null;
  logo: string | null;
  slug: string;
};

type Edicion = {
  id: number;
  evento_id: number;
  fecha: string | null;
  contenido: Record<string, string> | null;
};

const AÑOS_HISTORICOS = [
  2026,
  2025,
  2024,
  2023,
];

export default async function PijamadaRealHistoricoPage() {
  // =====================================================
  // EVENTO
  // =====================================================

  const {
    data: evento,
    error: eventoError,
  } = await supabase
    .from("eventos")
    .select(
      "id, nombre, descripcion, logo, slug"
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

          <h1 className="text-3xl font-bold text-purple-400">
            No se pudo cargar La Pijamada Real
          </h1>

          <p className="mt-3 text-zinc-400">
            El evento no pudo ser encontrado en Supabase.
          </p>

        </div>
      </main>
    );
  }

  // =====================================================
  // EDICIONES
  //
  // No usamos select("*") para evitar problemas con
  // columnas innecesarias.
  //
  // Tampoco incluimos "año" en el SELECT debido al
  // problema de PostgREST con el carácter "ñ".
  // =====================================================

  const {
    data: edicionesData,
    error: edicionesError,
  } = await supabase
    .from("ediciones")
    .select(
      "id, evento_id, fecha, contenido"
    )
    .eq("evento_id", evento.id);

  if (edicionesError) {
    console.error(
      "Error cargando ediciones de La Pijamada Real:",
      edicionesError
    );
  }

  const ediciones =
    (edicionesData ??
      []) as Edicion[];

  // =====================================================
  // MAPEAR EDICIONES
  //
  // Como conocemos los años históricos que queremos
  // mostrar, obtenemos el año desde la lista fija.
  //
  // Para saber qué edición corresponde a cada año,
  // consultamos nuevamente usando el filtro "año".
  // =====================================================

  const edicionesPorAño =
    new Map<number, Edicion>();

  for (
    const año of AÑOS_HISTORICOS
  ) {
    const {
      data: edicionData,
      error: edicionError,
    } = await supabase
      .from("ediciones")
      .select(
        "id, evento_id, fecha, contenido"
      )
      .eq("evento_id", evento.id)
      .eq("año", año)
      .maybeSingle();

    if (edicionError) {
      console.error(
        `Error cargando edición ${año}:`,
        edicionError
      );

      continue;
    }

    if (edicionData) {
      edicionesPorAño.set(
        año,
        edicionData as Edicion
      );
    }
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main
      className="relative min-h-screen bg-cover bg-center bg-fixed text-white"
      style={{
        backgroundImage:
          "url('/eventos/pijamada-reall.png')",
      }}
    >

      {/* =================================================
          OSCURECER FONDO
          ================================================= */}

      <div className="fixed inset-0 z-0 bg-black/70" />

      <div className="relative z-10">

        {/* =================================================
            HERO
            ================================================= */}

        <section className="relative overflow-hidden border-b border-white/10">

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.22),_transparent_50%)]" />

          <div className="relative mx-auto flex min-h-[650px] max-w-7xl flex-col items-center justify-center px-6 py-28 text-center">

            {evento.logo && (
              <img
                src={evento.logo}
                alt={evento.nombre}
                className="max-h-72 max-w-lg object-contain drop-shadow-[0_0_35px_rgba(168,85,247,0.35)]"
              />
            )}

            <p className="mt-12 text-sm font-semibold uppercase tracking-[0.45em] text-purple-400">
              Archivo histórico
            </p>

            <h1 className="mt-4 text-6xl font-black md:text-8xl">
              LA PIJAMADA REAL
            </h1>

            <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-zinc-300">
              Un recorrido por las distintas ediciones de
              La Pijamada Real y por todos esos momentos que
              hicieron de cada noche una experiencia especial.
            </p>

          </div>

        </section>

        {/* =================================================
            INTRODUCCIÓN
            ================================================= */}

        <section className="mx-auto max-w-4xl px-6 py-24 text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-400">
            Nuestra historia
          </p>

          <h2 className="mt-4 text-4xl font-black md:text-6xl">
            ARCHIVO DE LA PIJAMADA REAL
          </h2>

          <p className="mt-8 text-lg leading-8 text-zinc-300">
            Aquí quedan reunidas las ediciones de La Pijamada
            Real desde 2023 hasta 2026.
          </p>

        </section>

        {/* =================================================
            EDICIONES
            ================================================= */}

        <section className="border-y border-white/10 bg-black/40">

          <div className="mx-auto max-w-7xl px-6 py-28">

            <div className="text-center">

              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-400">
                El archivo
              </p>

              <h2 className="mt-4 text-5xl font-black md:text-7xl">
                EDICIONES
              </h2>

              <p className="mx-auto mt-6 max-w-2xl text-zinc-500">
                Cuatro años de encuentros, noches y recuerdos.
              </p>

            </div>

            <div className="mt-24 space-y-24">

              {AÑOS_HISTORICOS.map(
                (año) => {

                  const edicion =
                    edicionesPorAño.get(
                      año
                    );

                  // =================================================
                  // AÑO SIN EDICIÓN
                  // =================================================

                  if (!edicion) {
                    return (
                      <article
                        key={año}
                        className="overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950/95 shadow-2xl"
                      >

                        <div className="border-b border-white/10 bg-black/70 px-8 py-10 md:px-12 md:py-12">

                          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-400">
                            La Pijamada Real
                          </p>

                          <h3 className="mt-2 text-6xl font-black md:text-8xl">
                            {año}
                          </h3>

                        </div>

                        <div className="px-8 py-16 text-center md:px-12">

                          <p className="text-lg text-zinc-500">
                            Esta edición todavía no ha sido
                            registrada en Supabase.
                          </p>

                        </div>

                      </article>
                    );
                  }

                  // =================================================
                  // CONTENIDO
                  // =================================================

                  const contenido =
                    edicion.contenido ??
                    {};

                  const resumen =
                    contenido.resumen ??
                    "Escribe aquí el resumen de esta edición.";

                  // =================================================
                  // EDICIÓN
                  // =================================================

                  return (
                    <article
                      key={edicion.id}
                      className="overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950/95 shadow-2xl"
                    >

                      {/* =================================================
                          ENCABEZADO
                          ================================================= */}

                      <div className="relative overflow-hidden border-b border-white/10 bg-black/70 px-8 py-10 md:px-12 md:py-12">

                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,_rgba(168,85,247,0.16),_transparent_45%)]" />

                        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

                          <div>

                            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-400">
                              La Pijamada Real
                            </p>

                            <h3 className="mt-2 text-6xl font-black md:text-8xl">
                              {año}
                            </h3>

                          </div>

                          <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-600 md:pb-2">
                            Edición histórica
                          </p>

                        </div>

                      </div>

                      {/* =================================================
                          RESUMEN
                          ================================================= */}

                      <div className="border-b border-white/10 px-8 py-14 md:px-12 md:py-16">

                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-400">
                          Resumen
                        </p>

                        <EditarTextoEdicion
                          valor={resumen}
                          campo="resumen"
                          edicionId={edicion.id}
                          multilinea
                          claseTexto="mt-6 text-xl leading-9 text-zinc-300 md:text-2xl"
                        />

                      </div>

                      {/* =================================================
                          GALERÍA
                          ================================================= */}

                      <div className="px-8 py-12 md:px-12 md:py-14">

                        <div className="mb-10 text-center">

                          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-400">
                            Recuerdos
                          </p>

                          <h4 className="mt-3 text-4xl font-black md:text-5xl">
                            GALERÍA DE FOTOS
                          </h4>

                          <p className="mx-auto mt-4 max-w-2xl text-zinc-500">
                            Las fotografías de esta edición de
                            La Pijamada Real.
                          </p>

                        </div>

                        <GaleriaFotos
                          edicionId={
                            edicion.id
                          }
                        />

                      </div>

                    </article>
                  );
                }
              )}

            </div>

          </div>

        </section>

        {/* =================================================
            FOOTER
            ================================================= */}

        <footer className="border-t border-white/10 bg-black/50 px-6 py-10">

          <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-zinc-500 md:flex-row md:justify-between">

            <p>
              THE GAME ARCHIVE
            </p>

            <p>
              La Pijamada Real · Archivo histórico · 2023–2026
            </p>

          </div>

        </footer>

      </div>

    </main>
  );
}