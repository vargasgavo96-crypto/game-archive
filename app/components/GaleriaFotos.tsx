"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

const CLAVE = "GAME2026";

type Foto = {
  id: number;
  edicion_id: number;
  imagen: string;
  descripcion: string | null;
  orden: number | null;
  created_at: string;
};

type GaleriaFotosProps = {
  edicionId: number;
};

export default function GaleriaFotos({
  edicionId,
}: GaleriaFotosProps) {
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [cargando, setCargando] = useState(true);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [visorAbierto, setVisorAbierto] = useState(false);

  const [clave, setClave] = useState("");
  const [autorizado, setAutorizado] = useState(false);
  const [errorClave, setErrorClave] = useState("");

  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const [fotoVisor, setFotoVisor] = useState(0);
  const [eliminando, setEliminando] = useState<number | null>(null);

  const [usuarioLogeado, setUsuarioLogeado] =
    useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // =====================================================
  // COMPROBAR SESIÓN
  // =====================================================

  useEffect(() => {
    async function comprobarSesion() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const logeado = !!user;

      setUsuarioLogeado(logeado);

      // Si está logeado, no necesita clave
      setAutorizado(logeado);
    }

    comprobarSesion();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const logeado = !!session?.user;

        setUsuarioLogeado(logeado);

        // Usuario logeado = autorizado automáticamente
        setAutorizado(logeado);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // =====================================================
  // CARGAR FOTOS
  // =====================================================

  useEffect(() => {
    async function cargarFotos() {
      setCargando(true);

      const { data, error } = await supabase
        .from("galerias")
        .select("*")
        .eq("edicion_id", edicionId)
        .order("orden", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) {
        console.error(
          "Error cargando galería:",
          error
        );

        setFotos([]);
      } else {
        setFotos((data ?? []) as Foto[]);
      }

      setCargando(false);
    }

    cargarFotos();
  }, [edicionId]);

  // =====================================================
  // ABRIR MODAL
  // =====================================================

  async function abrirModal() {
    setClave("");
    setErrorClave("");
    setMensaje("");

    // Volvemos a comprobar la sesión por seguridad
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setUsuarioLogeado(true);
      setAutorizado(true);
    } else {
      setUsuarioLogeado(false);
      setAutorizado(false);
    }

    setModalAbierto(true);
  }

  function cerrarModal() {
    if (subiendo) return;

    setModalAbierto(false);
  }

  // =====================================================
  // VISOR
  // =====================================================

  function abrirVisor(indice: number) {
    setFotoVisor(indice);
    setVisorAbierto(true);
  }

  function cerrarVisor() {
    setVisorAbierto(false);
  }

  function fotoAnterior() {
    if (fotos.length <= 1) return;

    setFotoVisor((actual) =>
      actual === 0
        ? fotos.length - 1
        : actual - 1
    );
  }

  function siguienteFoto() {
    if (fotos.length <= 1) return;

    setFotoVisor((actual) =>
      actual === fotos.length - 1
        ? 0
        : actual + 1
    );
  }

  // =====================================================
  // TECLADO VISOR
  // =====================================================

  useEffect(() => {
    if (!visorAbierto) return;

    function manejarTecla(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        cerrarVisor();
      }

      if (event.key === "ArrowLeft") {
        setFotoVisor((actual) =>
          actual === 0
            ? fotos.length - 1
            : actual - 1
        );
      }

      if (event.key === "ArrowRight") {
        setFotoVisor((actual) =>
          actual === fotos.length - 1
            ? 0
            : actual + 1
        );
      }
    }

    document.addEventListener(
      "keydown",
      manejarTecla
    );

    const overflowAnterior =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        manejarTecla
      );

      document.body.style.overflow =
        overflowAnterior;
    };
  }, [visorAbierto, fotos.length]);

  // =====================================================
  // VALIDAR CLAVE
  // =====================================================

  function validarClave() {
    if (clave === CLAVE) {
      setAutorizado(true);
      setErrorClave("");
      setMensaje("");

      return;
    }

    setErrorClave(
      "La clave ingresada no es correcta."
    );
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

    if (archivos.length === 0) return;

    if (!autorizado) {
      setErrorClave(
        "Primero debes ingresar la clave."
      );

      return;
    }

    setSubiendo(true);
    setMensaje("");

    try {
      let ordenActual = fotos.length;

      for (const archivo of archivos) {
        if (!archivo.type.startsWith("image/")) {
          continue;
        }

        const extension =
          archivo.name.split(".").pop() ||
          "jpg";

        const nombreUnico =
          `${Date.now()}-${crypto.randomUUID()}.${extension}`;

        const ruta =
          `${edicionId}/${nombreUnico}`;

        // ---------------------------------------------
        // SUBIR AL STORAGE
        // ---------------------------------------------

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

        // ---------------------------------------------
        // URL PÚBLICA
        // ---------------------------------------------

        const {
          data: publicUrlData,
        } = supabase.storage
          .from("eventos-fotos")
          .getPublicUrl(ruta);

        // ---------------------------------------------
        // GUARDAR EN GALERIAS
        // ---------------------------------------------

        const {
          error: insertError,
        } = await supabase
          .from("galerias")
          .insert({
            edicion_id: edicionId,
            imagen:
              publicUrlData.publicUrl,
            descripcion: null,
            orden: ordenActual,
          });

        if (insertError) {
          await supabase.storage
            .from("eventos-fotos")
            .remove([ruta]);

          throw insertError;
        }

        ordenActual++;
      }

      // ---------------------------------------------
      // RECARGAR FOTOS
      // ---------------------------------------------

      const {
        data,
        error,
      } = await supabase
        .from("galerias")
        .select("*")
        .eq("edicion_id", edicionId)
        .order("orden", {
          ascending: true,
        })
        .order("created_at", {
          ascending: true,
        });

      if (!error) {
        setFotos(
          (data ?? []) as Foto[]
        );
      }

      setMensaje(
        "¡Fotos subidas correctamente!"
      );

      if (inputRef.current) {
        inputRef.current.value = "";
      }

    } catch (error) {
      console.error(
        "Error subiendo fotos:",
        error
      );

      setMensaje(
        "Ocurrió un error al subir las fotos."
      );

    } finally {
      setSubiendo(false);
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
  // ELIMINAR FOTO
  // =====================================================

  async function eliminarFoto(
    foto: Foto
  ) {
    if (!autorizado) {
      abrirModal();
      return;
    }

    const confirmar =
      window.confirm(
        "¿Seguro que quieres eliminar esta foto?"
      );

    if (!confirmar) return;

    setEliminando(foto.id);

    try {
      const ruta =
        obtenerRutaStorage(
          foto.imagen
        );

      // ---------------------------------------------
      // ELIMINAR DEL STORAGE
      // ---------------------------------------------

      if (ruta) {
        const {
          error: storageError,
        } = await supabase.storage
          .from("eventos-fotos")
          .remove([ruta]);

        if (storageError) {
          throw storageError;
        }
      }

      // ---------------------------------------------
      // ELIMINAR DE GALERIAS
      // ---------------------------------------------

      const {
        error: deleteError,
      } = await supabase
        .from("galerias")
        .delete()
        .eq("id", foto.id);

      if (deleteError) {
        throw deleteError;
      }

      setFotos(
        (actuales) =>
          actuales.filter(
            (fotoActual) =>
              fotoActual.id !== foto.id
          )
      );

      setFotoVisor((actual) =>
        Math.min(
          actual,
          Math.max(
            0,
            fotos.length - 2
          )
        )
      );

    } catch (error) {
      console.error(
        "Error eliminando foto:",
        error
      );

      window.alert(
        "No se pudo eliminar la foto."
      );

    } finally {
      setEliminando(null);
    }
  }

  // =====================================================
  // FOTOS DE VISTA PREVIA
  // =====================================================

  const fotosVista = fotos.slice(0, 4);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <section className="mt-20">

      {/* ================================================= */}
      {/* CABECERA */}
      {/* ================================================= */}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

        <div>

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
            Recuerdos
          </p>

          <h2 className="mt-3 text-4xl font-black md:text-5xl">
            GALERÍA
          </h2>

          <p className="mt-3 max-w-2xl text-zinc-400">
            Fotos de este evento compartidas por la comunidad.
          </p>

        </div>

        <button
          type="button"
          onClick={abrirModal}
          className="rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:scale-105 hover:bg-violet-200"
        >
          + AGREGAR FOTO
        </button>

      </div>

      {/* ================================================= */}
      {/* GALERÍA */}
      {/* ================================================= */}

      {cargando ? (

        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-zinc-400">
          Cargando galería...
        </div>

      ) : fotos.length === 0 ? (

        <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-12 text-center">

          <p className="text-lg font-semibold text-white">
            Todavía no hay fotos
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            ¡Sé la primera persona en agregar una!
          </p>

        </div>

      ) : (

        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

            {fotosVista.map(
              (foto, index) => (

                <div
                  key={foto.id}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-zinc-900"
                >

                  <button
                    type="button"
                    onClick={() =>
                      abrirVisor(index)
                    }
                    className="absolute inset-0 h-full w-full cursor-pointer"
                    aria-label={`Abrir foto ${
                      index + 1
                    }`}
                  >

                    <img
                      src={foto.imagen}
                      alt={
                        foto.descripcion ??
                        "Foto del evento"
                      }
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="pointer-events-none absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/20" />

                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100">

                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/70 text-xl text-white backdrop-blur-sm">
                        ⛶
                      </div>

                    </div>

                  </button>

                  {/* ELIMINAR */}

                  {autorizado && (

                    <button
                      type="button"
                      onClick={() =>
                        eliminarFoto(foto)
                      }
                      disabled={
                        eliminando ===
                        foto.id
                      }
                      className="absolute right-3 top-3 z-10 rounded-full bg-black/80 px-3 py-2 text-xs font-bold text-white opacity-0 backdrop-blur transition group-hover:opacity-100 hover:bg-red-600 disabled:opacity-50"
                    >
                      {eliminando ===
                      foto.id
                        ? "..."
                        : "🗑️"}
                    </button>

                  )}

                </div>

              )
            )}

          </div>

          {fotos.length > 4 && (

            <button
              type="button"
              onClick={() =>
                abrirVisor(0)
              }
              className="mx-auto mt-7 block rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:border-violet-500/40 hover:bg-violet-500/10"
            >
              VER TODAS LAS FOTOS →
            </button>

          )}

        </>
      )}

      {/* ================================================= */}
      {/* VISOR */}
      {/* ================================================= */}

      {visorAbierto &&
        fotos.length > 0 && (

          <div
            className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md lg:left-72"
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

              {/* HEADER */}

              <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-black/50 px-5 py-4 md:px-8">

                <div>

                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-400">
                    Recuerdos
                  </p>

                  <h2 className="mt-1 text-xl font-black text-white md:text-2xl">
                    GALERÍA
                  </h2>

                </div>

                <button
                  type="button"
                  onClick={cerrarVisor}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-2xl text-zinc-300 transition hover:bg-white/10 hover:text-white"
                  aria-label="Cerrar galería"
                >
                  ×
                </button>

              </div>

              {/* FOTO PRINCIPAL */}

              <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 py-6 md:px-16 md:py-8">

                <img
                  src={
                    fotos[fotoVisor].imagen
                  }
                  alt={
                    fotos[fotoVisor]
                      .descripcion ??
                    "Foto del evento"
                  }
                  className="max-h-full max-w-full object-contain"
                />

                {fotos.length > 1 && (

                  <>
                    <button
                      type="button"
                      onClick={
                        fotoAnterior
                      }
                      className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/60 text-3xl text-white backdrop-blur-md transition hover:bg-violet-600 md:left-8"
                      aria-label="Foto anterior"
                    >
                      ‹
                    </button>

                    <button
                      type="button"
                      onClick={
                        siguienteFoto
                      }
                      className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/60 text-3xl text-white backdrop-blur-md transition hover:bg-violet-600 md:right-8"
                      aria-label="Foto siguiente"
                    >
                      ›
                    </button>
                  </>

                )}

                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/70 px-4 py-2 text-sm font-bold text-white backdrop-blur-md">
                  {fotoVisor + 1} /{" "}
                  {fotos.length}
                </div>

              </div>

              {/* MINIATURAS */}

              <div className="shrink-0 border-t border-white/10 bg-black/70 px-4 py-4 md:px-8">

                <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto pb-1">

                  {fotos.map(
                    (foto, index) => (

                      <button
                        key={foto.id}
                        type="button"
                        onClick={() =>
                          setFotoVisor(
                            index
                          )
                        }
                        className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition md:h-20 md:w-28 ${
                          index ===
                          fotoVisor
                            ? "border-violet-500 opacity-100"
                            : "border-transparent opacity-50 hover:opacity-100"
                        }`}
                        aria-label={`Ver foto ${
                          index + 1
                        }`}
                      >

                        <img
                          src={foto.imagen}
                          alt=""
                          className="h-full w-full object-cover"
                        />

                        {index ===
                          fotoVisor && (

                          <div className="absolute inset-0 bg-violet-500/10" />

                        )}

                      </button>

                    )
                  )}

                </div>

              </div>

            </div>

          </div>

        )}

      {/* ================================================= */}
      {/* MODAL AGREGAR FOTO */}
      {/* ================================================= */}

      {modalAbierto && (

        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              cerrarModal();
            }
          }}
        >

          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-950 p-8 shadow-2xl">

            {/* HEADER */}

            <div className="flex items-start justify-between gap-4">

              <div>

                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
                  Galería
                </p>

                <h3 className="mt-2 text-3xl font-black">
                  {autorizado
                    ? "AGREGAR FOTOS"
                    : "ACCESO"}
                </h3>

                {usuarioLogeado && (

                  <p className="mt-2 text-sm text-emerald-400">
                    ✓ Sesión iniciada
                  </p>

                )}

              </div>

              <button
                type="button"
                onClick={cerrarModal}
                className="text-2xl text-zinc-500 transition hover:text-white"
              >
                ×
              </button>

            </div>

            {/* ================================================= */}
            {/* NO LOGEADO → CLAVE */}
            {/* ================================================= */}

            {!autorizado ? (

              <div className="mt-8">

                <p className="text-sm leading-6 text-zinc-400">
                  Ingresa la clave para agregar o eliminar fotos de esta
                  galería.
                </p>

                <input
                  type="password"
                  value={clave}
                  onChange={(event) => {
                    setClave(
                      event.target.value
                    );

                    setErrorClave("");
                  }}
                  onKeyDown={(event) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      validarClave();
                    }
                  }}
                  placeholder="Clave"
                  className="mt-5 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500"
                />

                {errorClave && (

                  <p className="mt-3 text-sm text-red-400">
                    {errorClave}
                  </p>

                )}

                <button
                  type="button"
                  onClick={validarClave}
                  className="mt-5 w-full rounded-2xl bg-white px-5 py-4 font-bold text-black transition hover:bg-violet-200"
                >
                  CONTINUAR
                </button>

              </div>

            ) : (

              /* ================================================= */
              /* AUTORIZADO → SUBIR */
              /* ================================================= */

              <div className="mt-8">

                <div
                  onClick={() =>
                    inputRef.current?.click()
                  }
                  className="cursor-pointer rounded-3xl border border-dashed border-white/20 bg-white/5 p-10 text-center transition hover:border-violet-500 hover:bg-violet-500/5"
                >

                  <div className="text-5xl">
                    📸
                  </div>

                  <p className="mt-4 font-bold">
                    Seleccionar fotos
                  </p>

                  <p className="mt-2 text-sm text-zinc-500">
                    Puedes seleccionar varias a la vez
                  </p>

                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={
                      subirFotos
                    }
                  />

                </div>

                {subiendo && (

                  <div className="mt-5 rounded-2xl bg-violet-500/10 p-4 text-center text-sm text-violet-300">
                    Subiendo fotos...
                  </div>

                )}

                {mensaje && (

                  <div className="mt-5 rounded-2xl bg-white/5 p-4 text-center text-sm text-zinc-300">
                    {mensaje}
                  </div>

                )}

                <button
                  type="button"
                  onClick={cerrarModal}
                  disabled={subiendo}
                  className="mt-5 w-full rounded-2xl border border-white/10 px-5 py-4 font-bold text-white transition hover:bg-white/5 disabled:opacity-50"
                >
                  CERRAR
                </button>

              </div>

            )}

          </div>

        </div>

      )}

    </section>
  );
}