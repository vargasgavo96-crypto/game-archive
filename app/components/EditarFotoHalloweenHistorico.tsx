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
      if (!archivo.type.startsWith("image/")) {
        throw new Error("El archivo seleccionado no es una imagen.");
      }

      if (archivo.size > 10 * 1024 * 1024) {
        throw new Error("La imagen no puede superar los 10 MB.");
      }

      const extension =
        archivo.name.split(".").pop()?.toLowerCase() || "jpg";

      const nombreArchivo =
        `${año}-${posicion}-${Date.now()}.${extension}`;

      const ruta =
        `halloween-historico/${año}/${posicion}/${nombreArchivo}`;

      const { error: uploadError } = await supabase.storage
        .from("eventos-fotos")
        .upload(ruta, archivo, {
          upsert: true,
          contentType: archivo.type,
          cacheControl: "3600",
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from("eventos-fotos")
        .getPublicUrl(ruta);

      const nuevaImagen = publicUrlData.publicUrl;

      if (registroId) {
        const { error: updateError } = await supabase
          .from("halloween_historico")
          .update({
            imagen: nuevaImagen,
          })
          .eq("id", registroId);

        if (updateError) {
          throw updateError;
        }
      } else {
        const { data: registroExistente, error: buscarError } =
          await supabase
            .from("halloween_historico")
            .select("id")
            .eq("año", año)
            .eq("posicion", posicion)
            .maybeSingle();

        if (buscarError) {
          throw buscarError;
        }

        if (registroExistente) {
          const { error: updateError } = await supabase
            .from("halloween_historico")
            .update({
              imagen: nuevaImagen,
            })
            .eq("id", registroExistente.id);

          if (updateError) {
            throw updateError;
          }
        } else {
          const { error: insertError } = await supabase
            .from("halloween_historico")
            .insert({
              año,
              posicion,
              nombre,
              imagen: nuevaImagen,
            });

          if (insertError) {
            throw insertError;
          }
        }
      }

      window.location.reload();
    } catch (err) {
      console.error(
        "Error guardando foto histórica:",
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
        <p className="max-w-xs text-center text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
