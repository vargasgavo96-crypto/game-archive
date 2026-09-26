import { supabase } from "@/lib/supabase";
import GaleriaFotos from "@/app/components/GaleriaFotos";
import EditarTextoEdicion from "@/app/components/EditarTextoEdicion";

type Evento = {
  id: number;
  nombre: string;
  descripcion: string;
  logo: string | null;
  slug: string;
};

type Edicion = {
  id: number;
  evento_id: number;
  año: string;
  fecha: string;
  contenido?: Record<string, string> | null;
};

type ParticipanteHistorico = {
  nombre: string;
  posicion: number;
  personaId?: number;
};

type EdicionHistorica = {
  año: number;
  participantes: ParticipanteHistorico[];
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

const edicionesHistoricas: EdicionHistorica[] = [
  {
    año: 2024,
    participantes: [
      {
        nombre: "Hans Oyarzo",
        posicion: 1,
      },
      {
        nombre: "Ángelo Gabriel Pérez Oyarzo",
        posicion: 2,
        personaId: 4,
      },
      {
        nombre: "Leslie Jazmin Novoa Mansilla",
        posicion: 3,
        personaId: 15,
      },
    ],
  },
  {
    año: 2023,
    participantes: [
      {
        nombre: "Blas Davor Gessel Yasic",
        posicion: 1,
      },
      {
        nombre: "Javier Eduardo Reyes Manzano",
        posicion: 2,
        personaId: 2,
      },
      {
        nombre: "Ángelo Gabriel Pérez Oyarzo",
        posicion: 3,
        personaId: 4,
      },
    ],
  },
  {
    año: 2022,
    participantes: [
      {
        nombre: "Ricardo Sebastian Vargas Vidal",
        posicion: 1,
        personaId: 16,
      },
      {
        nombre:
          "Juan Carlos Pérez Herreros & Andrés Eduardo Menéndez Oyarzo",
        posicion: 2,
        personaId: 9,
      },
      {
        nombre: "Constanza Graciela Osorio Retamal",
        posicion: 3,
        personaId: 11,
      },
    ],
  },
  {
    año: 2021,
    participantes: [
      {
        nombre: "Javier Eduardo Reyes Manzano",
        posicion: 1,
        personaId: 2,
      },
      {
        nombre: "Camilo Javier Avendaño Mancilla",
        posicion: 2,
        personaId: 17,
      },
      {
        nombre: "Ricardo Sebastian Vargas Vidal",
        posicion: 3,
        personaId: 16,
      },
    ],
  },
  {
    año: 2020,
    participantes: [
      {
        nombre: "The House",
        posicion: 1,
      },
    ],
  },
  {
    año: 2019,
    participantes: [
      {
        nombre: "Iván Luis Vera Vidal",
        posicion: 1,
      },
      {
        nombre: "Christopher Osvaldo Antonio Lillo",
        posicion: 2,
      },
      {
        nombre: "Iván Alejandro Harper González",
        posicion: 3,
        personaId: 13,
      },
    ],
  },
  {
    año: 2018,
    participantes: [
      {
        nombre: "Camilo Javier Avendaño Mancilla",
        posicion: 1,
        personaId: 17,
      },
      {
        nombre: "Javiera Ruiz",
        posicion: 2,
      },
      {
        nombre: "Javier Eduardo Reyes Manzano",
        posicion: 3,
        personaId: 2,
      },
    ],
  },
];

function nombreHistorico(nombre: string) {
  const normalizado = nombre.trim().toLowerCase();

  if (normalizado === "hans oyarzo") {
    return "Hans";
  }

  if (normalizado === "the house") {
    return "The House";
  }

  if (normalizado === "javiera ruiz") {
    return "Javiera Ruiz";
  }

  if (
    normalizado ===
    "juan carlos pérez herreros & andrés eduardo menéndez oyarzo"
  ) {
    return "Juan Carlos & Andrés";
  }

  const partes = nombre.trim().split(/\s+/);

  if (partes.length === 1) {
    return partes[0];
  }

  return `${partes[0]} ${partes[partes.length - 2]}`;
}

function posicionTexto(posicion: number) {
  if (posicion === 1) return "1.º LUGAR";
  if (posicion === 2) return "2.º LUGAR";
  if (posicion === 3) return "3.º LUGAR";
  return `${posicion}.º LUGAR`;
}

function posicionEmoji(posicion: number) {
  if (posicion === 1) return "🥇";
  if (posicion === 2) return "🥈";
  if (posicion === 3) return "🥉";
  return "🏆";
}

function getImagenParticipante(
  participante: ParticipanteHistorico
) {
  if (!participante.personaId) {
    return null;
  }

  return fotosAmigxs[participante.personaId] ?? null;
}

export default async function Halloween2024Page() {
  const {
    data: evento,
    error: eventoError,
  } = await supabase
    .from("eventos")
    .select("id, nombre, descripcion, logo, slug")
    .eq("slug", "halloween")
    .single();

  if (eventoError || !evento) {
    console.error(
      "Error cargando Halloween:",
      eventoError
    );

    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-400">
            No se pudo cargar Halloween
          </h1>

          <p className="mt-3 text-zinc-400">
            El evento no pudo ser encontrado en Supabase.
          </p>
        </div>
      </main>
    );
  }

  const {
    data: edicionesData,
    error: edicionesError,
  } = await supabase
    .from("ediciones")
    .select("*")
    .eq("evento_id", evento.id);

  if (edicionesError) {
    console.error(
      "Error cargando ediciones:",
      edicionesError
    );
  }

  const edicionesSupabase =
    (edicionesData as unknown as Edicion[] | null) ??
    [];

  const edicionPorAño = new Map(
    edicionesSupabase.map((edicion) => [
      Number(edicion.año),
      edicion,
    ])
  );

  return (
    <main
      className="relative min-h-screen bg-cover bg-center bg-fixed text-white"
      style={{
        backgroundImage:
          "url('/eventos/halloween.png')",
      }}
    >
      <div className="fixed inset-0 z-0 bg-black/70" />

      <div className="relative z-10">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,92,0,0.22),_transparent_50%)]" />

          <div className="relative mx-auto flex min-h-[650px] max-w-7xl flex-col items-center justify-center px-6 py-28 text-center">
            <img
              src={
                evento.logo ??
                "/logos/logohalloween.png"
              }
              alt="Halloween"
              className="max-h-72 max-w-lg object-contain drop-shadow-[0_0_35px_rgba(255,120,0,0.35)]"
            />

            <p className="mt-12 text-sm font-semibold uppercase tracking-[0.45em] text-orange-400">
              Archivo histórico
            </p>

            <h1 className="mt-4 text-6xl font-black md:text-8xl">
              HALLOWEEN
            </h1>

            <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-zinc-300">
              Un recorrido por las distintas ediciones de
              Halloween y por quienes han marcado la historia
              de nuestro torneo de disfraces.
            </p>
          </div>
        </section>

        {/* HISTORIA */}
        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400">
            Nuestra historia
          </p>

          <h2 className="mt-4 text-4xl font-black md:text-6xl">
            ARCHIVO DE HALLOWEEN
          </h2>

          <p className="mt-8 text-lg leading-8 text-zinc-300">
            Aquí quedan reunidas las ediciones históricas de
            Halloween, desde 2018 hasta 2024. Cada edición
            conserva sus resultados y su galería de fotografías.
          </p>
        </section>

        {/* EDICIONES */}
        <section className="border-y border-white/10 bg-black/40">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400">
                El archivo
              </p>

              <h2 className="mt-4 text-5xl font-black md:text-7xl">
                EDICIONES HISTÓRICAS
              </h2>

              <p className="mx-auto mt-6 max-w-2xl text-zinc-500">
                Desde los primeros años hasta la edición 2024.
              </p>
            </div>

            <div className="mt-24 space-y-32">
              {edicionesHistoricas.map(
                (edicionHistorica, indice) => {
                  const edicionSupabase =
                    edicionPorAño.get(
                      edicionHistorica.año
                    );

                  const contenido =
                    edicionSupabase?.contenido ?? {};

                  const participantes =
                    edicionHistorica.participantes;

                  const ganador =
                    participantes.find(
                      (participante) =>
                        participante.posicion === 1
                    ) ?? null;

                  const imagenGanador =
                    ganador
                      ? getImagenParticipante(ganador)
                      : null;

                  const mostrarPodio =
                    edicionHistorica.año !== 2020;

                  const esUltima =
                    indice ===
                    edicionesHistoricas.length - 1;

                  const textoEtiqueta =
                    contenido.etiqueta ??
                    "Edición histórica";

                  const textoCampeon =
                    contenido.campeon ??
                    "Campeón";

                  const textoMejorDisfraz =
                    contenido.mejor_disfraz ??
                    `Mejor Disfraz Halloween ${edicionHistorica.año}`;

                  const textoResultados =
                    contenido.resultados ??
                    "Resultados";

                  const textoPodio =
                    contenido.podio ??
                    "PODIO";

                  const textoSiguienteEdicion =
                    contenido.siguiente_edicion ??
                    "Siguiente edición";

                  return (
                    <article
                      key={edicionHistorica.año}
                      className="overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950/95 shadow-2xl"
                    >
                      {/* ENCABEZADO */}
                      <div className="relative overflow-hidden border-b border-white/10 bg-black/70 px-8 py-10 md:px-12 md:py-12">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,_rgba(255,92,0,0.14),_transparent_45%)]" />

                        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                          <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400">
                              Halloween
                            </p>

                            <h3 className="mt-2 text-6xl font-black md:text-8xl">
                              {edicionHistorica.año}
                            </h3>
                          </div>

                          {edicionSupabase ? (
                            <EditarTextoEdicion
                              valor={textoEtiqueta}
                              campo="etiqueta"
                              edicionId={edicionSupabase.id}
                              claseTexto="text-xs font-bold uppercase tracking-[0.25em] text-zinc-600 md:pb-2"
                            />
                          ) : (
                            <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-600 md:pb-2">
                              {textoEtiqueta}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* CAMPEÓN */}
                      <div className="grid md:grid-cols-2">
                        <div className="flex flex-col justify-center p-8 md:p-14">
                          {edicionSupabase ? (
                            <EditarTextoEdicion
                              valor={textoCampeon}
                              campo="campeon"
                              edicionId={edicionSupabase.id}
                              claseTexto="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400"
                            />
                          ) : (
                            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400">
                              {textoCampeon}
                            </p>
                          )}

                          {ganador ? (
                            <>
                              <h4 className="mt-5 text-5xl font-black md:text-6xl">
                                {nombreHistorico(
                                  ganador.nombre
                                )}
                              </h4>

                              {edicionSupabase ? (
                                <EditarTextoEdicion
                                  valor={textoMejorDisfraz}
                                  campo="mejor_disfraz"
                                  edicionId={edicionSupabase.id}
                                  claseTexto="mt-5 text-lg font-semibold text-zinc-300"
                                />
                              ) : (
                                <p className="mt-5 text-lg font-semibold text-zinc-300">
                                  {textoMejorDisfraz}
                                </p>
                              )}

                              <div className="mt-8">
                                <span className="text-7xl">
                                  🏆
                                </span>
                              </div>
                            </>
                          ) : (
                            <p className="mt-5 text-lg text-zinc-500">
                              Ganador no registrado.
                            </p>
                          )}
                        </div>

                        <div className="relative min-h-[420px] overflow-hidden bg-black">
                          {imagenGanador ? (
                            <img
                              src={imagenGanador}
                              alt={nombreHistorico(
                                ganador!.nombre
                              )}
                              className="h-full w-full object-contain object-right"
                            />
                          ) : (
                            <div className="flex h-full min-h-[420px] items-center justify-center">
                              <div className="text-center">
                                <p className="text-8xl">
                                  🎃
                                </p>

                                <p className="mt-5 text-xs font-bold uppercase tracking-[0.3em] text-zinc-700">
                                  Sin fotografía
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-zinc-950 via-transparent to-transparent" />
                        </div>
                      </div>

                      {/* PODIO */}
                      {mostrarPodio && (
                        <div className="border-t border-white/10 bg-black/20 px-8 py-12 md:px-12 md:py-14">
                          <div className="text-center">
                            {edicionSupabase ? (
                              <EditarTextoEdicion
                                valor={textoResultados}
                                campo="resultados"
                                edicionId={edicionSupabase.id}
                                claseTexto="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400"
                              />
                            ) : (
                              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400">
                                {textoResultados}
                              </p>
                            )}

                            {edicionSupabase ? (
                              <EditarTextoEdicion
                                valor={textoPodio}
                                campo="podio"
                                edicionId={edicionSupabase.id}
                                claseTexto="mt-3 text-4xl font-black md:text-5xl"
                              />
                            ) : (
                              <h4 className="mt-3 text-4xl font-black md:text-5xl">
                                {textoPodio}
                              </h4>
                            )}
                          </div>

                          <div className="mt-12 grid gap-6 md:grid-cols-3">
                            {participantes
                              .filter(
                                (participante) =>
                                  participante.posicion <= 3
                              )
                              .sort(
                                (a, b) =>
                                  a.posicion -
                                  b.posicion
                              )
                              .map(
                                (participante) => {
                                  const imagen =
                                    getImagenParticipante(
                                      participante
                                    );

                                  const altura =
                                    participante.posicion ===
                                    1
                                      ? "min-h-[430px]"
                                      : participante.posicion ===
                                          2
                                        ? "min-h-[360px]"
                                        : "min-h-[320px]";

                                  return (
                                    <div
                                      key={`podio-${edicionHistorica.año}-${participante.nombre}`}
                                      className={`relative ${altura} overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/90`}
                                    >
                                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,120,0,0.12),_transparent_55%)]" />

                                      <div className="relative flex h-full flex-col items-center justify-center p-8 text-center">
                                        <span className="text-6xl">
                                          {posicionEmoji(
                                            participante.posicion
                                          )}
                                        </span>

                                        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-orange-400">
                                          {posicionTexto(
                                            participante.posicion
                                          )}
                                        </p>

                                        <h5 className="mt-4 text-4xl font-black">
                                          {nombreHistorico(
                                            participante.nombre
                                          )}
                                        </h5>

                                        {imagen && (
                                          <div className="mt-8 h-24 w-24 overflow-hidden rounded-full border border-white/10 bg-black">
                                            <img
                                              src={imagen}
                                              alt={nombreHistorico(
                                                participante.nombre
                                              )}
                                              className="h-full w-full object-cover"
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                          </div>
                        </div>
                      )}

                      {/* GALERÍA */}
                      {edicionSupabase && (
                        <div className="border-t border-white/10 px-8 py-12 md:px-12 md:py-14">
                          <GaleriaFotos
                            edicionId={
                              edicionSupabase.id
                            }
                          />
                        </div>
                      )}

                      {/* SEPARADOR */}
                      {!esUltima && (
                        <div className="flex items-center gap-6 border-t border-white/5 bg-black/30 px-8 py-8 md:px-12">
                          <div className="h-px flex-1 bg-white/10" />

                          {edicionSupabase ? (
                            <EditarTextoEdicion
                              valor={textoSiguienteEdicion}
                              campo="siguiente_edicion"
                              edicionId={edicionSupabase.id}
                              claseTexto="text-xs font-bold uppercase tracking-[0.3em] text-zinc-600"
                            />
                          ) : (
                            <span className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-600">
                              {textoSiguienteEdicion}
                            </span>
                          )}

                          <div className="h-px flex-1 bg-white/10" />
                        </div>
                      )}
                    </article>
                  );
                }
              )}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/10 bg-black/50 px-6 py-10">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-zinc-500 md:flex-row md:justify-between">
            <p>THE GAME ARCHIVE</p>

            <p>
              Halloween · Archivo histórico · 2018–2024
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}