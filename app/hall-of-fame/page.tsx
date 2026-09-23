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

export default async function HallOfFamePage() {
  const { data: eventosData, error: eventosError } =
    await supabase
      .from("eventos")
      .select("id, nombre, logo, slug")
      .order("nombre");

  if (eventosError) {
    console.error("Error cargando eventos:", eventosError);
  }

  const eventos: Evento[] = eventosData ?? [];

  const eventoIds = eventos.map((evento) => evento.id);

  const { data: edicionesData, error: edicionesError } =
    eventoIds.length
      ? await supabase
          .from("ediciones")
          .select("id, evento_id, año, fecha")
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
  }

  const ediciones: Edicion[] = edicionesData ?? [];

  const edicionIds = ediciones.map(
    (edicion) => edicion.id
  );

  const { data: premiosData, error: premiosError } =
    edicionIds.length
      ? await supabase
          .from("premios")
          .select(
            "id, persona_id, edicion_id, nombre, descripcion"
          )
          .in("edicion_id", edicionIds)
      : { data: [], error: null };

  if (premiosError) {
    console.error("Error cargando premios:", premiosError);
  }

  const premios: Premio[] = premiosData ?? [];

  const { data: participacionesData, error: participacionesError } =
    edicionIds.length
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
  }

  const participaciones: Participacion[] =
    participacionesData ?? [];

  const personaIds = [
    ...new Set([
      ...premios.map((premio) => premio.persona_id),
      ...participaciones.map(
        (participacion) => participacion.persona_id
      ),
    ]),
  ];

  const { data: personasData, error: personasError } =
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

  const personas: Persona[] = personasData ?? [];

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

  const participacionPorEdicion = new Map(
    participaciones.map((participacion) => [
      participacion.edicion_id,
      participacion,
    ])
  );

  const campeones: Campeon[] = ediciones
    .map((edicion) => {
      const evento = eventoPorId.get(
        edicion.evento_id
      );

      if (!evento) {
        return null;
      }

      const premio = premioPorEdicion.get(
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

      const persona = personaPorId.get(
        personaId
      );

      if (!persona) {
        return null;
      }

      return {
        edicionId: edicion.id,
        año: edicion.año,
        fecha: edicion.fecha,
        evento: evento.nombre,
        slug: evento.slug,
        logo: evento.logo,
        winner: nombreCorto(persona.nombre),
        image: persona.imagen,
        title: tituloCampeon(
          premio?.nombre
        ),
      };
    })
    .filter(
      (campeon): campeon is Campeon =>
        campeon !== null
    )
    .sort((a, b) =>
      b.fecha.localeCompare(a.fecha)
    );

  return (
    <main
      className="relative min-h-screen bg-cover bg-center bg-fixed text-white"
      style={{
        backgroundImage:
          "url('/eventos/hall.png')",
      }}
    >
      <div className="fixed inset-0 z-0 bg-black/20" />

      <div className="relative z-10">
        {/* HEADER */}
        <section className="border-b border-white/10">
          <div className="mx-auto max-w-7xl px-6 py-24 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-violet-400">
              Los que hicieron historia
            </p>

            <h1 className="mt-4 text-6xl font-black md:text-8xl">
              HALL OF FAME
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
              Los campeones y campeonas que han dejado su
              nombre en la historia de nuestros eventos
            </p>
          </div>
        </section>

        {/* CAMPEONES */}
        <section className="mx-auto max-w-7xl px-6 py-24">
          {campeones.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-zinc-900/90 p-12 text-center">
              <p className="text-zinc-400">
                Todavía no hay campeones registrados.
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {campeones.map((campeon) => (
                <a
                  key={campeon.edicionId}
                  href={`/eventos/${campeon.slug}/${campeon.año}`}
                  className="group block overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/90 transition duration-300 hover:-translate-y-2 hover:border-violet-500/50"
                >
                  {/* FOTO */}
                  <div className="relative h-[420px] overflow-hidden bg-black">
                    {campeon.image ? (
                      <img
                        src={campeon.image}
                        alt={campeon.winner}
                        className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <img
                          src={
                            campeon.logo ??
                            "/logos/logokakegurui.png"
                          }
                          alt={campeon.evento}
                          className="max-h-48 max-w-[70%] object-contain opacity-50"
                        />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

                    <div className="absolute right-6 top-6 rounded-full border border-violet-400/30 bg-black/70 px-4 py-2 text-xs font-bold uppercase tracking-widest text-violet-300 backdrop-blur-md">
                      {campeon.title}
                    </div>

                    <div className="absolute bottom-6 left-6">
                      <p className="text-sm uppercase tracking-[0.3em] text-violet-400">
                        {campeon.año}
                      </p>

                      <h2 className="mt-2 text-4xl font-black">
                        {campeon.winner}
                      </h2>
                    </div>
                  </div>

                  {/* INFORMACIÓN */}
                  <div className="p-7">
                    <div className="mb-6 flex justify-center">
                      {campeon.logo && (
                        <img
                          src={campeon.logo}
                          alt={`Logo ${campeon.evento}`}
                          className="h-16 max-w-[180px] object-contain"
                        />
                      )}
                    </div>

                    <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                      Evento
                    </p>

                    <p className="mt-2 text-xl font-bold">
                      {campeon.evento}
                    </p>

                    <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                      <p className="text-sm text-zinc-500">
                        {campeon.title.toUpperCase()} ·{" "}
                        {campeon.año}
                      </p>

                      <span className="text-sm font-semibold text-violet-400 opacity-0 transition duration-300 group-hover:opacity-100">
                        VER EVENTO →
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/10 bg-black/40 px-6 py-10">
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