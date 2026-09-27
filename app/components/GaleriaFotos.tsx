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
  const [cargando, setCargando] = useState(true);

  // =====================================================
  // VISOR
  // =====================================================

  const [visorAbierto, setVisorAbierto] =
    useState(false);

  const [fotoActual, setFotoActual] =
    useState(0);

  // =====================================================
  // SESIÓN
  // =====================================================

  const [usuarioLogeado, setUsuarioLogeado] =
    useState(false);

  // =====================================================
  // SELECCIÓN
  // =====================================================

  const [modoSeleccion, setModoSeleccion] =
    useState(false);

  const [seleccionadas, setSeleccionadas] =
    useState<number[]>([]);

  // =====================================================
  // ESTADOS
  // =====================================================

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
    setError("");

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

      setFotos([]);
      setCargando(false);
      return;
    }

    const fotosCargadas =
      (data ?? []) as Foto[];

    // La portada aparece primero.
    const ordenadas =
      [...fotosCargadas].sort(
        (a, b) => {
          if (
            a.portada &&
            !b.portada
          ) {
            return -1;
          }

          if (
            !a.portada &&
            b.portada
          ) {
            return 1;
          }

          if (
            a.orden !== null &&
            b.orden !== null
          ) {
            return a.orden - b.orden;
          }

          return 0;
        }
      );

    setFotos(ordenadas);
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
  // CARGAR AL CAMBIAR EDICIÓN
  // =====================================================

  useEffect(() => {
    cargarFotos();

    setFotoActual(0);
    setVisorAbierto(false);
    setModoSeleccion(false);
    setSeleccionadas([]);
    setMensaje("");
    setError("");
  }, [edicionId]);

  // =====================================================
  // BLOQUEAR SCROLL CUANDO EL VISOR ESTÁ ABIERTO
  // =====================================================

  useEffect(() => {
    if (visorAbierto) {
      document.body.style.overflow =
        "hidden";
    } else {
      document.body.style.overflow =
        "";
    }

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [visorAbierto]);

  // =====================================================
  // TECLADO
  // =====================================================

  useEffect(() => {
    function manejarTeclado(
      event: KeyboardEvent
    ) {
      if (!visorAbierto) {
        return;
      }

      if (modoSeleccion) {
        return;
      }

      if (event.key === "Escape") {
        cerrarVisor();
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
    visorAbierto,
    modoSeleccion,
    fotos,
  ]);

  // =====================================================
  // ABRIR VISOR
  // =====================================================

  function abrirVisor(
    indice: number
  ) {
    setFotoActual(indice);
    setVisorAbierto(true);
    setModoSeleccion(false);
    setSeleccionadas([]);
    setMensaje("");
    setError("");
  }

  // =====================================================
  // CERRAR VISOR
  // =====================================================

  function cerrarVisor() {
    if (
      subiendo ||
      eliminando ||
      cambiandoPortada
    ) {
      return;
    }

    setVisorAbierto(false);
    setModoSeleccion(false);
    setSeleccionadas([]);
  }

  // =====================================================
  // SIGUIENTE FOTO
  // =====================================================

  function siguienteFoto() {
    if (fotos.length <= 1) {
      return;
    }

    setFotoActual((actual) =>
      actual >= fotos.length - 1
        ? 0
        : actual + 1
    );
  }

  // =====================================================
  // FOTO ANTERIOR
  // =====================================================

  function fotoAnterior() {
    if (fotos.length <= 1) {
      return;
    }

    setFotoActual((actual) =>
      actual <= 0
        ? fotos.length - 1
        : actual - 1
    );
  }

  // =====================================================
  // ABRIR SELECTOR DE FOTOS
  // =====================================================

  function abrirSelectorFotos() {
    setMensaje("");
    setError("");

    inputFotosRef.current?.click();
  }

  // =====================================================
  // SUBIR FOTOS
  // =====================================================

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
      const imagenes =
        archivos.filter((archivo) =>
          archivo.type.startsWith(
            "image/"
          )
        );

      if (imagenes.length === 0) {
        setError(
          "Los archivos seleccionados no contienen imágenes válidas."
        );

        return;
      }

      let ordenActual =
        fotos.length;

      const nuevasFotos: Foto[] = [];

      for (
        const archivo of imagenes
      ) {
        const extension =
          archivo.name
            .split(".")
            .pop()
            ?.toLowerCase() ||
          "jpg";

        const nombreUnico =
          `${Date.now()}-${crypto.randomUUID()}.${extension}`;

        const ruta =
          `${edicionId}/${nombreUnico}`;

        // -------------------------------------------------
        // STORAGE
        // -------------------------------------------------

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

        // -------------------------------------------------
        // BASE DE DATOS
        // -------------------------------------------------

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
        nuevasFotos.length > 0
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
  // OBTENER RUTA DE STORAGE
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
  // SELECCIONAR / DESELECCIONAR FOTO
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

  // =====================================================
  // SELECCIONAR TODAS
  // =====================================================

  function seleccionarTodas() {
    if (
      seleccionadas.length ===
      fotos.length
    ) {
      setSeleccionadas([]);
      return;
    }

    setSeleccionadas(
      fotos.map(
        (foto) => foto.id
      )
    );
  }

  // =====================================================
  // INICIAR SELECCIÓN
  // =====================================================

  function iniciarSeleccion() {
    setModoSeleccion(true);
    setSeleccionadas([]);
    setMensaje("");
    setError("");
  }

  // =====================================================
  // CANCELAR SELECCIÓN
  // =====================================================

  function cancelarSeleccion() {
    setModoSeleccion(false);
    setSeleccionadas([]);
  }

  // =====================================================
  // ELIMINAR FOTOS SELECCIONADAS
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

    const confirmar =
      window.confirm(
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

      // -------------------------------------------------
      // STORAGE
      // -------------------------------------------------

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
          .remove(
            rutasStorage
          );

        if (storageError) {
          console.error(
            "Error eliminando archivos:",
            storageError
          );
        }
      }

      // -------------------------------------------------
      // BASE DE DATOS
      // -------------------------------------------------

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

    if (foto.portada) {
      return;
    }

    setCambiandoPortada(true);
    setMensaje("");
    setError("");

    try {
      // -------------------------------------------------
      // QUITAR PORTADA ANTERIOR
      // -------------------------------------------------

      const {
        error: quitarError,
      } = await supabase
        .from("galerias")
        .update({
          portada: false,
        })
        .eq(
          "edicion_id",
          edicionId
        )
        .eq(
          "portada",
          true
        );

      if (quitarError) {
        throw quitarError;
      }

      // -------------------------------------------------
      // NUEVA PORTADA
      // -------------------------------------------------

      const {
        error: marcarError,
      } = await supabase
        .from("galerias")
        .update({
          portada: true,
        })
        .eq(
          "id",
          foto.id
        )
        .eq(
          "edicion_id",
          edicionId
        );

      if (marcarError) {
        throw marcarError;
      }

      const fotosActualizadas =
        fotos.map(
          (fotoActual) => ({
            ...fotoActual,
            portada:
              fotoActual.id ===
              foto.id,
          })
        );

      // Mantener portada arriba
      const ordenadas =
        [...fotosActualizadas].sort(
          (a, b) => {
            if (
              a.portada &&
              !b.portada
            ) {
              return -1;
            }

            if (
              !a.portada &&
              b.portada
            ) {
              return 1;
            }

            return 0;
          }
        );

      setFotos(ordenadas);

      const nuevoIndice =
        ordenadas.findIndex(
          (item) =>
            item.id === foto.id
        );

      if (
        nuevoIndice >= 0
      ) {
        setFotoActual(
          nuevoIndice
        );
      }

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
  // PRIMERAS 4 FOTOS
  // =====================================================

  const fotosPreview =
    fotos.slice(0, 4);

  const fotoSeleccionada =
    fotos[fotoActual] ??
    fotos[0];

  // =====================================================
  // RENDER
  // =====================================================

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

            <button
              type="button"
              onClick={
                iniciarSeleccion
              }
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-zinc-200 transition hover:bg-white/10"
            >
              SELECCIONAR
            </button>

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
        <div>

          <div className="mb-6 flex flex-wrap items-center gap-2">

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

            <span className="ml-2 text-xs text-zinc-500">
              {seleccionadas.length}{" "}
              seleccionadas
            </span>

          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">

            {fotos.map(
              (foto) => {
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
                        "Fotografía del evento"
                      }
                      className={`h-full w-full object-cover transition ${
                        seleccionada
                          ? "scale-95 opacity-60"
                          : "group-hover:scale-105"
                      }`}
                    />

                    {foto.portada && (
                      <div className="absolute left-3 top-3 rounded-full bg-yellow-400 px-3 py-1 text-[10px] font-black text-black">
                        ⭐ PORTADA
                      </div>
                    )}

                    <div
                      className={`absolute inset-0 transition ${
                        seleccionada
                          ? "bg-violet-500/20"
                          : "bg-transparent"
                      }`}
                    />

                    <div
                      className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border-2 font-black transition ${
                        seleccionada
                          ? "border-violet-300 bg-violet-500 text-white"
                          : "border-white/60 bg-black/50 text-transparent"
                      }`}
                    >
                      ✓
                    </div>

                  </button>
                );
              }
            )}

          </div>

        </div>
      ) : (
        <>
          {/* =================================================
              VISTA PREVIA
              
              4 FOTOS — 1 FILA — 4 COLUMNAS
              ================================================= */}

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-black">

            <div className="grid grid-cols-4 gap-1">

              {fotosPreview.map(
                (
                  foto,
                  index
                ) => (
                  <button
                    key={foto.id}
                    type="button"
                    onClick={() =>
                      abrirVisor(
                        index
                      )
                    }
                    className="group relative aspect-square min-w-0 overflow-hidden bg-zinc-900"
                  >

                    <img
                      src={foto.imagen}
                      alt={
                        foto.descripcion ??
                        "Fotografía del evento"
                      }
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    {/* OSCURECER AL PASAR */}

                    <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />

                    {/* PORTADA */}

                    {foto.portada && (
                      <div className="absolute left-2 top-2 rounded-full bg-yellow-400 px-2 py-1 text-[9px] font-black text-black shadow-lg">
                        ⭐
                      </div>
                    )}

                    {/* LUPA */}

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">

                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/70 text-xl backdrop-blur">
                        🔍
                      </div>

                    </div>

                  </button>
                )
              )}

              {/* ESPACIOS SI HAY MENOS DE 4 */}

              {Array.from({
                length:
                  Math.max(
                    0,
                    4 -
                      fotosPreview.length
                  ),
              }).map(
                (_, index) => (
                  <div
                    key={`vacio-${index}`}
                    className="aspect-square bg-zinc-900/70"
                  />
                )
              )}

            </div>

            {fotos.length > 4 && (
              <button
                type="button"
                onClick={() =>
                  abrirVisor(0)
                }
                className="w-full border-t border-white/10 bg-black/70 px-5 py-4 text-center text-sm font-bold text-zinc-300 transition hover:bg-white/5 hover:text-white"
              >
                VER LAS{" "}
                {fotos.length}{" "}
                FOTOGRAFÍAS →
              </button>
            )}

          </div>
        </>
      )}

      {/* =====================================================
          VISOR COMPLETO
          
          SE ABRE AL TOCAR UNA DE LAS 4 FOTOS
          
          AQUÍ ESTÁN TODAS LAS OPCIONES
          ===================================================== */}

      {visorAbierto &&
        !modoSeleccion && (
          <div
            className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-md"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                cerrarVisor();
              }
            }}
          >

            <div className="flex h-full w-full flex-col">

              {/* =================================================
                  HEADER DEL VISOR
                  ================================================= */}

              <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-black/80 px-5 py-4 backdrop-blur md:px-8">

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-400">
                    Recuerdos
                  </p>

                  <h2 className="mt-1 text-xl font-black text-white md:text-2xl">
                    GALERÍA
                  </h2>

                  <p className="mt-1 text-xs text-zinc-500">
                    {fotoActual + 1}{" "}
                    /{" "}
                    {fotos.length}
                  </p>
                </div>

                {/* =================================================
                    CONTROLES
                    ================================================= */}

                <div className="flex items-center gap-2">

                  {usuarioLogeado && (
                    <>
                      <button
                        type="button"
                        onClick={
                          abrirSelectorFotos
                        }
                        disabled={
                          subiendo
                        }
                        className="rounded-full bg-white px-4 py-2 text-xs font-black text-black transition hover:bg-violet-200 disabled:opacity-50 md:px-5"
                      >
                        {subiendo
                          ? "SUBIENDO..."
                          : "+ AGREGAR FOTOS"}
                      </button>

                      <button
                        type="button"
                        onClick={
                          iniciarSeleccion
                        }
                        className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-zinc-200 transition hover:bg-white/10 sm:block"
                      >
                        SELECCIONAR
                      </button>
                    </>
                  )}

                  {/* CERRAR */}

                  <button
                    type="button"
                    onClick={
                      cerrarVisor
                    }
                    disabled={
                      subiendo ||
                      eliminando ||
                      cambiandoPortada
                    }
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-2xl text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
                    aria-label="Cerrar galería"
                  >
                    ×
                  </button>

                </div>

              </div>

              {/* =================================================
                  MENSAJES
                  ================================================= */}

              {(mensaje || error) && (
                <div className="shrink-0 border-b border-white/10 bg-black/80 px-5 py-3 text-center">

                  {mensaje && (
                    <p className="text-sm font-semibold text-emerald-400">
                      {mensaje}
                    </p>
                  )}

                  {error && (
                    <p className="text-sm font-semibold text-red-400">
                      {error}
                    </p>
                  )}

                </div>
              )}

              {/* =================================================
                  FOTO GRANDE
                  ================================================= */}

              <div className="relative flex min-h-0 flex-1 items-center justify-center p-4 md:p-8">

                <img
                  src={
                    fotoSeleccionada.imagen
                  }
                  alt={
                    fotoSeleccionada.descripcion ??
                    "Fotografía del evento"
                  }
                  className="max-h-full max-w-full object-contain"
                />

                {/* PORTADA */}

                {fotoSeleccionada.portada && (
                  <div className="absolute left-6 top-6 rounded-full bg-yellow-400 px-4 py-2 text-xs font-black uppercase tracking-[0.15em] text-black shadow-lg">
                    ⭐ PORTADA ACTUAL
                  </div>
                )}

                {/* =================================================
                    FOTO ANTERIOR
                    ================================================= */}

                {fotos.length > 1 && (
                  <button
                    type="button"
                    onClick={
                      fotoAnterior
                    }
                    aria-label="Fotografía anterior"
                    className="absolute left-3 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/70 text-4xl text-white backdrop-blur transition hover:bg-black/90 md:left-8"
                  >
                    ‹
                  </button>
                )}

                {/* =================================================
                    FOTO SIGUIENTE
                    ================================================= */}

                {fotos.length > 1 && (
                  <button
                    type="button"
                    onClick={
                      siguienteFoto
                    }
                    aria-label="Siguiente fotografía"
                    className="absolute right-3 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/70 text-4xl text-white backdrop-blur transition hover:bg-black/90 md:right-8"
                  >
                    ›
                  </button>
                )}

                {/* =================================================
                    CAMBIAR PORTADA
                    ================================================= */}

                {usuarioLogeado && (
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2">

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
                      className={`rounded-full border px-6 py-3 text-xs font-black uppercase tracking-[0.15em] shadow-xl backdrop-blur transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        fotoSeleccionada.portada
                          ? "border-yellow-400 bg-yellow-400 text-black"
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
                  MINIATURAS
                  ================================================= */}

              <div className="shrink-0 border-t border-white/10 bg-black/90 px-4 py-4 backdrop-blur md:px-8">

                <div className="mb-3 flex items-center justify-center">

                  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-zinc-300">
                    {fotoActual + 1}{" "}
                    /{" "}
                    {fotos.length}
                  </span>

                </div>

                <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto pb-1">

                  {fotos.map(
                    (
                      foto,
                      index
                    ) => (
                      <button
                        key={
                          foto.id
                        }
                        type="button"
                        onClick={() =>
                          setFotoActual(
                            index
                          )
                        }
                        aria-label={`Ver fotografía ${
                          index + 1
                        }`}
                        className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition md:h-20 md:w-28 ${
                          index ===
                          fotoActual
                            ? "border-violet-500 opacity-100"
                            : "border-transparent opacity-50 hover:opacity-100"
                        }`}
                      >

                        <img
                          src={
                            foto.imagen
                          }
                          alt=""
                          className="h-full w-full object-cover"
                        />

                        {foto.portada && (
                          <div className="absolute bottom-1 left-1 rounded-full bg-yellow-400 px-1.5 py-0.5 text-[8px] font-black text-black">
                            ⭐
                          </div>
                        )}

                      </button>
                    )
                  )}

                </div>

              </div>

            </div>

          </div>
        )}

      {/* =====================================================
          INPUT
          ===================================================== */}

      <input
        ref={inputFotosRef}
        type="file"
        accept="image/*"
        multiple
        onChange={subirFotos}
        className="hidden"
      />

      {/* =====================================================
          MODAL DE SELECCIÓN
          
          Cuando se presiona SELECCIONAR dentro del visor,
          cerramos el visor y mostramos la selección.
          ===================================================== */}

      {modoSeleccion && (
        <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-md">

          <div className="flex h-full flex-col">

            {/* HEADER */}

            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-black/80 px-5 py-4 md:px-8">

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-400">
                  Galería
                </p>

                <h2 className="mt-1 text-xl font-black text-white md:text-2xl">
                  SELECCIONAR FOTOS
                </h2>

                <p className="mt-1 text-xs text-zinc-500">
                  {seleccionadas.length}{" "}
                  seleccionadas de{" "}
                  {fotos.length}
                </p>
              </div>

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  onClick={
                    seleccionarTodas
                  }
                  className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-zinc-200 transition hover:bg-white/10 sm:block"
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

              </div>

            </div>

            {/* FOTOS */}

            <div className="min-h-0 flex-1 overflow-y-auto p-5 md:p-8">

              <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">

                {fotos.map(
                  (foto) => {
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
                          src={
                            foto.imagen
                          }
                          alt={
                            foto.descripcion ??
                            "Fotografía del evento"
                          }
                          className={`h-full w-full object-cover transition ${
                            seleccionada
                              ? "scale-95 opacity-60"
                              : "group-hover:scale-105"
                          }`}
                        />

                        {foto.portada && (
                          <div className="absolute left-2 top-2 rounded-full bg-yellow-400 px-2 py-1 text-[8px] font-black text-black">
                            ⭐
                          </div>
                        )}

                        <div
                          className={`absolute inset-0 transition ${
                            seleccionada
                              ? "bg-violet-500/20"
                              : "bg-transparent"
                          }`}
                        />

                        <div
                          className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border-2 font-black ${
                            seleccionada
                              ? "border-violet-300 bg-violet-500 text-white"
                              : "border-white/60 bg-black/50 text-transparent"
                          }`}
                        >
                          ✓
                        </div>

                      </button>
                    );
                  }
                )}

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}