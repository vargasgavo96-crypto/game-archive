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

export default function GaleriaFotos({ edicionId }: GaleriaFotosProps) {
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clave, setClave] = useState("");
  const [autorizado, setAutorizado] = useState(false);
  const [errorClave, setErrorClave] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [fotoSeleccionada, setFotoSeleccionada] = useState<File | null>(null);
  const [eliminando, setEliminando] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    cargarFotos();
  }, [edicionId]);

  async function cargarFotos() {
    setCargando(true);

    const { data, error } = await supabase
      .from("galerias")
      .select("*")
      .eq("edicion_id", edicionId)
      .order("orden", { ascending: true })
      .order("created_at", { ascending: true });

    if (!error) {
      setFotos((data ?? []) as Foto[]);
    }

    setCargando(false);
  }

  function abrirModal() {
    setClave("");
    setErrorClave("");
    setMensaje("");
    setFotoSeleccionada(null);
    setAutorizado(false);
    setModalAbierto(true);
  }

  function cerrarModal() {
    if (subiendo) return;
    setModalAbierto(false);
  }

  function validarClave() {
    if (clave === CLAVE) {
      setAutorizado(true);
      setErrorClave("");
      setMensaje("");
      return;
    }

    setErrorClave("La clave ingresada no es correcta.");
  }

  async function subirFotos(event: React.ChangeEvent<HTMLInputElement>) {
    const archivos = Array.from(event.target.files ?? []);

    if (archivos.length === 0) return;

    if (!autorizado) {
      setErrorClave("Primero debes ingresar la clave.");
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

        const extension = archivo.name.split(".").pop() || "jpg";
        const nombreUnico = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
        const ruta = `${edicionId}/${nombreUnico}`;

        const { error: uploadError } = await supabase.storage
          .from("eventos-fotos")
          .upload(ruta, archivo, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from("eventos-fotos")
          .getPublicUrl(ruta);

        const { error: insertError } = await supabase
          .from("galerias")
          .insert({
            edicion_id: edicionId,
            imagen: publicUrlData.publicUrl,
            descripcion: null,
            orden: ordenActual,
          });

        if (insertError) {
          await supabase.storage.from("eventos-fotos").remove([ruta]);
          throw insertError;
        }

        ordenActual++;
      }

      await cargarFotos();
      setMensaje("¡Fotos subidas correctamente!");
      setFotoSeleccionada(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (error) {
      console.error(error);
      setMensaje("Ocurrió un error al subir las fotos.");
    } finally {
      setSubiendo(false);
    }
  }

  function obtenerRutaStorage(url: string) {
    const marcador = "/storage/v1/object/public/eventos-fotos/";

    const posicion = url.indexOf(marcador);

    if (posicion === -1) {
      return null;
    }

    return decodeURIComponent(url.substring(posicion + marcador.length));
  }

  async function eliminarFoto(foto: Foto) {
    if (!autorizado) {
      abrirModal();
      return;
    }

    const confirmar = window.confirm(
      "¿Seguro que quieres eliminar esta foto?"
    );

    if (!confirmar) return;

    setEliminando(foto.id);

    try {
      const ruta = obtenerRutaStorage(foto.imagen);

      if (ruta) {
        const { error: storageError } = await supabase.storage
          .from("eventos-fotos")
          .remove([ruta]);

        if (storageError) {
          throw storageError;
        }
      }

      const { error: deleteError } = await supabase
        .from("galerias")
        .delete()
        .eq("id", foto.id);

      if (deleteError) {
        throw deleteError;
      }

      setFotos((actuales) =>
        actuales.filter((fotoActual) => fotoActual.id !== foto.id)
      );
    } catch (error) {
      console.error(error);
      window.alert("No se pudo eliminar la foto.");
    } finally {
      setEliminando(null);
    }
  }

  return (
    <section className="mt-20">
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
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {fotos.map((foto) => (
            <div
              key={foto.id}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-zinc-900"
            >
              <img
                src={foto.imagen}
                alt="Foto del evento"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />

              {autorizado && (
                <button
                  type="button"
                  onClick={() => eliminarFoto(foto)}
                  disabled={eliminando === foto.id}
                  className="absolute right-3 top-3 rounded-full bg-black/80 px-3 py-2 text-xs font-bold text-white opacity-0 backdrop-blur transition group-hover:opacity-100 hover:bg-red-600 disabled:opacity-50"
                >
                  {eliminando === foto.id ? "..." : "🗑️"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {modalAbierto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-950 p-8 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
                  Galería
                </p>
                <h3 className="mt-2 text-3xl font-black">
                  {autorizado ? "AGREGAR FOTOS" : "ACCESO"}
                </h3>
              </div>

              <button
                type="button"
                onClick={cerrarModal}
                className="text-2xl text-zinc-500 transition hover:text-white"
              >
                ×
              </button>
            </div>

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
                    setClave(event.target.value);
                    setErrorClave("");
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      validarClave();
                    }
                  }}
                  placeholder="Clave"
                  className="mt-5 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500"
                />

                {errorClave && (
                  <p className="mt-3 text-sm text-red-400">{errorClave}</p>
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
              <div className="mt-8">
                <div
                  onClick={() => inputRef.current?.click()}
                  className="cursor-pointer rounded-3xl border border-dashed border-white/20 bg-white/5 p-10 text-center transition hover:border-violet-500 hover:bg-violet-500/5"
                >
                  <div className="text-5xl">📸</div>
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
                    onChange={subirFotos}
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