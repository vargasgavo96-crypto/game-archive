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
};

type EdicionGaleria = {
  id: number;
  eventoId: number;
  eventoNombre: string;
  eventoLogo: string | null;
  año: string;
  fecha: string | null;
  fotos: Foto[];
};

type GaleriaEdicionesProps = {
  ediciones: EdicionGaleria[];
};

export default function GaleriaEdiciones({
  ediciones,
}: GaleriaEdicionesProps) {
  const [edicionesLocales, setEdicionesLocales] =
    useState<EdicionGaleria[]>(ediciones);

  const [edicionSeleccionada, setEdicionSeleccionada] =
    useState<EdicionGaleria | null>(null);

  const [fotoActual, setFotoActual] = useState(0);

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

  const [mensaje, setMensaje] =
    useState("");

  const [error, setError] =
    useState("");

  const inputFotosRef =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEdicionesLocales(ediciones);
  }, [ediciones]);

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
          setUsuarioLogeado(!!session?.user);
        }
      );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function manejarTeclado(
      event: KeyboardEvent
    ) {
      if (!edicionSeleccionada) {
        return;
      }

      if (event.key === "Escape") {
        cerrarGaleria();
      }

      if (
        !modoSeleccion &&
        event.key === "ArrowRight"
      ) {
        siguienteFoto();
      }

      if (
        !modoSeleccion &&
        event.key === "ArrowLeft"
      ) {
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
    edicionSeleccionada,
    fotoActual,
    modoSeleccion,
  ]);

  useEffect(() => {
    if (edicionSeleccionada) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [edicionSeleccionada]);

  function abrirGaleria(
    edicion: EdicionGaleria
  ) {
    setEdicionSeleccionada(edicion);
    setFotoActual(0);
    setSeleccionadas([]);
    setModoSeleccion(false);
    setMensaje("");
    setError("");
  }

  function cerrarGaleria() {
    if (subiendo || eliminando) {
      return;
    }

    setEdicionSeleccionada(null);
    setFotoActual(0);
    setSeleccionadas([]);
    setModoSeleccion(false);
    setMensaje("");
    setError("");
  }

  function siguienteFoto() {
    if (
      !edicionSeleccionada ||
      edicionSeleccionada.fotos.length === 0
    ) {
      return;
    }

    setFotoActual((actual) =>
      actual ===
      edicionSeleccionada.fotos.length - 1
        ? 0
        : actual + 1
    );
  }

  function fotoAnterior() {
    if (
      !edicionSeleccionada ||
      edicionSeleccionada.fotos.length === 0
    ) {
      return;
    }

    setFotoActual((actual) =>
      actual === 0
        ? edicionSeleccionada.fotos.length - 1
        : actual - 1
    );
  }

  function actualizarEdicionLocal(
    edicionId: number,
    fotos: Foto[]
  ) {
    setEdicionesLocales((actuales) =>
      actuales.map((edicion) =>
        edicion.id === edicionId
          ? {
              ...edicion,
              fotos,
            }
          : edicion
      )
    );

    setEdicionSeleccionada((actual) =>
      actual && actual.id === edicionId
        ? {
            ...actual,
            fotos,
          }
        : actual
    );
  }

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
    if (!edicionSeleccionada) {
      return;
    }

    const todosLosIds =
      edicionSeleccionada.fotos.map(
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

    if (!edicionSeleccionada) {
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

      if (archivosImagenes.length === 0) {
        setError(
          "Los archivos seleccionados no contienen imágenes válidas."
        );

        return;
      }

      const fotosActuales =
        edicionSeleccionada.fotos;

      let ordenActual =
        fotosActuales.length;

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
          `${edicionSeleccionada.id}/${nombreUnico}`;

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
            edicion_id:
              edicionSeleccionada.id,
            imagen:
              publicUrlData.publicUrl,
            descripcion: null,
            orden: ordenActual,
          })
          .select(
            "id, imagen, descripcion, orden, created_at"
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
        ...fotosActuales,
        ...nuevasFotos,
      ];

      actualizarEdicionLocal(
        edicionSeleccionada.id,
        fotosActualizadas
      );

      setFotoActual(
        fotosActualizadas.length - 1
      );

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

  async function eliminarSeleccionadas() {
    if (!usuarioLogeado) {
      setError(
        "Debes iniciar sesión para eliminar fotografías."
      );

      return;
    }

    if (!edicionSeleccionada) {
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
        edicionSeleccionada.fotos.filter(
          (foto) =>
            seleccionadas.includes(foto.id)
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

      if (rutasStorage.length > 0) {
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
        edicionSeleccionada.fotos.filter(
          (foto) =>
            !seleccionadas.includes(
              foto.id
            )
        );

      actualizarEdicionLocal(
        edicionSeleccionada.id,
        fotosRestantes
      );

      setSeleccionadas([]);
      setModoSeleccion(false);

      if (fotosRestantes.length === 0) {
        setFotoActual(0);
      } else if (
        fotoActual >= fotosRestantes.length
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

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {edicionesLocales.map((edicion) => {
          const portada =
            edicion.fotos[0];

          return (
            <button
              key={edicion.id}
              type="button"
              onClick={() =>
                abrirGaleria(edicion)
              }
              className="group relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 text-left transition duration-500 hover:-translate-y-1 hover:border-violet-400/40 hover:shadow-2xl hover:shadow-violet-950/30"
            >
              {portada ? (
                <img
                  src={portada.imagen}
                  alt={`${edicion.eventoNombre} ${edicion.año}`}
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              ) : edicion.eventoLogo ? (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 p-12">
                  <img
                    src={edicion.eventoLogo}
                    alt={edicion.eventoNombre}
                    className="max-h-full max-w-full object-contain opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
                  />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                  <span className="text-sm uppercase tracking-[0.25em] text-zinc-600">
                    Sin fotografías
                  </span>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">
                  Edición
                </p>

                <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
                  {edicion.eventoNombre}
                </h2>

                <div className="mt-1 flex items-center justify-between gap-4">
                  <p className="text-lg font-bold text-zinc-300">
                    {edicion.año}
                  </p>

                  <span className="rounded-full border border-white/10 bg-black/50 px-3 py-1 text-xs font-semibold text-zinc-300 backdrop-blur">
                    {edicion.fotos.length}{" "}
                    {edicion.fotos.length === 1
                      ? "foto"
                      : "fotos"}
                  </span>
                </div>
              </div>

              <div className="absolute inset-0 border border-transparent transition duration-500 group-hover:border-violet-400/30" />
            </button>
          );
        })}
      </div>

      {edicionesLocales.length === 0 && (
        <div className="rounded-3xl border border-dashed border-white/10 bg-zinc-900/50 px-6 py-20 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-zinc-600">
            No hay ediciones con galería todavía
          </p>
        </div>
      )}

      {edicionSeleccionada && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              cerrarGaleria();
            }
          }}
        >
          <div className="fixed inset-y-0 left-0 right-0 lg:left-72">
            <div className="flex h-full flex-col">
              {/* HEADER */}
              <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-black/80 px-5 py-4 backdrop-blur md:px-8">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-400">
                    Galería
                  </p>

                  <h2 className="mt-1 text-xl font-black text-white md:text-2xl">
                    {edicionSeleccionada.eventoNombre}{" "}
                    {edicionSeleccionada.año}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {usuarioLogeado &&
                    !modoSeleccion && (
                      <>
                        <button
                          type="button"
                          onClick={
                            iniciarSeleccion
                          }
                          disabled={
                            edicionSeleccionada
                              .fotos
                              .length === 0
                          }
                          className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-zinc-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30 sm:block"
                        >
                          SELECCIONAR
                        </button>

                        <button
                          type="button"
                          onClick={
                            abrirSelectorFotos
                          }
                          disabled={subiendo}
                          className="rounded-full bg-white px-4 py-2 text-xs font-black text-black transition hover:bg-violet-200 disabled:cursor-not-allowed disabled:opacity-50 md:px-5"
                        >
                          {subiendo
                            ? "SUBIENDO..."
                            : "+ AGREGAR FOTOS"}
                        </button>

                        <input
                          ref={
                            inputFotosRef
                          }
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={
                            subirFotos
                          }
                          className="hidden"
                        />
                      </>
                    )}

                  {usuarioLogeado &&
                    modoSeleccion && (
                      <>
                        <button
                          type="button"
                          onClick={
                            seleccionarTodas
                          }
                          disabled={
                            edicionSeleccionada
                              .fotos
                              .length === 0
                          }
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-zinc-200 transition hover:bg-white/10 disabled:opacity-30"
                        >
                          {seleccionadas.length ===
                            edicionSeleccionada
                              .fotos
                              .length &&
                          edicionSeleccionada
                            .fotos
                            .length > 0
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
                            : `ELIMINAR ${
                                seleccionadas.length
                              }`}
                        </button>

                        <button
                          type="button"
                          onClick={
                            cancelarSeleccion
                          }
                          disabled={
                            eliminando
                          }
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-zinc-300 transition hover:bg-white/10"
                        >
                          CANCELAR
                        </button>
                      </>
                    )}

                  <button
                    type="button"
                    onClick={
                      cerrarGaleria
                    }
                    disabled={
                      subiendo ||
                      eliminando
                    }
                    aria-label="Cerrar galería"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-2xl text-zinc-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white disabled:opacity-40"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* MENSAJES */}
              {(mensaje || error) && (
                <div className="shrink-0 border-b border-white/10 bg-black/80 px-5 py-3 text-center backdrop-blur md:px-8">
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

              {modoSeleccion ? (
                /* MODO SELECCIÓN */
                <div className="min-h-0 flex-1 overflow-y-auto bg-black/50 p-5 md:p-8">
                  {edicionSeleccionada
                    .fotos.length > 0 ? (
                    <>
                      <div className="mx-auto mb-6 flex max-w-7xl items-center justify-between">
                        <p className="text-sm text-zinc-400">
                          <span className="font-bold text-white">
                            {
                              seleccionadas.length
                            }
                          </span>{" "}
                          de{" "}
                          {
                            edicionSeleccionada
                              .fotos
                              .length
                          }{" "}
                          fotos seleccionadas
                        </p>

                        <p className="hidden text-xs text-zinc-600 md:block">
                          Haz clic sobre las fotos para seleccionar
                        </p>
                      </div>

                      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {edicionSeleccionada.fotos.map(
                          (foto) => {
                            const seleccionada =
                              seleccionadas.includes(
                                foto.id
                              );

                            return (
                              <button
                                key={
                                  foto.id
                                }
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
                                    "Foto del evento"
                                  }
                                  className={`h-full w-full object-cover transition ${
                                    seleccionada
                                      ? "scale-95 opacity-70"
                                      : "group-hover:scale-105"
                                  }`}
                                />

                                <div
                                  className={`absolute inset-0 transition ${
                                    seleccionada
                                      ? "bg-violet-500/20"
                                      : "bg-black/0 group-hover:bg-black/10"
                                  }`}
                                />

                                <div
                                  className={`absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border-2 text-sm font-black transition ${
                                    seleccionada
                                      ? "border-violet-300 bg-violet-500 text-white"
                                      : "border-white/70 bg-black/50 text-transparent backdrop-blur"
                                  }`}
                                >
                                  ✓
                                </div>
                              </button>
                            );
                          }
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex min-h-full items-center justify-center">
                      <div className="text-center">
                        <p className="text-6xl">
                          📷
                        </p>

                        <p className="mt-5 text-lg font-semibold text-zinc-400">
                          No hay fotografías para seleccionar.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : edicionSeleccionada.fotos
                  .length > 0 ? (
                <>
                  {/* VISOR */}
                  <div className="relative flex min-h-0 flex-1 items-center justify-center p-4 md:p-8">
                    <img
                      src={
                        edicionSeleccionada
                          .fotos[
                          fotoActual
                        ]?.imagen ??
                        edicionSeleccionada
                          .fotos[0]
                          .imagen
                      }
                      alt={
                        edicionSeleccionada
                          .fotos[
                          fotoActual
                        ]?.descripcion ??
                        `${edicionSeleccionada.eventoNombre} ${edicionSeleccionada.año}`
                      }
                      className="max-h-full max-w-full object-contain"
                    />

                    {edicionSeleccionada
                      .fotos.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={
                            fotoAnterior
                          }
                          aria-label="Fotografía anterior"
                          className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/60 text-3xl text-white backdrop-blur transition hover:bg-black/80 md:left-8"
                        >
                          ‹
                        </button>

                        <button
                          type="button"
                          onClick={
                            siguienteFoto
                          }
                          aria-label="Siguiente fotografía"
                          className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/60 text-3xl text-white backdrop-blur transition hover:bg-black/80 md:right-8"
                        >
                          ›
                        </button>
                      </>
                    )}
                  </div>

                  {/* MINIATURAS */}
                  <div className="shrink-0 border-t border-white/10 bg-black/80 px-4 py-4 backdrop-blur md:px-8">
                    <div className="mb-4 flex items-center justify-center">
                      <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-semibold text-zinc-300">
                        {fotoActual + 1} /{" "}
                        {
                          edicionSeleccionada
                            .fotos.length
                        }
                      </span>
                    </div>

                    <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto pb-1">
                      {edicionSeleccionada.fotos.map(
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
                            className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition md:h-20 md:w-24 ${
                              index ===
                              fotoActual
                                ? "border-violet-400 opacity-100"
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
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </>
              ) : (
                /* SIN FOTOS */
                <div className="flex flex-1 items-center justify-center p-8 text-center">
                  <div>
                    {edicionSeleccionada.eventoLogo && (
                      <img
                        src={
                          edicionSeleccionada.eventoLogo
                        }
                        alt={
                          edicionSeleccionada.eventoNombre
                        }
                        className="mx-auto mb-8 max-h-40 max-w-xs object-contain opacity-70"
                      />
                    )}

                    <p className="text-sm uppercase tracking-[0.25em] text-zinc-600">
                      Esta edición todavía no tiene fotografías
                    </p>

                    {usuarioLogeado && (
                      <button
                        type="button"
                        onClick={
                          abrirSelectorFotos
                        }
                        disabled={
                          subiendo
                        }
                        className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-black text-black transition hover:bg-violet-200 disabled:opacity-50"
                      >
                        {subiendo
                          ? "SUBIENDO..."
                          : "+ AGREGAR FOTOS"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* INPUT GLOBAL PARA SUBIR FOTOS */}
      <input
        ref={inputFotosRef}
        type="file"
        accept="image/*"
        multiple
        onChange={subirFotos}
        className="hidden"
      />
    </>
  );
}