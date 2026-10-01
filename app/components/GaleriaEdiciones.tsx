"use client";

import EditarPortadaEdicion from "@/app/components/EditarPortadaEdicion";

type Foto = {
  id: number;
  edicion_id?: number;
  imagen: string;
  descripcion: string | null;
  orden: number | null;
  created_at: string;
  portada: boolean;
};

type EdicionGaleria = {
  id: number;
  eventoId: number;
  eventoNombre: string;
  eventoLogo: string | null;
  año: string;
  fecha: string | null;

  // NUEVO SISTEMA DE GALERÍA
  galeriaPortadaUrl?: string | null;
  galeriaDriveUrl?: string | null;

  // COMPATIBILIDAD CON PÁGINAS ANTIGUAS
  fotos?: Foto[];
};

type Props = {
  ediciones: EdicionGaleria[];
};

export default function GaleriaEdiciones({ ediciones }: Props) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {ediciones.map((edicion) => {
        const portada =
          edicion.galeriaPortadaUrl ??
          edicion.eventoLogo ??
          "/eventos/todos.jfif";

        function abrirGaleria() {
          if (!edicion.galeriaDriveUrl) return;

          window.open(
            edicion.galeriaDriveUrl,
            "_blank",
            "noopener,noreferrer"
          );
        }

        return (
          <div
            key={edicion.id}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl transition duration-300 hover:-translate-y-2 hover:border-violet-400/40 hover:shadow-violet-950/30"
          >
            <button
              type="button"
              onClick={abrirGaleria}
              disabled={!edicion.galeriaDriveUrl}
              className="relative block w-full text-left disabled:cursor-default"
            >
              <div className="relative h-[420px] overflow-hidden bg-zinc-950">
                <img
                  src={portada}
                  alt={`${edicion.eventoNombre} ${edicion.año}`}
                  className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                {edicion.galeriaDriveUrl && (
                  <div className="absolute right-5 top-5 z-20 rounded-full border border-white/20 bg-black/70 px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-white backdrop-blur-md transition group-hover:bg-violet-600">
                    VER GALERÍA
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 z-20 p-7">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-300">
                    Edición
                  </p>

                  <h2 className="mt-2 text-4xl font-black leading-tight text-white drop-shadow-2xl">
                    {edicion.eventoNombre}
                  </h2>

                  <p className="mt-2 text-2xl font-bold text-white/80">
                    {edicion.año}
                  </p>
                </div>
              </div>
            </button>

            <div
              className="absolute left-5 top-5 z-[100]"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
            >
              <EditarPortadaEdicion edicionId={edicion.id} />
            </div>
          </div>
        );
      })}
    </div>
  );
}