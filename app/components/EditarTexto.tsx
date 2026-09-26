"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  valor: string;
  campo: string;
  eventoId: number;
  multilinea?: boolean;
  claseTexto?: string;
};

export default function EditarTexto({
  valor,
  campo,
  eventoId,
  multilinea = false,
  claseTexto = "",
}: Props) {
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(valor);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  function comenzarEdicion() {
    setTexto(valor);
    setError("");
    setEditando(true);
  }

  function cancelar() {
    if (guardando) {
      return;
    }

    setTexto(valor);
    setError("");
    setEditando(false);
  }

  async function guardar() {
    const nuevoTexto = texto.trim();

    if (!nuevoTexto) {
      setError("El texto no puede quedar vacío.");
      return;
    }

    setGuardando(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          "No hay una sesión iniciada."
        );
      }

      const {
        data: perfil,
        error: perfilError,
      } = await supabase
        .from("perfiles")
        .select("id, rol, activo")
        .eq("id", user.id)
        .single();

      if (
        perfilError ||
        !perfil ||
        !perfil.activo
      ) {
        throw new Error(
          "Tu cuenta no está autorizada."
        );
      }

      if (perfil.rol !== "superadmin") {
        throw new Error(
          "No tienes permiso para editar."
        );
      }

      const { error: updateError } =
        await supabase
          .from("eventos")
          .update({
            [campo]: nuevoTexto,
          })
          .eq("id", eventoId);

      if (updateError) {
        throw updateError;
      }

      setTexto(nuevoTexto);
      setEditando(false);

      window.location.reload();
    } catch (error) {
      console.error(
        "ERROR GUARDANDO:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "No fue posible guardar."
      );
    } finally {
      setGuardando(false);
    }
  }

  /*
   * MODO EDICIÓN
   */

  if (editando) {
    return (
      <div className="w-full">
        {multilinea ? (
          <textarea
            value={texto}
            onChange={(event) =>
              setTexto(event.target.value)
            }
            autoFocus
            rows={7}
            className="w-full resize-y rounded-2xl border border-violet-500 bg-black/90 px-5 py-4 text-white outline-none focus:border-violet-400"
          />
        ) : (
          <input
            type="text"
            value={texto}
            onChange={(event) =>
              setTexto(event.target.value)
            }
            autoFocus
            className="w-full rounded-2xl border border-violet-500 bg-black/90 px-5 py-4 text-white outline-none focus:border-violet-400"
          />
        )}

        {error && (
          <p className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="mt-4 flex justify-center gap-3">
          <button
            type="button"
            onClick={cancelar}
            disabled={guardando}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            CANCELAR
          </button>

          <button
            type="button"
            onClick={guardar}
            disabled={guardando}
            className="rounded-xl bg-violet-600 px-5 py-2 text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {guardando
              ? "GUARDANDO..."
              : "GUARDAR"}
          </button>
        </div>
      </div>
    );
  }

  /*
   * TEXTO NORMAL + LÁPIZ
   *
   * El lápiz queda junto al texto y no
   * se posiciona según el ancho de la página.
   */

  return (
    <span className="inline-flex max-w-full items-center gap-3 align-middle">
      <span className={claseTexto}>
        {valor}
      </span>

      <button
        type="button"
        onClick={comenzarEdicion}
        title={`Editar ${campo}`}
        aria-label={`Editar ${campo}`}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/50 bg-violet-600/30 text-lg text-white shadow-md transition-all duration-200 hover:border-violet-400/80 hover:bg-violet-600/60"
      >
        ✏️
      </button>
    </span>
  );
}