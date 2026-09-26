"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Perfil = {
  id: string;
  usuario: string;
  nombre: string | null;
  rol: "superadmin" | "editor";
  activo: boolean;
};

type Permiso = {
  clave: string;
  nombre: string;
};

const gruposPermisos = [
  {
    titulo: "EVENTOS",
    permisos: ["eventos.crear", "eventos.editar"],
  },
  {
    titulo: "EDICIONES",
    permisos: [
      "ediciones.crear",
      "ediciones.editar",
      "ediciones.eliminar",
    ],
  },
  {
    titulo: "PARTICIPANTES",
    permisos: ["participantes.gestionar"],
  },
  {
    titulo: "CONTENIDO",
    permisos: [
      "segmentos.gestionar",
      "juegos.gestionar",
      "puntos.gestionar",
      "podio.gestionar",
      "ganador.gestionar",
    ],
  },
  {
    titulo: "AMIGXS",
    permisos: [
      "amigxs.crear",
      "amigxs.editar",
      "amigxs.eliminar",
    ],
  },
  {
    titulo: "GALERÍAS",
    permisos: [
      "galerias.subir",
      "galerias.eliminar",
    ],
  },
  {
    titulo: "USUARIOS",
    permisos: ["usuarios.gestionar"],
  },
];

export default function AdminPage() {
  const [perfilActual, setPerfilActual] =
    useState<Perfil | null>(null);

  const [usuarios, setUsuarios] = useState<Perfil[]>([]);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [permisosUsuario, setPermisosUsuario] =
    useState<string[]>([]);

  const [usuarioSeleccionado, setUsuarioSeleccionado] =
    useState<Perfil | null>(null);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const esSuperadmin =
    perfilActual?.rol === "superadmin";

  const mapaPermisos = useMemo(() => {
    return new Map(
      permisos.map((permiso) => [
        permiso.clave,
        permiso.nombre,
      ])
    );
  }, [permisos]);

  useEffect(() => {
    cargarAdministracion();
  }, []);

  async function cargarAdministracion() {
    setCargando(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: perfil, error: perfilError } =
        await supabase
          .from("perfiles")
          .select(
            "id, usuario, nombre, rol, activo"
          )
          .eq("id", user.id)
          .single();

      if (
        perfilError ||
        !perfil ||
        !perfil.activo
      ) {
        await supabase.auth.signOut();
        window.location.href = "/login";
        return;
      }

      setPerfilActual(perfil);

      const {
        data: permisosData,
        error: permisosError,
      } = await supabase
        .from("permisos")
        .select("clave, nombre")
        .order("clave");

      if (permisosError) {
        throw permisosError;
      }

      setPermisos(permisosData ?? []);

      const {
        data: permisosPropios,
        error: permisosPropiosError,
      } = await supabase
        .from("permisos_usuario")
        .select("permiso")
        .eq("usuario_id", user.id);

      if (permisosPropiosError) {
        throw permisosPropiosError;
      }

      setPermisosUsuario(
        (permisosPropios ?? []).map(
          (item) => item.permiso
        )
      );

      if (perfil.rol === "superadmin") {
        const {
          data: usuariosData,
          error: usuariosError,
        } = await supabase
          .from("perfiles")
          .select(
            "id, usuario, nombre, rol, activo"
          )
          .order("usuario");

        if (usuariosError) {
          throw usuariosError;
        }

        setUsuarios(usuariosData ?? []);
      }
    } catch (error) {
      console.error(
        "Error cargando administración:",
        error
      );

      setError(
        "No fue posible cargar el panel de administración."
      );
    } finally {
      setCargando(false);
    }
  }

  async function seleccionarUsuario(
    usuario: Perfil
  ) {
    setUsuarioSeleccionado(usuario);
    setMensaje("");
    setError("");

    if (usuario.rol === "superadmin") {
      setPermisosUsuario(
        permisos.map((permiso) => permiso.clave)
      );
      return;
    }

    const {
      data,
      error: permisosError,
    } = await supabase
      .from("permisos_usuario")
      .select("permiso")
      .eq("usuario_id", usuario.id);

    if (permisosError) {
      console.error(permisosError);

      setError(
        "No se pudieron cargar los permisos del usuario."
      );

      return;
    }

    setPermisosUsuario(
      (data ?? []).map(
        (item) => item.permiso
      )
    );
  }

  function cambiarPermiso(
    permiso: string,
    activo: boolean
  ) {
    if (
      !usuarioSeleccionado ||
      usuarioSeleccionado.rol === "superadmin"
    ) {
      return;
    }

    setPermisosUsuario((actuales) => {
      if (activo) {
        if (actuales.includes(permiso)) {
          return actuales;
        }

        return [...actuales, permiso];
      }

      return actuales.filter(
        (item) => item !== permiso
      );
    });

    setMensaje("");
    setError("");
  }

  async function guardarPermisos() {
    if (!usuarioSeleccionado) {
      return;
    }

    if (
      usuarioSeleccionado.rol === "superadmin"
    ) {
      return;
    }

    setGuardando(true);
    setMensaje("");
    setError("");

    try {
      const {
        error: deleteError,
      } = await supabase
        .from("permisos_usuario")
        .delete()
        .eq(
          "usuario_id",
          usuarioSeleccionado.id
        );

      if (deleteError) {
        throw deleteError;
      }

      if (permisosUsuario.length > 0) {
        const registros = permisosUsuario.map(
          (permiso) => ({
            usuario_id:
              usuarioSeleccionado.id,
            permiso,
          })
        );

        const {
          error: insertError,
        } = await supabase
          .from("permisos_usuario")
          .insert(registros);

        if (insertError) {
          throw insertError;
        }
      }

      setMensaje(
        `Permisos de ${usuarioSeleccionado.usuario} guardados correctamente.`
      );
    } catch (error) {
      console.error(
        "Error guardando permisos:",
        error
      );

      const errorSupabase = error as {
        message?: string;
        details?: string;
        hint?: string;
        code?: string;
      };

      setError(
        [
          "No fue posible guardar los permisos.",
          errorSupabase.message
            ? `Mensaje: ${errorSupabase.message}`
            : "",
          errorSupabase.details
            ? `Detalle: ${errorSupabase.details}`
            : "",
          errorSupabase.hint
            ? `Ayuda: ${errorSupabase.hint}`
            : "",
          errorSupabase.code
            ? `Código: ${errorSupabase.code}`
            : "",
        ]
          .filter(Boolean)
          .join(" | ")
      );
    } finally {
      setGuardando(false);
    }
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  function tienePermiso(permiso: string) {
    return (
      esSuperadmin ||
      permisosUsuario.includes(permiso)
    );
  }

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-zinc-500">
          Cargando administración...
        </p>
      </main>
    );
  }

  if (!perfilActual) {
    return null;
  }

  if (!esSuperadmin) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-950/90 p-10 text-center">
            <div className="text-5xl">
              🔒
            </div>

            <h1 className="mt-6 text-3xl font-black">
              SIN ACCESO
            </h1>

            <p className="mt-4 text-zinc-400">
              Tu cuenta todavía no tiene permisos
              para acceder al panel de administración.
            </p>

            <button
              onClick={cerrarSesion}
              className="mt-8 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-zinc-300 transition hover:bg-white/10 hover:text-white"
            >
              CERRAR SESIÓN
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="px-6 py-8 md:px-10 md:py-10">
        <div className="mx-auto max-w-7xl">
          <header className="border-b border-white/10 pb-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-violet-400">
                  Administración
                </p>

                <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
                  USUARIOS Y PERMISOS
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                  Desde aquí decides qué puede hacer
                  cada cuenta dentro de THE GAME ARCHIVE.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#d4af37]">
                  SUPERADMIN
                </div>

                <button
                  onClick={cerrarSesion}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 transition hover:bg-white/10 hover:text-white"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </header>

          <div className="py-10">
            {error && (
              <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
                {error}
              </div>
            )}

            {mensaje && (
              <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-300">
                {mensaje}
              </div>
            )}

            <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
              <section>
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">
                    Cuentas
                  </p>

                  <h2 className="mt-2 text-2xl font-black">
                    USUARIOS
                  </h2>
                </div>

                <div className="space-y-2">
                  {usuarios.map((usuario) => {
                    const seleccionado =
                      usuarioSeleccionado?.id ===
                      usuario.id;

                    const superadmin =
                      usuario.rol ===
                      "superadmin";

                    return (
                      <button
                        key={usuario.id}
                        onClick={() =>
                          seleccionarUsuario(
                            usuario
                          )
                        }
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          seleccionado
                            ? "border-violet-500/60 bg-violet-500/10"
                            : "border-white/10 bg-zinc-950/70 hover:border-white/20 hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-white">
                              {usuario.nombre ??
                                usuario.usuario}
                            </p>

                            <p className="mt-1 text-xs text-zinc-500">
                              @{usuario.usuario}
                            </p>
                          </div>

                          {superadmin ? (
                            <span className="shrink-0 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-[#d4af37]">
                              SUPER
                            </span>
                          ) : (
                            <span className="shrink-0 rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-violet-300">
                              EDITOR
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section>
                {!usuarioSeleccionado ? (
                  <div className="flex min-h-[500px] items-center justify-center rounded-3xl border border-white/10 bg-zinc-950/70 p-10 text-center">
                    <div>
                      <div className="text-5xl">
                        👤
                      </div>

                      <h2 className="mt-6 text-2xl font-black">
                        SELECCIONA UN USUARIO
                      </h2>

                      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
                        Selecciona una cuenta para
                        administrar sus permisos.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-6 md:p-8">
                    <div className="flex flex-col gap-5 border-b border-white/10 pb-7 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">
                          Cuenta seleccionada
                        </p>

                        <h2 className="mt-2 text-3xl font-black">
                          {usuarioSeleccionado.nombre ??
                            usuarioSeleccionado.usuario}
                        </h2>

                        <p className="mt-2 text-sm text-zinc-500">
                          @{usuarioSeleccionado.usuario}
                        </p>
                      </div>

                      {usuarioSeleccionado.rol ===
                      "superadmin" ? (
                        <span className="rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4af37]">
                          ACCESO TOTAL
                        </span>
                      ) : (
                        <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300">
                          EDITOR
                        </span>
                      )}
                    </div>

                    {usuarioSeleccionado.rol ===
                    "superadmin" ? (
                      <div className="mt-8 rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/5 p-6">
                        <p className="text-sm font-bold text-[#d4af37]">
                          Esta cuenta es SUPERADMIN.
                        </p>

                        <p className="mt-2 text-sm leading-6 text-zinc-400">
                          Tiene todos los permisos del sistema
                          y no puede ser limitada desde este
                          panel.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="mt-8 space-y-7">
                          {gruposPermisos.map(
                            (grupo) => (
                              <div key={grupo.titulo}>
                                <div className="mb-3 flex items-center gap-3">
                                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">
                                    {grupo.titulo}
                                  </p>

                                  <div className="h-px flex-1 bg-white/5" />
                                </div>

                                <div className="grid gap-2 md:grid-cols-2">
                                  {grupo.permisos.map(
                                    (clave) => {
                                      const activo =
                                        permisosUsuario.includes(
                                          clave
                                        );

                                      return (
                                        <label
                                          key={clave}
                                          className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition ${
                                            activo
                                              ? "border-violet-500/30 bg-violet-500/10"
                                              : "border-white/5 bg-white/[0.02] hover:border-white/10"
                                          }`}
                                        >
                                          <span className="text-sm text-zinc-300">
                                            {mapaPermisos.get(
                                              clave
                                            ) ??
                                              clave}
                                          </span>

                                          <input
                                            type="checkbox"
                                            checked={
                                              activo
                                            }
                                            onChange={(
                                              event
                                            ) =>
                                              cambiarPermiso(
                                                clave,
                                                event
                                                  .target
                                                  .checked
                                              )
                                            }
                                            className="h-4 w-4 accent-violet-500"
                                          />
                                        </label>
                                      );
                                    }
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>

                        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-7 md:flex-row md:items-center md:justify-between">
                          <p className="text-xs text-zinc-600">
                            Los cambios se guardarán
                            directamente en Supabase.
                          </p>

                          <button
                            onClick={
                              guardarPermisos
                            }
                            disabled={
                              guardando
                            }
                            className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {guardando
                              ? "GUARDANDO..."
                              : "GUARDAR PERMISOS"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}