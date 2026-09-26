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
};

type Premio = {
  id: number;
  persona_id: number;
  edicion_id: number;
  nombre: string;
  descripcion: string | null;
  imagen: string | null;
};

function nombreCorto(nombre: string) {
  const partes = nombre.trim().split(/\s+/);

  if (partes.length === 1) {
    return partes[0];
  }

  return `${partes[0]} ${partes[partes.length - 2]}`;
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

  return nombreCorto(nombre);
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
    return "border-amber-400/40 bg-amber-950/30 text-amber-300";
  }

  if (posicion === 2) {
    return "border-zinc-400/20 bg-zinc-800/40 text-zinc-300";
  }

  if (posicion === 3) {
    return "border-orange-700/30 bg-orange-950/30 text-orange-300";
  }

  return "border-white/10 bg-white/[0.03] text-zinc-400";
}

export default async function Halloween2025Page() {
  const {
    data: eventoData,
    error: eventoError,
  } = await supabase
    .from("eventos")
    .select("*")
    .eq("slug", "halloween")
    .single();

  const evento =
    eventoData as unknown as Evento | null;

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

  const ediciones =
    (edicionesData as unknown as Edicion[] | null) ??
    [];

  if (edicionesError) {
    console.error(
      "Error cargando ediciones de Halloween:",
      edicionesError
    );
  }

  const edicion = ediciones.find(
    (item) => String(item.año) === "2025"
  );

  if (!edicion) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-400">
            No se encontró Halloween 2025
          </h1>

          <p className="mt-3 text-zinc-400">
            Revisa que la edición 2025 exista en Supabase.
          </p>
        </div>
      </main>
    );
  }

  const edicionId = edicion.id;

  /*
   * CONTENIDO EDITABLE
   *
   * Los textos se guardan en:
   * ediciones.contenido
   */

  const contenido = edicion.contenido ?? {};

  const heroEtiqueta =
    contenido.hero_etiqueta ??
    "Segunda edición";

  const heroDescripcion =
    contenido.hero_descripcion ??
    "Una nueva edición de nuestra celebración de Halloween, con juegos, actividades y nuestro tradicional torneo de disfraces.";

  const introEtiqueta =
    contenido.intro_etiqueta ??
    "La celebración";

  const introTitulo =
    contenido.intro_titulo ??
    "¿Cómo fue esta edición?";

  const introParrafo1 =
    contenido.intro_parrafo1 ??
    "La segunda edición de Halloween continuó con la tradición de reunirnos para celebrar esta fecha junto a nuestros amigos.";

  const introParrafo2 =
    contenido.intro_parrafo2 ??
    "La jornada estuvo acompañada de distintas actividades y juegos, además del torneo de disfraces que se convirtió nuevamente en uno de los momentos principales de la celebración.";

  const introParrafo3 =
    contenido.intro_parrafo3 ??
    "Esta edición quedó marcada por la creatividad de los participantes y por la elección de un nuevo campeón del torneo de disfraces.";

  const participantesEtiqueta =
    contenido.participantes_etiqueta ??
    "Los protagonistas";

  const participantesTitulo =
    contenido.participantes_titulo ??
    "PARTICIPANTES";

  const participantesDescripcion =
    contenido.participantes_descripcion ??
    "Las personas que fueron parte de Halloween 2025.";

  const participantesProximamente =
    contenido.participantes_proximamente ??
    "Participantes próximamente.";

  const competenciaEtiqueta =
    contenido.competencia_etiqueta ??
    "La gran competencia";

  const competenciaTitulo =
    contenido.competencia_titulo ??
    "TORNEO DE DISFRACES";

  const competenciaDescripcion =
    contenido.competencia_descripcion ??
    "El torneo de disfraces volvió a ser una de las actividades principales de Halloween, reuniendo creatividad, preparación y diferentes propuestas para conseguir el título.";

  const competenciaEdicion =
    contenido.competencia_edicion ??
    "Halloween 2025";

  const competenciaSubtitulo =
    contenido.competencia_subtitulo ??
    "MEJOR DISFRAZ";

  const competenciaCardDescripcion =
    contenido.competencia_card_descripcion ??
    "La competencia que definió al nuevo campeón de Halloween.";

  const podioEtiqueta =
    contenido.podio_etiqueta ??
    "Resultado";

  const podioTitulo =
    contenido.podio_titulo ??
    "EL PODIO";

  const podioDescripcion =
    contenido.podio_descripcion ??
    "Así terminó el torneo de disfraces de Halloween 2025.";

  const podioProximamente =
    contenido.podio_proximamente ??
    "Próximamente";

  const campeonEtiqueta =
    contenido.campeon_etiqueta ??
    "Campeón";

  const campeonPremio =
    contenido.campeon_premio ??
    "Mejor Disfraz Halloween 2025";

  const campeonDescripcion =
    contenido.campeon_descripcion ??
    "Ángelo Pérez se convirtió en el campeón del torneo de disfraces de Halloween 2025.";

  const recuerdosEtiqueta =
    contenido.recuerdos_etiqueta ??
    "Recuerdos";

  const galeriaTitulo =
    contenido.galeria_titulo ??
    "GALERÍA";

  const galeriaDescripcion =
    contenido.galeria_descripcion ??
    "Fotografías de Halloween 2025.";

  const {
    data: participacionesData,
    error: participacionesError,
  } = await supabase
    .from("participaciones")
    .select("*")
    .eq("edicion_id", edicionId)
    .order("posicion", {
      ascending: true,
      nullsFirst: false,
    });

  const participaciones =
    (participacionesData as unknown as Participacion[] | null) ??
    [];

  if (participacionesError) {
    console.error(
      "Error cargando participaciones:",
      participacionesError
    );
  }

  const {
    data: personasData,
    error: personasError,
  } = await supabase
    .from("personas")
    .select("id, nombre, imagen");

  const personas =
    (personasData as unknown as Persona[] | null) ??
    [];

  if (personasError) {
    console.error(
      "Error cargando personas:",
      personasError
    );
  }

  const {
    data: premioData,
    error: premioError,
  } = await supabase
    .from("premios")
    .select("*")
    .eq("edicion_id", edicionId)
    .maybeSingle();

  const premio =
    premioData as unknown as Premio | null;

  if (premioError) {
    console.error(
      "Error cargando premio:",
      premioError
    );
  }

  const personaPorId = new Map(
    personas.map((persona) => [
      persona.id,
      persona,
    ])
  );

  const participacionGanadora =
    participaciones.find(
      (participacion) =>
        participacion.posicion === 1
    );

  const ganador = participacionGanadora
    ? personaPorId.get(
        participacionGanadora.persona_id
      )
    : premio
      ? personaPorId.get(premio.persona_id)
      : undefined;

  const podio = participaciones
    .filter(
      (participacion) =>
        participacion.posicion !== null &&
        participacion.posicion <= 3
    )
    .sort(
      (a, b) =>
        (a.posicion ?? 99) -
        (b.posicion ?? 99)
    );

  const imagenGanador =
    premio?.imagen ??
    "/campeones/campeonhalloween2025.png";

  const nombreGanador = ganador
    ? nombreWeb(ganador.nombre)
    : "Ángelo Pérez";

  return (
    <main
      className="relative min-h-screen bg-cover bg-center bg-fixed text-white"
      style={{
        backgroundImage:
          "url('/eventos/halloween.png')",
      }}
    >
      <div className="fixed inset-0 z-0 bg-black/65" />

      <div className="relative z-10">

        {/* HERO */}
        <section className="relative overflow-hidden border-b border-white/10">

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.25),_transparent_50%)]" />

          <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 py-28 text-center">

            <img
              src={
                evento.logo ??
                "/logos/logohalloween.png"
              }
              alt="Halloween"
              className="max-h-72 max-w-lg object-contain"
            />

            <EditarTextoEdicion
              valor={heroEtiqueta}
              campo="hero_etiqueta"
              edicionId={edicionId}
              claseTexto="mt-12 text-sm font-semibold uppercase tracking-[0.4em] text-orange-400"
            />

            <h1 className="mt-4 text-6xl font-black md:text-8xl">
              HALLOWEEN
            </h1>

            <p className="mt-4 text-3xl font-bold text-white/80">
              2025
            </p>

            <EditarTextoEdicion
              valor={heroDescripcion}
              campo="hero_descripcion"
              edicionId={edicionId}
              multilinea
              claseTexto="mx-auto mt-8 max-w-3xl text-lg leading-8 text-zinc-300"
            />

          </div>
        </section>

        {/* INTRODUCCIÓN */}
        <section className="mx-auto max-w-4xl px-6 py-24 text-center">

          <EditarTextoEdicion
            valor={introEtiqueta}
            campo="intro_etiqueta"
            edicionId={edicionId}
            claseTexto="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400"
          />

          <EditarTextoEdicion
            valor={introTitulo}
            campo="intro_titulo"
            edicionId={edicionId}
            claseTexto="mt-4 text-4xl font-bold md:text-5xl"
          />

          <div className="mt-8 space-y-6 text-lg leading-8 text-zinc-300">

            <EditarTextoEdicion
              valor={introParrafo1}
              campo="intro_parrafo1"
              edicionId={edicionId}
              multilinea
              claseTexto="block"
            />

            <EditarTextoEdicion
              valor={introParrafo2}
              campo="intro_parrafo2"
              edicionId={edicionId}
              multilinea
              claseTexto="block"
            />

            <EditarTextoEdicion
              valor={introParrafo3}
              campo="intro_parrafo3"
              edicionId={edicionId}
              multilinea
              claseTexto="block"
            />

          </div>
        </section>

        {/* PARTICIPANTES */}
        <section className="border-y border-white/10 bg-black/30">

          <div className="mx-auto max-w-7xl px-6 py-24">

            <div className="text-center">

              <EditarTextoEdicion
                valor={participantesEtiqueta}
                campo="participantes_etiqueta"
                edicionId={edicionId}
                claseTexto="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400"
              />

              <EditarTextoEdicion
                valor={participantesTitulo}
                campo="participantes_titulo"
                edicionId={edicionId}
                claseTexto="mt-4 text-5xl font-black md:text-6xl"
              />

              <EditarTextoEdicion
                valor={participantesDescripcion}
                campo="participantes_descripcion"
                edicionId={edicionId}
                multilinea
                claseTexto="mx-auto mt-5 max-w-xl text-zinc-400"
              />

            </div>

            {participaciones.length > 0 ? (
              <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                {participaciones.map(
                  (participacion) => {

                    const persona =
                      personaPorId.get(
                        participacion.persona_id
                      );

                    if (!persona) {
                      return null;
                    }

                    return (
                      <div
                        key={participacion.id}
                        className="group overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/90 transition duration-300 hover:-translate-y-1 hover:border-orange-500/30"
                      >

                        <div className="relative h-72 overflow-hidden bg-black">

                          {persona.imagen ? (
                            <img
                              src={persona.imagen}
                              alt={nombreWeb(
                                persona.nombre
                              )}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <span className="text-7xl opacity-20">
                                👤
                              </span>
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                        </div>

                        <div className="p-6">

                          <h3 className="text-2xl font-black">
                            {nombreWeb(
                              persona.nombre
                            )}
                          </h3>

                          <div className="mt-4">

                            <span
                              className={`inline-flex rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wide ${posicionColor(
                                participacion.posicion
                              )}`}
                            >
                              {posicionTexto(
                                participacion.posicion
                              )}
                            </span>

                          </div>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            ) : (
              <div className="mt-14 rounded-3xl border border-dashed border-white/10 bg-zinc-900/70 p-16 text-center">

                <EditarTextoEdicion
                  valor={participantesProximamente}
                  campo="participantes_proximamente"
                  edicionId={edicionId}
                  claseTexto="text-sm text-zinc-600"
                />

              </div>
            )}

          </div>
        </section>

        {/* TORNEO DE DISFRACES */}
        <section className="border-b border-white/10 bg-black/40">

          <div className="mx-auto max-w-6xl px-6 py-28">

            <div className="grid items-center gap-12 md:grid-cols-2">

              <div>

                <EditarTextoEdicion
                  valor={competenciaEtiqueta}
                  campo="competencia_etiqueta"
                  edicionId={edicionId}
                  claseTexto="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400"
                />

                <EditarTextoEdicion
                  valor={competenciaTitulo}
                  campo="competencia_titulo"
                  edicionId={edicionId}
                  multilinea
                  claseTexto="mt-4 whitespace-pre-line text-4xl font-black md:text-6xl"
                />

                <EditarTextoEdicion
                  valor={competenciaDescripcion}
                  campo="competencia_descripcion"
                  edicionId={edicionId}
                  multilinea
                  claseTexto="mt-8 max-w-xl text-lg leading-8 text-zinc-300"
                />

              </div>

              <div className="relative overflow-hidden rounded-3xl border border-orange-500/20 bg-black/60 p-10">

                <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-orange-500/10 blur-3xl" />

                <div className="relative text-center">

                  <p className="text-7xl">
                    🎃
                  </p>

                  <EditarTextoEdicion
                    valor={competenciaEdicion}
                    campo="competencia_edicion"
                    edicionId={edicionId}
                    claseTexto="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-orange-400"
                  />

                  <EditarTextoEdicion
                    valor={competenciaSubtitulo}
                    campo="competencia_subtitulo"
                    edicionId={edicionId}
                    claseTexto="mt-3 text-3xl font-black"
                  />

                  <EditarTextoEdicion
                    valor={competenciaCardDescripcion}
                    campo="competencia_card_descripcion"
                    edicionId={edicionId}
                    multilinea
                    claseTexto="mt-4 text-zinc-400"
                  />

                </div>

              </div>

            </div>

          </div>
        </section>

        {/* PODIO */}
        <section className="mx-auto max-w-6xl px-6 py-28">

          <div className="text-center">

            <EditarTextoEdicion
              valor={podioEtiqueta}
              campo="podio_etiqueta"
              edicionId={edicionId}
              claseTexto="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400"
            />

            <EditarTextoEdicion
              valor={podioTitulo}
              campo="podio_titulo"
              edicionId={edicionId}
              claseTexto="mt-4 text-5xl font-black md:text-6xl"
            />

            <EditarTextoEdicion
              valor={podioDescripcion}
              campo="podio_descripcion"
              edicionId={edicionId}
              multilinea
              claseTexto="mx-auto mt-5 max-w-xl text-zinc-400"
            />

          </div>

          {podio.length > 0 ? (
            <div className="mt-14 grid gap-6 md:grid-cols-3">

              {podio.map((participacion) => {

                const jugador =
                  personaPorId.get(
                    participacion.persona_id
                  );

                if (!jugador) {
                  return null;
                }

                const posicion =
                  participacion.posicion;

                return (
                  <div
                    key={participacion.id}
                    className={`rounded-3xl border p-8 text-center transition duration-300 hover:-translate-y-2 ${
                      posicion === 1
                        ? "border-orange-500/50 bg-orange-950/30"
                        : "border-white/10 bg-zinc-900/90"
                    }`}
                  >

                    <div className="text-6xl">
                      {posicion === 1
                        ? "🥇"
                        : posicion === 2
                          ? "🥈"
                          : "🥉"}
                    </div>

                    <p className="mt-10 text-sm uppercase tracking-[0.3em] text-orange-400">
                      {posicion}° lugar
                    </p>

                    <h3 className="mt-6 text-3xl font-black">
                      {nombreWeb(
                        jugador.nombre
                      )}
                    </h3>

                  </div>
                );
              })}

            </div>
          ) : (
            <div className="mt-14 grid gap-6 md:grid-cols-3">

              {[1, 2, 3].map((posicion) => (
                <div
                  key={posicion}
                  className="flex h-72 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-zinc-900/70"
                >

                  <div className="text-center">

                    <p className="text-5xl">
                      {posicion === 1
                        ? "🥇"
                        : posicion === 2
                          ? "🥈"
                          : "🥉"}
                    </p>

                    <p className="mt-5 text-sm uppercase tracking-[0.3em] text-zinc-600">
                      {posicion}° lugar
                    </p>

                    <EditarTextoEdicion
                      valor={podioProximamente}
                      campo="podio_proximamente"
                      edicionId={edicionId}
                      claseTexto="mt-2 text-sm text-zinc-700"
                    />

                  </div>

                </div>
              ))}

            </div>
          )}

        </section>

        {/* CAMPEÓN */}
        <section className="border-y border-white/10 bg-black/50">

          <div className="mx-auto max-w-6xl px-6 py-28">

            <div className="overflow-hidden rounded-3xl border border-orange-500/20 bg-zinc-950">

              <div className="grid min-h-[620px] md:grid-cols-2">

                <div className="flex flex-col justify-center p-10 text-center md:p-14">

                  <EditarTextoEdicion
                    valor={campeonEtiqueta}
                    campo="campeon_etiqueta"
                    edicionId={edicionId}
                    claseTexto="text-sm uppercase tracking-[0.3em] text-orange-400"
                  />

                  <h2 className="mt-4 text-5xl font-black md:text-6xl">
                    {nombreGanador}
                  </h2>

                  <EditarTextoEdicion
                    valor={
                      premio?.nombre ??
                      campeonPremio
                    }
                    campo="campeon_premio"
                    edicionId={edicionId}
                    claseTexto="mt-6 text-xl font-semibold text-orange-300"
                  />

                  {premio?.descripcion && (
                    <p className="mt-6 text-lg leading-8 text-zinc-300">
                      {premio.descripcion}
                    </p>
                  )}

                  <div className="mt-8 flex justify-center">
                    <span className="text-7xl">
                      👑
                    </span>
                  </div>

                  <EditarTextoEdicion
                    valor={campeonDescripcion}
                    campo="campeon_descripcion"
                    edicionId={edicionId}
                    multilinea
                    claseTexto="mt-8 text-lg leading-8 text-zinc-400"
                  />

                  <a
                    href="/eventos/halloween"
                    className="mx-auto mt-8 w-fit rounded-full border border-white/20 px-7 py-3 text-sm font-semibold transition hover:bg-white hover:text-black"
                  >
                    VOLVER AL EVENTO →
                  </a>

                </div>

                <div className="relative min-h-[620px] overflow-hidden bg-black">

                  <img
                    src={imagenGanador}
                    alt={nombreGanador}
                    className="absolute inset-0 h-full w-full object-contain"
                  />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />

                </div>

              </div>

            </div>

          </div>
        </section>

        {/* GALERÍA */}
        <section className="mx-auto max-w-7xl px-6 py-24">

          <div className="text-center">

            <EditarTextoEdicion
              valor={recuerdosEtiqueta}
              campo="recuerdos_etiqueta"
              edicionId={edicionId}
              claseTexto="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400"
            />

            <EditarTextoEdicion
              valor={galeriaTitulo}
              campo="galeria_titulo"
              edicionId={edicionId}
              claseTexto="mt-4 text-5xl font-black md:text-6xl"
            />

            <EditarTextoEdicion
              valor={galeriaDescripcion}
              campo="galeria_descripcion"
              edicionId={edicionId}
              multilinea
              claseTexto="mx-auto mt-5 max-w-xl text-zinc-400"
            />

          </div>

          <div className="mt-14">
            <GaleriaFotos edicionId={edicionId} />
          </div>

        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/10 bg-black/50 px-6 py-10">

          <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between">

            <p>
              THE GAME ARCHIVE
            </p>

            <p>
              Halloween · Segunda edición · 2025
            </p>

          </div>

        </footer>

      </div>
    </main>
  );
}