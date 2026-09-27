"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Persona = {
  id: number;
  nombre: string;
  imagen: string | null;
};

type Participacion = {
  id: number;
  persona_id: number;
  edicion_id: number;
  posicion: number | null;
  puntos_finales: number | null;
  personaje: string | null;
  imagen: string | null;
};

type Props = {
  edicionId: number;
  personas: Persona[];
  participacionesIniciales: Participacion[];
};

export default function ParticipantesMascarada({
  edicionId,
  personas,
  participacionesIniciales,
}: Props) {
  const [participaciones, setParticipaciones] =
    useState<Participacion[]>(participacionesIniciales);

  const [mostrarAgregar, setMostrarAgregar] =
    useState(false);

  const [guardando, setGuardando] =
    useState<number | null>(null);

  const [subiendoFoto, setSubiendoFoto] =
    useState<number | null>(null);

  const [mensaje, setMensaje] =
    useState("");

  const [errorDetalle, setErrorDetalle] =
    useState("");

  // =====================================================
  // PERSONAS YA AGREGADAS
  // =====================================================

  const participantesIds = new Set(
    participaciones.map(
      (participacion) => participacion.persona_id
    )
  );

  const participantes = personas.filter((persona) =>
    participantesIds.has(persona.id)
  );

  // =====================================================
  // AGREGAR PARTICIPANTE
  // =====================================================

  async function agregarParticipante(persona: Persona) {
    if (participantesIds.has(persona.id)) {
      return;
    }

    setMensaje("");
    setErrorDetalle("");

    const { error } = await supabase
      .from("participaciones")
      .insert({
        persona_id: persona.id,
        edicion_id: edicionId,
        posicion: null,
        puntos_finales: null,
        personaje: null,
        imagen: null,
      });

    if (error) {
      console.error(
        "ERROR AGREGANDO PARTICIPANTE:",
        error
      );

      console.error("message:", error.message);
      console.error("details:", error.details);
      console.error("hint:", error.hint);
      console.error("code:", error.code);

      setMensaje(
        "No se pudo agregar al participante."
      );

      setErrorDetalle(
        [
          error.message,
          error.details,
          error.hint,
          error.code
            ? `Código: ${error.code}`
            : "",
        ]
          .filter(Boolean)
          .join(" | ")
      );

      return;
    }

    // ===================================================
    // RECARGAR PARTICIPACIÓN RECIÉN CREADA
    // ===================================================

    const {
      data: nuevaParticipacion,
      error: consultaError,
    } = await supabase
      .from("participaciones")
      .select(
        "id, persona_id, edicion_id, posicion, puntos_finales, personaje, imagen"
      )
      .eq("edicion_id", edicionId)
      .eq("persona_id", persona.id)
      .order("id", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (consultaError) {
      console.error(
        "PARTICIPANTE INSERTADO PERO NO SE PUDO RECARGAR:",
        consultaError
      );

      setMensaje(
        `${persona.nombre} fue agregado, pero no se pudo actualizar la pantalla.`
      );

      return;
    }

    if (!nuevaParticipacion) {
      setMensaje(
        `${persona.nombre} fue agregado.`
      );

      return;
    }

    setParticipaciones((actuales) => [
      ...actuales,
      nuevaParticipacion,
    ]);

    setMensaje(
      `${persona.nombre} fue agregado correctamente.`
    );
  }

  // =====================================================
  // QUITAR PARTICIPANTE
  // =====================================================

  async function quitarParticipante(
    participacionId: number
  ) {
    setMensaje("");
    setErrorDetalle("");

    const { error } = await supabase
      .from("participaciones")
      .delete()
      .eq("id", participacionId);

    if (error) {
      console.error(
        "ERROR ELIMINANDO PARTICIPANTE:",
        error
      );

      setMensaje(
        "No se pudo quitar al participante."
      );

      setErrorDetalle(
        [
          error.message,
          error.details,
          error.hint,
          error.code
            ? `Código: ${error.code}`
            : "",
        ]
          .filter(Boolean)
          .join(" | ")
      );

      return;
    }

    setParticipaciones((actuales) =>
      actuales.filter(
        (participacion) =>
          participacion.id !== participacionId
      )
    );

    setMensaje(
      "Participante eliminado."
    );
  }

  // =====================================================
  // GUARDAR DISFRAZ
  // =====================================================

  async function guardarDisfraz(
    participacionId: number,
    disfraz: string
  ) {
    setGuardando(participacionId);

    setMensaje("");
    setErrorDetalle("");

    const valor =
      disfraz.trim() || null;

    const { error } = await supabase
      .from("participaciones")
      .update({
        personaje: valor,
      })
      .eq("id", participacionId);

    if (error) {
      console.error(
        "ERROR GUARDANDO DISFRAZ:",
        error
      );

      setMensaje(
        "No se pudo guardar el disfraz."
      );

      setErrorDetalle(
        [
          error.message,
          error.details,
          error.hint,
          error.code
            ? `Código: ${error.code}`
            : "",
        ]
          .filter(Boolean)
          .join(" | ")
      );

      setGuardando(null);

      return;
    }

    setParticipaciones((actuales) =>
      actuales.map((participacion) =>
        participacion.id === participacionId
          ? {
              ...participacion,
              personaje: valor,
            }
          : participacion
      )
    );

    setMensaje(
      "Disfraz guardado correctamente."
    );

    setGuardando(null);
  }

  // =====================================================
  // SUBIR FOTO DEL DISFRAZ
  // =====================================================

  async function subirFoto(
    participacion: Participacion,
    archivo: File
  ) {
    setSubiendoFoto(participacion.id);

    setMensaje("");
    setErrorDetalle("");

    try {
      const extension =
        archivo.name.split(".").pop() || "jpg";

      const nombreArchivo =
        `${Date.now()}.${extension}`;

      const ruta =
        `mascarada/${edicionId}/${participacion.persona_id}/${nombreArchivo}`;

      // -----------------------------------------------
      // SUBIR AL STORAGE
      // -----------------------------------------------

      const {
        error: uploadError,
      } = await supabase.storage
        .from("eventos-fotos")
        .upload(
          ruta,
          archivo,
          {
            contentType: archivo.type,
            upsert: false,
          }
        );

      if (uploadError) {
        console.error(
          "ERROR SUBIENDO FOTO:",
          uploadError
        );

        setMensaje(
          "No se pudo subir la foto."
        );

        setErrorDetalle(
          [
            uploadError.message,
            uploadError.name,
          ]
            .filter(Boolean)
            .join(" | ")
        );

        return;
      }

      // -----------------------------------------------
      // URL PÚBLICA
      // -----------------------------------------------

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("eventos-fotos")
        .getPublicUrl(ruta);

      const imagen =
        publicUrlData.publicUrl;

      // -----------------------------------------------
      // GUARDAR URL
      // -----------------------------------------------

      const {
        error: updateError,
      } = await supabase
        .from("participaciones")
        .update({
          imagen,
        })
        .eq("id", participacion.id);

      if (updateError) {
        console.error(
          "ERROR GUARDANDO FOTO:",
          updateError
        );

        setMensaje(
          "La foto se subió, pero no se pudo guardar."
        );

        setErrorDetalle(
          [
            updateError.message,
            updateError.details,
            updateError.hint,
            updateError.code
              ? `Código: ${updateError.code}`
              : "",
          ]
            .filter(Boolean)
            .join(" | ")
        );

        return;
      }

      // -----------------------------------------------
      // ACTUALIZAR PANTALLA
      // -----------------------------------------------

      setParticipaciones((actuales) =>
        actuales.map((item) =>
          item.id === participacion.id
            ? {
                ...item,
                imagen,
              }
            : item
        )
      );

      setMensaje(
        "Foto del disfraz actualizada."
      );
    } finally {
      setSubiendoFoto(null);
    }
  }

  // =====================================================
  // INTERFAZ
  // =====================================================

  return (
    <div className="space-y-6">

      {/* =================================================
          BOTÓN AGREGAR
      ================================================= */}

      <div>
        <button
          type="button"
          onClick={() =>
            setMostrarAgregar(!mostrarAgregar)
          }
          className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-purple-500"
        >
          {mostrarAgregar
            ? "✕ Cerrar participantes"
            : "＋ Agregar participantes"}
        </button>
      </div>

      {/* =================================================
          MENÚ DE PERSONAS
      ================================================= */}

      {mostrarAgregar && (
        <div className="rounded-3xl border border-purple-500/30 bg-black/50 p-5 backdrop-blur-md">

          <h3 className="mb-2 text-xl font-black">
            ¿Quiénes participaron?
          </h3>

          <p className="mb-5 text-sm text-gray-300">
            Marca a las personas que participaron
            en esta edición de La Mascarada.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

            {personas.map((persona) => {
              const agregado =
                participantesIds.has(
                  persona.id
                );

              return (
                <label
                  key={persona.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                    agregado
                      ? "border-purple-500 bg-purple-500/20"
                      : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={agregado}
                    onChange={() => {
                      if (!agregado) {
                        agregarParticipante(
                          persona
                        );
                      }
                    }}
                    className="h-5 w-5 accent-purple-600"
                  />

                  <span className="font-semibold">
                    {persona.nombre}
                  </span>
                </label>
              );
            })}

          </div>
        </div>
      )}

      {/* =================================================
          MENSAJES
      ================================================= */}

      {mensaje && (
        <div className="rounded-xl border border-purple-500/20 bg-black/60 px-4 py-3 backdrop-blur-md">

          <p className="text-sm text-gray-200">
            {mensaje}
          </p>

          {errorDetalle && (
            <p className="mt-2 break-words text-xs text-red-400">
              {errorDetalle}
            </p>
          )}

        </div>
      )}

      {/* =================================================
          SIN PARTICIPANTES
      ================================================= */}

      {participantes.length === 0 ? (

        <div className="rounded-3xl border border-dashed border-white/20 bg-black/40 p-10 text-center backdrop-blur-md">

          <div className="mb-3 text-4xl">
            🎭
          </div>

          <p className="text-gray-300">
            Todavía no hay participantes
            registrados.
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Usa "Agregar participantes"
            para comenzar.
          </p>

        </div>

      ) : (

        /* =================================================
           PARTICIPANTES COMPACTOS
        ================================================= */

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">

          {participantes.map((persona) => {

            const participacion =
              participaciones.find(
                (item) =>
                  item.persona_id ===
                  persona.id
              );

            if (!participacion) {
              return null;
            }

            return (
              <div
                key={participacion.id}
                className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-black/55 p-3 backdrop-blur-md transition hover:border-purple-500/30 hover:bg-black/65"
              >

                {/* =====================================
                    MINIATURA
                ===================================== */}

                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-black/70">

                  {participacion.imagen ? (

                    <img
                      src={
                        participacion.imagen
                      }
                      alt={
                        participacion.personaje
                          ? `${persona.nombre} - ${participacion.personaje}`
                          : `Disfraz de ${persona.nombre}`
                      }
                      className="h-full w-full object-cover"
                    />

                  ) : (

                    <div className="flex h-full w-full items-center justify-center text-3xl">
                      🎭
                    </div>

                  )}

                </div>

                {/* =====================================
                    INFORMACIÓN
                ===================================== */}

                <div className="min-w-0 flex-1">

                  <h3 className="truncate text-base font-black text-white">
                    {persona.nombre}
                  </h3>

                  <p className="mt-1 truncate text-sm italic text-purple-300">
                    "
                    {participacion.personaje ||
                      "Sin disfraz registrado"}
                    "
                  </p>

                  {/* =================================
                      CONTROLES
                  ================================= */}

                  <div className="mt-2 flex flex-wrap items-center gap-2">

                    {/* CAMBIAR FOTO */}

                    <label className="cursor-pointer text-xs font-semibold text-gray-400 transition hover:text-purple-300">

                      {subiendoFoto ===
                      participacion.id
                        ? "Subiendo..."
                        : "📷 Cambiar foto"}

                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={
                          subiendoFoto ===
                          participacion.id
                        }
                        onChange={(event) => {
                          const archivo =
                            event.target
                              .files?.[0];

                          if (archivo) {
                            subirFoto(
                              participacion,
                              archivo
                            );
                          }

                          event.currentTarget.value =
                            "";
                        }}
                      />

                    </label>

                    <span className="text-gray-700">
                      •
                    </span>

                    {/* QUITAR */}

                    <button
                      type="button"
                      onClick={() =>
                        quitarParticipante(
                          participacion.id
                        )
                      }
                      className="text-xs font-semibold text-red-400 transition hover:text-red-300"
                    >
                      Quitar
                    </button>

                  </div>

                </div>

                {/* =====================================
                    EDICIÓN DEL DISFRAZ
                ===================================== */}

                <div className="shrink-0">

                  <details className="relative">

                    <summary className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sm text-gray-400 transition hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-purple-300">
                      ✎
                    </summary>

                    <div className="absolute right-0 top-10 z-30 w-64 rounded-2xl border border-white/10 bg-[#111]/95 p-4 shadow-2xl backdrop-blur-xl">

                      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                        Editar disfraz
                      </p>

                      <input
                        defaultValue={
                          participacion.personaje ??
                          ""
                        }
                        placeholder="¿De qué se disfrazó?"
                        className="w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600 focus:border-purple-500"
                        onBlur={(event) => {
                          guardarDisfraz(
                            participacion.id,
                            event.target.value
                          );
                        }}
                      />

                      {guardando ===
                        participacion.id && (
                        <p className="mt-2 text-xs text-purple-300">
                          Guardando...
                        </p>
                      )}

                      <label className="mt-3 block cursor-pointer rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-center text-xs font-bold text-purple-200 transition hover:bg-purple-500/20">

                        {subiendoFoto ===
                        participacion.id
                          ? "Subiendo foto..."
                          : "📷 Cambiar foto"}

                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={
                            subiendoFoto ===
                            participacion.id
                          }
                          onChange={(event) => {
                            const archivo =
                              event.target
                                .files?.[0];

                            if (archivo) {
                              subirFoto(
                                participacion,
                                archivo
                              );
                            }

                            event.currentTarget.value =
                              "";
                          }}
                        />

                      </label>

                    </div>

                  </details>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}