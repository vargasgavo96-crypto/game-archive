"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Evento = {
  id: number;
  nombre: string;
  descripcion: string | null;
  logo: string | null;
  slug: string;
  historia: string | null;
  como_nacio: string | null;
  fondo: string | null;
};

export default function EditarEventoPage() {
  const params = useParams();
  const router = useRouter();

  const slug = params.slug as string;

  const [evento, setEvento] = useState<Evento | null>(
    null
  );

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [logo, setLogo] = useState("");
  const [historia, setHistoria] = useState("");
  const [comoNacio, setComoNacio] = useState("");
  const [fondo, setFondo] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarEvento();
  }, [slug]);

  async function cargarEvento() {
    setCargando(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
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
        await supabase.auth.signOut();
        router.push("/login");
        return;
      }

      let tienePermiso = perfil.rol === "superadmin";

      if (!tienePermiso) {
        const {
          data: permiso,
          error: permisoError,
        } = await supabase
          .from("permisos_usuario")
          .select("permiso")
          .eq("usuario_id", user.id)
          .eq("permiso", "eventos.editar")
          .maybeSingle();

        if (
          !permisoError &&
          permiso
        ) {
          tienePermiso = true;
        }
      }

      if (!tienePermiso) {
        setError(
          "Tu cuenta no tiene permiso para editar eventos."
        );
        setCargando(false);
        return;
      }

      const {
        data: eventoData,
        error: eventoError,
      } = await supabase
        .from("eventos")
        .select(
          "id, nombre, descripcion, logo, slug, historia, como_nacio, fondo"
        )
        .eq("slug", slug)
        .single();

      if (eventoError || !eventoData) {
        setError(
          "No se encontró el evento."
        );
        setCargando(false);
        return;
      }

      const datos = eventoData as Evento;

      setEvento(datos);

      setNombre(datos.nombre ?? "");
      setDescripcion(datos.descripcion ?? "");
      setLogo(datos.logo ?? "");
      setHistoria(datos.historia ?? "");
      setComoNacio(datos.como_nacio ?? "");
      setFondo(datos.fondo ?? "");
    } catch (error) {
      console.error(
        "Error cargando evento:",
        error
      );

      setError(
        "No fue posible cargar el evento."
      );
    } finally {
      setCargando(false);
    }
  }

  async function guardarCambios(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!evento) {
      return;
    }

    setGuardando(true);
    setError("");
    setMensaje("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const {
        error: updateError,
      } = await supabase
        .from("eventos")
        .update({
          nombre: nombre.trim(),
          descripcion:
            descripcion.trim() || null,
          logo: logo.trim() || null,
          historia:
            historia.trim() || null,
          como_nacio:
            comoNacio.trim() || null,
          fondo:
            fondo.trim() || null,
        })
        .eq("id", evento.id);

      if (updateError) {
        throw updateError;
      }

      setMensaje(
        "Los cambios se guardaron correctamente."
      );

      setTimeout(() => {
        router.push(
          `/eventos/${evento.slug}`
        );
        router.refresh();
      }, 900);
    } catch (error) {
      console.error(
        "Error guardando evento:",
        error
      );

      setError(
        "No fue posible guardar los cambios. Revisa los permisos de Supabase."
      );
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
          Cargando evento...
        </p>
      </main>
    );
  }

  if (error && !evento) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-950 p-10 text-center">
          <div className="text-5xl">
            🔒
          </div>

          <h1 className="mt-6 text-3xl font-black">
            NO SE PUEDE EDITAR
          </h1>

          <p className="mt-4 leading-7 text-zinc-400">
            {error}
          </p>

          <Link
            href={`/eventos/${slug}`}
            className="mt-8 inline-flex rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold uppercase tracking-[0.15em] text-zinc-300 transition hover:bg-white/10 hover:text-white"
          >
            ← Volver al evento
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
        {/* HEADER */}

        <div className="mb-10 flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-violet-400">
              Administración
            </p>

            <h1 className="mt-3 text-4xl font-black md:text-6xl">
              EDITAR EVENTO
            </h1>

            {evento && (
              <p className="mt-3 text-zinc-500">
                Modificando{" "}
                <span className="text-zinc-300">
                  {evento.nombre}
                </span>
              </p>
            )}
          </div>

          {evento && (
            <Link
              href={`/eventos/${evento.slug}`}
              className="inline-flex w-fit rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold uppercase tracking-[0.15em] text-zinc-400 transition hover:bg-white/10 hover:text-white"
            >
              ← Volver al evento
            </Link>
          )}
        </div>

        {/* MENSAJES */}

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

        {/* FORMULARIO */}

        <form
          onSubmit={guardarCambios}
          className="space-y-8"
        >
          <section className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 md:p-8">
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-400">
                Información principal
              </p>

              <h2 className="mt-2 text-2xl font-black">
                DATOS DEL EVENTO
              </h2>
            </div>

            <div className="space-y-6">
              {/* NOMBRE */}

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                  Nombre
                </label>

                <input
                  type="text"
                  value={nombre}
                  onChange={(e) =>
                    setNombre(e.target.value)
                  }
                  required
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-violet-500"
                  placeholder="Nombre del evento"
                />
              </div>

              {/* DESCRIPCIÓN */}

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                  Descripción
                </label>

                <textarea
                  value={descripcion}
                  onChange={(e) =>
                    setDescripcion(
                      e.target.value
                    )
                  }
                  rows={4}
                  className="w-full resize-y rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-violet-500"
                  placeholder="Descripción del evento"
                />
              </div>

              {/* LOGO */}

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                  Logo
                </label>

                <input
                  type="text"
                  value={logo}
                  onChange={(e) =>
                    setLogo(e.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-violet-500"
                  placeholder="/logos/logo.png"
                />

                {logo && (
                  <div className="mt-4 flex h-40 items-center justify-center rounded-2xl border border-white/5 bg-black/50 p-6">
                    <img
                      src={logo}
                      alt="Vista previa del logo"
                      className="max-h-32 max-w-full object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* HISTORIA */}

          <section className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 md:p-8">
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-400">
                Historia
              </p>

              <h2 className="mt-2 text-2xl font-black">
                HISTORIA DEL EVENTO
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                  Historia
                </label>

                <textarea
                  value={historia}
                  onChange={(e) =>
                    setHistoria(
                      e.target.value
                    )
                  }
                  rows={8}
                  className="w-full resize-y rounded-xl border border-white/10 bg-black px-4 py-3 leading-7 text-white outline-none transition focus:border-violet-500"
                  placeholder="Historia del evento..."
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                  ¿Cómo nació?
                </label>

                <textarea
                  value={comoNacio}
                  onChange={(e) =>
                    setComoNacio(
                      e.target.value
                    )
                  }
                  rows={8}
                  className="w-full resize-y rounded-xl border border-white/10 bg-black px-4 py-3 leading-7 text-white outline-none transition focus:border-violet-500"
                  placeholder="Cuenta cómo nació el evento..."
                />
              </div>
            </div>
          </section>

          {/* FONDO */}

          <section className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 md:p-8">
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-400">
                Apariencia
              </p>

              <h2 className="mt-2 text-2xl font-black">
                FONDO DEL EVENTO
              </h2>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                Ruta de imagen
              </label>

              <input
                type="text"
                value={fondo}
                onChange={(e) =>
                  setFondo(e.target.value)
                }
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-violet-500"
                placeholder="/eventos/fonda.png"
              />

              {fondo && (
                <div
                  className="mt-4 h-48 rounded-2xl border border-white/5 bg-cover bg-center"
                  style={{
                    backgroundImage: `url("${fondo}")`,
                  }}
                />
              )}
            </div>
          </section>

          {/* ACCIONES */}

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-8 sm:flex-row sm:justify-between">
            {evento && (
              <Link
                href={`/eventos/${evento.slug}`}
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold uppercase tracking-[0.15em] text-zinc-400 transition hover:bg-white/10 hover:text-white"
              >
                Cancelar
              </Link>
            )}

            <button
              type="submit"
              disabled={guardando}
              className="rounded-xl bg-violet-600 px-8 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {guardando
                ? "GUARDANDO..."
                : "GUARDAR CAMBIOS"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}