"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

type Foto = {
  id: number;
  imagen: string;
  descripcion: string | null;
  orden: number | null;
  created_at: string;
  portada: boolean;
};

type GaleriaFotosProps = {
  edicionId: number;
};

export default function GaleriaFotos({
  edicionId,
}: GaleriaFotosProps) {
  const [fotos, setFotos] = useState<Foto[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [fotoActual, setFotoActual] =
    useState(0);

  const [usuarioLogeado, setUsuarioLogeado] =
    useState(false);

  const [seleccionadas, setSeleccionadas] =
    useState<number[]>([]);

  const [modoSeleccion, setModoSeleccion] =
    useState(false);

  const [subiendo, setSubiendo] =
    useState(false);

  const [eliminando, setEliminando] =
    useState(false);

  const [cambiandoPortada, setCambiandoPortada] =
    useState(false);

  const [mensaje, setMensaje] =
    useState("");

  const [error, setError] =
    useState("");

  const inputFotosRef =
    useRef<HTMLInputElement>(null);

  // =====================================================
  // CARGAR FOTOS
  // =====================================================

  async function cargarFotos() {
    setCargando(true);

    const {
      data,
      error: errorFotos,
    } = await supabase
      .from("galerias")
      .select(
        "id, imagen, descripcion, orden, created_at, portada"
      )
      .eq("edicion_id", edicionId)
      .order("orden", {
        ascending: true,
      })
      .order("created_at", {
        ascending: true,
      });

    if (errorFotos) {
      console.error(
        "Error cargando fotografías:",
        errorFotos
      );

      setError(
        "No se pudieron cargar las fotografías."
      );

      setCargando(false);
      return;
    }

    setFotos(
      (data ?? []) as Foto[]
    );

    setCargando(false);
  }

  // =====================================================
  // SESIÓN
  // =====================================================

  useEffect(() => {
    async function comprobarSesion() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUsuarioLogeado(!!user);
    }

    comprobarSesion();

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUsuarioLogeado(
            !!session?.user
          );
        }
      );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // =====================================================
  // CARGAR GALERÍA
  // =====================================================

  useEffect(() => {
    cargarFotos();

    setFotoActual(0);
    setSeleccionadas([]);
    setModoSeleccion(false);
    setMensaje("");
    setError("");
  }, [edicionId]);

  // =====================================================
  // TECLADO
  // =====================================================

  useEffect(() => {
    function manejarTeclado(
      event: KeyboardEvent
    ) {
      if (fotos.length === 0) {
        return;
      }

      if (modoSeleccion) {
        return;
      }

      if (event.key === "ArrowRight") {
        siguienteFoto();
      }

      if (event.key === "ArrowLeft") {
        fotoAnterior();
      }
    }

    window.addEventListener(
      "keydown",
      manejarTeclado
    );

    return () => {
      window.removeEventListener(
        "keydown",
        manejarTeclado
      );
    };
  }, [
    fotos,
    fotoActual,
    modoSeleccion,
  ]);

  // =====================================================
  // NAVEGACIÓN
  // =====================================================

  function siguienteFoto() {
    if (fotos.length === 0) {
      return;
    }

    setFotoActual((actual) =>
      actual === fotos.length - 1
        ? 0
        : actual + 1
    );
  }

  function fotoAnterior() {
    if (fotos.length === 0) {
      return;
    }

    setFotoActual((actual) =>
      actual === 0
        ? fotos.length - 1
        : actual - 1
    );
  }

  // =====================================================
  // SELECCIÓN
  // =====================================================

  function alternarSeleccion(
    fotoId: number
  ) {
    setSeleccionadas((actuales) =>
      actuales.includes(fotoId)
        ? actuales.filter(
            (id) => id !== fotoId
          )
        : [...actuales, fotoId]
    );
  }

  function seleccionarTodas() {
    const todosLosIds =
      fotos.map(
        (foto) => foto.id
      );

    if (
      seleccionadas.length ===
      todosLosIds.length
    ) {
      setSeleccionadas([]);
    } else {
      setSeleccionadas(todosLosIds);
    }
  }

  function cancelarSeleccion() {
    setSeleccionadas([]);
    setModoSeleccion(false);
  }

  function iniciarSeleccion() {
    setMensaje("");
    setError("");
    setModoSeleccion(true);
  }

  // =====================================================
  // SUBIR FOTOS
  // =====================================================

  function abrirSelectorFotos() {
    setMensaje("");
    setError("");

    inputFotosRef.current?.click();
  }

  async function subirFotos(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const archivos = Array.from(
      event.target.files ?? []
    );

    if (archivos.length === 0) {
      return;
    }

    if (!usuarioLogeado) {
      setError(
        "Debes iniciar sesión para subir fotografías."
      );

      event.target.value = "";
      return;
    }

    setSubiendo(true);
    setMensaje("");
    setError("");

    try {
      const archivosImagenes =
        archivos.filter((archivo) =>
          archivo.type.startsWith("image/")
        );

      if (
        archivosImagenes.length === 0
      ) {
        setError(
          "Los archivos seleccionados no contienen imágenes válidas."
        );

        return;
      }

      let ordenActual =
        fotos.length;

      const nuevasFotos: Foto[] = [];

      for (
        const archivo of archivosImagenes
      ) {
        const extension =
          archivo.name
            .split(".")
            .pop()
            ?.toLowerCase() || "jpg";

        const nombreUnico =
          `${Date.now()}-${crypto.randomUUID()}.${extension}`;

        const ruta =
          `${edicionId}/${nombreUnico}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from("eventos-fotos")
          .upload(
            ruta,
            archivo,
            {
              cacheControl: "3600",
              upsert: false,
            }
          );

        if (uploadError) {
          throw uploadError;
        }

        const {
          data: publicUrlData,
        } = supabase.storage
          .from("eventos-fotos")
          .getPublicUrl(ruta);

        const {
          data: fotoInsertada,
          error: insertError,
        } = await supabase
          .from("galerias")
          .insert({
            edicion_id: edicionId,
            imagen:
              publicUrlData.publicUrl,
            descripcion: null,
            orden: ordenActual,
            portada: false,
          })
          .select(
            "id, imagen, descripcion, orden, created_at, portada"
          )
          .single();

        if (insertError) {
          await supabase.storage
            .from("eventos-fotos")
            .remove([ruta]);

          throw insertError;
        }

        if (fotoInsertada) {
          nuevasFotos.push(
            fotoInsertada as Foto
          );
        }

        ordenActual++;
      }

      const fotosActualizadas = [
        ...fotos,
        ...nuevasFotos,
      ];

      setFotos(fotosActualizadas);

      if (
        fotosActualizadas.length > 0
      ) {
        setFotoActual(
          fotosActualizadas.length - 1
        );
      }

      setMensaje(
        `${nuevasFotos.length} ${
          nuevasFotos.length === 1
            ? "foto subida"
            : "fotos subidas"
        } correctamente.`
      );
    } catch (error) {
      console.error(
        "Error subiendo fotografías:",
        error
      );

      setError(
        "Ocurrió un error al subir las fotografías."
      );
    } finally {
      setSubiendo(false);

      event.target.value = "";
    }
  }

  // =====================================================
  // OBTENER RUTA STORAGE
  // =====================================================

  function obtenerRutaStorage(
    url: string
  ) {
    const marcador =
      "/storage/v1/object/public/eventos-fotos/";

    const posicion =
      url.indexOf(marcador);

    if (posicion === -1) {
      return null;
    }

    return decodeURIComponent(
      url.substring(
        posicion + marcador.length
      )
    );
  }

  // =====================================================
  // ELIMINAR FOTOS
  // =====================================================

  async function eliminarSeleccionadas() {
    if (!usuarioLogeado) {
      setError(
        "Debes iniciar sesión para eliminar fotografías."
      );

      return;
    }

    if (seleccionadas.length === 0) {
      return;
    }

    const cantidad =
      seleccionadas.length;

    const confirmar = window.confirm(
      `¿Seguro que quieres eliminar ${cantidad} ${
        cantidad === 1
          ? "fotografía"
          : "fotografías"
      }? Esta acción no se puede deshacer.`
    );

    if (!confirmar) {
      return;
    }

    setEliminando(true);
    setMensaje("");
    setError("");

    try {
      const fotosAEliminar =
        fotos.filter((foto) =>
          seleccionadas.includes(
            foto.id
          )
        );

      const rutasStorage =
        fotosAEliminar
          .map((foto) =>
            obtenerRutaStorage(
              foto.imagen
            )
          )
          .filter(
            (
              ruta
            ): ruta is string =>
              ruta !== null
          );

      if (
        rutasStorage.length > 0
      ) {
        const {
          error: storageError,
        } = await supabase.storage
          .from("eventos-fotos")
          .remove(rutasStorage);

        if (storageError) {
          console.error(
            "Error eliminando archivos del Storage:",
            storageError
          );
        }
      }

      const ids =
        fotosAEliminar.map(
          (foto) => foto.id
        );

      const {
        error: deleteError,
      } = await supabase
        .from("galerias")
        .delete()
        .in("id", ids);

      if (deleteError) {
        throw deleteError;
      }

      const fotosRestantes =
        fotos.filter(
          (foto) =>
            !seleccionadas.includes(
              foto.id
            )
        );

      setFotos(fotosRestantes);

      setSeleccionadas([]);
      setModoSeleccion(false);

      if (
        fotosRestantes.length === 0
      ) {
        setFotoActual(0);
      } else if (
        fotoActual >=
        fotosRestantes.length
      ) {
        setFotoActual(
          fotosRestantes.length - 1
        );
      }

      setMensaje(
        `${cantidad} ${
          cantidad === 1
            ? "fotografía eliminada"
            : "fotografías eliminadas"
        } correctamente.`
      );
    } catch (error) {
      console.error(
        "Error eliminando fotografías:",
        error
      );

      setError(
        "Ocurrió un error al eliminar las fotografías."
      );
    } finally {
      setEliminando(false);
    }
  }

  // =====================================================
  // ESTABLECER PORTADA
  // =====================================================

  async function establecerPortada(
    foto: Foto
  ) {
    if (!usuarioLogeado) {
      setError(
        "Debes iniciar sesión para cambiar la portada."
      );

      return;
    }

    setCambiandoPortada(true);
    setMensaje("");
    setError("");

    try {
      /*
       * Primero quitamos cualquier portada
       * que exista actualmente para esta edición.
       */
      const {
        error: quitarError,
      } = await supabase
        .from("galerias")
        .update({
          portada: false,
        })
        .eq("edicion_id", edicionId)
        .eq("portada", true);

      if (quitarError) {
        throw quitarError;
      }

      /*
       * Después marcamos esta foto
       * como la nueva portada.
       */
      const {
        error: portadaError,
      } = await supabase
        .from("galerias")
        .update({
          portada: true,
        })
        .eq("id", foto.id);

      if (portadaError) {
        throw portadaError;
      }

      /*
       * Actualizamos inmediatamente
       * el estado local.
       */
      setFotos((actuales) =>
        actuales.map(
          (fotoActual) => ({
            ...fotoActual,
            portada:
              fotoActual.id ===
              foto.id,
          })
        )
      );

      setMensaje(
        "⭐ Portada actualizada correctamente."
      );
    } catch (error) {
      console.error(
        "Error estableciendo portada:",
        error
      );

      setError(
        "No se pudo establecer la portada."
      );
    } finally {
      setCambiandoPortada(false);
    }
  }

  // =====================================================
  // ESTADO DE CARGA
  // =====================================================

  if (cargando) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm uppercase tracking-[0.25em] text-zinc-600">
          Cargando fotografías...
        </p>
      </div>
    );
  }

  // =====================================================
  // SIN FOTOS
  // =====================================================

  if (fotos.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="rounded-3xl border border-dashed border-white/10 bg-black/20 px-6 py-16">
          <p className="text-6xl">
            📷
          </p>

          <p className="mt-5 text-sm uppercase tracking-[0.25em] text-zinc-600">
            Esta edición todavía no tiene fotografías
          </p>

          {usuarioLogeado && (
            <>
              <button
                type="button"
                onClick={
                  abrirSelectorFotos
                }
                disabled={subiendo}
                className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-black text-black transition hover:bg-violet-200 disabled:opacity-50"
              >
                {subiendo
                  ? "SUBIENDO..."
                  : "+ AGREGAR FOTOS"}
              </button>

              <input
                ref={inputFotosRef}
                type="file"
                accept="image/*"
                multiple
                onChange={subirFotos}
                className="hidden"
              />
            </>
          )}

          {error && (
            <p className="mt-5 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  // =====================================================
  // GALERÍA
  // =====================================================

  const fotoSeleccionada =
    fotos[fotoActual] ??
    fotos[0];

  return (
    <div className="relative">

      {/* =================================================
          CABECERA
          ================================================= */}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
            Fotografías
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            {fotos.length}{" "}
            {fotos.length === 1
              ? "fotografía"
              : "fotografías"}
          </p>
        </div>

        {usuarioLogeado && (
          <div className="flex flex-wrap gap-2">

            {!modoSeleccion && (
              <>
                <button
                  type="button"
                  onClick={
                    iniciarSeleccion
                  }
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-zinc-200 transition hover:bg-white/10"
                >
                  SELECCIONAR
                </button>

                <button
                  type="button"
                  onClick={
                    abrirSelectorFotos
                  }
                  disabled={subiendo}
                  className="rounded-full bg-white px-5 py-2 text-xs font-black text-black transition hover:bg-violet-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {subiendo
                    ? "SUBIENDO..."
                    : "+ AGREGAR FOTOS"}
                </button>
              </>
            )}

            {modoSeleccion && (
              <>
                <button
                  type="button"
                  onClick={
                    seleccionarTodas
                  }
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-zinc-200 transition hover:bg-white/10"
                >
                  {seleccionadas.length ===
                    fotos.length
                    ? "DESELECCIONAR TODAS"
                    : "SELECCIONAR TODAS"}
                </button>

                <button
                  type="button"
                  onClick={
                    eliminarSeleccionadas
                  }
                  disabled={
                    seleccionadas.length ===
                      0 ||
                    eliminando
                  }
                  className="rounded-full bg-red-500 px-4 py-2 text-xs font-black text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {eliminando
                    ? "ELIMINANDO..."
                    : `ELIMINAR ${seleccionadas.length}`}
                </button>

                <button
                  type="button"
                  onClick={
                    cancelarSeleccion
                  }
                  disabled={
                    eliminando
                  }
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-zinc-300 transition hover:bg-white/10"
                >
                  CANCELAR
                </button>
              </>
            )}
          </div>
        )}

        <input
          ref={inputFotosRef}
          type="file"
          accept="image/*"
          multiple
          onChange={subirFotos}
          className="hidden"
        />
      </div>

      {/* =================================================
          MENSAJES
          ================================================= */}

      {mensaje && (
        <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 px-5 py-4 text-center">
          <p className="text-sm font-semibold text-emerald-400">
            {mensaje}
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-950/20 px-5 py-4 text-center">
          <p className="text-sm font-semibold text-red-400">
            {error}
          </p>
        </div>
      )}

      {/* =================================================
          MODO SELECCIÓN
          ================================================= */}

      {modoSeleccion ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {fotos.map((foto) => {
            const seleccionada =
              seleccionadas.includes(
                foto.id
              );

            return (
              <button
                key={foto.id}
                type="button"
                onClick={() =>
                  alternarSeleccion(
                    foto.id
                  )
                }
                className={`group relative aspect-square overflow-hidden rounded-2xl border-2 bg-zinc-900 transition ${
                  seleccionada
                    ? "border-violet-400 ring-4 ring-violet-400/20"
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                <img
                  src={foto.imagen}
                  alt={
                    foto.descripcion ??
                    "Foto del evento"
                  }
                  className={`h-full w-full object-cover transition ${
                    seleccionada
                      ? "scale-95 opacity-70"
                      : "group-hover:scale-105"
                  }`}
                />

                {foto.portada && (
                  <div className="absolute left-3 top-3 rounded-full bg-yellow-400 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-black">
                    ⭐ Portada
                  </div>
                )}

                <div
                  className={`absolute inset-0 ${
                    seleccionada
                      ? "bg-violet-500/20"
                      : "bg-black/0"
                  }`}
                />

                <div
                  className={`absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border-2 text-sm font-black ${
                    seleccionada
                      ? "border-violet-300 bg-violet-500 text-white"
                      : "border-white/70 bg-black/50 text-transparent"
                  }`}
                >
                  ✓
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <>
          {/* =================================================
              FOTO PRINCIPAL
              ================================================= */}

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black">

            <div className="relative flex min-h-[500px] items-center justify-center bg-black p-4 md:min-h-[650px] md:p-8">

              <img
                src={
                  fotoSeleccionada.imagen
                }
                alt={
                  fotoSeleccionada.descripcion ??
                  "Fotografía del evento"
                }
                className="max-h-[70vh] max-w-full object-contain"
              />

              {/* PORTADA */}
              {fotoSeleccionada.portada && (
                <div className="absolute left-6 top-6 rounded-full border border-yellow-400/30 bg-yellow-400 px-4 py-2 text-xs font-black uppercase tracking-[0.15em] text-black shadow-lg">
                  ⭐ PORTADA ACTUAL
                </div>
              )}

              {/* ANTERIOR */}
              {fotos.length > 1 && (
                <button
                  type="button"
                  onClick={
                    fotoAnterior
                  }
                  aria-label="Fotografía anterior"
                  className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/70 text-3xl text-white backdrop-blur transition hover:bg-black/90 md:left-8"
                >
                  ‹
                </button>
              )}

              {/* SIGUIENTE */}
              {fotos.length > 1 && (
                <button
                  type="button"
                  onClick={
                    siguienteFoto
                  }
                  aria-label="Siguiente fotografía"
                  className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/70 text-3xl text-white backdrop-blur transition hover:bg-black/90 md:right-8"
                >
                  ›
                </button>
              )}

              {/* =================================================
                  BOTÓN PORTADA
                  ================================================= */}

              {usuarioLogeado && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2">

                  <button
                    type="button"
                    onClick={() =>
                      establecerPortada(
                        fotoSeleccionada
                      )
                    }
                    disabled={
                      cambiandoPortada
                    }
                    className={`rounded-full border px-5 py-3 text-xs font-black uppercase tracking-[0.15em] backdrop-blur transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      fotoSeleccionada.portada
                        ? "border-yellow-400/50 bg-yellow-400 text-black"
                        : "border-white/20 bg-black/80 text-white hover:border-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300"
                    }`}
                  >
                    {cambiandoPortada
                      ? "GUARDANDO..."
                      : fotoSeleccionada.portada
                        ? "⭐ PORTADA ACTUAL"
                        : "⭐ USAR COMO PORTADA"}
                  </button>

                </div>
              )}
            </div>

            {/* =================================================
                INFORMACIÓN FOTO
                ================================================= */}

            <div className="border-t border-white/10 bg-zinc-950/90 px-5 py-4 md:px-8">

              <div className="flex items-center justify-between gap-4">

                <p className="text-sm text-zinc-400">
                  {fotoActual + 1}{" "}
                  /{" "}
                  {fotos.length}
                </p>

                {fotoSeleccionada.descripcion && (
                  <p className="text-sm text-zinc-500">
                    {
                      fotoSeleccionada.descripcion
                    }
                  </p>
                )}

              </div>

            </div>
          </div>

          {/* =================================================
              MINIATURAS
              ================================================= */}

          <div className="mt-6 flex gap-2 overflow-x-auto pb-2">

            {fotos.map(
              (foto, index) => (
                <button
                  key={foto.id}
                  type="button"
                  onClick={() =>
                    setFotoActual(
                      index
                    )
                  }
                  className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                    index ===
                    fotoActual
                      ? "border-violet-400 opacity-100"
                      : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                >
                  <img
                    src={foto.imagen}
                    alt=""
                    className="h-full w-full object-cover"
                  />

                  {foto.portada && (
                    <div className="absolute bottom-1 left-1 rounded-full bg-yellow-400 px-2 py-0.5 text-[8px] font-black text-black">
                      ⭐
                    </div>
                  )}
                </button>
              )
            )}

          </div>
        </>
      )}
    </div>
  );
}