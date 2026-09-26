"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

type FormularioEvento = {
  nombre: string;
  slug: string;
  descripcion: string;
  historia: string;
  como_nacio: string;
  logo: string;
  fondo: string;
};

const formularioVacio: FormularioEvento = {
  nombre: "",
  slug: "",
  descripcion: "",
  historia: "",
  como_nacio: "",
  logo: "",
  fondo: "",
};

function generarSlug(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminEventosPage() {
  const router = useRouter();

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [formulario, setFormulario] =
    useState<FormularioEvento>(formularioVacio);
  const [eventoEditando, setEventoEditando] =
    useState<Evento | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [archivoLogo, setArchivoLogo] =
    useState<File | null>(null);
  const [archivoFondo, setArchivoFondo] =
    useState<File | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setCargando(true);
    setError("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.replace("/login");
      return;
    }

    const { data, error: eventosError } = await supabase
      .from("eventos")
      .select(
        "id, nombre, descripcion, logo, slug, historia, como_nacio, fondo"
      )
      .order("nombre");

    if (eventosError) {
      console.error(eventosError);
      setError("No se pudieron cargar los eventos.");
      setCargando(false);
      return;
    }

    setEventos((data ?? []) as Evento[]);
    setCargando(false);
  }

  function abrirNuevoEvento() {
    setEventoEditando(null);
    setFormulario(formularioVacio);
    setArchivoLogo(null);
    setArchivoFondo(null);
    setMensaje("");
    setError("");
    setModalAbierto(true);
  }

  function abrirEditarEvento(evento: Evento) {
    setEventoEditando(evento);

    setFormulario({
      nombre: evento.nombre ?? "",
      slug: evento.slug ?? "",
      descripcion: evento.descripcion ?? "",
      historia: evento.historia ?? "",
      como_nacio: evento.como_nacio ?? "",
      logo: evento.logo ?? "",
      fondo: evento.fondo ?? "",
    });

    setArchivoLogo(null);
    setArchivoFondo(null);
    setMensaje("");
    setError("");
    setModalAbierto(true);
  }

  function cerrarModal() {
    if (guardando) return;
    setModalAbierto(false);
  }

  function cambiarNombre(valor: string) {
    setFormulario((actual) => ({
      ...actual,
      nombre: valor,
      slug:
        eventoEditando
          ? actual.slug
          : generarSlug(valor),
    }));
  }

  async function subirArchivo(
    archivo: File,
    slug: string,
    tipo: "logo" | "fondo"
  ) {
    const extension =
      archivo.name.split(".").pop()?.toLowerCase() || "jpg";

    const nombreUnico =
      `${tipo}-${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const ruta = `${slug}/${nombreUnico}`;

    const { error: uploadError } = await supabase.storage
      .from("eventos-assets")
      .upload(ruta, archivo, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("eventos-assets")
      .getPublicUrl(ruta);

    return data.publicUrl;
  }

  async function guardarEvento(event: FormEvent) {
    event.preventDefault();

    setGuardando(true);
    setMensaje("");
    setError("");

    const nombre = formulario.nombre.trim();
    const slug = formulario.slug.trim();

    if (!nombre) {
      setError("El nombre del evento es obligatorio.");
      setGuardando(false);
      return;
    }

    if (!slug) {
      setError("El slug del evento es obligatorio.");
      setGuardando(false);
      return;
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError(
        "El slug solo puede contener letras minúsculas, números y guiones."
      );
      setGuardando(false);
      return;
    }

    try {
      let logoUrl = formulario.logo || null;
      let fondoUrl = formulario.fondo || null;

      if (eventoEditando) {
        const { error: updateInicialError } = await supabase
          .from("eventos")
          .update({
            nombre,
            slug,
            descripcion:
              formulario.descripcion.trim() || null,
            historia:
              formulario.historia.trim() || null,
            como_nacio:
              formulario.como_nacio.trim() || null,
          })
          .eq("id", eventoEditando.id);

        if (updateInicialError) {
          throw updateInicialError;
        }

        if (archivoLogo) {
          logoUrl = await subirArchivo(
            archivoLogo,
            slug,
            "logo"
          );
        }

        if (archivoFondo) {
          fondoUrl = await subirArchivo(
            archivoFondo,
            slug,
            "fondo"
          );
        }

        const { error: updateFinalError } = await supabase
          .from("eventos")
          .update({
            logo: logoUrl,
            fondo: fondoUrl,
          })
          .eq("id", eventoEditando.id);

        if (updateFinalError) {
          throw updateFinalError;
        }

        setMensaje("Evento actualizado correctamente.");
      } else {
        const { data: nuevoEvento, error: insertError } =
          await supabase
            .from("eventos")
            .insert({
              nombre,
              slug,
              descripcion:
                formulario.descripcion.trim() || null,
              historia:
                formulario.historia.trim() || null,
              como_nacio:
                formulario.como_nacio.trim() || null,
              logo: null,
              fondo: null,
            })
            .select()
            .single();

        if (insertError) {
          throw insertError;
        }

        if (archivoLogo) {
          logoUrl = await subirArchivo(
            archivoLogo,
            slug,
            "logo"
          );
        }

        if (archivoFondo) {
          fondoUrl = await subirArchivo(
            archivoFondo,
            slug,
            "fondo"
          );
        }

        if (logoUrl || fondoUrl) {
          const { error: updateError } = await supabase
            .from("eventos")
            .update({
              logo: logoUrl,
              fondo: fondoUrl,
            })
            .eq("id", nuevoEvento.id);

          if (updateError) {
            throw updateError;
          }
        }

        setMensaje("Evento creado correctamente.");

        setTimeout(() => {
          router.push(`/eventos/${slug}`);
        }, 500);

        return;
      }

      await cargarDatos();

      setTimeout(() => {
        setModalAbierto(false);
      }, 500);
    } catch (err: unknown) {
      console.error(err);

      const mensajeError =
        err instanceof Error
          ? err.message
          : "Ocurrió un error al guardar el evento.";

      setError(mensajeError);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarEvento(evento: Evento) {
    const confirmar = window.confirm(
      `¿Seguro que quieres eliminar "${evento.nombre}"?`
    );

    if (!confirmar) return;

    setError("");
    setMensaje("");

    const { error: deleteError } = await supabase
      .from("eventos")
      .delete()
      .eq("id", evento.id);

    if (deleteError) {
      console.error(deleteError);
      setError(
        "No se pudo eliminar el evento. Revisa que seas superadmin y que no existan registros dependientes."
      );
      return;
    }

    setMensaje("Evento eliminado correctamente.");
    await cargarDatos();
  }

  function seleccionarLogo(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const archivo = event.target.files?.[0] ?? null;
    setArchivoLogo(archivo);
  }

  function seleccionarFondo(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const archivo = event.target.files?.[0] ?? null;
    setArchivoFondo(archivo);
  }

  return (
    <main className="min-h-screen bg-[#080808] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-violet-400">
              Administración
            </p>

            <h1 className="mt-3 text-4xl font-black md:text-5xl">
              EVENTOS
            </h1>

            <p className="mt-3 max-w-2xl text-zinc-400">
              Crea y administra los eventos que forman parte del
              archivo histórico.
            </p>
          </div>

          <button
            type="button"
            onClick={abrirNuevoEvento}
            className="rounded-2xl bg-violet-600 px-6 py-4 text-sm font-bold transition hover:bg-violet-500"
          >
            + NUEVO EVENTO
          </button>
        </div>

        {mensaje && (
          <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-300">
            {mensaje}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {cargando ? (
          <div className="flex min-h-[300px] items-center justify-center text-zinc-500">
            Cargando eventos...
          </div>
        ) : eventos.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-white/10 bg-zinc-900/70 p-10 text-center">
            <p className="text-lg font-semibold">
              No hay eventos registrados.
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              Crea el primero con el botón de arriba.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {eventos.map((evento) => (
              <div
                key={evento.id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950"
              >
                <div className="relative h-48 bg-zinc-900">
                  {evento.fondo ? (
                    <img
                      src={evento.fondo}
                      alt=""
                      className="h-full w-full object-cover opacity-60"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-6xl opacity-10">
                      🎮
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

                  <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-4">
                    <div>
                      {evento.logo && (
                        <img
                          src={evento.logo}
                          alt={evento.nombre}
                          className="mb-3 h-12 max-w-40 object-contain object-left"
                        />
                      )}

                      <h2 className="text-2xl font-black">
                        {evento.nombre}
                      </h2>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                    /eventos/{evento.slug}
                  </p>

                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-zinc-400">
                    {evento.descripcion ||
                      "Sin descripción todavía."}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/eventos/${evento.slug}`
                        )
                      }
                      className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/5"
                    >
                      VER EVENTO
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        abrirEditarEvento(evento)
                      }
                      className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold transition hover:bg-violet-500"
                    >
                      EDITAR
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      eliminarEvento(evento)
                    }
                    className="mt-3 w-full rounded-xl border border-red-500/20 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
                  >
                    ELIMINAR EVENTO
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/80 px-4 py-10 backdrop-blur-sm">
          <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 md:px-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-400">
                  {eventoEditando
                    ? "Editar evento"
                    : "Nuevo evento"}
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  {eventoEditando
                    ? eventoEditando.nombre
                    : "CREAR EVENTO"}
                </h2>
              </div>

              <button
                type="button"
                onClick={cerrarModal}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-xl text-zinc-300 transition hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={guardarEvento}
              className="space-y-7 p-6 md:p-8"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                    Nombre del evento
                  </label>

                  <input
                    type="text"
                    value={formulario.nombre}
                    onChange={(e) =>
                      cambiarNombre(e.target.value)
                    }
                    placeholder="Ej: Halloween"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-violet-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                    Slug
                  </label>

                  <input
                    type="text"
                    value={formulario.slug}
                    onChange={(e) =>
                      setFormulario((actual) => ({
                        ...actual,
                        slug: e.target.value
                          .toLowerCase()
                          .replace(/\s+/g, "-"),
                      }))
                    }
                    placeholder="ej: halloween"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-white outline-none transition focus:border-violet-500"
                    required
                  />

                  <p className="mt-2 text-xs text-zinc-600">
                    URL: /eventos/{formulario.slug || "..."}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                  Descripción
                </label>

                <textarea
                  value={formulario.descripcion}
                  onChange={(e) =>
                    setFormulario((actual) => ({
                      ...actual,
                      descripcion: e.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Descripción general del evento..."
                  className="mt-2 w-full resize-y rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                  Historia del evento
                </label>

                <textarea
                  value={formulario.historia}
                  onChange={(e) =>
                    setFormulario((actual) => ({
                      ...actual,
                      historia: e.target.value,
                    }))
                  }
                  rows={7}
                  placeholder="Cuenta la historia del evento, cómo evolucionó, qué significa, etc."
                  className="mt-2 w-full resize-y rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                  ¿Cómo nació?
                </label>

                <textarea
                  value={formulario.como_nacio}
                  onChange={(e) =>
                    setFormulario((actual) => ({
                      ...actual,
                      como_nacio: e.target.value,
                    }))
                  }
                  rows={7}
                  placeholder="Cuenta cómo surgió la idea, quién la propuso y qué motivó la primera edición."
                  className="mt-2 w-full resize-y rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-violet-500"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <label className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                    Logo del evento
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={seleccionarLogo}
                    className="mt-4 block w-full text-sm text-zinc-400 file:mr-4 file:rounded-xl file:border-0 file:bg-violet-600 file:px-4 file:py-2 file:font-semibold file:text-white"
                  />

                  {archivoLogo && (
                    <p className="mt-3 text-xs text-violet-300">
                      Archivo seleccionado:{" "}
                      {archivoLogo.name}
                    </p>
                  )}

                  {formulario.logo && (
                    <img
                      src={formulario.logo}
                      alt="Logo actual"
                      className="mt-5 h-24 max-w-full object-contain"
                    />
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <label className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                    Imagen de fondo
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={seleccionarFondo}
                    className="mt-4 block w-full text-sm text-zinc-400 file:mr-4 file:rounded-xl file:border-0 file:bg-violet-600 file:px-4 file:py-2 file:font-semibold file:text-white"
                  />

                  {archivoFondo && (
                    <p className="mt-3 text-xs text-violet-300">
                      Archivo seleccionado:{" "}
                      {archivoFondo.name}
                    </p>
                  )}

                  {formulario.fondo && (
                    <img
                      src={formulario.fondo}
                      alt="Fondo actual"
                      className="mt-5 h-24 w-full rounded-xl object-cover"
                    />
                  )}
                </div>
              </div>

              {mensaje && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-300">
                  {mensaje}
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-white/10 pt-6 md:flex-row md:justify-end">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="rounded-2xl border border-white/10 px-6 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/5"
                >
                  CANCELAR
                </button>

                <button
                  type="submit"
                  disabled={guardando}
                  className="rounded-2xl bg-violet-600 px-7 py-3 text-sm font-bold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {guardando
                    ? "GUARDANDO..."
                    : eventoEditando
                      ? "GUARDAR CAMBIOS"
                      : "CREAR EVENTO"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}