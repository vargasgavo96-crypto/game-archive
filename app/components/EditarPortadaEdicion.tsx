"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

type Props = {
  edicionId: number;
};

// =====================================================
// COMPRIMIR IMAGEN
// =====================================================

async function comprimirImagen(
  archivo: File
): Promise<File> {
  const maxBytes = 800 * 1024;

  if (archivo.size <= maxBytes) {
    return archivo;
  }

  const bitmap =
    await createImageBitmap(archivo);

  const maxDimension = 1600;

  let ancho = bitmap.width;
  let alto = bitmap.height;

  if (
    ancho > maxDimension ||
    alto > maxDimension
  ) {
    const escala = Math.min(
      maxDimension / ancho,
      maxDimension / alto
    );

    ancho = Math.round(
      ancho * escala
    );

    alto = Math.round(
      alto * escala
    );
  }

  const canvas =
    document.createElement("canvas");

  canvas.width = ancho;
  canvas.height = alto;

  const ctx =
    canvas.getContext("2d");

  if (!ctx) {
    throw new Error(
      "No se pudo preparar la imagen."
    );
  }

  ctx.drawImage(
    bitmap,
    0,
    0,
    ancho,
    alto
  );

  bitmap.close();

  let calidad = 0.82;
  let blob: Blob | null = null;

  while (calidad >= 0.45) {
    blob =
      await new Promise<Blob | null>(
        (resolve) =>
          canvas.toBlob(
            resolve,
            "image/jpeg",
            calidad
          )
      );

    if (
      blob &&
      blob.size <= maxBytes
    ) {
      break;
    }

    calidad -= 0.07;
  }

  if (!blob) {
    throw new Error(
      "No se pudo comprimir la imagen."
    );
  }

  return new File(
    [blob],
    `portada-${Date.now()}.jpg`,
    {
      type: "image/jpeg",
    }
  );
}

// =====================================================
// OBTENER RUTA STORAGE
// =====================================================

function obtenerRutaStorage(
  url: string
) {
  const marcador =
    "/storage/v1/object/public/eventos-fotos/";

  const posicion =
    url.indexOf(marcador);

  if (posicion === -1) {
    return null;
  }

  return decodeURIComponent(
    url.slice(
      posicion + marcador.length
    )
  );
}

// =====================================================
// COMPONENTE
// =====================================================

export default function EditarPortadaEdicion({
  edicionId,
}: Props) {
  const inputRef =
    useRef<HTMLInputElement>(null);

  const [
    usuarioAutorizado,
    setUsuarioAutorizado,
  ] = useState(false);

  const [comprobandoPermisos, setComprobandoPermisos] =
    useState(true);

  const [subiendo, setSubiendo] =
    useState(false);

  const [error, setError] =
    useState("");

  // ===================================================
  // COMPROBAR PERMISOS
  // ===================================================

  useEffect(() => {
    let activo = true;

    async function comprobarPermisos() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (
          userError ||
          !user
        ) {
          if (activo) {
            setUsuarioAutorizado(false);
          }

          return;
        }

        const {
          data: perfil,
          error: perfilError,
        } = await supabase
          .from("perfiles")
          .select("rol, activo")
          .eq("id", user.id)
          .single();

        if (perfilError) {
          console.error(
            "ERROR PERFIL:",
            perfilError
          );

          if (activo) {
            setUsuarioAutorizado(false);
          }

          return;
        }

        if (
          activo &&
          perfil?.rol === "superadmin" &&
          perfil?.activo === true
        ) {
          setUsuarioAutorizado(true);
        } else if (activo) {
          setUsuarioAutorizado(false);
        }
      } catch (error) {
        console.error(
          "ERROR COMPROBANDO PERMISOS:",
          error
        );

        if (activo) {
          setUsuarioAutorizado(false);
        }
      } finally {
        if (activo) {
          setComprobandoPermisos(false);
        }
      }
    }

    comprobarPermisos();

    return () => {
      activo = false;
    };
  }, []);

  // ===================================================
  // ABRIR SELECTOR
  // ===================================================

  function abrirSelector() {
    if (subiendo) {
      return;
    }

    setError("");

    inputRef.current?.click();
  }

  // ===================================================
  // CAMBIAR PORTADA
  // ===================================================

  async function cambiarPortada(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const archivo =
      event.target.files?.[0];

    // Permite seleccionar nuevamente
    // el mismo archivo.
    event.target.value = "";

    if (!archivo) {
      return;
    }

    if (
      !archivo.type.startsWith("image/")
    ) {
      setError(
        "Selecciona una imagen válida."
      );

      return;
    }

    setSubiendo(true);
    setError("");

    try {
      // ================================================
      // USUARIO
      // ================================================

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (
        userError ||
        !user
      ) {
        throw new Error(
          "Debes iniciar sesión para cambiar la portada."
        );
      }

      // ================================================
      // PERMISOS
      // ================================================

      const {
        data: perfil,
        error: perfilError,
      } = await supabase
        .from("perfiles")
        .select("rol, activo")
        .eq("id", user.id)
        .single();

      if (perfilError) {
        throw new Error(
          `Error obteniendo permisos: ${perfilError.message}`
        );
      }

      if (
        perfil?.rol !== "superadmin" ||
        perfil?.activo !== true
      ) {
        throw new Error(
          "Tu usuario no tiene permisos para cambiar la portada."
        );
      }

      // ================================================
      // COMPRIMIR
      // ================================================

      const imagen =
        await comprimirImagen(
          archivo
        );

      // ================================================
      // PORTADA ACTUAL
      // ================================================

      const {
        data: edicion,
        error: lecturaError,
      } = await supabase
        .from("ediciones")
        .select(
          "galeria_portada_url"
        )
        .eq("id", edicionId)
        .single();

      if (lecturaError) {
        throw new Error(
          `Error leyendo la edición: ${lecturaError.message}`
        );
      }

      if (!edicion) {
        throw new Error(
          "No se encontró la edición."
        );
      }

      const rutaAnterior =
        edicion.galeria_portada_url
          ? obtenerRutaStorage(
              edicion.galeria_portada_url
            )
          : null;

      // ================================================
      // NUEVA RUTA
      // ================================================

      const ruta =
        `galerias-portadas/${edicionId}/${Date.now()}-${crypto.randomUUID()}.jpg`;

      // ================================================
      // STORAGE
      // ================================================

      const {
        error: uploadError,
      } =
        await supabase.storage
          .from("eventos-fotos")
          .upload(
            ruta,
            imagen,
            {
              cacheControl:
                "31536000",
              upsert: false,
              contentType:
                "image/jpeg",
            }
          );

      if (uploadError) {
        throw new Error(
          `Error subiendo la imagen: ${uploadError.message}`
        );
      }

      // ================================================
      // URL PÚBLICA
      // ================================================

      const {
        data: publicUrlData,
      } =
        supabase.storage
          .from("eventos-fotos")
          .getPublicUrl(ruta);

      const nuevaUrl =
        publicUrlData.publicUrl;

      if (!nuevaUrl) {
        // Intentar limpiar si no conseguimos URL.
        await supabase.storage
          .from("eventos-fotos")
          .remove([ruta]);

        throw new Error(
          "No se pudo obtener la URL pública de la imagen."
        );
      }

      // ================================================
      // GUARDAR EN EDICIONES
      // ================================================

      const {
        error: updateError,
      } = await supabase
        .from("ediciones")
        .update({
          galeria_portada_url:
            nuevaUrl,
        })
        .eq("id", edicionId);

      if (updateError) {
        await supabase.storage
          .from("eventos-fotos")
          .remove([ruta]);

        throw new Error(
          `Error guardando la portada: ${updateError.message}`
        );
      }

      // ================================================
      // ELIMINAR PORTADA ANTERIOR
      // ================================================

      if (
        rutaAnterior &&
        rutaAnterior !== ruta
      ) {
        const {
          error: eliminarError,
        } =
          await supabase.storage
            .from("eventos-fotos")
            .remove([
              rutaAnterior,
            ]);

        if (eliminarError) {
          console.warn(
            "No se pudo eliminar la portada anterior:",
            eliminarError
          );
        }
      }

      // ================================================
      // RECARGAR
      // ================================================

      window.location.reload();
    } catch (error: unknown) {
      console.error(
        "ERROR CAMBIANDO PORTADA:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "No se pudo cambiar la portada."
      );
    } finally {
      setSubiendo(false);
    }
  }

  // ===================================================
  // CARGANDO PERMISOS
  // ===================================================

  if (comprobandoPermisos) {
    return null;
  }

  // ===================================================
  // SIN PERMISOS
  // ===================================================

  if (!usuarioAutorizado) {
    return null;
  }

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="relative z-[100]">

      {/* =================================================
          INPUT
          ================================================= */}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={cambiarPortada}
      />

      {/* =================================================
          BOTÓN
          ================================================= */}

      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();

          abrirSelector();
        }}
        onMouseDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        disabled={subiendo}
        title="Cambiar portada"
        aria-label="Cambiar portada"
        className="
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-full
          border
          border-violet-300/50
          bg-black/80
          text-lg
          shadow-2xl
          backdrop-blur-md
          transition
          hover:scale-110
          hover:border-violet-300
          hover:bg-violet-600
          disabled:cursor-wait
          disabled:opacity-60
        "
      >
        {subiendo ? "⏳" : "✏️"}
      </button>

      {/* =================================================
          ERROR
          ================================================= */}

      {error && (
        <div
          className="
            absolute
            left-0
            top-14
            z-[9999]
            w-72
            rounded-xl
            border
            border-red-400/30
            bg-black/95
            px-4
            py-3
            text-xs
            font-medium
            text-red-200
            shadow-2xl
          "
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          {error}
        </div>
      )}

    </div>
  );
}