import { supabase } from "@/lib/supabase";
import GaleriaEdiciones from "@/app/components/GaleriaEdiciones";

// =====================================================
// CONFIGURACIÓN
// =====================================================

export const dynamic = "force-dynamic";
export const revalidate = 0;

// =====================================================
// TIPOS
// =====================================================

type Evento = {
  id: number;
  nombre: string;
  logo: string | null;
};

type Edicion = {
  id: number;
  evento_id: number;
  año: string;
  fecha: string | null;
  galeria_drive_url: string | null;
  galeria_portada_url: string | null;
};

// =====================================================
// PÁGINA
// =====================================================

export default async function GaleriaPage() {
  // ===================================================
  // EVENTOS
  // ===================================================

  const {
    data: eventosData,
    error: eventosError,
  } = await supabase
    .from("eventos")
    .select("id, nombre, logo")
    .order("nombre", {
      ascending: true,
    });

  // ===================================================
  // EDICIONES
  // ===================================================

  const {
    data: edicionesData,
    error: edicionesError,
  } = await supabase
    .from("ediciones")
    .select(
      `
        id,
        evento_id,
        año,
        fecha,
        galeria_drive_url,
        galeria_portada_url
      `
    )
    .order("fecha", {
      ascending: false,
    });

  // ===================================================
  // ERRORES
  // ===================================================

  if (eventosError || edicionesError) {
    console.error({
      eventosError,
      edicionesError,
    });

    return (
      <main className="min-h-screen bg-black px-6 py-20">
        <div className="mx-auto max-w-5xl rounded-3xl border border-red-500/20 bg-red-950/20 p-8 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-red-400">
            Error
          </p>

          <h1 className="mt-3 text-3xl font-black text-white">
            No se pudo cargar la galería
          </h1>

          <p className="mt-4 text-zinc-400">
            Intenta recargar la página.
          </p>
        </div>
      </main>
    );
  }

  // ===================================================
  // DATOS
  // ===================================================

  const eventos =
    (eventosData ?? []) as unknown as Evento[];

  const ediciones =
    (edicionesData ?? []) as unknown as Edicion[];

  // ===================================================
  // MAPA DE EVENTOS
  // ===================================================

  const mapaEventos = new Map<number, Evento>();

  for (const evento of eventos) {
    mapaEventos.set(evento.id, evento);
  }

  // ===================================================
  // CONSTRUIR EDICIONES
  // ===================================================

  const edicionesGaleria = ediciones
    .map((edicion) => {
      const evento = mapaEventos.get(
        edicion.evento_id
      );

      if (!evento) {
        return null;
      }

      return {
        id: edicion.id,

        eventoId: evento.id,

        eventoNombre: evento.nombre,

        eventoLogo: evento.logo,

        año: edicion.año,

        fecha: edicion.fecha,

        galeriaPortadaUrl:
          edicion.galeria_portada_url,

        galeriaDriveUrl:
          edicion.galeria_drive_url,
      };
    })
    .filter(
      (
        edicion
      ): edicion is NonNullable<
        typeof edicion
      > =>
        edicion !== null
    );

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <main className="relative min-h-screen overflow-hidden bg-black">

      {/* =================================================
          FONDO
          ================================================= */}

      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('/eventos/todos.jfif')",
        }}
      />

      {/* =================================================
          OSCURECER
          ================================================= */}

      <div className="fixed inset-0 bg-black/65" />

      {/* =================================================
          CONTENIDO
          ================================================= */}

      <div className="relative z-10 min-h-screen">

        {/* =================================================
            ENCABEZADO
            ================================================= */}

        <section className="border-b border-white/10 bg-black/20">
          <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">

            <div className="text-center">

              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-violet-400">
                Recuerdos
              </p>

              <h1 className="mt-4 text-5xl font-black tracking-tight text-white drop-shadow-2xl md:text-7xl">
                GALERÍA
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-300 drop-shadow-lg">
                Fotografías de cada edición de
                nuestros eventos. Selecciona una
                edición para explorar todos sus
                recuerdos.
              </p>

            </div>

          </div>
        </section>

        {/* =================================================
            EDICIONES
            ================================================= */}

        <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">

          <GaleriaEdiciones
            ediciones={edicionesGaleria}
          />

        </section>

      </div>

    </main>
  );
}