"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

function emailInterno(usuario: string) {
  return `${usuario.trim().toLowerCase()}@gamearchive.local`;
}

export default function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function iniciarSesion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const usuarioLimpio = usuario.trim().toLowerCase();

    if (!usuarioLimpio || !password) {
      setError("Ingresa tu usuario y contraseña.");
      return;
    }

    setCargando(true);

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: emailInterno(usuarioLimpio),
          password,
        });

      if (loginError || !data.user) {
        setError("Usuario o contraseña incorrectos.");
        return;
      }

      const { data: perfil, error: perfilError } =
        await supabase
          .from("perfiles")
          .select("usuario, nombre, rol, activo")
          .eq("id", data.user.id)
          .single();

      if (perfilError || !perfil || !perfil.activo) {
        await supabase.auth.signOut();
        setError("Esta cuenta no está habilitada.");
        return;
      }

      window.location.href = "/admin";
    } catch (error) {
      console.error(error);
      setError("No fue posible iniciar sesión.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold tracking-[0.45em] text-zinc-500">
              THE
            </p>

            <h1 className="mt-1 text-4xl font-black tracking-tight">
              GAME ARCHIVE
            </h1>

            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.35em] text-violet-400">
              Administración
            </p>
          </div>

          <form
            onSubmit={iniciarSesion}
            className="rounded-3xl border border-white/10 bg-zinc-950/90 p-8 shadow-2xl"
          >
            <div>
              <label
                htmlFor="usuario"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400"
              >
                Usuario
              </label>

              <input
                id="usuario"
                type="text"
                value={usuario}
                onChange={(event) =>
                  setUsuario(event.target.value)
                }
                autoComplete="username"
                autoFocus
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500"
                placeholder="Ingresa tu usuario"
              />
            </div>

            <div className="mt-5">
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400"
              >
                Contraseña
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500"
                placeholder="Ingresa tu contraseña"
              />
            </div>

            {error && (
              <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="mt-6 w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cargando ? "INGRESANDO..." : "INGRESAR"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}