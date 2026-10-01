"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

type GaleriaFotosProps = {
  edicionId: number;
};

type EdicionGaleria = {
  galeria_drive_url: string | null;
  galeria_portada_url: string | null;
};

export default function GaleriaFotos({
  edicionId,
}: GaleriaFotosProps) {
  const [galeria, setGaleria] =
    useState<EdicionGaleria | null>(null);

  const [cargando, setCargando] =
    useState(true);

  const [usuarioLogeado, setUsuarioLogeado] =
    useState(false);

  const [subiendoPortada, setSubiendoPortada] =
    useState(false);

  const [error, setError] =
    useState("");

  const inputPortadaRef =
    useRef<HTMLInputElement>(null);

  // =====================================================
  // CARGAR GALERÍA
  // =====================================================

  async function cargarGaleria() {
    setCargando(true);
    setError("");

    const {
      data,
      error: errorGaleria,
    } = await supabase
      .from("ediciones")
      .select(
        "galeria_drive_url, galeria_portada_url"
      )
      .eq("id", edicionId)
      .single();

    if (errorGaleria) {
      console.error(
        "Error cargando galería:",
        errorGaleria
      );

      setError(
        "No se pudo cargar la galería."
      );

      setGaleria(null);
      setCargando(false);

      return;
    }

    setGaleria(
      data as EdicionGaleria
    );

    setCargando(false);
  }

  // =====================================================
  // SESIÓN
  // =====================================================

  useEffect(() => {
    async function comprobarSesion() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUsuarioLogeado(!!user);
    }

    comprobarSesion();

    const {
      data: listener,
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUsuarioLogeado(
          !!session?.user
        );
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // =====================================================
  // CARGAR DATOS
  // =====================================================

  useEffect(() => {
    cargarGaleria();
  }, [edicionId]);

  // =====================================================
  // ABRIR SELECTOR DE PORTADA
  // =====================================================

  function abrirSelectorPortada() {
    if (!usuarioLogeado) {
      return;
    }

    setError("");

    inputPortadaRef.current?.click();
  }

  // =====================================================
  // COMPRIMIR IMAGEN
  // =====================================================

  async function comprimirImagen(
    archivo: File
  ): Promise<Blob> {
    return new Promise(
      (resolve, reject) => {
        const imagen =
          new Image();

        const url =
          URL.createObjectURL(
            archivo
          );

        imagen.onload = () => {
          URL.revokeObjectURL(url);

          const maxWidth = 1200;

          const escala =
            Math.min(
              1,
              maxWidth /
                imagen.width
            );

          const ancho =
            Math.round(
              imagen.width *
                escala
            );

          const alto =
            Math.round(
              imagen.height *
                escala
            );

          const canvas =
            document.createElement(
              "canvas"
            );

          canvas.width = ancho;
          canvas.height = alto;

          const contexto =
            canvas.getContext(
              "2d"
            );

          if (!contexto) {
            reject(
              new Error(
                "No se pudo preparar la imagen."
              )
            );

            return;
          }

          contexto.drawImage(
            imagen,
            0,
            0,
            ancho,
            alto
          );

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(
                  new Error(
                    "No se pudo comprimir la imagen."
                  )
                );

                return;
              }

              resolve(blob);
            },
            "image/jpeg",
            0.82
          );
        };

        imagen.onerror = () => {
          URL.revokeObjectURL(url);

          reject(
            new Error(
              "No se pudo leer la imagen."
            )
          );
        };

        imagen.src = url;
      }
    );
  }

  // =====================================================
  // CAMBIAR PORTADA
  // =====================================================

  async function cambiarPortada(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const archivo =
      event.target.files?.[0];

    event.target.value = "";

    if (!archivo) {
      return;
    }

    if (!usuarioLogeado) {
      setError(
        "Debes iniciar sesión para cambiar la portada."
      );

      return;
    }

    if (
      !archivo.type.startsWith(
        "image/"
      )
    ) {
      setError(
        "Selecciona una imagen válida."
      );

      return;
    }

    setSubiendoPortada(true);
    setError("");

    try {
      // -------------------------------------------------
      // COMPRIMIR IMAGEN
      // -------------------------------------------------

      const imagenComprimida =
        await comprimirImagen(
          archivo
        );

      // -------------------------------------------------
      // RUTA
      // -------------------------------------------------

      const ruta =
        `galerias-portadas/${edicionId}/portada-${Date.now()}.jpg`;

      // -------------------------------------------------
      // SUBIR A STORAGE
      // -------------------------------------------------

      const {
        error: uploadError,
      } = await supabase.storage
        .from("eventos-fotos")
        .upload(
          ruta,
          imagenComprimida,
          {
            cacheControl:
              "3600",
            contentType:
              "image/jpeg",
            upsert: false,
          }
        );

      if (uploadError) {
        throw uploadError;
      }

      // -------------------------------------------------
      // OBTENER URL
      // -------------------------------------------------

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("eventos-fotos")
        .getPublicUrl(ruta);

      const nuevaPortada =
        publicUrlData.publicUrl;

      // -------------------------------------------------
      // GUARDAR EN EDICIONES
      // -------------------------------------------------

      const {
        error: updateError,
      } = await supabase
        .from("ediciones")
        .update({
          galeria_portada_url:
            nuevaPortada,
        })
        .eq(
          "id",
          edicionId
        );

      if (updateError) {
        throw updateError;
      }

      // -------------------------------------------------
      // ACTUALIZAR PANTALLA
      // -------------------------------------------------

      setGaleria(
        (actual) => ({
          galeria_drive_url:
            actual?.galeria_drive_url ??
            null,

          galeria_portada_url:
            nuevaPortada,
        })
      );
    } catch (error) {
      console.error(
        "Error cambiando portada:",
        error
      );

      setError(
        "No se pudo cambiar la portada."
      );
    } finally {
      setSubiendoPortada(false);
    }
  }

  // =====================================================
  // CARGANDO
  // =====================================================

  if (cargando) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-3xl border border-white/10 bg-black/50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  // =====================================================
  // SIN GALERÍA
  // =====================================================

  if (
    !galeria?.galeria_drive_url
  ) {
    return null;
  }

  // =====================================================
  // PORTADA
  // =====================================================

  const portada =
    galeria.galeria_portada_url ??
    "/eventos/halloween.png";

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="relative">

      {/* =================================================
          BOTÓN EDITAR PORTADA
      ================================================= */}

      {usuarioLogeado && (
        <>
          <button
            type="button"
            onClick={
              abrirSelectorPortada
            }
            disabled={
              subiendoPortada
            }
            className="absolute right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-black/80 text-lg shadow-xl backdrop-blur-md transition hover:scale-105 hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            title="Cambiar portada"
          >
            {subiendoPortada
              ? "⏳"
              : "✏️"}
          </button>

          <input
            ref={inputPortadaRef}
            type="file"
            accept="image/*"
            onChange={
              cambiarPortada
            }
            className="hidden"
          />
        </>
      )}

      {/* =================================================
          TARJETA
      ================================================= */}

      <a
        href={
          galeria.galeria_drive_url
        }
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
      >
        <div className="relative flex min-h-[250px] items-center overflow-hidden rounded-3xl border border-white/10 bg-black/65 px-8 py-8 transition duration-300 hover:border-white/20 hover:bg-black/75 md:px-12">

          {/* =================================================
              TEXTO
          ================================================= */}

          <div className="flex-1 pr-8">

            <h3 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              GALERÍA
            </h3>

            <div className="mt-7 inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition-transform duration-300 group-hover:translate-x-2">
              REVISA LAS FOTOS DE ESTA EDICIÓN

              <span className="text-2xl">
                →
              </span>
            </div>

          </div>

          {/* =================================================
              PORTADA CUADRADA DORADA
          ================================================= */}

          <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-2xl border-2 border-amber-400/80 bg-zinc-900 shadow-[0_0_25px_rgba(251,191,36,0.25)] md:h-48 md:w-48">

            <img
              src={portada}
              alt="Portada de la galería"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-black/10 transition group-hover:bg-black/0" />

          </div>

          {/* =================================================
              ICONO ABRIR
          ================================================= */}

          <div className="absolute bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded-full border border-amber-400/40 bg-black/70 text-lg text-white backdrop-blur-md transition duration-300 group-hover:scale-110">
            ↗
          </div>

        </div>
      </a>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <p className="mt-3 text-center text-sm text-red-400">
          {error}
        </p>
      )}

    </div>
  );
}