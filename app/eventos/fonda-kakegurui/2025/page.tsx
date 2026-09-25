import { supabase } from "@/lib/supabase";
import GaleriaFotos from "@/app/components/GaleriaFotos";

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
  edicion_id: number;
  persona_id: number;
  nombre: string;
  descripcion: string | null;
  imagen: string | null;
};

const grupos = [
  {
    numero: "01",
    participantes: ["Camilo", "Angelo", "Seba Martínez"],
    ganador: "Angelo",
  },
  {
    numero: "02",
    participantes: ["Seba Silva", "Javier", "Ricardo"],
    ganador: "Seba Silva",
  },
  {
    numero: "03",
    participantes: ["Gonza", "Fefi", "Jeimy"],
    ganador: "Gonza",
  },
];

const finalistas = [
  {
    nombre: "Angelo",
    emoji: "🏆",
  },
  {
    nombre: "Seba Silva",
    emoji: "🎯",
  },
  {
    nombre: "Gonza",
    emoji: "🎯",
  },
];

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

export default async function FondaKakegurui2025Page() {
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

  const { data: edicion, error: edicionError } = await supabase
    .from("ediciones")
    .select("*")
    .eq("evento_id", evento.id)
    .eq("año", "2025")
    .single();

  if (edicionError || !edicion) {
    console.error("Error cargando edición:", edicionError);

    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-400">
            No se encontró la edición 2025
          </h1>

          <p className="mt-3 text-zinc-400">
            Revisa que la edición esté registrada en Supabase.
          </p>
        </div>
      </main>
    );
  }

  const {
    data: participaciones,
    error: participacionesError,
  } = await supabase
    .from("participaciones")
    .select("id, persona_id, edicion_id, posicion, puntos_finales")
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
    console.error("Error cargando personas:", personasError);
  }

  const personaPorId = new Map(
    (personas ?? []).map((persona: Persona) => [
      persona.id,
      persona,
    ])
  );

  /*
   * La imagen del campeón pertenece al premio de la edición,
   * no a la foto personal de la persona.
   */
  const { data: premio, error: premioError } = await supabase
    .from("premios")
    .select(
      "edicion_id, persona_id, nombre, descripcion, imagen"
    )
    .eq("edicion_id", edicion.id)
    .maybeSingle();

  if (premioError) {
    console.error("Error cargando premio:", premioError);
  }

  const premioCampeon: Premio | null = premio ?? null;

  const participacionGanadora = listaParticipaciones.find(
    (participacion) => participacion.posicion === 1
  );

  const campeon = participacionGanadora
    ? personaPorId.get(participacionGanadora.persona_id)
    : undefined;

  const podio = listaParticipaciones
    .filter(
      (participacion) =>
        participacion.posicion !== null &&
        participacion.posicion <= 3
    )
    .sort(
      (a, b) =>
        (a.posicion ?? 99) - (b.posicion ?? 99)
    );

  /*
   * Fuente principal:
   * premios.imagen
   *
   * Fallback:
   * imagen histórica conocida del campeón.
   */
  const imagenCampeon =
    premioCampeon?.imagen ??
    "/campeones/angeloperez.png";

  return (
    <main
      className="relative min-h-screen bg-cover bg-center bg-fixed text-white"
      style={{
        backgroundImage: "url('/eventos/fonda.png')",
      }}
    >
      <div className="fixed inset-0 z-0 bg-black/60" />

      <div className="relative z-10">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.25),_transparent_50%)]" />

          <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 py-28 text-center">
            {evento.logo && (
              <img
                src={evento.logo}
                alt="Fonda Kakegurui"
                className="max-h-72 max-w-md object-contain"
              />
            )}

            <p className="mt-12 text-sm font-semibold uppercase tracking-[0.4em] text-violet-400">
              Primera edición
            </p>

            <h1 className="mt-4 text-6xl font-black md:text-8xl">
              FONDA KAKEGURUI
            </h1>

            <p className="mt-4 text-3xl font-bold text-white/80">
              2025
            </p>

            <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-zinc-300">
              La primera edición de Fonda Kakegurui, una jornada
              de juegos, competencia y celebración de Fiestas
              Patrias organizada por Gonza.
            </p>
          </div>
        </section>

        {/* INTRODUCCIÓN */}
        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
            El comienzo
          </p>

          <h2 className="mt-4 text-4xl font-bold md:text-5xl">
            ¿Cómo fue esta edición?
          </h2>

          <div className="mt-8 space-y-6 text-lg leading-8 text-zinc-300">
            <p>
              Esta edición fue organizada por Gonza y contó con
              varios juegos y actividades para celebrar las
              Fiestas Patrias.
            </p>

            <p>
              A diferencia de otras competencias, los juegos no
              tuvieron puntajes generales. La excepción fue el
              torneo de emboque, que tuvo su propio sistema de
              clasificación y una final para determinar al
              ganador.
            </p>

            <p>
              Con nueve participantes, la competencia se dividió
              inicialmente en tres grupos de tres personas.
              Quienes ganaban cada grupo avanzaban a la gran final.
            </p>
          </div>
        </section>

        {/* TORNEO DE EMBOQUE */}
        <section className="border-y border-white/10 bg-black/40">
          <div className="mx-auto max-w-7xl px-6 py-24">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
                La competencia
              </p>

              <h2 className="mt-4 text-5xl font-black md:text-6xl">
                TORNEO DE EMBOQUE
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-zinc-300">
                Nueve participantes. Tres grupos. Tres ganadores.
                Una final para definir al campeón.
              </p>
            </div>

            {/* GRUPOS */}
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {grupos.map((grupo) => (
                <div
                  key={grupo.numero}
                  className="rounded-3xl border border-white/10 bg-zinc-900/90 p-8 transition duration-300 hover:-translate-y-2 hover:border-violet-500/50"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-violet-400">
                      GRUPO {grupo.numero}
                    </p>

                    <span className="text-xs uppercase tracking-widest text-zinc-600">
                      3 JUGADORES
                    </span>
                  </div>

                  <div className="mt-8 space-y-4">
                    {grupo.participantes.map((participante) => (
                      <div
                        key={participante}
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                          participante === grupo.ganador
                            ? "border-violet-500/40 bg-violet-950/40"
                            : "border-white/5 bg-black/20"
                        }`}
                      >
                        <span className="font-semibold">
                          {participante}
                        </span>

                        {participante === grupo.ganador && (
                          <span className="text-xs font-bold uppercase tracking-widest text-violet-400">
                            GANADOR
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 border-t border-white/10 pt-6">
                    <p className="text-xs uppercase tracking-widest text-zinc-500">
                      Clasificado a la final
                    </p>

                    <p className="mt-2 text-xl font-bold">
                      {grupo.ganador}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* FINAL */}
            <div className="mx-auto mt-12 max-w-4xl rounded-3xl border border-violet-500/30 bg-violet-950/30 p-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
                Gran final
              </p>

              <h3 className="mt-4 text-4xl font-black">
                LOS TRES FINALISTAS
              </h3>

              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {finalistas.map((finalista) => (
                  <div
                    key={finalista.nombre}
                    className="rounded-2xl border border-white/10 bg-black/30 p-6"
                  >
                    <span className="text-4xl">
                      {finalista.emoji}
                    </span>

                    <p className="mt-4 text-xs uppercase tracking-widest text-zinc-500">
                      Finalista
                    </p>

                    <p className="mt-2 text-xl font-bold">
                      {finalista.nombre}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PODIO */}
        <section className="mx-auto max-w-6xl px-6 py-28">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
              Resultado
            </p>

            <h2 className="mt-4 text-5xl font-black md:text-6xl">
              EL PODIO
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-zinc-400">
              Así terminó el torneo de emboque de Fonda Kakegurui
              2025.
            </p>
          </div>

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
                  className={`rounded-3xl border p-8 text-center transition duration-300 hover:-translate-y-2 ${
                    posicion === 1
                      ? "border-violet-500/50 bg-violet-950/40"
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

                  <p className="mt-10 text-sm uppercase tracking-[0.3em] text-violet-400">
                    {posicion}° lugar
                  </p>

                  <h3 className="mt-6 text-3xl font-black">
                    {nombreWeb(jugador.nombre)}
                  </h3>
                </div>
              );
            })}
          </div>
        </section>

        {/* CAMPEÓN */}
        <section className="border-y border-white/10 bg-black/40">
          <div className="mx-auto max-w-6xl px-6 py-28">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/90">
              <div className="grid min-h-[600px] md:grid-cols-2">
                {/* INFORMACIÓN */}
                <div className="flex flex-col justify-center p-10 text-center md:p-14">
                  <p className="text-sm uppercase tracking-[0.3em] text-violet-400">
                    Campeón
                  </p>

                  <h2 className="mt-4 text-5xl font-black">
                    {campeon
                      ? nombreWeb(campeon.nombre)
                      : "Angelo Perez"}
                  </h2>

                  <div className="mt-8 flex justify-center">
                    <span className="text-7xl">👑</span>
                  </div>

                  <p className="mt-8 text-xl leading-8 text-zinc-300">
                    Ganador del primer torneo de emboque de
                    Fonda Kakegurui.
                  </p>

                  <a
                    href="/eventos/fonda-kakegurui"
                    className="mx-auto mt-8 w-fit rounded-full border border-white/20 px-7 py-3 text-sm font-semibold transition hover:bg-white hover:text-black"
                  >
                    VOLVER AL EVENTO →
                  </a>
                </div>

                {/* FOTO DEL CAMPEÓN */}
                <div className="relative min-h-[600px] overflow-hidden bg-zinc-900/90">
                  <img
                    src={imagenCampeon}
                    alt={
                      campeon
                        ? nombreWeb(campeon.nombre)
                        : "Angelo Perez"
                    }
                    className="absolute bottom-0 left-0 h-full w-auto max-w-none object-contain object-left-bottom"
                  />

                  <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-zinc-900/60 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MOMENTO DESTACADO */}
        <section className="mx-auto max-w-4xl px-6 py-28 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
            Momento destacado
          </p>

          <h2 className="mt-4 text-5xl font-black md:text-6xl">
            LA PUERTA DE CAMILO
          </h2>

          <p className="mx-auto mt-8 text-lg leading-8 text-zinc-300">
            Toda edición tiene sus momentos memorables. Esta
            tuvo uno que merece una disculpa pública.
          </p>

          <div className="mx-auto mt-10 rounded-3xl border border-white/10 bg-zinc-900/90 p-10">
            <p className="text-3xl font-black">
              Perdón, Camilo.
            </p>

            <p className="mt-5 text-xl text-zinc-400">
              Públicamente queremos pedirle disculpas a Camilo
              por agujerear su puerta :c
            </p>
          </div>
        </section>

        {/* GALERÍA */}
        <GaleriaFotos edicionId={edicion.id} />

        {/* FOOTER */}
        <footer className="border-t border-white/10 bg-black/40 px-6 py-10">
          <div className="mx-auto flex max-w-7xl justify-between text-sm text-zinc-500">
            <p>THE GAME ARCHIVE</p>

            <p>
              Fonda Kakegurui · Primera edición · 2025
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}