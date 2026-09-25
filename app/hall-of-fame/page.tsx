"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Evento = {
  id: number;
  nombre: string;
  logo: string | null;
  slug: string;
};

type Edicion = {
  id: number;
  evento_id: number;
  año: string;
  fecha: string;
};

type Persona = {
  id: number;
  nombre: string;
  imagen: string | null;
};

type Premio = {
  id: number;
  persona_id: number;
  edicion_id: number;
  nombre: string;
  descripcion: string | null;
  imagen: string | null;
};

type Participacion = {
  id: number;
  persona_id: number;
  edicion_id: number;
  posicion: number | null;
  puntos_finales: number | null;
};

type Campeon = {
  edicionId: number;
  año: string;
  fecha: string;
  evento: string;
  slug: string;
  logo: string | null;
  winner: string;
  image: string | null;
  title: string;
};

function nombreCorto(nombre: string) {
  const partes = nombre.trim().split(/\s+/);

  if (partes.length === 1) {
    return partes[0];
  }

  return `${partes[0]} ${partes[partes.length - 2]}`;
}

function tituloCampeon(nombrePremio?: string) {
  if (!nombrePremio) {
    return "Campeón";
  }

  if (nombrePremio.toLowerCase().startsWith("campeona")) {
    return "Campeona";
  }

  return "Campeón";
}

export default function HallOfFamePage() {
  const [campeones, setCampeones] = useState<Campeon[]>([]);
  const [añosDisponibles, setAñosDisponibles] = useState<string[]>([]);
  const [añoSeleccionado, setAñoSeleccionado] = useState("todos");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarHallOfFame() {
      try {
        const { data: eventosData, error: eventosError } =
          await supabase
            .from("eventos")
            .select("id, nombre, logo, slug")
            .order("nombre");

        if (eventosError) {
          console.error(
            "Error cargando eventos:",
            eventosError
          );
          return;
        }

        const eventos: Evento[] = eventosData ?? [];

        const eventoIds = eventos.map(
          (evento) => evento.id
        );

        const { data: edicionesData, error: edicionesError } =
          eventoIds.length
            ? await supabase
                .from("ediciones")
                .select("*")
                .in("evento_id", eventoIds)
                .order("fecha", {
                  ascending: false,
                })
            : { data: [], error: null };

        if (edicionesError) {
          console.error(
            "Error cargando ediciones:",
            edicionesError
          );
          return;
        }

        const ediciones: Edicion[] =
          edicionesData ?? [];

        const edicionIds = ediciones.map(
          (edicion) => edicion.id
        );

        const { data: premiosData, error: premiosError } =
          edicionIds.length
            ? await supabase
                .from("premios")
                .select(
                  "id, persona_id, edicion_id, nombre, descripcion, imagen"
                )
                .in("edicion_id", edicionIds)
            : { data: [], error: null };

        if (premiosError) {
          console.error(
            "Error cargando premios:",
            premiosError
          );
          return;
        }

        const premios: Premio[] =
          premiosData ?? [];

        const {
          data: participacionesData,
          error: participacionesError,
        } = edicionIds.length
          ? await supabase
              .from("participaciones")
              .select(
                "id, persona_id, edicion_id, posicion, puntos_finales"
              )
              .in("edicion_id", edicionIds)
              .eq("posicion", 1)
          : { data: [], error: null };

        if (participacionesError) {
          console.error(
            "Error cargando participaciones:",
            participacionesError
          );
          return;
        }

        const participaciones: Participacion[] =
          participacionesData ?? [];

        const personaIds = [
          ...new Set([
            ...premios.map(
              (premio) =>
                premio.persona_id
            ),
            ...participaciones.map(
              (participacion) =>
                participacion.persona_id
            ),
          ]),
        ];

        const {
          data: personasData,
          error: personasError,
        } = personaIds.length
          ? await supabase
              .from("personas")
              .select(
                "id, nombre, imagen"
              )
              .in("id", personaIds)
          : { data: [], error: null };

        if (personasError) {
          console.error(
            "Error cargando personas:",
            personasError
          );
          return;
        }

        const personas: Persona[] =
          personasData ?? [];

        const eventoPorId = new Map(
          eventos.map((evento) => [
            evento.id,
            evento,
          ])
        );

        const personaPorId = new Map(
          personas.map((persona) => [
            persona.id,
            persona,
          ])
        );

        const premioPorEdicion = new Map(
          premios.map((premio) => [
            premio.edicion_id,
            premio,
          ])
        );

        const participacionPorEdicion =
          new Map(
            participaciones.map(
              (participacion) => [
                participacion.edicion_id,
                participacion,
              ]
            )
          );

        const campeonesCargados: Campeon[] =
          ediciones
            .map((edicion) => {
              const evento =
                eventoPorId.get(
                  edicion.evento_id
                );

              if (!evento) {
                return null;
              }

              const premio =
                premioPorEdicion.get(
                  edicion.id
                );

              const participacion =
                participacionPorEdicion.get(
                  edicion.id
                );

              const personaId =
                premio?.persona_id ??
                participacion?.persona_id;

              if (!personaId) {
                return null;
              }

              const persona =
                personaPorId.get(
                  personaId
                );

              if (!persona) {
                return null;
              }

              return {
                edicionId:
                  edicion.id,
                año: edicion.año,
                fecha: edicion.fecha,
                evento:
                  evento.nombre,
                slug: evento.slug,
                logo: evento.logo,
                winner:
                  nombreCorto(
                    persona.nombre
                  ),
                image:
                  premio?.imagen ??
                  persona.imagen,
                title:
                  tituloCampeon(
                    premio?.nombre
                  ),
              };
            })
            .filter(
              (
                campeon
              ): campeon is Campeon =>
                campeon !== null
            )
            .sort((a, b) =>
              b.fecha.localeCompare(
                a.fecha
              )
            );

        const años = [
          ...new Set(
            campeonesCargados.map(
              (campeon) =>
                campeon.año
            )
          ),
        ].sort(
          (a, b) =>
            Number(b) - Number(a)
        );

        setCampeones(
          campeonesCargados
        );
        setAñosDisponibles(años);
      } catch (error) {
        console.error(
          "Error cargando Hall of Fame:",
          error
        );
      } finally {
        setCargando(false);
      }
    }

    cargarHallOfFame();
  }, []);

  const campeonesFiltrados =
    añoSeleccionado === "todos"
      ? campeones
      : campeones.filter(
          (campeon) =>
            campeon.año ===
            añoSeleccionado
        );

  return (
    <main
      className="relative min-h-screen bg-cover bg-center bg-fixed text-white"
      style={{
        backgroundImage:
          "url('/eventos/hall.png')",
      }}
    >
      <div className="fixed inset-0 z-0 bg-black/35" />

      <div className="relative z-10">
        {/* HEADER */}
        <section className="border-b border-white/10">
          <div className="mx-auto max-w-7xl px-6 py-24 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-violet-400">
              Los que hicieron historia
            </p>

            <h1 className="mt-4 font-serif text-6xl font-black italic tracking-[0.08em] text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] md:text-8xl">
              HALL OF FAME
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
              Los campeones y campeonas que han dejado su
              nombre en la historia de nuestros eventos
            </p>

            {/* FILTRO POR AÑO */}
            <div className="mt-10">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">
                Filtrar por año
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setAñoSeleccionado(
                      "todos"
                    )
                  }
                  className={`rounded-full border px-8 py-3 text-sm font-bold uppercase tracking-[0.12em] transition duration-300 ${
                    añoSeleccionado ===
                    "todos"
                      ? "border-[#d4af37] bg-[#d4af37] text-black shadow-[0_0_25px_rgba(212,175,55,0.2)]"
                      : "border-white/15 bg-black/40 text-zinc-400 hover:border-[#d4af37]/60 hover:text-white"
                  }`}
                >
                  Todos
                </button>

                {añosDisponibles.map(
                  (año) => (
                    <button
                      key={año}
                      type="button"
                      onClick={() =>
                        setAñoSeleccionado(
                          año
                        )
                      }
                      className={`rounded-full border px-8 py-3 text-sm font-bold uppercase tracking-[0.12em] transition duration-300 ${
                        añoSeleccionado ===
                        año
                          ? "border-[#d4af37] bg-[#d4af37] text-black shadow-[0_0_25px_rgba(212,175,55,0.2)]"
                          : "border-white/15 bg-black/40 text-zinc-400 hover:border-[#d4af37]/60 hover:text-white"
                      }`}
                    >
                      {año}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CAMPEONES */}
        <section className="mx-auto max-w-7xl px-6 py-24">
          {cargando ? (
            <div className="rounded-3xl border border-white/10 bg-zinc-900/90 p-12 text-center">
              <p className="text-zinc-400">
                Cargando Hall of Fame...
              </p>
            </div>
          ) : campeonesFiltrados.length ===
            0 ? (
            <div className="rounded-3xl border border-white/10 bg-zinc-900/90 p-12 text-center">
              <p className="text-zinc-400">
                No hay campeones registrados para este año.
              </p>
            </div>
          ) : (
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              {campeonesFiltrados.map(
                (campeon) => (
                  <a
                    key={
                      campeon.edicionId
                    }
                    href={`/eventos/${campeon.slug}/${campeon.año}`}
                    className="group relative block"
                  >
                    {/* MARCO EXTERIOR */}
                    <div className="relative rounded-[2rem] bg-gradient-to-br from-[#fff1a8] via-[#c99b30] to-[#6e4912] p-[2px] shadow-2xl shadow-black/60 transition duration-500 group-hover:-translate-y-3 group-hover:shadow-[0_25px_70px_rgba(212,175,55,0.25)]">
                      {/* MARCO INTERIOR */}
                      <div className="relative rounded-[1.9rem] bg-gradient-to-br from-[#3b2b0b] via-[#15120d] to-[#050505] p-[5px]">
                        {/* BORDE INTERNO */}
                        <div className="relative overflow-hidden rounded-[1.65rem] border border-[#d4af37]/50 bg-[#080808]">
                          {/* BRILLO SUPERIOR */}
                          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-32 bg-gradient-to-b from-[#d4af37]/10 to-transparent" />

                          {/* ESQUINA SUPERIOR IZQUIERDA */}
                          <div className="absolute left-3 top-3 z-30 h-10 w-10 border-l-2 border-t-2 border-[#e6c766]/80" />

                          {/* ESQUINA SUPERIOR DERECHA */}
                          <div className="absolute right-3 top-3 z-30 h-10 w-10 border-r-2 border-t-2 border-[#e6c766]/80" />

                          {/* ESQUINA INFERIOR IZQUIERDA */}
                          <div className="absolute bottom-3 left-3 z-30 h-10 w-10 border-b-2 border-l-2 border-[#e6c766]/80" />

                          {/* ESQUINA INFERIOR DERECHA */}
                          <div className="absolute bottom-3 right-3 z-30 h-10 w-10 border-b-2 border-r-2 border-[#e6c766]/80" />

                          {/* FOTO */}
                          <div className="relative h-[430px] overflow-hidden bg-gradient-to-b from-[#17130b] to-black">
                            {campeon.image ? (
                              <img
                                src={
                                  campeon.image
                                }
                                alt={
                                  campeon.winner
                                }
                                className="h-full w-full object-contain object-center transition duration-700 group-hover:scale-[1.03]"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                {campeon.logo ? (
                                  <img
                                    src={
                                      campeon.logo
                                    }
                                    alt={
                                      campeon.evento
                                    }
                                    className="max-h-48 max-w-[70%] object-contain opacity-50"
                                  />
                                ) : (
                                  <span className="text-7xl text-[#d4af37]">
                                    ♛
                                  </span>
                                )}
                              </div>
                            )}

                            {/* DEGRADADO */}
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />

                            {/* PLACA CAMPEÓN */}
                            <div className="absolute right-5 top-5 rounded-full border border-[#e6c766]/60 bg-black/75 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-[#e6c766] shadow-xl backdrop-blur-md">
                              {
                                campeon.title
                              }
                            </div>

                            {/* AÑO + NOMBRE */}
                            <div className="absolute bottom-7 left-0 right-0 px-6 text-center">
                              <p className="text-sm font-semibold uppercase tracking-[0.45em] text-[#d9b957]">
                                {
                                  campeon.año
                                }
                              </p>

                              <h2 className="mt-3 text-4xl font-black tracking-tight text-white drop-shadow-lg">
                                {
                                  campeon.winner
                                }
                              </h2>
                            </div>
                          </div>

                          {/* INFORMACIÓN */}
                          <div className="relative bg-gradient-to-b from-[#11100d] to-[#050505] px-7 pb-7 pt-6">
                            {/* SEPARADOR ORNAMENTAL */}
                            <div className="mb-5 flex items-center justify-center gap-3">
                              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#a9822d]/70 to-[#a9822d]/30" />

                              <span className="text-sm text-[#d4af37]">
                                ✦
                              </span>

                              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#a9822d]/70 to-[#a9822d]/30" />
                            </div>

                            {/* LOGO */}
                            <div className="flex h-20 items-center justify-center">
                              {campeon.logo && (
                                <img
                                  src={
                                    campeon.logo
                                  }
                                  alt={`Logo ${campeon.evento}`}
                                  className="max-h-16 max-w-[190px] object-contain opacity-90 transition duration-300 group-hover:scale-105 group-hover:opacity-100"
                                />
                              )}
                            </div>

                            {/* EVENTO */}
                            <div className="mt-5 text-center">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#8d8a82]">
                                Evento
                              </p>

                              <p className="mt-2 text-lg font-semibold tracking-wide text-zinc-200">
                                {
                                  campeon.evento
                                }
                              </p>
                            </div>

                            {/* PIE */}
                            <div className="mt-6 flex items-center justify-between border-t border-[#d4af37]/15 pt-4">
                              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                                {
                                  campeon.title
                                }{" "}
                                ·{" "}
                                {
                                  campeon.año
                                }
                              </p>

                              <span className="text-xs font-semibold text-[#d4af37] opacity-0 transition duration-300 group-hover:opacity-100">
                                VER EVENTO →
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                )
              )}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/10 bg-black/50 px-6 py-10">
          <div className="mx-auto flex max-w-7xl justify-between text-sm text-zinc-500">
            <p>THE GAME ARCHIVE</p>

            <p>
              Juegos · Eventos · Campeones
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}