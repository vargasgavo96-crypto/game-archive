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

  if (
    nombreNormalizado ===
    "camila fernanda elgueta jamett".toLowerCase()
  ) {
    return "Fefi";
  }

  return nombreCorto(nombre);
}

function posicionTexto(posicion: number | null) {
  if (posicion === 1) return "1° lugar";
  if (posicion === 2) return "2° lugar";
  if (posicion === 3) return "3° lugar";
  return `${posicion}° lugar`;
}

export default async function Halloween2026Page() {
  const { data: evento, error: eventoError } = await supabase
    .from("eventos")
    .select("id, nombre, descripcion, logo, slug")
    .eq("slug", "halloween")
    .single();

  if (eventoError || !evento) {
    console.error("Error cargando evento:", eventoError);

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
    (edicionesData as unknown as Edicion[] | null) ?? [];

  const edicion = ediciones.find(
    (item) => String(item.año) === "2026"
  );

  if (edicionesError || !edicion) {
    console.error(
      "Error cargando edición:",
      edicionesError
    );

    return (
      <main
        className="relative flex min-h-screen items-center justify-center bg-cover bg-center text-white"
        style={{
          backgroundImage: "url('/eventos/halloween.png')",
        }}
      >
        <div className="absolute inset-0 bg-black/75" />

        <div className="relative z-10 px-6 text-center">
          <p className="text-6xl">🎃</p>

          <h1 className="mt-6 text-4xl font-black">
            HALLOWEEN 2026
          </h1>

          <p className="mt-4 text-zinc-400">
            La edición todavía no está disponible.
          </p>
        </div>
      </main>
    );
  }

  const edicionId = edicion.id;

  const contenido = edicion.contenido ?? {};

  const [
    { data: participacionesData, error: participacionesError },
    { data: personasData, error: personasError },
  ] = await Promise.all([
    supabase
      .from("participaciones")
      .select(
        "id, persona_id, edicion_id, posicion, puntos_finales"
      )
      .eq("edicion_id", edicionId)
      .order("posicion", {
        ascending: true,
        nullsFirst: false,
      }),

    supabase
      .from("personas")
      .select("id, nombre, imagen")
      .order("nombre"),
  ]);

  if (participacionesError) {
    console.error(
      "Error cargando participaciones:",
      participacionesError
    );
  }

  if (personasError) {
    console.error(
      "Error cargando personas:",
      personasError
    );
  }

  const participaciones: Participacion[] =
    (participacionesData as unknown as Participacion[] | null) ?? [];

  const personas: Persona[] =
    (personasData as unknown as Persona[] | null) ?? [];

  const personaPorId = new Map(
    personas.map((persona) => [persona.id, persona])
  );

  const participantes = participaciones
    .map((participacion) =>
      personaPorId.get(participacion.persona_id)
    )
    .filter(
      (persona): persona is Persona => Boolean(persona)
    );

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

  const participacionGanadora = participaciones.find(
    (participacion) => participacion.posicion === 1
  );

  const ganador = participacionGanadora
    ? personaPorId.get(
        participacionGanadora.persona_id
      )
    : undefined;

  const heroEtiqueta =
    contenido.hero_etiqueta ?? "Próxima edición";

  const heroDescripcion =
    contenido.hero_descripcion ?? evento.descripcion;

  const heroEstado =
    contenido.hero_estado ?? "Próximamente";

  const introEtiqueta =
    contenido.intro_etiqueta ?? "Halloween 2026";

  const introTitulo =
    contenido.intro_titulo ?? "¿CÓMO SERÁ ESTA EDICIÓN?";

  const introParrafo1 =
    contenido.intro_parrafo1 ??
    "Esta edición todavía está por realizarse. Aquí quedará registrada la historia de Halloween 2026 una vez que se lleve a cabo.";

  const introParrafo2 =
    contenido.intro_parrafo2 ??
    "En esta sección se incorporará posteriormente el relato de cómo se desarrolló la celebración, sus principales momentos y las actividades que marcaron esta edición.";

  const participantesEtiqueta =
    contenido.participantes_etiqueta ?? "Los protagonistas";

  const participantesTitulo =
    contenido.participantes_titulo ?? "PARTICIPANTES";

  const participantesDescripcion =
    contenido.participantes_descripcion ??
    "Las personas que participarán en Halloween 2026 aparecerán aquí.";

  const participantesVacio =
    contenido.participantes_vacio ??
    "Participantes por definir";

  const participantesVacioDescripcion =
    contenido.participantes_vacio_descripcion ??
    "La lista de participantes se actualizará cuando sean registrados.";

  const competenciaEtiqueta =
    contenido.competencia_etiqueta ?? "La gran competencia";

  const competenciaTitulo =
    contenido.competencia_titulo ?? "TORNEO DE";

  const competenciaTitulo2 =
    contenido.competencia_titulo2 ?? "DISFRACES";

  const competenciaDescripcion =
    contenido.competencia_descripcion ??
    "Una de las actividades principales de Halloween es nuestro torneo de disfraces, donde los participantes pueden demostrar toda su creatividad para convertirse en el mejor disfraz de la celebración.";

  const competenciaEdicion =
    contenido.competencia_edicion ?? "Halloween 2026";

  const competenciaSubtitulo =
    contenido.competencia_subtitulo ??
    "¿QUIÉN SERÁ EL MEJOR DISFRAZ?";

  const competenciaResultado =
    contenido.competencia_resultado ??
    "El resultado se conocerá una vez realizada la celebración.";

  const podioEtiqueta =
    contenido.podio_etiqueta ?? "Clasificación final";

  const podioTitulo =
    contenido.podio_titulo ?? "EL PODIO";

  const podioDescripcion =
    contenido.podio_descripcion ??
    "Los resultados aparecerán aquí una vez finalizada la competencia.";

  const podioVacio =
    contenido.podio_vacio ?? "Podio por definir";

  const podioVacioDescripcion =
    contenido.podio_vacio_descripcion ??
    "Aquí aparecerán los tres primeros lugares después de Halloween 2026.";

  const ganadorEtiqueta =
    contenido.ganador_etiqueta ?? "El gran ganador";

  const ganadorTitulo =
    contenido.ganador_titulo ?? "GANADOR";

  const ganadorVacio =
    contenido.ganador_vacio ??
    "EL GANADOR AÚN NO ESTÁ DEFINIDO";

  const ganadorVacioDescripcion =
    contenido.ganador_vacio_descripcion ??
    "Esta sección se actualizará automáticamente cuando se registre el primer lugar de Halloween 2026.";

  const ganadorEtiquetaInterna =
    contenido.ganador_etiqueta_interna ?? "🏆 Campeón";

  const ganadorPremio =
    contenido.ganador_premio ??
    "Mejor Disfraz Halloween 2026";

  const ganadorImagenVacia =
    contenido.ganador_imagen_vacia ??
    "Imagen del ganador por agregar";

  return (
    <main
      className="relative min-h-screen bg-cover bg-center bg-fixed text-white"
      style={{
        backgroundImage: "url('/eventos/halloween.png')",
      }}
    >
      <div className="fixed inset-0 z-0 bg-black/65" />

      <div className="relative z-10">

        {/* HERO */}
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,92,0,0.25),_transparent_50%)]" />

          <div className="relative mx-auto flex min-h-[680px] max-w-7xl flex-col items-center justify-center px-6 py-28 text-center">

            {evento.logo && (
              <img
                src={evento.logo}
                alt={evento.nombre}
                className="max-h-72 max-w-lg object-contain drop-shadow-[0_0_35px_rgba(255,120,0,0.35)]"
              />
            )}

            <div className="mt-12">
              <EditarTextoEdicion
                valor={heroEtiqueta}
                campo="hero_etiqueta"
                edicionId={edicionId}
                claseTexto="text-sm font-semibold uppercase tracking-[0.4em] text-orange-400"
              />
            </div>

            <h1 className="mt-4 text-6xl font-black uppercase tracking-tight md:text-8xl">
              HALLOWEEN
            </h1>

            <p className="mt-4 text-4xl font-black text-white/80 md:text-5xl">
              2026
            </p>

            <div className="mx-auto mt-8 max-w-3xl">
              <EditarTextoEdicion
                valor={heroDescripcion}
                campo="hero_descripcion"
                edicionId={edicionId}
                multilinea
                claseTexto="text-lg leading-8 text-zinc-300"
              />
            </div>

            <div className="mt-10 rounded-full border border-orange-500/30 bg-orange-500/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-orange-300 backdrop-blur-sm">
              <EditarTextoEdicion
                valor={heroEstado}
                campo="hero_estado"
                edicionId={edicionId}
              />
            </div>
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

          <div className="mt-4">
            <EditarTextoEdicion
              valor={introTitulo}
              campo="intro_titulo"
              edicionId={edicionId}
              claseTexto="text-4xl font-bold md:text-5xl"
            />
          </div>

          <div className="mt-8 space-y-6 text-lg leading-8 text-zinc-300">

            <div>
              <EditarTextoEdicion
                valor={introParrafo1}
                campo="intro_parrafo1"
                edicionId={edicionId}
                multilinea
              />
            </div>

            <div>
              <EditarTextoEdicion
                valor={introParrafo2}
                campo="intro_parrafo2"
                edicionId={edicionId}
                multilinea
              />
            </div>

          </div>
        </section>

        {/* PARTICIPANTES */}
        <section className="border-y border-white/10 bg-black/40">
          <div className="mx-auto max-w-7xl px-6 py-24">

            <div className="text-center">

              <EditarTextoEdicion
                valor={participantesEtiqueta}
                campo="participantes_etiqueta"
                edicionId={edicionId}
                claseTexto="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400"
              />

              <div className="mt-4">
                <EditarTextoEdicion
                  valor={participantesTitulo}
                  campo="participantes_titulo"
                  edicionId={edicionId}
                  claseTexto="text-5xl font-black md:text-6xl"
                />
              </div>

              <div className="mx-auto mt-5 max-w-2xl">
                <EditarTextoEdicion
                  valor={participantesDescripcion}
                  campo="participantes_descripcion"
                  edicionId={edicionId}
                  multilinea
                  claseTexto="text-zinc-400"
                />
              </div>

            </div>

            {participantes.length === 0 ? (
              <div className="mx-auto mt-14 max-w-2xl rounded-3xl border border-orange-500/20 bg-black/50 px-8 py-16 text-center backdrop-blur-sm">

                <p className="text-6xl">👻</p>

                <div className="mt-6">
                  <EditarTextoEdicion
                    valor={participantesVacio}
                    campo="participantes_vacio"
                    edicionId={edicionId}
                    claseTexto="text-2xl font-bold"
                  />
                </div>

                <div className="mt-3">
                  <EditarTextoEdicion
                    valor={participantesVacioDescripcion}
                    campo="participantes_vacio_descripcion"
                    edicionId={edicionId}
                    multilinea
                    claseTexto="text-zinc-500"
                  />
                </div>

              </div>
            ) : (
              <div className="mt-14 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

                {participantes.map((persona) => (
                  <div
                    key={persona.id}
                    className="group overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/90 transition duration-300 hover:-translate-y-2 hover:border-orange-500/40"
                  >

                    <div className="relative aspect-square overflow-hidden bg-black">

                      {persona.imagen ? (
                        <img
                          src={persona.imagen}
                          alt={nombreWeb(persona.nombre)}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-6xl">
                          👻
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    </div>

                    <div className="px-6 py-5 text-center">

                      <h3 className="text-xl font-black">
                        {nombreWeb(persona.nombre)}
                      </h3>

                      <p className="mt-2 text-xs uppercase tracking-[0.25em] text-orange-400">
                        Participante
                      </p>

                    </div>
                  </div>
                ))}

              </div>
            )}

          </div>
        </section>

        {/* TORNEO DE DISFRACES */}
        <section className="border-b border-white/10 bg-black/30">
          <div className="mx-auto max-w-6xl px-6 py-24">

            <div className="grid items-center gap-12 md:grid-cols-2">

              <div>

                <EditarTextoEdicion
                  valor={competenciaEtiqueta}
                  campo="competencia_etiqueta"
                  edicionId={edicionId}
                  claseTexto="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400"
                />

                <div className="mt-4">
                  <EditarTextoEdicion
                    valor={competenciaTitulo}
                    campo="competencia_titulo"
                    edicionId={edicionId}
                    claseTexto="text-4xl font-black md:text-6xl"
                  />
                </div>

                <div>
                  <EditarTextoEdicion
                    valor={competenciaTitulo2}
                    campo="competencia_titulo2"
                    edicionId={edicionId}
                    claseTexto="text-4xl font-black md:text-6xl"
                  />
                </div>

                <div className="mt-8 max-w-xl">
                  <EditarTextoEdicion
                    valor={competenciaDescripcion}
                    campo="competencia_descripcion"
                    edicionId={edicionId}
                    multilinea
                    claseTexto="text-lg leading-8 text-zinc-300"
                  />
                </div>

              </div>

              <div className="relative overflow-hidden rounded-3xl border border-orange-500/20 bg-black/50 p-10">

                <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-orange-500/10 blur-3xl" />

                <div className="relative text-center">

                  <p className="text-7xl">🎃</p>

                  <div className="mt-6">
                    <EditarTextoEdicion
                      valor={competenciaEdicion}
                      campo="competencia_edicion"
                      edicionId={edicionId}
                      claseTexto="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400"
                    />
                  </div>

                  <div className="mt-3">
                    <EditarTextoEdicion
                      valor={competenciaSubtitulo}
                      campo="competencia_subtitulo"
                      edicionId={edicionId}
                      claseTexto="text-3xl font-black"
                    />
                  </div>

                  <div className="mt-4">
                    <EditarTextoEdicion
                      valor={competenciaResultado}
                      campo="competencia_resultado"
                      edicionId={edicionId}
                      multilinea
                      claseTexto="text-zinc-400"
                    />
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* PODIO */}
        <section className="border-y border-white/10 bg-black/40">
          <div className="mx-auto max-w-5xl px-6 py-24">

            <div className="text-center">

              <EditarTextoEdicion
                valor={podioEtiqueta}
                campo="podio_etiqueta"
                edicionId={edicionId}
                claseTexto="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400"
              />

              <div className="mt-4">
                <EditarTextoEdicion
                  valor={podioTitulo}
                  campo="podio_titulo"
                  edicionId={edicionId}
                  claseTexto="text-5xl font-black md:text-6xl"
                />
              </div>

              <div className="mx-auto mt-5 max-w-2xl">
                <EditarTextoEdicion
                  valor={podioDescripcion}
                  campo="podio_descripcion"
                  edicionId={edicionId}
                  multilinea
                  claseTexto="text-zinc-400"
                />
              </div>

            </div>

            {podio.length === 0 ? (
              <div className="mx-auto mt-14 max-w-2xl rounded-3xl border border-orange-500/20 bg-black/50 px-8 py-16 text-center backdrop-blur-sm">

                <p className="text-6xl">🏆</p>

                <div className="mt-6">
                  <EditarTextoEdicion
                    valor={podioVacio}
                    campo="podio_vacio"
                    edicionId={edicionId}
                    claseTexto="text-2xl font-bold"
                  />
                </div>

                <div className="mt-3">
                  <EditarTextoEdicion
                    valor={podioVacioDescripcion}
                    campo="podio_vacio_descripcion"
                    edicionId={edicionId}
                    multilinea
                    claseTexto="text-zinc-500"
                  />
                </div>

              </div>
            ) : (
              <div className="mt-14 grid gap-6 md:grid-cols-3">

                {podio.map((participacion) => {
                  const jugador = personaPorId.get(
                    participacion.persona_id
                  );

                  if (!jugador) {
                    return null;
                  }

                  const posicion = participacion.posicion;

                  return (
                    <div
                      key={participacion.id}
                      className={`rounded-3xl border p-8 text-center ${
                        posicion === 1
                          ? "border-orange-500/50 bg-orange-950/40"
                          : "border-white/10 bg-zinc-900/90"
                      }`}
                    >

                      <span className="text-6xl">
                        {posicion === 1
                          ? "🥇"
                          : posicion === 2
                            ? "🥈"
                            : "🥉"}
                      </span>

                      <p className="mt-6 text-sm uppercase tracking-widest text-zinc-500">
                        {posicionTexto(posicion)}
                      </p>

                      <h3 className="mt-2 text-2xl font-black">
                        {nombreWeb(jugador.nombre)}
                      </h3>

                      {participacion.puntos_finales !== null && (
                        <p className="mt-3 text-xl font-bold text-orange-400">
                          {participacion.puntos_finales.toLocaleString(
                            "es-CL"
                          )}{" "}
                          pts
                        </p>
                      )}

                    </div>
                  );
                })}

              </div>
            )}

          </div>
        </section>

        {/* GANADOR */}
        <section className="border-b border-orange-500/20 bg-black/40">
          <div className="mx-auto max-w-7xl px-6 py-24">

            <div className="mb-12 text-center">

              <EditarTextoEdicion
                valor={ganadorEtiqueta}
                campo="ganador_etiqueta"
                edicionId={edicionId}
                claseTexto="text-sm font-semibold uppercase tracking-[0.4em] text-orange-400"
              />

              <div className="mt-4">
                <EditarTextoEdicion
                  valor={ganadorTitulo}
                  campo="ganador_titulo"
                  edicionId={edicionId}
                  claseTexto="text-5xl font-black md:text-6xl"
                />
              </div>

            </div>

            {!ganador ? (
              <div className="mx-auto max-w-3xl rounded-[2rem] border border-orange-500/20 bg-black/60 px-8 py-20 text-center shadow-[0_0_80px_rgba(255,100,0,0.08)]">

                <p className="text-7xl">👑</p>

                <div className="mt-8">
                  <EditarTextoEdicion
                    valor={ganadorVacio}
                    campo="ganador_vacio"
                    edicionId={edicionId}
                    claseTexto="text-3xl font-black"
                  />
                </div>

                <div className="mx-auto mt-4 max-w-xl">
                  <EditarTextoEdicion
                    valor={ganadorVacioDescripcion}
                    campo="ganador_vacio_descripcion"
                    edicionId={edicionId}
                    multilinea
                    claseTexto="text-zinc-400"
                  />
                </div>

              </div>
            ) : (
              <div className="relative mx-auto min-h-[620px] max-w-7xl overflow-hidden rounded-[2rem] border border-orange-500/30 bg-black/75 shadow-[0_0_80px_rgba(255,100,0,0.12)]">

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_50%,_rgba(255,100,0,0.12),_transparent_45%)]" />

                <div className="relative grid min-h-[620px] md:grid-cols-[0.9fr_1.1fr]">

                  <div className="relative z-10 flex flex-col justify-center px-10 py-14 text-center md:px-14 md:text-left lg:px-20">

                    <EditarTextoEdicion
                      valor={ganadorEtiquetaInterna}
                      campo="ganador_etiqueta_interna"
                      edicionId={edicionId}
                      claseTexto="text-sm font-semibold uppercase tracking-[0.4em] text-orange-400"
                    />

                    <h3 className="mt-5 text-5xl font-black leading-none text-white md:text-6xl lg:text-7xl">
                      {nombreWeb(ganador.nombre)}
                    </h3>

                    <div className="mt-8 h-px w-24 bg-orange-500/60" />

                    <div className="mt-8">
                      <EditarTextoEdicion
                        valor={ganadorPremio}
                        campo="ganador_premio"
                        edicionId={edicionId}
                        claseTexto="text-2xl font-semibold text-orange-400"
                      />
                    </div>

                  </div>

                  <div className="relative flex min-h-[500px] items-center justify-center overflow-hidden bg-zinc-950 md:min-h-[620px]">

                    {ganador.imagen ? (
                      <img
                        src={ganador.imagen}
                        alt={nombreWeb(ganador.nombre)}
                        className="h-full max-h-[620px] w-full object-contain object-center"
                      />
                    ) : (
                      <div className="text-center">

                        <p className="text-8xl">🏆</p>

                        <div className="mt-6">
                          <EditarTextoEdicion
                            valor={ganadorImagenVacia}
                            campo="ganador_imagen_vacia"
                            edicionId={edicionId}
                            claseTexto="text-zinc-500"
                          />
                        </div>

                      </div>
                    )}

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent md:from-black md:via-black/10 md:to-transparent" />

                  </div>

                </div>
              </div>
            )}

          </div>
        </section>

        {/* GALERÍA */}
        <GaleriaFotos edicionId={edicionId} />

        {/* FOOTER */}
        <footer className="border-t border-white/10 bg-black/50 px-6 py-10">

          <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between">

            <p>THE GAME ARCHIVE</p>

            <p>
              Halloween · Tercera edición · 2026
            </p>

          </div>
        </footer>

      </div>
    </main>
  );
}