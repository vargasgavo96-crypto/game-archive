"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

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
  const [error, setError] = useState<string | null>(null);

  async function seleccionarFoto(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const archivo = event.target.files?.[0];

    if (!archivo) return;

    setError(null);
    setSubiendo(true);

    try {
      // =================================================
      // VALIDAR IMAGEN
      // =================================================

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

      // =================================================
      // EXTENSIÓN
      // =================================================

      const extension =
        archivo.name.split(".").pop()?.toLowerCase() || "jpg";

      // =================================================
      // NOMBRE ÚNICO
      // =================================================

      const nombreArchivo =
        `${año}-${posicion}-${Date.now()}.${extension}`;

      const ruta =
        `halloween-historico/${año}/${posicion}/${nombreArchivo}`;

      console.log("Subiendo fotografía:", ruta);

      // =================================================
      // SUBIR STORAGE
      // =================================================

      const { error: uploadError } =
        await supabase.storage
          .from("eventos-fotos")
          .upload(ruta, archivo, {
            upsert: false,
            contentType: archivo.type,
            cacheControl: "3600",
          });

      if (uploadError) {
        console.error("ERROR STORAGE:", uploadError);

        throw new Error(
          `Error de Storage: ${uploadError.message}`
        );
      }

      // =================================================
      // OBTENER URL PÚBLICA
      // =================================================

      const { data: publicUrlData } =
        supabase.storage
          .from("eventos-fotos")
          .getPublicUrl(ruta);

      const nuevaImagen = publicUrlData.publicUrl;

      console.log("Nueva URL:", nuevaImagen);

      // =================================================
      // BUSCAR REGISTRO EXISTENTE
      // =================================================

      const {
        data: registroExistente,
        error: buscarError,
      } = await supabase
        .from("halloween_historico")
        .select(
          "id, año, posicion, nombre, persona_id, imagen"
        )
        .eq("año", año)
        .eq("posicion", posicion)
        .maybeSingle();

      if (buscarError) {
        console.error(
          "ERROR BUSCANDO REGISTRO:",
          buscarError
        );

        throw new Error(
          `Error leyendo halloween_historico: ${buscarError.message}`
        );
      }

      // =================================================
      // ACTUALIZAR REGISTRO EXISTENTE
      // =================================================

      if (registroExistente) {
        console.log(
          "Actualizando registro:",
          registroExistente.id
        );

        const { error: updateError } =
          await supabase
            .from("halloween_historico")
            .update({
              imagen: nuevaImagen,
            })
            .eq("id", registroExistente.id);

        if (updateError) {
          console.error(
            "ERROR UPDATE:",
            updateError
          );

          throw new Error(
            `Error actualizando halloween_historico: ${updateError.message}`
          );
        }
      }

      // =================================================
      // CREAR REGISTRO SI NO EXISTE
      // =================================================

      else {
        console.log(
          "No existe registro. Creando uno nuevo."
        );

        const { error: insertError } =
          await supabase
            .from("halloween_historico")
            .insert({
              año,
              posicion,
              nombre,
              imagen: nuevaImagen,
            });

        if (insertError) {
          console.error(
            "ERROR INSERT:",
            insertError
          );

          throw new Error(
            `Error creando halloween_historico: ${insertError.message}`
          );
        }
      }

      // =================================================
      // ÉXITO
      // =================================================

      console.log(
        "Fotografía guardada correctamente."
      );

      window.location.reload();
    } catch (err) {
      console.error(
        "ERROR GUARDANDO FOTO HISTÓRICA:",
        err
      );

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
    <div className="mt-5 flex flex-col items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={seleccionarFoto}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={subiendo}
        className="rounded-full border border-orange-500/30 bg-black/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-400 transition hover:border-orange-500 hover:bg-orange-500/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {subiendo
          ? "Subiendo..."
          : imagen
            ? "Cambiar foto"
            : "Agregar foto"}
      </button>

      {error && (
        <div className="max-w-xs text-center">
          <p className="text-xs font-semibold text-red-400">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}