"use client";

import { useEffect, useState } from "react";

type Foto = {
  id: number;
  imagen: string;
  descripcion: string | null;
  orden: number | null;
  created_at: string;
};

type EdicionGaleria = {
  id: number;
  eventoId: number;
  eventoNombre: string;
  eventoLogo: string | null;
  año: string;
  fecha: string | null;
  fotos: Foto[];
};

type GaleriaEdicionesProps = {
  ediciones: EdicionGaleria[];
};

export default function GaleriaEdiciones({
  ediciones,
}: GaleriaEdicionesProps) {
  const [edicionSeleccionada, setEdicionSeleccionada] =
    useState<EdicionGaleria | null>(null);
  const [fotoActual, setFotoActual] = useState(0);

  useEffect(() => {
    function manejarTeclado(event: KeyboardEvent) {
      if (!edicionSeleccionada) {
        return;
      }

      if (event.key === "Escape") {
        cerrarGaleria();
      }

      if (event.key === "ArrowRight") {
        siguienteFoto();
      }

      if (event.key === "ArrowLeft") {
        fotoAnterior();
      }
    }

    window.addEventListener("keydown", manejarTeclado);

    return () => {
      window.removeEventListener("keydown", manejarTeclado);
    };
  }, [edicionSeleccionada, fotoActual]);

  useEffect(() => {
    if (edicionSeleccionada) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [edicionSeleccionada]);

  function abrirGaleria(edicion: EdicionGaleria) {
    setEdicionSeleccionada(edicion);
    setFotoActual(0);
  }

  function cerrarGaleria() {
    setEdicionSeleccionada(null);
    setFotoActual(0);
  }

  function siguienteFoto() {
    if (!edicionSeleccionada || edicionSeleccionada.fotos.length === 0) {
      return;
    }

    setFotoActual((actual) =>
      actual === edicionSeleccionada.fotos.length - 1 ? 0 : actual + 1
    );
  }

  function fotoAnterior() {
    if (!edicionSeleccionada || edicionSeleccionada.fotos.length === 0) {
      return;
    }

    setFotoActual((actual) =>
      actual === 0 ? edicionSeleccionada.fotos.length - 1 : actual - 1
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ediciones.map((edicion) => {
          const portada = edicion.fotos[0];

          return (
            <button
              key={edicion.id}
              type="button"
              onClick={() => abrirGaleria(edicion)}
              className="group relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 text-left transition duration-500 hover:-translate-y-1 hover:border-violet-400/40 hover:shadow-2xl hover:shadow-violet-950/30"
            >
              {portada ? (
                <img
                  src={portada.imagen}
                  alt={`${edicion.eventoNombre} ${edicion.año}`}
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              ) : edicion.eventoLogo ? (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 p-12">
                  <img
                    src={edicion.eventoLogo}
                    alt={edicion.eventoNombre}
                    className="max-h-full max-w-full object-contain opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
                  />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                  <span className="text-sm uppercase tracking-[0.25em] text-zinc-600">
                    Sin fotografías
                  </span>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">
                  Edición
                </p>

                <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
                  {edicion.eventoNombre}
                </h2>

                <div className="mt-1 flex items-center justify-between gap-4">
                  <p className="text-lg font-bold text-zinc-300">
                    {edicion.año}
                  </p>

                  <span className="rounded-full border border-white/10 bg-black/50 px-3 py-1 text-xs font-semibold text-zinc-300 backdrop-blur">
                    {edicion.fotos.length}{" "}
                    {edicion.fotos.length === 1 ? "foto" : "fotos"}
                  </span>
                </div>
              </div>

              <div className="absolute inset-0 border border-transparent transition duration-500 group-hover:border-violet-400/30" />
            </button>
          );
        })}
      </div>

      {ediciones.length === 0 && (
        <div className="rounded-3xl border border-dashed border-white/10 bg-zinc-900/50 px-6 py-20 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-zinc-600">
            No hay ediciones con galería todavía
          </p>
        </div>
      )}

      {edicionSeleccionada && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              cerrarGaleria();
            }
          }}
        >
          <div className="fixed inset-y-0 left-0 right-0 lg:left-72">
            <div className="flex h-full flex-col">
              <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-black/80 px-5 py-4 backdrop-blur md:px-8">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-400">
                    Galería
                  </p>

                  <h2 className="mt-1 text-xl font-black text-white md:text-2xl">
                    {edicionSeleccionada.eventoNombre}{" "}
                    {edicionSeleccionada.año}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={cerrarGaleria}
                  aria-label="Cerrar galería"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-2xl text-zinc-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  ×
                </button>
              </div>

              {edicionSeleccionada.fotos.length > 0 ? (
                <>
                  <div className="relative flex min-h-0 flex-1 items-center justify-center p-4 md:p-8">
                    <img
                      src={
                        edicionSeleccionada.fotos[fotoActual]?.imagen ??
                        edicionSeleccionada.fotos[0].imagen
                      }
                      alt={
                        edicionSeleccionada.fotos[fotoActual]?.descripcion ??
                        `${edicionSeleccionada.eventoNombre} ${edicionSeleccionada.año}`
                      }
                      className="max-h-full max-w-full object-contain"
                    />

                    {edicionSeleccionada.fotos.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={fotoAnterior}
                          aria-label="Fotografía anterior"
                          className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/60 text-3xl text-white backdrop-blur transition hover:bg-black/80 md:left-8"
                        >
                          ‹
                        </button>

                        <button
                          type="button"
                          onClick={siguienteFoto}
                          aria-label="Siguiente fotografía"
                          className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/60 text-3xl text-white backdrop-blur transition hover:bg-black/80 md:right-8"
                        >
                          ›
                        </button>
                      </>
                    )}
                  </div>

                  <div className="shrink-0 border-t border-white/10 bg-black/80 px-4 py-4 backdrop-blur md:px-8">
                    <div className="mb-4 flex items-center justify-center">
                      <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-semibold text-zinc-300">
                        {fotoActual + 1} / {edicionSeleccionada.fotos.length}
                      </span>
                    </div>

                    <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto pb-1">
                      {edicionSeleccionada.fotos.map((foto, index) => (
                        <button
                          key={foto.id}
                          type="button"
                          onClick={() => setFotoActual(index)}
                          aria-label={`Ver fotografía ${index + 1}`}
                          className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition md:h-20 md:w-24 ${
                            index === fotoActual
                              ? "border-violet-400 opacity-100"
                              : "border-transparent opacity-50 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={foto.imagen}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center p-8 text-center">
                  <div>
                    {edicionSeleccionada.eventoLogo && (
                      <img
                        src={edicionSeleccionada.eventoLogo}
                        alt={edicionSeleccionada.eventoNombre}
                        className="mx-auto mb-8 max-h-40 max-w-xs object-contain opacity-70"
                      />
                    )}

                    <p className="text-sm uppercase tracking-[0.25em] text-zinc-600">
                      Esta edición todavía no tiene fotografías
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}