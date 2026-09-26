"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Props = {
  eventoId: number;
};

export default function AgregarEdicion({
  eventoId,
}: Props) {
  const router = useRouter();

  const [abierto, setAbierto] = useState(false);
  const [año, setAño] = useState("");
  const [fecha, setFecha] = useState("");

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function comprobarPermiso() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { data: perfil, error: perfilError } =
      await supabase
        .from("perfiles")
        .select("id, rol, activo")
        .eq("id", user.id)
        .single();

    if (
      perfilError ||
      !perfil ||
      !perfil.activo
    ) {
      return false;
    }

    if (perfil.rol === "superadmin") {
      return true;
    }

    const {
      data: permiso,
      error: permisoError,
    } = await supabase
      .from("permisos_usuario")
      .select("permiso")
      .eq("usuario_id", user.id)
      .eq("permiso", "ediciones.crear")
      .maybeSingle();

    return !permisoError && !!permiso;
  }

  async function abrirFormulario() {
    setError("");
    setMensaje("");

    const autorizado =
      await comprobarPermiso();

    if (!autorizado) {
      setError(
        "No tienes permiso para crear ediciones."
      );
      return;
    }

    setAbierto(true);
  }

  function cerrarFormulario() {
    if (guardando) {
      return;
    }

    setAbierto(false);
    setError("");
    setMensaje("");
    setAño("");
    setFecha("");
  }

  async function crearEdicion(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMensaje("");

    if (!año.trim() || !fecha) {
      setError(
        "Debes ingresar el año y la fecha."
      );
      return;
    }

    setGuardando(true);

    try {
      const autorizado =
        await comprobarPermiso();

      if (!autorizado) {
        setError(
          "No tienes permiso para crear ediciones."
        );
        return;
      }

      const { error: insertError } =
        await supabase
          .from("ediciones")
          .insert({
            evento_id: eventoId,
            año: año.trim(),
            fecha,
          });

      if (insertError) {
        throw insertError;
      }

      setMensaje(
        "La edición fue creada correctamente."
      );

      setAño("");
      setFecha("");

      router.refresh();

      setTimeout(() => {
        setAbierto(false);
        setMensaje("");
      }, 800);
    } catch (error) {
      console.error(
        "Error creando edición:",
        error
      );

      setError(
        "No fue posible crear la edición. Revisa los permisos de Supabase."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="w-full">
      {!abierto ? (
        <button
          type="button"
          onClick={abrirFormulario}
          className="inline-flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-violet-300 transition hover:border-violet-500/60 hover:bg-violet-500/20"
        >
          <span className="text-lg leading-none">
            ＋
          </span>

          Agregar edición
        </button>
      ) : (
        <div className="rounded-3xl border border-violet-500/20 bg-zinc-950/95 p-6 shadow-2xl shadow-black/30 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-400">
                Nueva edición
              </p>

              <h3 className="mt-2 text-2xl font-black">
                AGREGAR EDICIÓN
              </h3>
            </div>

            <button
              type="button"
              onClick={cerrarFormulario}
              disabled={guardando}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {mensaje && (
            <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {mensaje}
            </div>
          )}

          <form
            onSubmit={crearEdicion}
            className="mt-7"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                  Año
                </label>

                <input
                  type="text"
                  value={año}
                  onChange={(event) =>
                    setAño(event.target.value)
                  }
                  placeholder="2027"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-700 focus:border-violet-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                  Fecha
                </label>

                <input
                  type="date"
                  value={fecha}
                  onChange={(event) =>
                    setFecha(event.target.value)
                  }
                  required
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-violet-500"
                />
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cerrarFormulario}
                disabled={guardando}
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold uppercase tracking-[0.15em] text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={guardando}
                className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold uppercase tracking-[0.15em] text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {guardando
                  ? "CREANDO..."
                  : "CREAR EDICIÓN"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}