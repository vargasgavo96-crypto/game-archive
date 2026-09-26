"use client";

import {
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";

type Props = {
  valor: string;
  campo: string;
  edicionId: number;
  multilinea?: boolean;
  claseTexto?: string;
};

function nombreCampo(campo: string) {
  return campo
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letra) => letra.toUpperCase());
}

export default function EditarTextoEdicion({
  valor,
  campo,
  edicionId,
  multilinea = false,
  claseTexto = "",
}: Props) {
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(valor);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  function comenzarEdicion() {
    setTexto(valor);
    setError("");
    setEditando(true);
  }

  function cancelar() {
    if (guardando) return;

    setTexto(valor);
    setError("");
    setEditando(false);
  }

  async function guardar() {
    setError("");

    if (!texto.trim()) {
      setError("El contenido no puede estar vacío.");
      return;
    }

    setGuardando(true);

    try {
      // ==========================================
      // USUARIO
      // ==========================================

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(
          `Error de autenticación: ${userError.message}`
        );
      }

      if (!user) {
        throw new Error(
          "No hay una sesión iniciada."
        );
      }

      // ==========================================
      // PERFIL
      // ==========================================

      const {
        data: perfil,
        error: perfilError,
      } = await supabase
        .from("perfiles")
        .select("id, rol, activo")
        .eq("id", user.id)
        .single();

      if (perfilError) {
        throw new Error(
          `Error obteniendo perfil: ${perfilError.message}`
        );
      }

      if (!perfil) {
        throw new Error(
          "No se encontró tu perfil."
        );
      }

      if (perfil.rol !== "superadmin") {
        throw new Error(
          "Tu usuario no tiene permisos de superadmin."
        );
      }

      if (!perfil.activo) {
        throw new Error(
          "Tu usuario está inactivo."
        );
      }

      // ==========================================
      // OBTENER CONTENIDO ACTUAL
      // ==========================================

      const {
        data: edicion,
        error: lecturaError,
      } = await supabase
        .from("ediciones")
        .select("contenido")
        .eq("id", edicionId)
        .single();

      if (lecturaError) {
        throw new Error(
          `Error leyendo la edición: ${lecturaError.message}`
        );
      }

      const contenidoActual =
        edicion?.contenido &&
        typeof edicion.contenido === "object" &&
        !Array.isArray(edicion.contenido)
          ? edicion.contenido
          : {};

      const nuevoContenido = {
        ...contenidoActual,
        [campo]: texto.trim(),
      };

      // ==========================================
      // ACTUALIZAR
      // ==========================================

      const {
        error: updateError,
      } = await supabase
        .from("ediciones")
        .update({
          contenido: nuevoContenido,
        })
        .eq("id", edicionId);

      if (updateError) {
        console.error(
          "ERROR SUPABASE:",
          updateError
        );

        throw new Error(
          [
            updateError.message,
            updateError.code
              ? `Código: ${updateError.code}`
              : "",
            updateError.details
              ? `Detalles: ${updateError.details}`
              : "",
          ]
            .filter(Boolean)
            .join("\n")
        );
      }

      // ==========================================
      // GUARDADO EXITOSO
      // ==========================================

      setEditando(false);

      window.location.reload();
    } catch (error: unknown) {
      console.error(
        "ERROR GUARDANDO CONTENIDO:",
        error
      );

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Ocurrió un error inesperado."
        );
      }
    } finally {
      setGuardando(false);
    }
  }

  // ==========================================
  // TEXTO + LÁPIZ
  // ==========================================

  const contenido = (
    <div className="relative w-full">
      <div className={claseTexto}>
        {valor}
      </div>

      <button
        type="button"
        onClick={comenzarEdicion}
        title="Editar"
        className="absolute right-0 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg border border-violet-400/40 bg-violet-600/20 text-sm shadow-md transition hover:bg-violet-600/40"
      >
        ✏️
      </button>
    </div>
  );

  // ==========================================
  // MODAL
  // ==========================================

  const modal =
    editando && montado
      ? createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                cancelar();
              }
            }}
          >
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-violet-500/40 bg-zinc-950 shadow-2xl">

              {/* HEADER */}

              <div className="border-b border-white/10 px-6 py-5">
                <div className="flex items-start justify-between gap-4">

                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-white">
                      Editar contenido
                    </h2>

                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
                      {nombreCampo(campo)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={cancelar}
                    disabled={guardando}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-lg text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                    title="Cerrar"
                  >
                    ×
                  </button>

                </div>
              </div>

              {/* CUERPO */}

              <div className="px-6 py-6">

                {multilinea ? (
                  <textarea
                    value={texto}
                    onChange={(e) =>
                      setTexto(e.target.value)
                    }
                    disabled={guardando}
                    autoFocus
                    rows={7}
                    className="block w-full resize-y rounded-xl border border-white/15 bg-black px-4 py-4 text-base leading-7 text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                ) : (
                  <input
                    type="text"
                    value={texto}
                    onChange={(e) =>
                      setTexto(e.target.value)
                    }
                    disabled={guardando}
                    autoFocus
                    className="block w-full rounded-xl border border-white/15 bg-black px-4 py-4 text-base text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                )}

                {/* ERROR */}

                {error && (
                  <div className="mt-4 rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-red-300">
                      {error}
                    </p>
                  </div>
                )}

              </div>

              {/* FOOTER */}

              <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-5">

                <button
                  type="button"
                  onClick={cancelar}
                  disabled={guardando}
                  className="rounded-xl border border-white/15 bg-black px-5 py-3 text-sm font-bold text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={guardar}
                  disabled={guardando}
                  className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-black text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {guardando
                    ? "Guardando..."
                    : "Guardar"}
                </button>

              </div>

            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {contenido}
      {modal}
    </>
  );
}