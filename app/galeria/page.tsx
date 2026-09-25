import { supabase } from "@/lib/supabase";
import GaleriaEdiciones from "@/app/components/GaleriaEdiciones";

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
};

type Foto = {
  id: number;
  edicion_id: number;
  imagen: string;
  descripcion: string | null;
  orden: number | null;
  created_at: string;
};

export default async function GaleriaPage() {
  const [
    { data: eventosData, error: eventosError },
    { data: edicionesData, error: edicionesError },
    { data: fotosData, error: fotosError },
  ] = await Promise.all([
    supabase
      .from("eventos")
      .select("id, nombre, logo")
      .order("nombre", { ascending: true }),
    supabase
      .from("ediciones")
      .select("*")
      .order("fecha", { ascending: false }),
    supabase
      .from("galerias")
      .select(
        "id, edicion_id, imagen, descripcion, orden, created_at"
      )
      .order("orden", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  if (eventosError || edicionesError || fotosError) {
    console.error({
      eventosError,
      edicionesError,
      fotosError,
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

  const eventos =
    (eventosData ?? []) as unknown as Evento[];

  const ediciones =
    (edicionesData ?? []) as unknown as Edicion[];

  const fotos =
    (fotosData ?? []) as unknown as Foto[];

  const mapaEventos = new Map<number, Evento>();

  for (const evento of eventos) {
    mapaEventos.set(evento.id, evento);
  }

  const mapaFotos = new Map<number, Foto[]>();

  for (const foto of fotos) {
    const fotosEdicion =
      mapaFotos.get(foto.edicion_id) ?? [];

    fotosEdicion.push(foto);

    mapaFotos.set(
      foto.edicion_id,
      fotosEdicion
    );
  }

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
        fotos: mapaFotos.get(edicion.id) ?? [],
      };
    })
    .filter(
      (
        edicion
      ): edicion is NonNullable<typeof edicion> =>
        edicion !== null
    );

  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      {/* FONDO */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('/eventos/todos.jfif')",
        }}
      />

      {/* OSCURECER FONDO */}
      <div className="fixed inset-0 bg-black/65" />

      {/* CONTENIDO */}
      <div className="relative z-10 min-h-screen">
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
                Fotografías de cada edición de nuestros
                eventos. Selecciona una edición para
                explorar todos sus recuerdos.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <GaleriaEdiciones
            ediciones={edicionesGaleria}
          />
        </section>
      </div>
    </main>
  );
}