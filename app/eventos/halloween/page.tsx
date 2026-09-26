import { supabase } from "@/lib/supabase";
import EditarTexto from "@/app/components/EditarTexto";

type Evento = {
  id: number;
  nombre: string;
  descripcion: string;
  logo: string | null;
  slug: string;
  historia: string | null;

  juegos_titulo: string | null;
  juegos_descripcion: string | null;

  organizador_titulo: string | null;
  organizador_descripcion: string | null;

  disfraces_titulo: string | null;
  disfraces_descripcion: string | null;
  disfraces_pregunta: string | null;
  disfraces_subtexto: string | null;
};

type Edicion = {
  id: number;
  evento_id: number;
  año: string;
  fecha: string;
};

type Participacion = {
  edicion_id: number;
  persona_id: number;
  posicion: number | null;
};

type Persona = {
  id: number;
  nombre: string;
};

const imagenesGanadores: Record<string, string> = {
  "2025": "/campeones/campeonhalloween2025.png",
};

function nombreCorto(nombre: string) {
  const partes = nombre.trim().split(/\s+/);

  if (partes.length === 1) {
    return partes[0];
  }

  return `${partes[0]} ${partes[partes.length - 2]}`;
}

export default async function HalloweenPage() {
  const {
    data: evento,
    error: eventoError,
  } = await supabase
    .from("eventos")
    .select(`
      id,
      nombre,
      descripcion,
      logo,
      slug,
      historia,
      juegos_titulo,
      juegos_descripcion,
      organizador_titulo,
      organizador_descripcion,
      disfraces_titulo,
      disfraces_descripcion,
      disfraces_pregunta,
      disfraces_subtexto
    `)
    .eq("slug", "halloween")
    .single();

  if (eventoError || !evento) {
    console.error(
      "Error cargando evento:",
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
    .eq("evento_id", evento.id)
    .order("fecha", {
      ascending: false,
    });

  if (edicionesError) {
    console.error(
      "Error cargando ediciones:",
      edicionesError
    );
  }

  const ediciones =
    (edicionesData as unknown as Edicion[] | null) ??
    [];

  const idsEdiciones = ediciones.map(
    (edicion) => edicion.id
  );

  let participaciones: Participacion[] = [];

  if (idsEdiciones.length > 0) {
    const {
      data: participacionesData,
      error: participacionesError,
    } = await supabase
      .from("participaciones")
      .select(
        "edicion_id, persona_id, posicion"
      )
      .in("edicion_id", idsEdiciones)
      .eq("posicion", 1);

    if (participacionesError) {
      console.error(
        "Error cargando ganadores:",
        participacionesError
      );
    }

    participaciones =
      (participacionesData as unknown as Participacion[] | null) ??
      [];
  }

  const idsPersonas = Array.from(
    new Set(
      participaciones.map(
        (participacion) =>
          participacion.persona_id
      )
    )
  );

  let personas: Persona[] = [];

  if (idsPersonas.length > 0) {
    const {
      data: personasData,
      error: personasError,
    } = await supabase
      .from("personas")
      .select("id, nombre")
      .in("id", idsPersonas);

    if (personasError) {
      console.error(
        "Error cargando nombres de ganadores:",
        personasError
      );
    }

    personas =
      (personasData as unknown as Persona[] | null) ??
      [];
  }

  const personaPorId = new Map(
    personas.map((persona) => [
      persona.id,
      persona,
    ])
  );

  const ganadorPorEdicion = new Map(
    participaciones.map(
      (participacion) => [
        participacion.edicion_id,
        personaPorId.get(
          participacion.persona_id
        ),
      ]
    )
  );

  const edicionesNormales = ediciones.filter(
    (edicion) => Number(edicion.año) >= 2025
  );

  const existeArchivoHistorico = ediciones.some(
    (edicion) => Number(edicion.año) <= 2024
  );

  /*
   * TEXTOS POR DEFECTO
   *
   * Si algún campo está vacío en Supabase,
   * mantenemos el texto que ya tenía la página.
   */

  const historiaInicial =
    evento.historia?.trim() ||
    `Halloween se convirtió en una de nuestras celebraciones,
incorporando juegos, actividades y distintas formas de
disfrutar esta fecha junto a nuestros amigos.`;

  const juegosTitulo =
    evento.juegos_titulo?.trim() ||
    "Juegos y actividades";

  const juegosDescripcion =
    evento.juegos_descripcion?.trim() ||
    "La celebración incluye distintos juegos y actividades preparadas especialmente para Halloween.";

  const organizadorTitulo =
    evento.organizador_titulo?.trim() ||
    "Organizado por Camilo";

  const organizadorDescripcion =
    evento.organizador_descripcion?.trim() ||
    "Camilo, gran fanático de Halloween, es el encargado de organizar la celebración, preparar los juegos y llevar adelante sus principales actividades.";

  const disfracesTitulo =
    evento.disfraces_titulo?.trim() ||
    "TORNEO DE DISFRACES";

  const disfracesDescripcion =
    evento.disfraces_descripcion?.trim() ||
    "Una de las actividades principales de Halloween es nuestro torneo de disfraces, donde los participantes pueden demostrar toda su creatividad para convertirse en el mejor disfraz de la celebración.";

  const disfracesPregunta =
    evento.disfraces_pregunta?.trim() ||
    "¿QUIÉN SERÁ EL MEJOR DISFRAZ?";

  const disfracesSubtexto =
    evento.disfraces_subtexto?.trim() ||
    "Una competencia para poner a prueba la creatividad, originalidad y puesta en escena.";

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

        {/* =====================================================
            HERO
        ===================================================== */}

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

            <p className="mt-12 text-sm font-semibold uppercase tracking-[0.4em] text-orange-400">
              Celebración
            </p>

            {/* NOMBRE */}

            <EditarTexto
              valor={evento.nombre}
              campo="nombre"
              eventoId={evento.id}
              claseTexto="mt-4 text-6xl font-black uppercase tracking-tight md:text-8xl"
            />

            {/* DESCRIPCIÓN */}

            <EditarTexto
              valor={evento.descripcion}
              campo="descripcion"
              eventoId={evento.id}
              multilinea
              claseTexto="mx-auto mt-8 max-w-3xl text-lg leading-8 text-zinc-300"
            />

          </div>
        </section>

        {/* =====================================================
            NUESTRA CELEBRACIÓN
        ===================================================== */}

        <section className="mx-auto max-w-5xl px-6 py-24">

          <div className="text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400">
              Nuestra celebración
            </p>

            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              UNA NOCHE PARA CELEBRAR
            </h2>

            {/* HISTORIA */}

            <div className="mt-8">

              <EditarTexto
                valor={historiaInicial}
                campo="historia"
                eventoId={evento.id}
                multilinea
                claseTexto="mx-auto max-w-3xl whitespace-pre-line text-lg leading-8 text-zinc-300"
              />

            </div>

          </div>

          {/* =====================================================
              TARJETAS
          ===================================================== */}

          <div className="mt-16 grid gap-6 md:grid-cols-2">

            {/* =================================================
                JUEGOS
            ================================================= */}

            <div className="rounded-3xl border border-orange-500/20 bg-black/50 p-8 backdrop-blur-sm transition duration-300 hover:border-orange-500/40 hover:bg-black/60">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/10 text-3xl">
                🎃
              </div>

              {/* TÍTULO EDITABLE */}

              <EditarTexto
                valor={juegosTitulo}
                campo="juegos_titulo"
                eventoId={evento.id}
                claseTexto="mt-6 text-2xl font-bold"
              />

              {/* DESCRIPCIÓN EDITABLE */}

              <EditarTexto
                valor={juegosDescripcion}
                campo="juegos_descripcion"
                eventoId={evento.id}
                multilinea
                claseTexto="mt-4 leading-7 text-zinc-400"
              />

            </div>

            {/* =================================================
                ORGANIZADOR
            ================================================= */}

            <div className="rounded-3xl border border-orange-500/20 bg-black/50 p-8 backdrop-blur-sm transition duration-300 hover:border-orange-500/40 hover:bg-black/60">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/10 text-3xl">
                👻
              </div>

              {/* TÍTULO EDITABLE */}

              <EditarTexto
                valor={organizadorTitulo}
                campo="organizador_titulo"
                eventoId={evento.id}
                claseTexto="mt-6 text-2xl font-bold"
              />

              {/* DESCRIPCIÓN EDITABLE */}

              <EditarTexto
                valor={organizadorDescripcion}
                campo="organizador_descripcion"
                eventoId={evento.id}
                multilinea
                claseTexto="mt-4 leading-7 text-zinc-400"
              />

            </div>

          </div>

        </section>

        {/* =====================================================
            TORNEO DE DISFRACES
        ===================================================== */}

        <section className="border-y border-white/10 bg-black/30">

          <div className="mx-auto max-w-6xl px-6 py-24">

            <div className="grid items-center gap-12 md:grid-cols-2">

              {/* IZQUIERDA */}

              <div>

                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400">
                  La gran competencia
                </p>

                {/* TÍTULO EDITABLE */}

                <EditarTexto
                  valor={disfracesTitulo}
                  campo="disfraces_titulo"
                  eventoId={evento.id}
                  multilinea
                  claseTexto="mt-4 text-4xl font-black md:text-6xl"
                />

                {/* DESCRIPCIÓN EDITABLE */}

                <EditarTexto
                  valor={disfracesDescripcion}
                  campo="disfraces_descripcion"
                  eventoId={evento.id}
                  multilinea
                  claseTexto="mt-8 max-w-xl text-lg leading-8 text-zinc-300"
                />

              </div>

              {/* DERECHA */}

              <div className="relative overflow-hidden rounded-3xl border border-orange-500/20 bg-black/50 p-10">

                <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-orange-500/10 blur-3xl" />

                <div className="relative text-center">

                  <p className="text-7xl">
                    🎃
                  </p>

                  <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-orange-400">
                    Halloween
                  </p>

                  {/* PREGUNTA EDITABLE */}

                  <EditarTexto
                    valor={disfracesPregunta}
                    campo="disfraces_pregunta"
                    eventoId={evento.id}
                    multilinea
                    claseTexto="mt-3 text-3xl font-black"
                  />

                  {/* SUBTEXTO EDITABLE */}

                  <EditarTexto
                    valor={disfracesSubtexto}
                    campo="disfraces_subtexto"
                    eventoId={evento.id}
                    multilinea
                    claseTexto="mt-4 text-zinc-400"
                  />

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            EDICIONES
        ===================================================== */}

        <section className="mx-auto max-w-7xl px-6 py-24">

          <div className="text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400">
              Archivo
            </p>

            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              EDICIONES
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-zinc-400">
              Las ediciones más recientes y el archivo histórico
              de Halloween.
            </p>

          </div>

          {!edicionesNormales.length &&
          !existeArchivoHistorico ? (

            <div className="mx-auto mt-14 max-w-2xl rounded-3xl border border-white/10 bg-black/40 px-8 py-16 text-center backdrop-blur-sm">

              <p className="text-5xl">
                👻
              </p>

              <h3 className="mt-6 text-2xl font-bold text-white">
                Próximamente
              </h3>

              <p className="mt-3 text-zinc-500">
                Todavía no hay ediciones registradas para Halloween.
              </p>

            </div>

          ) : (

            <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

              {edicionesNormales.map((edicion) => {

                const ganador =
                  ganadorPorEdicion.get(
                    edicion.id
                  );

                const imagenGanador =
                  imagenesGanadores[
                    String(edicion.año)
                  ];

                return (
                  <a
                    key={edicion.id}
                    href={`/eventos/halloween/${edicion.año}`}
                    className="group overflow-hidden rounded-3xl border border-white/10 bg-black/50 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-orange-500/40 hover:bg-black/70"
                  >

                    <div className="relative flex h-64 items-center justify-center overflow-hidden bg-black/60">

                      <img
                        src={
                          imagenGanador ??
                          "/logos/logohalloween.png"
                        }
                        alt={
                          ganador
                            ? nombreCorto(
                                ganador.nombre
                              )
                            : `Halloween ${edicion.año}`
                        }
                        className={
                          imagenGanador
                            ? "h-full w-full object-contain transition duration-500 group-hover:scale-[1.03]"
                            : "max-h-36 max-w-[80%] object-contain opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                        }
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

                      <div className="absolute bottom-5 left-6">

                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-400">
                          Edición
                        </p>

                        <p className="mt-1 text-3xl font-black text-white">
                          {edicion.año}
                        </p>

                      </div>

                    </div>

                    <div className="px-6 py-5">

                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-400">
                        Campeón
                      </p>

                      <p className="mt-1 text-lg font-bold text-white">
                        {ganador
                          ? nombreCorto(
                              ganador.nombre
                            )
                          : "Por definir"}
                      </p>

                      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">

                        <p className="text-sm text-zinc-400">
                          Ver edición
                        </p>

                        <span className="text-sm font-semibold text-orange-400 transition duration-300 group-hover:translate-x-1">
                          →
                        </span>

                      </div>

                    </div>

                  </a>
                );
              })}

              {/* EDICIONES HISTÓRICAS */}

              {existeArchivoHistorico && (
                <a
                  href="/eventos/halloween/2024"
                  className="group overflow-hidden rounded-3xl border border-orange-500/30 bg-black/50 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-orange-500/60 hover:bg-black/70"
                >

                  <div className="relative flex h-64 items-center justify-center overflow-hidden bg-black/60">

                    <img
                      src={
                        evento.logo ??
                        "/logos/logohalloween.png"
                      }
                      alt="Ediciones históricas de Halloween"
                      className="max-h-40 max-w-[82%] object-contain opacity-90 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

                    <div className="absolute bottom-5 left-6">

                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-400">
                        Archivo histórico
                      </p>

                      <p className="mt-1 text-2xl font-black uppercase leading-none text-white">
                        Ediciones
                        <br />
                        históricas
                      </p>

                    </div>

                  </div>

                  <div className="px-6 py-5">

                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-400">
                      Historia de Halloween
                    </p>

                    <p className="mt-1 text-lg font-bold text-white">
                      2018–2024
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">

                      <p className="text-sm text-zinc-400">
                        Ver archivo histórico
                      </p>

                      <span className="text-sm font-semibold text-orange-400 transition duration-300 group-hover:translate-x-1">
                        →
                      </span>

                    </div>

                  </div>

                </a>
              )}

            </div>
          )}

        </section>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer className="border-t border-white/10 bg-black/50 px-6 py-10">

          <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between">

            <p>
              THE GAME ARCHIVE
            </p>

            <p>
              Halloween · Juegos · Disfraces
            </p>

          </div>

        </footer>

      </div>
    </main>
  );
}