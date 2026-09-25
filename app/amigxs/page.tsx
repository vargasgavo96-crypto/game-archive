"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Persona = {
  id: number;
  nombre: string;
  apodo: string | null;
  cumpleaños: string | null;
  signo: string | null;
  biografia: string | null;
  etiquetas: string[] | null;
  imagen: string | null;
};

type Premio = {
  persona_id: number;
  edicion_id: number;
};

type Edicion = {
  id: number;
  año: string;
  evento_id: number;
};

type Evento = {
  id: number;
  nombre: string;
  slug: string;
};

type Participacion = {
  persona_id: number;
  edicion_id: number;
  posicion: number | null;
};

type Juego = {
  id: number;
  edicion_id: number;
  nombre: string;
};

type HistorialParticipacion = {
  año: string;
  evento: string;
  slug: string;
  posicion: number | null;
};

type HallOfFame = {
  año: string;
  evento: string;
};

const fotosAmigxs: Record<number, string> = {
  4: "/amigxs/angelo.png",
  1: "/amigxs/ayelen.png",
  24: "/amigxs/fefi.png",
  17: "/amigxs/camilo.png",
  11: "/amigxs/coni.png",
  7: "/amigxs/cristian.png",
  3: "/amigxs/cristobal.png",
  26: "/amigxs/diego.png",
  6: "/amigxs/gonza.png",
  13: "/amigxs/harper.png",
  2: "/amigxs/javier.png",
  25: "/amigxs/jeimy.png",
  9: "/amigxs/juancarlos.png",
  5: "/amigxs/koke.png",
  15: "/amigxs/leslie.png",
  19: "/amigxs/nacho.png",
  10: "/amigxs/nico.png",
  12: "/amigxs/pipe.png",
  16: "/amigxs/ricardo.png",
  21: "/amigxs/sebamartinez.png",
  14: "/amigxs/sebasilva.png",
  22: "/amigxs/vicente.png",
};

function normalizarTexto(texto: string) {
  return texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function nombreWeb(nombre: string) {
  const nombreNormalizado = nombre.trim().toLowerCase();

  if (
    nombreNormalizado ===
    "sebastián alejandro silva aguilera".toLowerCase()
  ) {
    return "Seba Silva";
  }

  if (
    nombreNormalizado ===
    "sebastián benjamín martínez wolf".toLowerCase()
  ) {
    return "Seba Martínez";
  }

  if (
    nombreNormalizado ===
    "camila fernanda elgueta jamett".toLowerCase()
  ) {
    return "Fefi";
  }

  return nombre;
}

function posicionTexto(posicion: number | null) {
  if (posicion === null) {
    return "Participante";
  }

  if (posicion === 1) {
    return "🥇 1° lugar";
  }

  if (posicion === 2) {
    return "🥈 2° lugar";
  }

  if (posicion === 3) {
    return "🥉 3° lugar";
  }

  return `${posicion}° lugar`;
}

function posicionColor(posicion: number | null) {
  if (posicion === 1) {
    return "border-amber-400/30 bg-amber-950/30 text-amber-300";
  }

  if (posicion === 2) {
    return "border-zinc-400/20 bg-zinc-800/40 text-zinc-300";
  }

  if (posicion === 3) {
    return "border-orange-700/30 bg-orange-950/30 text-orange-300";
  }

  if (posicion === null) {
    return "border-violet-500/20 bg-violet-950/20 text-violet-300";
  }

  return "border-white/10 bg-white/[0.03] text-zinc-400";
}

function juegoPerteneceAPersona(
  nombreJuego: string,
  persona: Persona
) {
  const juego = normalizarTexto(nombreJuego);
  const nombreCompleto = normalizarTexto(persona.nombre);
  const partesNombre = nombreCompleto.split(/\s+/);
  const primerNombre = partesNombre[0] ?? "";
  const apodo = persona.apodo
    ? normalizarTexto(persona.apodo)
    : "";
  const nombreVisible = normalizarTexto(
    nombreWeb(persona.nombre)
  );

  const candidatos = [
    nombreCompleto,
    primerNombre,
    apodo,
    nombreVisible,
  ].filter(Boolean);

  return candidatos.some((candidato) => {
    return (
      juego === candidato ||
      juego.startsWith(`${candidato} -`) ||
      juego.startsWith(`${candidato}:`) ||
      juego.startsWith(`${candidato} —`) ||
      juego.startsWith(`${candidato} –`)
    );
  });
}

export default function AmigxsPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [hallOfFame, setHallOfFame] = useState<
    Record<number, HallOfFame[]>
  >({});
  const [historial, setHistorial] = useState<
    Record<number, HistorialParticipacion[]>
  >({});
  const [personaSeleccionada, setPersonaSeleccionada] =
    useState<Persona | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function cargarDatos() {
      const [
        { data: personasData, error: personasError },
        { data: premiosData, error: premiosError },
        { data: participacionesData, error: participacionesError },
        { data: edicionesData, error: edicionesError },
        { data: eventosData, error: eventosError },
        { data: juegosData, error: juegosError },
      ] = await Promise.all([
        supabase.from("personas").select("*"),
        supabase.from("premios").select("persona_id, edicion_id"),
        supabase
          .from("participaciones")
          .select("persona_id, edicion_id, posicion"),
        supabase.from("ediciones").select("*"),
        supabase.from("eventos").select("id, nombre, slug"),
        supabase
          .from("juegos")
          .select("id, edicion_id, nombre")
          .order("orden", { ascending: true }),
      ]);

      if (
        personasError ||
        premiosError ||
        participacionesError ||
        edicionesError ||
        eventosError ||
        juegosError
      ) {
        console.error({
          personasError,
          premiosError,
          participacionesError,
          edicionesError,
          eventosError,
          juegosError,
        });

        setError(true);
        setCargando(false);
        return;
      }

      const personas: Persona[] = personasData ?? [];
      const premios: Premio[] = premiosData ?? [];
      const participaciones: Participacion[] =
        participacionesData ?? [];
      const ediciones =
        (edicionesData ?? []) as unknown as Edicion[];
      const eventos: Evento[] = eventosData ?? [];
      const juegos: Juego[] = juegosData ?? [];

      const edicionPorId = new Map(
        ediciones.map((edicion) => [
          edicion.id,
          edicion,
        ])
      );

      const eventoPorId = new Map(
        eventos.map((evento) => [
          evento.id,
          evento,
        ])
      );

      const hallOfFameTemporal: Record<
        number,
        HallOfFame[]
      > = {};

      premios.forEach((premio) => {
        const edicion = edicionPorId.get(
          premio.edicion_id
        );

        if (!edicion) {
          return;
        }

        const evento = eventoPorId.get(
          edicion.evento_id
        );

        if (!evento) {
          return;
        }

        if (!hallOfFameTemporal[premio.persona_id]) {
          hallOfFameTemporal[premio.persona_id] = [];
        }

        const yaExiste = hallOfFameTemporal[
          premio.persona_id
        ].some(
          (item) =>
            item.año === edicion.año &&
            item.evento === evento.nombre
        );

        if (!yaExiste) {
          hallOfFameTemporal[premio.persona_id].push({
            año: edicion.año,
            evento: evento.nombre,
          });
        }
      });

      Object.keys(hallOfFameTemporal).forEach(
        (personaId) => {
          hallOfFameTemporal[Number(personaId)].sort(
            (a, b) =>
              Number(b.año) - Number(a.año)
          );
        }
      );

      const historialTemporal: Record<
        number,
        HistorialParticipacion[]
      > = {};

      participaciones.forEach((participacion) => {
        const edicion = edicionPorId.get(
          participacion.edicion_id
        );

        if (!edicion) {
          return;
        }

        const evento = eventoPorId.get(
          edicion.evento_id
        );

        if (!evento) {
          return;
        }

        if (!historialTemporal[participacion.persona_id]) {
          historialTemporal[participacion.persona_id] =
            [];
        }

        const yaExiste = historialTemporal[
          participacion.persona_id
        ].some(
          (item) =>
            item.año === edicion.año &&
            item.evento === evento.nombre
        );

        if (!yaExiste) {
          historialTemporal[
            participacion.persona_id
          ].push({
            año: edicion.año,
            evento: evento.nombre,
            slug: evento.slug,
            posicion: participacion.posicion,
          });
        }
      });

      const edicionesConParticipaciones = new Set(
        participaciones.map(
          (participacion) => participacion.edicion_id
        )
      );

      const juegosPorEdicion = new Map<
        number,
        Juego[]
      >();

      juegos.forEach((juego) => {
        if (!juegosPorEdicion.has(juego.edicion_id)) {
          juegosPorEdicion.set(juego.edicion_id, []);
        }

        juegosPorEdicion
          .get(juego.edicion_id)!
          .push(juego);
      });

      juegosPorEdicion.forEach(
        (juegosEdicion, edicionId) => {
          if (
            edicionesConParticipaciones.has(
              edicionId
            )
          ) {
            return;
          }

          const edicion = edicionPorId.get(edicionId);

          if (!edicion) {
            return;
          }

          const evento = eventoPorId.get(
            edicion.evento_id
          );

          if (!evento) {
            return;
          }

          juegosEdicion.forEach((juego) => {
            const persona = personas.find((persona) =>
              juegoPerteneceAPersona(
                juego.nombre,
                persona
              )
            );

            if (!persona) {
              return;
            }

            if (!historialTemporal[persona.id]) {
              historialTemporal[persona.id] = [];
            }

            const yaExiste = historialTemporal[
              persona.id
            ].some(
              (item) =>
                item.año === edicion.año &&
                item.evento === evento.nombre
            );

            if (!yaExiste) {
              historialTemporal[
                persona.id
              ].push({
                año: edicion.año,
                evento: evento.nombre,
                slug: evento.slug,
                posicion: null,
              });
            }
          });
        }
      );

      Object.keys(historialTemporal).forEach(
        (personaId) => {
          historialTemporal[Number(personaId)].sort(
            (a, b) =>
              Number(b.año) - Number(a.año)
          );
        }
      );

      const personasOrdenadas = [...personas].sort(
        (a, b) =>
          a.nombre.localeCompare(b.nombre, "es", {
            sensitivity: "base",
          })
      );

      setPersonas(personasOrdenadas);
      setHallOfFame(hallOfFameTemporal);
      setHistorial(historialTemporal);
      setCargando(false);
    }

    cargarDatos();
  }, []);

  useEffect(() => {
    function manejarTecla(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPersonaSeleccionada(null);
      }
    }

    if (personaSeleccionada) {
      document.addEventListener(
        "keydown",
        manejarTecla
      );

      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener(
        "keydown",
        manejarTecla
      );

      document.body.style.overflow = "";
    };
  }, [personaSeleccionada]);

  const totalPersonas = personas.length;

  const hallOfFameSeleccionado = personaSeleccionada
    ? hallOfFame[personaSeleccionada.id] ?? []
    : [];

  const historialSeleccionado = personaSeleccionada
    ? historial[personaSeleccionada.id] ?? []
    : [];

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-violet-500" />

          <p className="mt-5 text-sm uppercase tracking-[0.3em] text-zinc-500">
            Cargando archivo
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-400">
            No se pudo cargar Amigxs
          </h1>

          <p className="mt-3 text-zinc-400">
            No fue posible cargar las personas desde
            Supabase.
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main
        className="relative min-h-screen bg-cover bg-center bg-fixed text-white"
        style={{
          backgroundImage:
            "url('/eventos/todos.jfif')",
        }}
      >
        <div className="fixed inset-0 z-0 bg-black/70" />

        <div className="relative z-10">
          {/* HERO */}
          <section className="relative overflow-hidden border-b border-white/10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.35),_transparent_55%)]" />

            <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-violet-600/10 blur-3xl" />

            <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl" />

            <div className="relative mx-auto max-w-7xl px-6 py-28 text-center md:py-36">
              <p className="text-sm font-semibold uppercase tracking-[0.5em] text-violet-400">
                El archivo
              </p>

              <h1 className="mt-5 text-6xl font-black tracking-tight md:text-8xl">
                AMIGXS
              </h1>

              <div className="mx-auto mt-8 h-px w-24 bg-violet-500/50" />

              <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-zinc-300 md:text-xl">
                Las personas detrás de los juegos, eventos,
                competencias y recuerdos que forman parte de
                nuestra historia.
              </p>

              <div className="mt-10 inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/30 px-5 py-3 backdrop-blur">
                <span className="text-xl font-black text-white">
                  {totalPersonas}
                </span>

                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  personas en el archivo
                </span>
              </div>
            </div>
          </section>

          {/* INTRO */}
          <section className="mx-auto max-w-4xl px-6 py-24 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
              Las personas detrás de la historia
            </p>

            <h2 className="mt-4 text-4xl font-black md:text-5xl">
              QUIÉNES SOMOS
            </h2>

            <p className="mt-7 text-lg leading-8 text-zinc-400">
              Más que participantes, somos parte de las
              historias que han ido construyendo este archivo.
              Aquí quedan registrados nuestros recuerdos,
              momentos y pequeñas historias.
            </p>
          </section>

          {/* PERSONAS */}
          <section className="border-y border-white/10 bg-black/30">
            <div className="mx-auto max-w-7xl px-6 py-24">
              <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.35em] text-zinc-600">
                    Archivo de participantes
                  </p>

                  <h2 className="mt-2 text-3xl font-black md:text-4xl">
                    NUESTRA GENTE
                  </h2>
                </div>

                <p className="text-sm text-zinc-500">
                  {totalPersonas}{" "}
                  {totalPersonas === 1
                    ? "persona registrada"
                    : "personas registradas"}
                </p>
              </div>

              {personas.length > 0 ? (
                <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {personas.map((amigx) => {
                    const imagenAmigx =
                      fotosAmigxs[amigx.id];

                    const premiosPersona =
                      hallOfFame[amigx.id] ?? [];

                    return (
                      <button
                        key={amigx.id}
                        type="button"
                        onClick={() =>
                          setPersonaSeleccionada(amigx)
                        }
                        className="group flex h-[720px] w-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 text-left transition duration-500 hover:-translate-y-2 hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-950/20 focus:outline-none focus:ring-2 focus:ring-violet-500/60"
                      >
                        <div className="relative h-80 shrink-0 overflow-hidden bg-zinc-900">
                          {imagenAmigx ? (
                            <img
                              src={imagenAmigx}
                              alt={amigx.nombre}
                              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-zinc-950">
                              <div className="text-center">
                                <div className="text-7xl opacity-10">
                                  👤
                                </div>

                                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-700">
                                  Sin fotografía
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                          <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/50 text-xs font-black text-white opacity-0 backdrop-blur transition duration-300 group-hover:opacity-100">
                            ✦
                          </div>
                        </div>

                        <div className="flex min-h-0 flex-1 flex-col p-6">
                          <h3 className="text-2xl font-black leading-tight text-white">
                            {amigx.nombre}
                          </h3>

                          {amigx.apodo && (
                            <p className="mt-1 text-sm font-semibold text-violet-400">
                              &quot;{amigx.apodo}&quot;
                            </p>
                          )}

                          {amigx.biografia ? (
                            <p className="mt-5 line-clamp-5 text-sm leading-6 text-zinc-400">
                              {amigx.biografia}
                            </p>
                          ) : (
                            <p className="mt-5 text-sm italic text-zinc-700">
                              Historia próximamente...
                            </p>
                          )}

                          {(amigx.cumpleaños ||
                            amigx.signo) && (
                            <div className="mt-auto flex flex-wrap gap-2 border-t border-white/10 pt-5">
                              {amigx.cumpleaños && (
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300">
                                  🎂 {amigx.cumpleaños}
                                </span>
                              )}

                              {amigx.signo && (
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300">
                                  ♈ {amigx.signo}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="mt-5 flex flex-wrap gap-2">
                            {Array.from(
                              new Map(
                                premiosPersona.map((premio) => [
                                  premio.año,
                                  premio,
                                ])
                              ).values()
                            ).map((premio) => (
                              <span
                                key={`hall-of-famer-${premio.año}`}
                                className="rounded-full border border-amber-400/40 bg-gradient-to-r from-amber-950/80 via-yellow-900/50 to-amber-950/80 px-3 py-1.5 text-xs font-black tracking-wide text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.08)]"
                              >
                                🏆 Hall of Famer {premio.año}
                              </span>
                            ))}

                            {amigx.etiquetas?.map(
                              (etiqueta) => (
                                <span
                                  key={etiqueta}
                                  className="rounded-full border border-violet-500/20 bg-violet-950/30 px-3 py-1.5 text-xs font-bold tracking-wide text-violet-300 transition group-hover:border-violet-500/40 group-hover:bg-violet-950/50"
                                >
                                  {etiqueta}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-3xl border border-white/10 bg-zinc-900/90 p-12 text-center">
                  <div className="text-5xl opacity-20">
                    👥
                  </div>

                  <p className="mt-5 text-zinc-400">
                    Todavía no hay personas registradas.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* FRASE FINAL */}
          <section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.12),_transparent_60%)]" />

            <div className="relative mx-auto max-w-4xl px-6 py-28 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-violet-400">
                El archivo continúa
              </p>

              <h2 className="mt-5 text-4xl font-black md:text-6xl">
                MUCHAS HISTORIAS
                <br />
                POR CONTAR
              </h2>

              <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-zinc-400">
                Nuevos eventos, fotografías, competencias y
                recuerdos seguirán formando parte de este
                archivo.
              </p>

              <div className="mx-auto mt-10 flex items-center justify-center gap-3">
                <span className="h-px w-12 bg-white/10" />
                <span className="text-violet-400">✦</span>
                <span className="h-px w-12 bg-white/10" />
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="border-t border-white/10 bg-black/50 px-6 py-10">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between">
              <p className="font-semibold tracking-widest">
                THE GAME ARCHIVE
              </p>

              <p>AMIGXS · ARCHIVO</p>
            </div>
          </footer>
        </div>
      </main>

      {/* POPUP / FICHA PERSONAL */}
      {personaSeleccionada && (
        <div
          className="fixed inset-y-0 left-0 right-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm lg:left-72 lg:p-8"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setPersonaSeleccionada(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Información de ${personaSeleccionada.nombre}`}
            className="relative flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl shadow-black/60 lg:flex-row"
          >
            {/* CERRAR */}
            <button
              type="button"
              onClick={() =>
                setPersonaSeleccionada(null)
              }
              aria-label="Cerrar"
              className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/60 text-lg text-zinc-300 backdrop-blur transition hover:border-white/20 hover:bg-black hover:text-white"
            >
              ×
            </button>

            {/* FOTO */}
            <div className="relative h-72 shrink-0 bg-zinc-900 sm:h-96 lg:h-auto lg:w-[45%]">
              {fotosAmigxs[personaSeleccionada.id] ? (
                <img
                  src={
                    fotosAmigxs[
                      personaSeleccionada.id
                    ]
                  }
                  alt={personaSeleccionada.nombre}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="text-center">
                    <div className="text-8xl opacity-10">
                      👤
                    </div>

                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-700">
                      Sin fotografía
                    </p>
                  </div>
                </div>
              )}

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent lg:bg-gradient-to-r" />
            </div>

            {/* INFORMACIÓN */}
            <div className="min-h-0 flex-1 overflow-y-auto p-7 sm:p-9 lg:p-12">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-violet-400">
                Ficha personal
              </p>

              <h2 className="mt-3 pr-10 text-4xl font-black leading-tight text-white md:text-5xl">
                {personaSeleccionada.nombre}
              </h2>

              {personaSeleccionada.apodo && (
                <p className="mt-2 text-lg font-semibold text-violet-400">
                  &quot;{personaSeleccionada.apodo}&quot;
                </p>
              )}

              {/* DESCRIPCIÓN */}
              <div className="mt-8">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-600">
                  Sobre esta persona
                </p>

                {personaSeleccionada.biografia ? (
                  <p className="mt-4 text-base leading-8 text-zinc-300">
                    {personaSeleccionada.biografia}
                  </p>
                ) : (
                  <p className="mt-4 text-base italic leading-8 text-zinc-600">
                    Historia próximamente...
                  </p>
                )}
              </div>

              {/* DATOS */}
              {(personaSeleccionada.cumpleaños ||
                personaSeleccionada.signo) && (
                <div className="mt-9 border-t border-white/10 pt-7">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-600">
                    Información
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {personaSeleccionada.cumpleaños && (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs uppercase tracking-widest text-zinc-600">
                          Cumpleaños
                        </p>

                        <p className="mt-2 font-semibold text-zinc-200">
                          🎂{" "}
                          {personaSeleccionada.cumpleaños}
                        </p>
                      </div>
                    )}

                    {personaSeleccionada.signo && (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs uppercase tracking-widest text-zinc-600">
                          Signo
                        </p>

                        <p className="mt-2 font-semibold text-zinc-200">
                          ♈{" "}
                          {personaSeleccionada.signo}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* HALL OF FAME */}
              {hallOfFameSeleccionado.length > 0 && (
                <div className="mt-9 border-t border-white/10 pt-7">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-600">
                    Hall of Fame
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {Array.from(
                      new Map(
                        hallOfFameSeleccionado.map((premio) => [
                          premio.año,
                          premio,
                        ])
                      ).values()
                    ).map((premio) => (
                      <span
                        key={`hall-of-famer-${premio.año}`}
                        className="rounded-full border border-amber-400/40 bg-gradient-to-r from-amber-950/80 via-yellow-900/40 to-amber-950/80 px-4 py-2 text-sm font-black tracking-wide text-amber-300 shadow-[0_0_25px_rgba(251,191,36,0.08)]"
                      >
                        🏆 Hall of Famer {premio.año}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 space-y-2">
                    {hallOfFameSeleccionado.map(
                      (premio) => (
                        <div
                          key={`detalle-${premio.evento}-${premio.año}`}
                          className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
                        >
                          <span className="text-sm text-zinc-300">
                            {premio.evento}
                          </span>

                          <span className="text-sm font-bold text-amber-400">
                            {premio.año}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* HISTORIAL */}
              {historialSeleccionado.length > 0 && (
                <div className="mt-9 border-t border-white/10 pt-7">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-600">
                        Trayectoria
                      </p>

                      <h3 className="mt-2 text-2xl font-black text-white">
                        HISTORIAL DE PARTICIPACIÓN
                      </h3>
                    </div>

                    <span className="text-xs font-semibold text-zinc-600">
                      {historialSeleccionado.length}{" "}
                      {historialSeleccionado.length === 1
                        ? "evento"
                        : "eventos"}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    {historialSeleccionado.map(
                      (item, index) => (
                        <Link
                          key={`${item.evento}-${item.año}-${index}`}
                          href={`/eventos/${item.slug}/${item.año}`}
                          onClick={() =>
                            setPersonaSeleccionada(null)
                          }
                          className="group block rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition hover:border-violet-500/40 hover:bg-violet-950/10"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-base font-bold text-white transition group-hover:text-violet-300">
                                  {item.evento}
                                </p>

                                <span className="text-xs text-zinc-700 transition group-hover:text-violet-500">
                                  ↗
                                </span>
                              </div>

                              <p className="mt-1 text-sm font-semibold uppercase tracking-[0.15em] text-zinc-600">
                                Edición {item.año}
                              </p>
                            </div>

                            <span
                              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wide ${posicionColor(
                                item.posicion
                              )}`}
                            >
                              {posicionTexto(
                                item.posicion
                              )}
                            </span>
                          </div>
                        </Link>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* ETIQUETAS */}
              {personaSeleccionada.etiquetas &&
                personaSeleccionada.etiquetas.length > 0 && (
                  <div className="mt-9 border-t border-white/10 pt-7">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-600">
                      Etiquetas
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {personaSeleccionada.etiquetas.map(
                        (etiqueta) => (
                          <span
                            key={etiqueta}
                            className="rounded-full border border-violet-500/20 bg-violet-950/30 px-4 py-2 text-sm font-bold tracking-wide text-violet-300"
                          >
                            {etiqueta}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}