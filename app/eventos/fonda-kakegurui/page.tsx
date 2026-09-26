import { supabase } from "@/lib/supabase";
import EditarTexto from "@/app/components/EditarTexto";

type Evento = {
  id: number;
  nombre: string;
  descripcion: string;
  logo: string | null;
  slug: string;
  historia: string | null;
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
  edicion_id: number;
  persona_id: number;
  nombre: string;
  descripcion: string | null;
  imagen: string | null;
};

export default async function FondaKakeguruiPage() {
  const {
    data: evento,
    error: eventoError,
  } = await supabase
    .from("eventos")
    .select(
      "id, nombre, descripcion, logo, slug, historia"
    )
    .eq("slug", "fonda-kakegurui")
    .single();

  if (eventoError || !evento) {
    console.error(
      "Error cargando Fonda Kakegurui:",
      eventoError
    );

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

  const {
    data: ediciones,
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

    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-400">
            Error cargando las ediciones
          </h1>

          <p className="mt-3 text-zinc-400">
            No se pudieron cargar las ediciones de Fonda Kakegurui.
          </p>
        </div>
      </main>
    );
  }

  const listaEdiciones: Edicion[] =
    ediciones ?? [];

  const {
    data: premios,
    error: premiosError,
  } = await supabase
    .from("premios")
    .select(
      "edicion_id, persona_id, nombre, descripcion, imagen"
    )
    .in(
      "edicion_id",
      listaEdiciones.map(
        (edicion) => edicion.id
      )
    );

  if (premiosError) {
    console.error(
      "Error cargando campeones:",
      premiosError
    );
  }

  const listaPremios: Premio[] =
    premios ?? [];

  const personaIds = listaPremios.map(
    (premio) => premio.persona_id
  );

  const {
    data: personas,
    error: personasError,
  } = personaIds.length
    ? await supabase
        .from("personas")
        .select("id, nombre, imagen")
        .in("id", personaIds)
    : {
        data: [],
        error: null,
      };

  if (personasError) {
    console.error(
      "Error cargando personas:",
      personasError
    );
  }

  const personaPorId = new Map(
    (personas ?? []).map(
      (persona: Persona) => [
        persona.id,
        persona,
      ]
    )
  );

  const premioPorEdicion = new Map(
    listaPremios.map((premio) => [
      premio.edicion_id,
      premio,
    ])
  );

  function nombreCorto(nombre: string) {
    const partes = nombre
      .trim()
      .split(/\s+/);

    if (partes.length === 1) {
      return partes[0];
    }

    return `${partes[0]} ${
      partes[partes.length - 2]
    }`;
  }

  /*
   * Si todavía no existe historia en Supabase,
   * mostramos el texto que ya tenía la página.
   *
   * Al editarlo y guardar, se almacenará en:
   *
   * eventos.historia
   */

  const historiaInicial =
    evento.historia?.trim() ||
    `Fonda Kakegurui es nuestro torneo de Fiestas Patrias,
donde los participantes se enfrentan en diferentes
juegos, desafíos y pruebas para convertirse en el
campeón o campeona del evento.

¡Este evento lo organiza Gonza!`;

  return (
    <main
      className="relative min-h-screen bg-cover bg-center bg-fixed text-white"
      style={{
        backgroundImage:
          "url('/eventos/fonda.png')",
      }}
    >
      <div className="fixed inset-0 z-0 bg-black/55" />

      <div className="relative z-10">

        {/* HERO */}

        <section className="relative overflow-hidden border-b border-white/10">

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.25),_transparent_50%)]" />

          <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center">

            {evento.logo && (
              <img
                src={evento.logo}
                alt={evento.nombre}
                className="max-h-72 max-w-md object-contain"
              />
            )}

            <p className="mt-12 text-sm font-semibold uppercase tracking-[0.4em] text-violet-400">
              Nuestro evento
            </p>

            {/* NOMBRE */}

            <EditarTexto
              valor={evento.nombre}
              campo="nombre"
              eventoId={evento.id}
              claseTexto="mt-4 text-5xl font-black md:text-7xl"
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

        {/* HISTORIA */}

        <section className="mx-auto max-w-5xl px-6 py-20 text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
            La historia
          </p>

          <h2 className="mt-4 text-4xl font-bold md:text-5xl">
            ¿Qué es {evento.nombre}?
          </h2>

          <div className="mt-8">

            <EditarTexto
              valor={historiaInicial}
              campo="historia"
              eventoId={evento.id}
              multilinea
              claseTexto="whitespace-pre-line text-lg leading-8 text-zinc-300"
            />

          </div>

        </section>

        {/* EDICIONES */}

        <section className="border-y border-white/10 bg-black/40">

          <div className="mx-auto max-w-7xl px-6 py-24">

            <div className="text-center">

              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
                Archivo histórico
              </p>

              <h2 className="mt-4 text-5xl font-black">
                EDICIONES
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-zinc-300">
                Revive cada edición del torneo y descubre cómo
                se definió cada campeonato.
              </p>

            </div>

            <div className="mt-14 grid gap-8 md:grid-cols-2">

              {listaEdiciones.map((edicion) => {

                const premio =
                  premioPorEdicion.get(
                    edicion.id
                  );

                const ganador = premio
                  ? personaPorId.get(
                      premio.persona_id
                    )
                  : undefined;

                /*
                 * La portada utiliza la imagen específica
                 * del campeón guardada en premios.imagen.
                 */

                const imagenCampeon =
                  premio?.imagen ?? null;

                return (
                  <a
                    key={edicion.id}
                    href={`/eventos/fonda-kakegurui/${edicion.año}`}
                    className="group overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/90 transition duration-300 hover:-translate-y-2 hover:border-violet-500/50"
                  >

                    {/* IMAGEN */}

                    <div className="relative h-96 overflow-hidden bg-black">

                      {imagenCampeon ? (

                        <img
                          src={imagenCampeon}
                          alt={
                            ganador
                              ? nombreCorto(
                                  ganador.nombre
                                )
                              : "Campeón de Fonda Kakegurui"
                          }
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />

                      ) : evento.logo ? (

                        <div className="flex h-full items-center justify-center">

                          <img
                            src={evento.logo}
                            alt={`Logo ${evento.nombre}`}
                            className="max-h-48 max-w-[65%] object-contain transition duration-500 group-hover:scale-110"
                          />

                        </div>

                      ) : (

                        <div className="flex h-full items-center justify-center">

                          <span className="text-7xl">
                            🏆
                          </span>

                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                      <div className="absolute bottom-8 left-8">

                        <p className="text-sm uppercase tracking-[0.3em] text-violet-400">
                          Edición
                        </p>

                        <h3 className="mt-2 text-5xl font-black">
                          {edicion.año}
                        </h3>

                      </div>

                    </div>

                    {/* INFORMACIÓN */}

                    <div className="p-8">

                      <p className="text-xs uppercase tracking-widest text-zinc-500">
                        {premio?.nombre ??
                          "Campeón"}
                      </p>

                      <p className="mt-2 text-2xl font-bold">
                        {ganador
                          ? nombreCorto(
                              ganador.nombre
                            )
                          : "Por definir"}
                      </p>

                      <p className="mt-6 text-sm text-zinc-500">
                        VER EDICIÓN →
                      </p>

                    </div>

                  </a>
                );
              })}

            </div>
          </div>

        </section>

        {/* FOOTER */}

        <footer className="border-t border-white/10 bg-black/40 px-6 py-10">

          <div className="mx-auto flex max-w-7xl justify-between text-sm text-zinc-500">

            <p>
              THE GAME ARCHIVE
            </p>

            <p>
              Juegos · Eventos · Campeones
            </p>

          </div>

        </footer>

      </div>
    </main>
  );
}