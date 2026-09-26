import { supabase } from "@/lib/supabase";
import GaleriaFotos from "@/app/components/GaleriaFotos";
import EditarTextoEdicion from "@/app/components/EditarTextoEdicion";

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
  edicion_id: number;
  persona_id: number;
  nombre: string;
  descripcion: string | null;
  imagen: string | null;
};

type Edicion = {
  id: number;
  evento_id: number;
  año: string;
  fecha: string;
  contenido: Record<string, unknown> | null;
};

type Prueba = {
  numero: string;
  nombre: string;
  descripcion: string;
  ganador: string;
};

type Reto = {
  numero: string;
  nombre: string;
  descripcion: string;
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
    "sebástian alejandro silva aguilera".toLowerCase()
  ) {
    return "Seba Silva";
  }

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

function obtenerContenido(
  contenido: Record<string, unknown> | null,
  campo: string,
  fallback: string
) {
  const valor = contenido?.[campo];

  if (typeof valor === "string" && valor.trim() !== "") {
    return valor;
  }

  return fallback;
}

export default async function FondaKakegurui2026Page() {
  // =====================================================
  // EVENTO
  // =====================================================

  const { data: evento, error: eventoError } = await supabase
    .from("eventos")
    .select("id, nombre, descripcion, logo, slug")
    .eq("slug", "fonda-kakegurui")
    .single();

  if (eventoError || !evento) {
    console.error("Error cargando evento:", eventoError);

    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-400">
            No se pudo cargar Fonda Kakegurui
          </h1>

          <p className="mt-3 text-zinc-400">
            El evento no pudo ser encontrado en Supabase.
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // EDICIÓN 2026
  // =====================================================

  const { data: edicionData, error: edicionError } =
    await supabase
      .from("ediciones")
      .select("*")
      .eq("evento_id", evento.id)
      .eq("año", "2026")
      .single();

  if (edicionError || !edicionData) {
    console.error("Error cargando edición:", edicionError);

    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-400">
            No se encontró la edición 2026
          </h1>

          <p className="mt-3 text-zinc-400">
            Revisa que la edición esté registrada en Supabase.
          </p>
        </div>
      </main>
    );
  }

  const edicion = edicionData as Edicion;

  const contenido =
    edicion.contenido &&
    typeof edicion.contenido === "object" &&
    !Array.isArray(edicion.contenido)
      ? edicion.contenido
      : {};

  // =====================================================
  // PARTICIPACIONES
  // =====================================================

  const {
    data: participaciones,
    error: participacionesError,
  } = await supabase
    .from("participaciones")
    .select(
      "id, persona_id, edicion_id, posicion, puntos_finales"
    )
    .eq("edicion_id", edicion.id)
    .order("posicion", {
      ascending: true,
      nullsFirst: false,
    });

  if (participacionesError) {
    console.error(
      "Error cargando participaciones:",
      participacionesError
    );
  }

  const listaParticipaciones: Participacion[] =
    participaciones ?? [];

  const personaIds = listaParticipaciones.map(
    (participacion) => participacion.persona_id
  );

  const { data: personas, error: personasError } =
    personaIds.length
      ? await supabase
          .from("personas")
          .select("id, nombre, imagen")
          .in("id", personaIds)
      : { data: [], error: null };

  if (personasError) {
    console.error(
      "Error cargando personas:",
      personasError
    );
  }

  const personaPorId = new Map(
    (personas ?? []).map((persona: Persona) => [
      persona.id,
      persona,
    ])
  );

  // =====================================================
  // CAMPEÓN
  // =====================================================

  const participacionGanadora =
    listaParticipaciones.find(
      (participacion) =>
        participacion.posicion === 1
    );

  const campeon = participacionGanadora
    ? personaPorId.get(
        participacionGanadora.persona_id
      )
    : undefined;

  // =====================================================
  // PREMIO
  // =====================================================

  const {
    data: premio,
    error: premioError,
  } = await supabase
    .from("premios")
    .select(
      "edicion_id, persona_id, nombre, descripcion, imagen"
    )
    .eq("edicion_id", edicion.id)
    .maybeSingle();

  if (premioError) {
    console.error(
      "Error cargando premio:",
      premioError
    );
  }

  const premioCampeon: Premio | null =
    premio ?? null;

  const imagenCampeon =
    premioCampeon?.imagen ??
    "/campeones/cristobal2026.png";

  // =====================================================
  // PODIO
  // =====================================================

  const podio = listaParticipaciones
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

  // =====================================================
  // CONTENIDO EDITABLE
  // =====================================================

  const heroDescripcion = obtenerContenido(
    contenido,
    "hero_descripcion",
    "Una nueva edición de Fonda Kakegurui, esta vez convertida en una competencia de puntos donde cada prueba podía cambiar completamente la clasificación."
  );

  const edicionTitulo = obtenerContenido(
    contenido,
    "edicion_titulo",
    "UNA COMPETENCIA DE PUNTOS"
  );

  const edicionParrafo1 = obtenerContenido(
    contenido,
    "edicion_parrafo_1",
    "En 2026 Fonda Kakegurui tomó una nueva forma. Los juegos fueron diseñados por Gonza y se creó un sistema de puntos que permitió acumular ventajas a lo largo de toda la jornada."
  );

  const edicionParrafo2 = obtenerContenido(
    contenido,
    "edicion_parrafo_2",
    "Cada prueba entregaba puntos y los participantes podían modificar su posición mediante diferentes retos y mecánicas especiales."
  );

  const edicionParrafo3 = obtenerContenido(
    contenido,
    "edicion_parrafo_3",
    "Al final de la competencia, quien tuviera la mayor cantidad de puntos se convertiría en el campeón de Fonda Kakegurui 2026."
  );

  const pruebasDescripcion = obtenerContenido(
    contenido,
    "pruebas_descripcion",
    "Cinco pruebas principales fueron parte del sistema de puntuación de esta edición."
  );

  const retosDescripcion = obtenerContenido(
    contenido,
    "retos_descripcion",
    "La competencia no dependía solamente de los juegos. También existían retos capaces de alterar la distribución de puntos."
  );

  const sistemaPuntosDescripcion = obtenerContenido(
    contenido,
    "sistema_puntos_descripcion",
    "Cada participante comenzó a construir su puntuación a través de las diferentes pruebas y retos de la jornada."
  );

  const campeonDescripcion = obtenerContenido(
    contenido,
    "campeon_descripcion",
    `Después de completar las diferentes pruebas y aprovechar el sistema de puntos, ${
      campeon
        ? nombreWeb(campeon.nombre)
        : "Cristóbal Urrutia"
    } terminó en el primer lugar de la competencia.`
  );

  const premioDescripcion = obtenerContenido(
    contenido,
    "premio_descripcion",
    "🏆 Recibió un premio por convertirse en el campeón."
  );

  // =====================================================
  // PRUEBAS
  // =====================================================

  const pruebas: Prueba[] = [
    {
      numero: "01",
      nombre: obtenerContenido(
        contenido,
        "prueba_01_nombre",
        "Números"
      ),
      descripcion: obtenerContenido(
        contenido,
        "prueba_01_descripcion",
        "Puzzle de adivinar el número de los compañeros."
      ),
      ganador: obtenerContenido(
        contenido,
        "prueba_01_ganador",
        "Fefi"
      ),
    },
    {
      numero: "02",
      nombre: obtenerContenido(
        contenido,
        "prueba_02_nombre",
        "Trivia de Chile"
      ),
      descripcion: obtenerContenido(
        contenido,
        "prueba_02_descripcion",
        "10 preguntas sobre Chile."
      ),
      ganador: obtenerContenido(
        contenido,
        "prueba_02_ganador",
        "Cristóbal"
      ),
    },
    {
      numero: "03",
      nombre: obtenerContenido(
        contenido,
        "prueba_03_nombre",
        "Si se la sabe"
      ),
      descripcion: obtenerContenido(
        contenido,
        "prueba_03_descripcion",
        "10 canciones en las que había que indicar el nombre y el autor."
      ),
      ganador: obtenerContenido(
        contenido,
        "prueba_03_ganador",
        "Leslie"
      ),
    },
    {
      numero: "04",
      nombre: obtenerContenido(
        contenido,
        "prueba_04_nombre",
        "Dardos"
      ),
      descripcion: obtenerContenido(
        contenido,
        "prueba_04_descripcion",
        "Tirar 6 dardos."
      ),
      ganador: obtenerContenido(
        contenido,
        "prueba_04_ganador",
        "Cristian"
      ),
    },
    {
      numero: "05",
      nombre: obtenerContenido(
        contenido,
        "prueba_05_nombre",
        "Emboque"
      ),
      descripcion: obtenerContenido(
        contenido,
        "prueba_05_descripcion",
        "Intentar embocar 10 veces."
      ),
      ganador: obtenerContenido(
        contenido,
        "prueba_05_ganador",
        "Cristóbal"
      ),
    },
  ];

  // =====================================================
  // RETOS
  // =====================================================

  const retos: Reto[] = [
    {
      numero: "01",
      nombre: obtenerContenido(
        contenido,
        "reto_01_nombre",
        "Gana reto"
      ),
      descripcion: obtenerContenido(
        contenido,
        "reto_01_descripcion",
        "El ganador obtiene 300 puntos."
      ),
    },
    {
      numero: "02",
      nombre: obtenerContenido(
        contenido,
        "reto_02_nombre",
        "Cultura Chupística"
      ),
      descripcion: obtenerContenido(
        contenido,
        "reto_02_descripcion",
        "Reto especial dentro de la competencia."
      ),
    },
    {
      numero: "03",
      nombre: obtenerContenido(
        contenido,
        "reto_03_nombre",
        "¿Cuánto vale?"
      ),
      descripcion: obtenerContenido(
        contenido,
        "reto_03_descripcion",
        "Un reto para poner a prueba la capacidad de estimar."
      ),
    },
    {
      numero: "04",
      nombre: obtenerContenido(
        contenido,
        "reto_04_nombre",
        "Apuesta de Cachipún"
      ),
      descripcion: obtenerContenido(
        contenido,
        "reto_04_descripcion",
        "Los participantes podían apostar puntos en cachipún."
      ),
    },
    {
      numero: "05",
      nombre: obtenerContenido(
        contenido,
        "reto_05_nombre",
        "Regala 600"
      ),
      descripcion: obtenerContenido(
        contenido,
        "reto_05_descripcion",
        "El participante debía regalar 600 puntos a 2 personas."
      ),
    },
  ];

  return (
    <main
      className="relative min-h-screen bg-cover bg-center bg-fixed text-white"
      style={{
        backgroundImage:
          "url('/eventos/fonda.png')",
      }}
    >
      <div className="fixed inset-0 z-0 bg-black/60" />

      <div className="relative z-10">

        {/* ================================================= */}
        {/* HERO */}
        {/* ================================================= */}

        <section className="relative overflow-hidden border-b border-white/10">

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.3),_transparent_50%)]" />

          <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 py-28 text-center">

            <img
              src="/logos/logokakegurui.png"
              alt="Fonda Kakegurui"
              className="max-h-72 max-w-md object-contain"
            />

            <p className="mt-12 text-sm font-semibold uppercase tracking-[0.4em] text-violet-400">
              Segunda edición
            </p>

            <h1 className="mt-4 text-6xl font-black md:text-8xl">
              FONDA KAKEGURUI
            </h1>

            <p className="mt-4 text-3xl font-bold text-white/80">
              2026
            </p>

            <div className="relative mx-auto mt-8 max-w-3xl">
              <EditarTextoEdicion
                valor={heroDescripcion}
                campo="hero_descripcion"
                edicionId={edicion.id}
                multilinea
                claseTexto="text-lg leading-8 text-zinc-300"
              />
            </div>

          </div>
        </section>

        {/* ================================================= */}
        {/* LA EDICIÓN */}
        {/* ================================================= */}

        <section className="mx-auto max-w-4xl px-6 py-24 text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
            La edición
          </p>

          <div className="relative mt-4">
            <EditarTextoEdicion
              valor={edicionTitulo}
              campo="edicion_titulo"
              edicionId={edicion.id}
              claseTexto="text-4xl font-bold md:text-5xl"
            />
          </div>

          <div className="mt-8 space-y-6">

            <EditarTextoEdicion
              valor={edicionParrafo1}
              campo="edicion_parrafo_1"
              edicionId={edicion.id}
              multilinea
              claseTexto="text-lg leading-8 text-zinc-300"
            />

            <EditarTextoEdicion
              valor={edicionParrafo2}
              campo="edicion_parrafo_2"
              edicionId={edicion.id}
              multilinea
              claseTexto="text-lg leading-8 text-zinc-300"
            />

            <EditarTextoEdicion
              valor={edicionParrafo3}
              campo="edicion_parrafo_3"
              edicionId={edicion.id}
              multilinea
              claseTexto="text-lg leading-8 text-zinc-300"
            />

          </div>

        </section>

        {/* ================================================= */}
        {/* PRUEBAS */}
        {/* ================================================= */}

        <section className="border-y border-white/10 bg-black/40">

          <div className="mx-auto max-w-7xl px-6 py-24">

            <div className="text-center">

              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
                Las pruebas
              </p>

              <h2 className="mt-4 text-5xl font-black md:text-6xl">
                JUEGOS
              </h2>

              <div className="relative mx-auto mt-5 max-w-2xl">
                <EditarTextoEdicion
                  valor={pruebasDescripcion}
                  campo="pruebas_descripcion"
                  edicionId={edicion.id}
                  multilinea
                  claseTexto="text-zinc-300"
                />
              </div>

            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {pruebas.map((prueba) => {

                const numero =
                  prueba.numero;

                return (
                  <div
                    key={numero}
                    className="group rounded-3xl border border-white/10 bg-zinc-900/90 p-8 transition duration-300 hover:-translate-y-2 hover:border-violet-500/50"
                  >

                    <div className="flex items-center justify-between">

                      <span className="text-4xl font-black text-white/10">
                        {prueba.numero}
                      </span>

                      <span className="rounded-full border border-violet-500/30 px-3 py-1 text-xs font-bold uppercase tracking-widest text-violet-400">
                        PRUEBA
                      </span>

                    </div>

                    <div className="relative mt-8">
                      <EditarTextoEdicion
                        valor={prueba.nombre}
                        campo={`prueba_${numero}_nombre`}
                        edicionId={edicion.id}
                        claseTexto="text-3xl font-black"
                      />
                    </div>

                    <div className="relative mt-4">
                      <EditarTextoEdicion
                        valor={prueba.descripcion}
                        campo={`prueba_${numero}_descripcion`}
                        edicionId={edicion.id}
                        multilinea
                        claseTexto="min-h-20 leading-7 text-zinc-400"
                      />
                    </div>

                    <div className="mt-8 border-t border-white/10 pt-6">

                      <p className="text-xs uppercase tracking-widest text-zinc-500">
                        Ganador
                      </p>

                      <div className="relative mt-2">
                        <EditarTextoEdicion
                          valor={prueba.ganador}
                          campo={`prueba_${numero}_ganador`}
                          edicionId={edicion.id}
                          claseTexto="text-xl font-bold text-violet-400"
                        />
                      </div>

                    </div>

                  </div>
                );
              })}

            </div>

          </div>
        </section>

        {/* ================================================= */}
        {/* RETOS */}
        {/* ================================================= */}

        <section className="mx-auto max-w-7xl px-6 py-24">

          <div className="text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
              Mecánicas especiales
            </p>

            <h2 className="mt-4 text-5xl font-black md:text-6xl">
              LOS RETOS
            </h2>

            <div className="relative mx-auto mt-5 max-w-2xl">
              <EditarTextoEdicion
                valor={retosDescripcion}
                campo="retos_descripcion"
                edicionId={edicion.id}
                multilinea
                claseTexto="text-zinc-400"
              />
            </div>

          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-5">

            {retos.map((reto) => (

              <div
                key={reto.numero}
                className="rounded-3xl border border-white/10 bg-zinc-900/90 p-7 transition duration-300 hover:-translate-y-2 hover:border-violet-500/50"
              >

                <p className="text-4xl font-black text-violet-500/40">
                  {reto.numero}
                </p>

                <div className="relative mt-6">
                  <EditarTextoEdicion
                    valor={reto.nombre}
                    campo={`reto_${reto.numero}_nombre`}
                    edicionId={edicion.id}
                    claseTexto="text-xl font-black"
                  />
                </div>

                <div className="relative mt-4">
                  <EditarTextoEdicion
                    valor={reto.descripcion}
                    campo={`reto_${reto.numero}_descripcion`}
                    edicionId={edicion.id}
                    multilinea
                    claseTexto="text-sm leading-6 text-zinc-400"
                  />
                </div>

              </div>

            ))}

          </div>

        </section>

        {/* ================================================= */}
        {/* SISTEMA DE PUNTOS */}
        {/* ================================================= */}

        <section className="border-y border-white/10 bg-black/40">

          <div className="mx-auto max-w-5xl px-6 py-24">

            <div className="text-center">

              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
                La mecánica
              </p>

              <h2 className="mt-4 text-5xl font-black md:text-6xl">
                EL SISTEMA DE PUNTOS
              </h2>

              <div className="relative mx-auto mt-6 max-w-2xl">
                <EditarTextoEdicion
                  valor={sistemaPuntosDescripcion}
                  campo="sistema_puntos_descripcion"
                  edicionId={edicion.id}
                  multilinea
                  claseTexto="text-zinc-400"
                />
              </div>

            </div>

            <div className="mt-14 overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/90">

              <div className="grid grid-cols-2 border-b border-white/10 bg-black/30 px-6 py-5 text-xs font-bold uppercase tracking-widest text-zinc-500 md:grid-cols-3">

                <span>
                  Participante
                </span>

                <span className="text-right md:text-left">
                  Puntos
                </span>

                <span className="hidden text-right md:block">
                  Posición
                </span>

              </div>

              {listaParticipaciones.map(
                (participacion, index) => {

                  const persona =
                    personaPorId.get(
                      participacion.persona_id
                    );

                  if (!persona) {
                    return null;
                  }

                  const puntos =
                    participacion.puntos_finales ?? 0;

                  return (
                    <div
                      key={participacion.id}
                      className={`grid grid-cols-2 items-center border-b border-white/5 px-6 py-5 last:border-0 md:grid-cols-3 ${
                        index === 0
                          ? "bg-violet-950/30"
                          : ""
                      }`}
                    >

                      <div className="flex items-center gap-4">

                        <span className="w-6 text-sm font-bold text-zinc-600">
                          {index + 1}
                        </span>

                        <span className="font-bold">
                          {nombreWeb(
                            persona.nombre
                          )}
                        </span>

                      </div>

                      <span className="text-right text-xl font-black md:text-left">
                        {puntos.toLocaleString(
                          "es-CL"
                        )}
                      </span>

                      <span className="hidden text-right text-sm uppercase tracking-widest text-zinc-500 md:block">
                        {index === 0
                          ? "CAMPEÓN"
                          : `${index + 1}°`}
                      </span>

                    </div>
                  );
                }
              )}

            </div>

          </div>
        </section>

        {/* ================================================= */}
        {/* PODIO */}
        {/* ================================================= */}

        <section className="border-y border-white/10 bg-black/40">

          <div className="mx-auto max-w-5xl px-6 py-24">

            <div className="text-center">

              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
                Clasificación final
              </p>

              <h2 className="mt-4 text-5xl font-black">
                EL PODIO
              </h2>

            </div>

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
                    className={`rounded-3xl border p-8 text-center ${
                      posicion === 1
                        ? "border-violet-500/50 bg-violet-950/40"
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
                      {posicion}° lugar
                    </p>

                    <h3 className="mt-2 text-2xl font-black">
                      {nombreWeb(
                        jugador.nombre
                      )}
                    </h3>

                    <p className="mt-3 text-xl font-bold text-violet-400">
                      {(
                        participacion.puntos_finales ??
                        0
                      ).toLocaleString(
                        "es-CL"
                      )}{" "}
                      pts
                    </p>

                  </div>
                );
              })}

            </div>

          </div>
        </section>

        {/* ================================================= */}
        {/* CAMPEÓN */}
        {/* ================================================= */}

        <section className="mx-auto max-w-7xl px-6 py-28">

          <div className="text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
              Resultado final
            </p>

            <h2 className="mt-4 text-5xl font-black md:text-6xl">
              EL CAMPEÓN
            </h2>

          </div>

          <div className="mt-14 overflow-hidden rounded-3xl border border-violet-500/30 bg-zinc-900/90">

            <div className="grid min-h-[650px] md:grid-cols-2">

              {/* INFORMACIÓN */}

              <div className="flex flex-col justify-center p-10 text-center md:p-16">

                <span className="text-8xl">
                  👑
                </span>

                <p className="mt-8 text-sm uppercase tracking-[0.3em] text-violet-400">
                  Campeón Fonda Kakegurui 2026
                </p>

                <h3 className="mt-4 text-5xl font-black md:text-6xl">
                  {campeon
                    ? nombreWeb(campeon.nombre)
                    : "Cristóbal Urrutia"}
                </h3>

                <div className="mx-auto mt-8 rounded-2xl border border-violet-500/30 bg-violet-950/30 px-8 py-5">

                  <p className="text-xs uppercase tracking-widest text-zinc-500">
                    Puntuación final
                  </p>

                  <p className="mt-2 text-4xl font-black text-violet-400">
                    {participacionGanadora?.puntos_finales?.toLocaleString(
                      "es-CL"
                    ) ?? "6.300"}
                  </p>

                </div>

                <div className="relative mt-8">
                  <EditarTextoEdicion
                    valor={campeonDescripcion}
                    campo="campeon_descripcion"
                    edicionId={edicion.id}
                    multilinea
                    claseTexto="text-lg leading-8 text-zinc-300"
                  />
                </div>

                <div className="mt-8">

                  <p className="text-sm uppercase tracking-widest text-zinc-500">
                    Premio
                  </p>

                  <div className="relative mt-2">
                    <EditarTextoEdicion
                      valor={premioDescripcion}
                      campo="premio_descripcion"
                      edicionId={edicion.id}
                      multilinea
                      claseTexto="text-xl font-bold"
                    />
                  </div>

                </div>

              </div>

              {/* FOTO DEL CAMPEÓN */}

              <div className="relative min-h-[650px] overflow-hidden bg-zinc-900/90">

                <img
                  src={imagenCampeon}
                  alt={
                    campeon
                      ? nombreWeb(
                          campeon.nombre
                        )
                      : "Cristóbal Urrutia"
                  }
                  className="absolute bottom-0 left-0 h-full w-auto max-w-none object-contain object-left-bottom"
                />

                <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-zinc-900/60 to-transparent" />

              </div>

            </div>

          </div>

        </section>

        {/* ================================================= */}
        {/* GALERÍA */}
        {/* ================================================= */}

        <GaleriaFotos
          edicionId={edicion.id}
        />

        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <footer className="border-t border-white/10 bg-black/50 px-6 py-10">

          <div className="mx-auto flex max-w-7xl justify-between text-sm text-zinc-500">

            <p>
              THE GAME ARCHIVE
            </p>

            <p>
              Fonda Kakegurui · Segunda edición · 2026
            </p>

          </div>

        </footer>

      </div>
    </main>
  );
}