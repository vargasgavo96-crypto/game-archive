"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  registroId?: number | null;
  año: number;
  posicion: number;
  nombre: string;
  imagen?: string | null;
};

export default function EditarFotoHalloweenHistorico({
  registroId,
  año,
  posicion,
  nombre,
  imagen,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [subiendo, setSubiendo] = useState(false);
  const [estado, setEstado] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function seleccionarFoto(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const archivo = event.target.files?.[0];

    if (!archivo) return;

    setError(null);
    setSubiendo(true);
    setEstado("Comprobando sesión...");

    try {
      console.log("========== HALLOWEEN FOTO ==========");
      console.log("Año:", año);
      console.log("Posición:", posicion);
      console.log("Registro:", registroId);
      console.log("Archivo:", archivo.name);
      console.log("Tamaño:", archivo.size);
      console.log("Tipo:", archivo.type);

      // =====================================================
      // SESIÓN
      // =====================================================

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      console.log("SESSION:", session);
      console.log("SESSION ERROR:", sessionError);

      if (sessionError) {
        throw new Error(
          `Error obteniendo sesión: ${sessionError.message}`
        );
      }

      if (!session) {
        throw new Error(
          "NO HAY SESIÓN INICIADA. Debes iniciar sesión para subir fotografías."
        );
      }

      console.log("Sesión OK:", session.user.id);

      // =====================================================
      // VALIDAR
      // =====================================================

      if (!archivo.type.startsWith("image/")) {
        throw new Error(
          "El archivo seleccionado no es una imagen."
        );
      }

      if (archivo.size > 10 * 1024 * 1024) {
        throw new Error(
          "La imagen no puede superar los 10 MB."
        );
      }

      // =====================================================
      // RUTA
      // =====================================================

      const extension =
        archivo.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      const nombreArchivo =
        `${año}-${posicion}-${Date.now()}.${extension}`;

      const ruta =
        `halloween-historico/${año}/${posicion}/${nombreArchivo}`;

      console.log("RUTA:", ruta);

      // =====================================================
      // STORAGE
      // =====================================================

      setEstado("Subiendo fotografía a Supabase...");

      console.log("INICIANDO UPLOAD...");

      const {
        data: uploadData,
        error: uploadError,
      } = await supabase.storage
        .from("eventos-fotos")
        .upload(
          ruta,
          archivo,
          {
            upsert: false,
            contentType: archivo.type,
            cacheControl: "3600",
          }
        );

      console.log("UPLOAD TERMINÓ");
      console.log("UPLOAD DATA:", uploadData);
      console.log("UPLOAD ERROR:", uploadError);

      if (uploadError) {
        throw new Error(
          `Error de Storage: ${uploadError.message}`
        );
      }

      if (!uploadData) {
        throw new Error(
          "Supabase no devolvió información después de subir la imagen."
        );
      }

      // =====================================================
      // URL
      // =====================================================

      setEstado("Obteniendo URL de la fotografía...");

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("eventos-fotos")
        .getPublicUrl(ruta);

      const nuevaImagen =
        publicUrlData.publicUrl;

      console.log(
        "URL NUEVA:",
        nuevaImagen
      );

      if (!nuevaImagen) {
        throw new Error(
          "No se pudo obtener la URL pública."
        );
      }

      // =====================================================
      // ACTUALIZAR REGISTRO EXISTENTE
      // =====================================================

      if (registroId) {
        setEstado(
          "Guardando fotografía en la base de datos..."
        );

        console.log(
          "ACTUALIZANDO ID:",
          registroId
        );

        const {
          error: updateError,
        } = await supabase
          .from("halloween_historico")
          .update({
            imagen: nuevaImagen,
          })
          .eq(
            "id",
            registroId
          );

        console.log(
          "UPDATE ERROR:",
          updateError
        );

        if (updateError) {
          throw new Error(
            `Error actualizando la base de datos: ${updateError.message}`
          );
        }

        console.log(
          "UPDATE CORRECTO"
        );

        setEstado("¡Fotografía guardada!");

        window.location.reload();

        return;
      }

      // =====================================================
      // BUSCAR REGISTRO
      // =====================================================

      setEstado(
        "Buscando registro histórico..."
      );

      const {
        data: registroExistente,
        error: buscarError,
      } = await supabase
        .from("halloween_historico")
        .select("*")
        .eq("año", año)
        .eq("posicion", posicion)
        .maybeSingle();

      console.log(
        "REGISTRO EXISTENTE:",
        registroExistente
      );

      console.log(
        "ERROR BUSCANDO:",
        buscarError
      );

      if (buscarError) {
        throw new Error(
          `Error leyendo halloween_historico: ${buscarError.message}`
        );
      }

      // =====================================================
      // ACTUALIZAR
      // =====================================================

      if (registroExistente) {
        setEstado(
          "Actualizando registro..."
        );

        const {
          error: updateError,
        } = await supabase
          .from("halloween_historico")
          .update({
            imagen: nuevaImagen,
          })
          .eq(
            "id",
            registroExistente.id
          );

        if (updateError) {
          throw new Error(
            `Error actualizando: ${updateError.message}`
          );
        }
      }

      // =====================================================
      // INSERTAR
      // =====================================================

      else {
        setEstado(
          "Creando registro histórico..."
        );

        const {
          error: insertError,
        } = await supabase
          .from("halloween_historico")
          .insert({
            año,
            posicion,
            nombre,
            imagen: nuevaImagen,
          });

        if (insertError) {
          throw new Error(
            `Error creando registro: ${insertError.message}`
          );
        }
      }

      setEstado("¡Fotografía guardada!");

      window.location.reload();

    } catch (err) {
      console.error(
        "========== ERROR HALLOWEEN =========="
      );
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar la fotografía."
      );
    } finally {
      setSubiendo(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="mt-5 flex flex-col items-center gap-3">

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={seleccionarFoto}
        className="hidden"
      />

      <button
        type="button"
        onClick={() =>
          inputRef.current?.click()
        }
        disabled={subiendo}
        className="rounded-full border border-orange-500/30 bg-black/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-400 transition hover:border-orange-500 hover:bg-orange-500/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {subiendo
          ? "Subiendo..."
          : imagen
            ? "Cambiar foto"
            : "Agregar foto"}
      </button>

      {subiendo && estado && (
        <p className="text-center text-xs font-semibold text-orange-400">
          {estado}
        </p>
      )}

      {error && (
        <div className="max-w-sm text-center">
          <p className="text-xs font-semibold leading-5 text-red-400">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}