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
  contenido: Record<string, unknown> | null;
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

const presentaciones = [
  {
    nombre: "Javier",
    campo: "presentacion_javier",
    tema: "Su animé favorito",
  },
  {
    nombre: "Ricardo",
    campo: "presentacion_ricardo",
    tema: "El niño interior dentro del animé",
  },
  {
    nombre: "Fefi",
    campo: "presentacion_fefi",
    tema: "2 verdades y 1 mentira sobre ella",
  },
  {
    nombre: "Camilo",
    campo: "presentacion_camilo",
    tema: "¿Cuánto lo conocen?",
  },
  {
    nombre: "Gonza",
    campo: "presentacion_gonza",
    tema: "El chisme de cuando fue parte de la FEUTFSM",
  },
  {
    nombre: "Leslie",
    campo: "presentacion_leslie",
    tema: "¿Qué tan similar es Bob Esponja a las esponjas marinas?",
  },
  {
    nombre: "Seba",
    campo: "presentacion_seba",
    tema: "La historia de asesinos seriales",
  },
];

function nombreCorto(nombre: string) {
  const partes = nombre.trim().split(/\s+/);

  if (partes.length === 1) {
    return partes[0];
  }

  return `${partes[0]} ${partes[partes.length - 2]}`;
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

export default async function Expofest2025Page() {
  const { data: evento, error: eventoError } = await supabase
    .from("eventos")
    .select("id, nombre, descripcion, logo, slug")
    .eq("slug", "expofest")
    .single();

  if (eventoError || !evento) {
    console.error("Error cargando Expofest:", eventoError);

    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-400">
            No se pudo cargar Expofest
          </h1>

          <p className="mt-3 text-zinc-400">
            El evento no pudo ser encontrado en Supabase.
          </p>
        </div>
      </main>
    );
  }

  const { data: edicionData, error: edicionError } = await supabase
    .from("ediciones")
    .select("*")
    .eq("evento_id", evento.id)
    .eq("año", "2025")
    .single();

  if (edicionError || !edicionData) {
    console.error("Error cargando edición:", edicionError);

    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-400">
            No se encontró Expofest 2025
          </h1>

          <p className="mt-3 text-zinc-400">
            Revisa que la edición 2025 exista en Supabase.
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

  const { data: premio, error: premioError } = await supabase
    .from("premios")
    .select(
      "id, persona_id, edicion_id, nombre, descripcion, imagen"
    )
    .eq("edicion_id", edicion.id)
    .maybeSingle();

  if (premioError) {
    console.error("Error cargando premio:", premioError);
  }

  const {
    data: participacionGanadora,
    error: participacionError,
  } = await supabase
    .from("participaciones")
    .select("id, persona_id, edicion_id, posicion, puntos_finales")
    .eq("edicion_id", edicion.id)
    .eq("posicion", 1)
    .maybeSingle();

  if (participacionError) {
    console.error(
      "Error cargando participación ganadora:",
      participacionError
    );
  }

  const ganadorId =
    premio?.persona_id ??
    participacionGanadora?.persona_id;

  let ganadora: Persona | undefined;

  if (ganadorId) {
    const { data: persona, error: personaError } =
      await supabase
        .from("personas")
        .select("id, nombre, imagen")
        .eq("id", ganadorId)
        .single();

    if (personaError) {
      console.error(
        "Error cargando persona ganadora:",
        personaError
      );
    }

    ganadora = persona ?? undefined;
  }

  const nombreGanadora = ganadora
    ? nombreCorto(ganadora.nombre)
    : "Leslie Novoa";

  const imagenGanadora =
    premio?.imagen ??
    ganadora?.imagen ??
    "/campeones/leslie2025.png";

  const heroDescripcion = obtenerContenido(
    contenido,
    "hero_descripcion",
    "Una instancia para compartir, presentar y conocernos mejor a través de nuestras propias historias e intereses."
  );

  const historia1 = obtenerContenido(
    contenido,
    "historia_1",
    "La primera edición de Expofest surgió gracias a TikTok, donde una actividad recomendaba realizar presentaciones sobre diferentes temáticas."
  );

  const historia2 = obtenerContenido(
    contenido,
    "historia_2",
    "Después de mucho posponerlo, finalmente llegamos a noviembre de 2025 y decidimos realizar la primera edición."
  );

  const historia3 = obtenerContenido(
    contenido,
    "historia_3",
    "En esta oportunidad la temática era completamente libre, por lo que cada participante pudo elegir aquello que quisiera compartir con el grupo."
  );

  const presentacionesDescripcion = obtenerContenido(
    contenido,
    "presentaciones_descripcion",
    "Siete presentaciones, siete temas completamente diferentes y una noche para compartir nuestros intereses, historias y experiencias."
  );

  const temaTrascendioTitulo = obtenerContenido(
    contenido,
    "tema_trascendio_titulo",
    "¿Qué tan similar es Bob Esponja a las esponjas marinas?"
  );

  const temaTrascendioDescripcion1 = obtenerContenido(
    contenido,
    "tema_trascendio_descripcion_1",
    "Esta edición no tuvo notas ni votaciones. Sin embargo, hubo una presentación que trascendió y que terminó cambiando un poco la dinámica del grupo."
  );

  const temaTrascendioDescripcion2 = obtenerContenido(
    contenido,
    "tema_trascendio_descripcion_2",
    "A mi parecer, la presentación de Leslie nos enseñó algo que nunca podremos olvidar: ya no podemos despejar a Bob Esponja de Leslie."
  );

  const reconocimientoDescripcion = obtenerContenido(
    contenido,
    "reconocimiento_descripcion",
    "Por una presentación que dejó huella."
  );

  const momentoFefiTitulo = obtenerContenido(
    contenido,
    "momento_fefi_titulo",
    "Fefi y su mala suerte"
  );

  const momentoFefiDescripcion = obtenerContenido(
    contenido,
    "momento_fefi_descripcion",
    "Fefi nos contó algunas de sus historias más increíbles, incluyendo cómo una vez quedó atrapada en medio de una balacera y cómo terminó rompiendo una puerta de vidrio con el cuerpo."
  );

  const momentoCamiloTitulo = obtenerContenido(
    contenido,
    "momento_camilo_titulo",
    "Camilo y sus mascotas"
  );

  const momentoCamiloDescripcion = obtenerContenido(
    contenido,
    "momento_camilo_descripcion",
    "Camilo nos contó sobre sus mascotas y también descubrimos que conoce a Angelo desde hace mucho tiempo."
  );

  const momentoJavierTitulo = obtenerContenido(
    contenido,
    "momento_javier_titulo",
    "Houseki no Kuni"
  );

  const momentoJavierDescripcion = obtenerContenido(
    contenido,
    "momento_javier_descripcion",
    "Javier nos emocionó con su presentación sobre Houseki no Kuni. La presentación fue tan especial que incluso recibió una muñeca relacionada con la serie."
  );

  const momentoGeneralTitulo = obtenerContenido(
    contenido,
    "momento_general_titulo",
    "Un viaje por todos los temas"
  );

  const momentoGeneralDescripcion = obtenerContenido(
    contenido,
    "momento_general_descripcion",
    "Ricardo nos hizo volver a la infancia, para que después Gonza nos entregara su dosis de chisme sobre su paso por la FEUTFSM, antes de finalizar con las historias de asesinos seriales de Seba."
  );

  const ganadoraTema = obtenerContenido(
    contenido,
    "ganadora_tema",
    "¿Qué tan similar es Bob Esponja a las esponjas marinas?"
  );

  const ganadoraDescripcion = obtenerContenido(
    contenido,
    "ganadora_descripcion",
    "Una presentación que trascendió y que terminó convirtiéndose en uno de los recuerdos más característicos de esta edición."
  );

  return (
    <main
      className="relative min-h-screen bg-cover bg-center bg-fixed text-white"
      style={{
        backgroundImage: "url('/eventos/expofest.png')",
      }}
    >
      <div className="fixed inset-0 z-0 bg-black/60" />

      <div className="relative z-10">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.25),_transparent_50%)]" />

          <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 py-28 text-center">
            <img
              src={evento.logo ?? "/logos/logoexpofests.png"}
              alt="Expofest"
              className="max-h-72 max-w-lg object-contain"
            />

            <p className="mt-12 text-sm font-semibold uppercase tracking-[0.4em] text-violet-400">
              Primera edición
            </p>

            <h1 className="mt-4 text-6xl font-black md:text-8xl">
              EXPOFEST
            </h1>

            <p className="mt-4 text-3xl font-bold text-white/80">
              2025
            </p>

            <div className="relative mx-auto mt-8 w-full max-w-3xl">
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

        {/* INTRODUCCIÓN */}
        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
            El comienzo
          </p>

          <h2 className="mt-4 text-4xl font-bold md:text-5xl">
            ¿Cómo nació Expofest?
          </h2>

          <div className="mt-8 space-y-6 text-lg leading-8 text-zinc-300">
            <EditarTextoEdicion
              valor={historia1}
              campo="historia_1"
              edicionId={edicion.id}
              multilinea
              claseTexto="text-lg leading-8 text-zinc-300"
            />

            <EditarTextoEdicion
              valor={historia2}
              campo="historia_2"
              edicionId={edicion.id}
              multilinea
              claseTexto="text-lg leading-8 text-zinc-300"
            />

            <EditarTextoEdicion
              valor={historia3}
              campo="historia_3"
              edicionId={edicion.id}
              multilinea
              claseTexto="text-lg leading-8 text-zinc-300"
            />
          </div>
        </section>

        {/* PRESENTACIONES */}
        <section className="border-y border-white/10 bg-black/40">
          <div className="mx-auto max-w-7xl px-6 py-24">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
                Primera edición
              </p>

              <h2 className="mt-4 text-5xl font-black">
                LAS PRESENTACIONES
              </h2>

              <div className="relative mx-auto mt-5 max-w-2xl">
                <EditarTextoEdicion
                  valor={presentacionesDescripcion}
                  campo="presentaciones_descripcion"
                  edicionId={edicion.id}
                  multilinea
                  claseTexto="text-zinc-300"
                />
              </div>
            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {presentaciones.map((presentacion, index) => {
                const tema = obtenerContenido(
                  contenido,
                  presentacion.campo,
                  presentacion.tema
                );

                return (
                  <div
                    key={presentacion.nombre}
                    className="group rounded-3xl border border-white/10 bg-zinc-900/90 p-7 transition duration-300 hover:-translate-y-2 hover:border-violet-500/50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-violet-400">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="text-xs uppercase tracking-widest text-zinc-600">
                        PRESENTACIÓN
                      </span>
                    </div>

                    <h3 className="mt-8 text-3xl font-black">
                      {presentacion.nombre}
                    </h3>

                    <div className="mt-5 border-t border-white/10 pt-5">
                      <p className="text-xs uppercase tracking-widest text-zinc-500">
                        Tema
                      </p>

                      <div className="relative mt-2">
                        <EditarTextoEdicion
                          valor={tema}
                          campo={presentacion.campo}
                          edicionId={edicion.id}
                          multilinea
                          claseTexto="text-lg leading-7 text-zinc-300"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* EL TEMA QUE TRASCENDIÓ */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.15),_transparent_55%)]" />

          <div className="relative mx-auto max-w-5xl px-6 py-28 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
              El tema que trascendió
            </p>

            <div className="relative mt-5">
              <EditarTextoEdicion
                valor={temaTrascendioTitulo}
                campo="tema_trascendio_titulo"
                edicionId={edicion.id}
                multilinea
                claseTexto="text-4xl font-black leading-tight md:text-6xl"
              />
            </div>

            <div className="relative mx-auto mt-8 max-w-3xl">
              <EditarTextoEdicion
                valor={temaTrascendioDescripcion1}
                campo="tema_trascendio_descripcion_1"
                edicionId={edicion.id}
                multilinea
                claseTexto="text-lg leading-8 text-zinc-300"
              />
            </div>

            <div className="relative mx-auto mt-6 max-w-3xl">
              <EditarTextoEdicion
                valor={temaTrascendioDescripcion2}
                campo="tema_trascendio_descripcion_2"
                edicionId={edicion.id}
                multilinea
                claseTexto="text-lg leading-8 text-zinc-300"
              />
            </div>

            <div className="mx-auto mt-12 max-w-2xl rounded-3xl border border-violet-500/30 bg-violet-950/30 p-8">
              <p className="text-sm uppercase tracking-[0.3em] text-violet-400">
                Reconocimiento de la edición
              </p>

              <p className="mt-4 text-4xl font-black">
                {nombreGanadora}
              </p>

              <div className="relative mt-3">
                <EditarTextoEdicion
                  valor={reconocimientoDescripcion}
                  campo="reconocimiento_descripcion"
                  edicionId={edicion.id}
                  multilinea
                  claseTexto="text-zinc-400"
                />
              </div>
            </div>
          </div>
        </section>

        {/* MOMENTOS DESTACADOS */}
        <section className="border-y border-white/10 bg-black/40">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
                Momentos destacados
              </p>

              <h2 className="mt-4 text-5xl font-black">
                LO QUE RECORDAMOS
              </h2>
            </div>

            <div className="mt-14 space-y-5">
              {/* MOMENTO FEFI */}
              <div className="rounded-3xl border border-white/10 bg-zinc-900/90 p-8">
                <div className="relative">
                  <EditarTextoEdicion
                    valor={momentoFefiTitulo}
                    campo="momento_fefi_titulo"
                    edicionId={edicion.id}
                    claseTexto="text-2xl font-bold"
                  />
                </div>

                <div className="relative mt-4">
                  <EditarTextoEdicion
                    valor={momentoFefiDescripcion}
                    campo="momento_fefi_descripcion"
                    edicionId={edicion.id}
                    multilinea
                    claseTexto="leading-7 text-zinc-300"
                  />
                </div>
              </div>

              {/* MOMENTO CAMILO */}
              <div className="rounded-3xl border border-white/10 bg-zinc-900/90 p-8">
                <div className="relative">
                  <EditarTextoEdicion
                    valor={momentoCamiloTitulo}
                    campo="momento_camilo_titulo"
                    edicionId={edicion.id}
                    claseTexto="text-2xl font-bold"
                  />
                </div>

                <div className="relative mt-4">
                  <EditarTextoEdicion
                    valor={momentoCamiloDescripcion}
                    campo="momento_camilo_descripcion"
                    edicionId={edicion.id}
                    multilinea
                    claseTexto="leading-7 text-zinc-300"
                  />
                </div>
              </div>

              {/* MOMENTO JAVIER */}
              <div className="rounded-3xl border border-white/10 bg-zinc-900/90 p-8">
                <div className="relative">
                  <EditarTextoEdicion
                    valor={momentoJavierTitulo}
                    campo="momento_javier_titulo"
                    edicionId={edicion.id}
                    claseTexto="text-2xl font-bold"
                  />
                </div>

                <div className="relative mt-4">
                  <EditarTextoEdicion
                    valor={momentoJavierDescripcion}
                    campo="momento_javier_descripcion"
                    edicionId={edicion.id}
                    multilinea
                    claseTexto="leading-7 text-zinc-300"
                  />
                </div>
              </div>

              {/* MOMENTO GENERAL */}
              <div className="rounded-3xl border border-white/10 bg-zinc-900/90 p-8">
                <div className="relative">
                  <EditarTextoEdicion
                    valor={momentoGeneralTitulo}
                    campo="momento_general_titulo"
                    edicionId={edicion.id}
                    claseTexto="text-2xl font-bold"
                  />
                </div>

                <div className="relative mt-4">
                  <EditarTextoEdicion
                    valor={momentoGeneralDescripcion}
                    campo="momento_general_descripcion"
                    edicionId={edicion.id}
                    multilinea
                    claseTexto="leading-7 text-zinc-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* GANADORA */}
        <section className="mx-auto max-w-6xl px-6 py-28">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
              Reconocimiento
            </p>

            <h2 className="mt-4 text-5xl font-black md:text-7xl">
              {nombreGanadora.toUpperCase()}
            </h2>

            <p className="mt-6 text-xl text-zinc-300">
              La persona que destacó en la primera edición de
              Expofest.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/90">
            <div className="grid min-h-[600px] md:grid-cols-2">
              {/* INFORMACIÓN */}
              <div className="flex flex-col justify-center p-10 text-center md:p-14">
                <p className="text-sm uppercase tracking-[0.3em] text-violet-400">
                  Ganadora
                </p>

                <h3 className="mt-4 text-5xl font-black">
                  {nombreGanadora}
                </h3>

                <div className="mt-8 flex justify-center">
                  <span className="text-7xl">🏆</span>
                </div>

                <div className="relative mt-8">
                  <EditarTextoEdicion
                    valor={ganadoraTema}
                    campo="ganadora_tema"
                    edicionId={edicion.id}
                    multilinea
                    claseTexto="text-xl leading-8 text-zinc-300"
                  />
                </div>

                <div className="relative mt-6">
                  <EditarTextoEdicion
                    valor={ganadoraDescripcion}
                    campo="ganadora_descripcion"
                    edicionId={edicion.id}
                    multilinea
                    claseTexto="text-sm leading-6 text-zinc-500"
                  />
                </div>

                <a
                  href="/eventos/expofest"
                  className="mx-auto mt-8 w-fit rounded-full border border-white/20 px-7 py-3 text-sm font-semibold transition hover:bg-white hover:text-black"
                >
                  VOLVER A EXPOFEST →
                </a>
              </div>

              {/* FOTO */}
              <div className="relative min-h-[600px] overflow-hidden bg-black">
                <img
                  src={imagenGanadora}
                  alt={nombreGanadora}
                  className="h-full w-full object-contain object-right"
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-zinc-900 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </section>

        {/* GALERÍA */}
        <GaleriaFotos edicionId={edicion.id} />

        {/* FOOTER */}
        <footer className="border-t border-white/10 bg-black/40 px-6 py-10">
          <div className="mx-auto flex max-w-7xl justify-between text-sm text-zinc-500">
            <p>THE GAME ARCHIVE</p>
            <p>Expofest · Primera edición · 2025</p>
          </div>
        </footer>
      </div>
    </main>
  );
}