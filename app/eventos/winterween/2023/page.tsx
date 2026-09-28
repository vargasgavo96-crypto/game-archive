import { notFound } from "next/navigation";

import { supabase } from "@/lib/supabase";

import EditarTextoEdicion from "@/app/components/EditarTextoEdicion";
import ParticipantesMascarada from "@/app/components/ParticipantesMascarada";
import GaleriaFotos from "@/app/components/GaleriaFotos";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ============================================================
// TIPOS
// ============================================================

type Evento = {
  id: number;
  nombre: string;
  descripcion: string | null;
  logo: string | null;
  slug: string;
  historia: string | null;
  como_nacio: string | null;
};

type Edicion = {
  id: number;
  evento_id: number;
  año: number;
  fecha: string | null;
  contenido: Record<string, any> | null;
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
  personaje: string | null;
  imagen: string | null;
};

// ============================================================
// PÁGINA WINTERWEEN 2023
// ============================================================

export default async function Winterween2023Page() {
  // ==========================================================
  // EVENTO
  // ==========================================================

  const {
    data: eventoData,
    error: eventoError,
  } = await supabase
    .from("eventos")
    .select(
      "id, nombre, descripcion, logo, slug, historia, como_nacio"
    )
    .eq("slug", "winterween")
    .single();

  if (eventoError || !eventoData) {
    console.error(
      "Error cargando Winterween:",
      eventoError
    );

    notFound();
  }

  const evento = eventoData as Evento;

  // ==========================================================
  // EDICIÓN 2023
  // ==========================================================

  const {
    data: edicionData,
    error: edicionError,
  } = await supabase
    .from("ediciones")
    .select("id, evento_id, fecha, contenido")
    .eq("evento_id", evento.id)
    .eq("año", 2023)
    .single();

  if (edicionError || !edicionData) {
    console.error(
      "Error cargando Winterween 2023:",
      edicionError
    );

    notFound();
  }

  const edicion: Edicion = {
    id: edicionData.id,
    evento_id: edicionData.evento_id,
    año: 2023,
    fecha: edicionData.fecha ?? null,
    contenido:
      (edicionData.contenido as Record<string, any> | null) ??
      {},
  };

  // ==========================================================
  // PERSONAS
  // ==========================================================

  const {
    data: personasData,
    error: personasError,
  } = await supabase
    .from("personas")
    .select("id, nombre, imagen")
    .order("nombre", {
      ascending: true,
    });

  if (personasError) {
    console.error(
      "Error cargando personas:",
      personasError
    );
  }

  const personas: Persona[] =
    (personasData ?? []) as Persona[];

  // ==========================================================
  // PARTICIPACIONES
  // ==========================================================

  const {
    data: participacionesData,
    error: participacionesError,
  } = await supabase
    .from("participaciones")
    .select(
      "id, persona_id, edicion_id, posicion, puntos_finales, personaje, imagen"
    )
    .eq("edicion_id", edicion.id)
    .order("id", {
      ascending: true,
    });

  if (participacionesError) {
    console.error(
      "Error cargando participaciones:",
      participacionesError
    );
  }

  const participaciones: Participacion[] =
    (participacionesData ?? []) as Participacion[];

  // ==========================================================
  // CONTENIDO EDITABLE
  // ==========================================================

  const contenido = edicion.contenido ?? {};

  const resumen =
    contenido.resumen ??
    "Escribe aquí el resumen de Winterween 2023.";

  const tematica =
    contenido.tematica ??
    "Escribe aquí la temática de Winterween 2023.";

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <main className="relative min-h-screen overflow-x-hidden text-white">

      {/* ======================================================
          FONDO WINTERWEEN

          Ocupa toda la pantalla y permanece fijo mientras
          se recorre toda la página.
          ====================================================== */}

      <div
        className="
          fixed
          inset-0
          z-0
          bg-cover
          bg-center
          bg-no-repeat
        "
        style={{
          backgroundImage:
            'url("/eventos/winterween.png")',
        }}
      />

      {/* ======================================================
          CAPA OSCURA
          ====================================================== */}

      <div
        className="
          fixed
          inset-0
          z-10
          bg-black/30
        "
      />

      {/* ======================================================
          CONTENIDO
          ====================================================== */}

      <div className="relative z-20">

        {/* ====================================================
            HERO
            ==================================================== */}

        <section
          className="
            relative
            flex
            min-h-screen
            w-full
            items-center
            justify-center
            overflow-hidden
          "
        >

          <div
            className="
              absolute
              inset-0
              bg-[radial-gradient(
                circle_at_center,
                rgba(59,130,246,0.12),
                transparent_55%
              )]
            "
          />

          <div
            className="
              relative
              z-10
              mx-auto
              flex
              min-h-screen
              w-full
              max-w-7xl
              flex-col
              items-center
              justify-center
              px-6
              py-24
              text-center
            "
          >

            <p
              className="
                text-sm
                font-bold
                uppercase
                tracking-[0.55em]
                text-blue-200
                drop-shadow-lg
                sm:text-base
              "
            >
              WINTERWEEN
            </p>

            <h1
              className="
                mt-3
                text-7xl
                font-black
                leading-none
                tracking-tight
                text-white
                drop-shadow-[0_8px_30px_rgba(0,0,0,0.8)]
                sm:text-8xl
                md:text-9xl
              "
            >
              2023
            </h1>

            <p
              className="
                mt-8
                max-w-3xl
                text-lg
                font-medium
                leading-8
                text-white
                drop-shadow-[0_4px_15px_rgba(0,0,0,0.9)]
                sm:text-xl
                md:text-2xl
              "
            >
              {evento.descripcion ||
                "Evento de THE GAME ARCHIVE."}
            </p>

          </div>
        </section>

        {/* ====================================================
            CONTENIDO PRINCIPAL
            ==================================================== */}

        <div
          className="
            mx-auto
            w-full
            max-w-7xl
            px-4
            pb-24
            sm:px-6
            lg:px-8
          "
        >

          {/* ==================================================
              1. RESUMEN DE LA EDICIÓN
              ================================================== */}

          <section className="mb-24">

            <div className="mb-8">

              <p
                className="
                  text-sm
                  font-bold
                  uppercase
                  tracking-[0.4em]
                  text-blue-200
                  drop-shadow-lg
                "
              >
                LA EDICIÓN
              </p>

              <h2
                className="
                  mt-3
                  text-4xl
                  font-black
                  leading-tight
                  text-white
                  drop-shadow-[0_5px_15px_rgba(0,0,0,0.9)]
                  sm:text-5xl
                  md:text-6xl
                "
              >
                Resumen de la edición
              </h2>

            </div>

            <div
              className="
                rounded-3xl
                border
                border-white/15
                bg-black/35
                p-6
                shadow-2xl
                backdrop-blur-sm
                sm:p-8
                md:p-10
              "
            >

              <EditarTextoEdicion
                valor={resumen}
                campo="resumen"
                edicionId={edicion.id}
                multilinea
                claseTexto="
                  whitespace-pre-line
                  text-lg
                  leading-8
                  text-white
                  sm:text-xl
                "
              />

            </div>

          </section>

          {/* ==================================================
              2. TEMÁTICA
              ================================================== */}

          <section className="mb-24">

            <div className="mb-8">

              <p
                className="
                  text-sm
                  font-bold
                  uppercase
                  tracking-[0.4em]
                  text-blue-200
                  drop-shadow-lg
                "
              >
                WINTERWEEN
              </p>

              <h2
                className="
                  mt-3
                  text-4xl
                  font-black
                  leading-tight
                  text-white
                  drop-shadow-[0_5px_15px_rgba(0,0,0,0.9)]
                  sm:text-5xl
                  md:text-6xl
                "
              >
                Temática de la edición
              </h2>

            </div>

            <div
              className="
                rounded-3xl
                border
                border-blue-300/20
                bg-black/35
                p-6
                shadow-2xl
                backdrop-blur-sm
                sm:p-8
                md:p-10
              "
            >

              <EditarTextoEdicion
                valor={tematica}
                campo="tematica"
                edicionId={edicion.id}
                multilinea
                claseTexto="
                  whitespace-pre-line
                  text-xl
                  font-semibold
                  leading-9
                  text-blue-100
                  sm:text-2xl
                  md:text-3xl
                "
              />

            </div>

          </section>

          {/* ==================================================
              3. PARTICIPANTES
              ================================================== */}

          <section className="mb-24">

            <div className="mb-8">

              <p
                className="
                  text-sm
                  font-bold
                  uppercase
                  tracking-[0.4em]
                  text-blue-200
                  drop-shadow-lg
                "
              >
                LOS PARTICIPANTES
              </p>

              <h2
                className="
                  mt-3
                  text-4xl
                  font-black
                  leading-tight
                  text-white
                  drop-shadow-[0_5px_15px_rgba(0,0,0,0.9)]
                  sm:text-5xl
                  md:text-6xl
                "
              >
                Participantes
              </h2>

            </div>

            <div
              className="
                rounded-3xl
                border
                border-white/15
                bg-black/35
                p-5
                shadow-2xl
                backdrop-blur-sm
                sm:p-8
              "
            >

              <ParticipantesMascarada
                edicionId={edicion.id}
                personas={personas}
                participacionesIniciales={
                  participaciones
                }
              />

            </div>

          </section>

          {/* ==================================================
              4. HISTORIA DEL EVENTO
              ================================================== */}

          <section className="mb-24">

            <div className="mb-8">

              <p
                className="
                  text-sm
                  font-bold
                  uppercase
                  tracking-[0.4em]
                  text-blue-200
                  drop-shadow-lg
                "
              >
                HISTORIA
              </p>

              <h2
                className="
                  mt-3
                  text-4xl
                  font-black
                  leading-tight
                  text-white
                  drop-shadow-[0_5px_15px_rgba(0,0,0,0.9)]
                  sm:text-5xl
                  md:text-6xl
                "
              >
                Historia del evento
              </h2>

            </div>

            <div
              className="
                rounded-3xl
                border
                border-white/15
                bg-black/35
                p-6
                shadow-2xl
                backdrop-blur-sm
                sm:p-8
                md:p-10
              "
            >

              <p
                className="
                  whitespace-pre-line
                  text-lg
                  leading-8
                  text-white
                  sm:text-xl
                "
              >
                {evento.historia ||
                  "Winterween es un evento de THE GAME ARCHIVE."}
              </p>

            </div>

          </section>

          {/* ==================================================
              5. ¿CÓMO NACIÓ?
              ================================================== */}

          <section className="mb-24">

            <div className="mb-8">

              <p
                className="
                  text-sm
                  font-bold
                  uppercase
                  tracking-[0.4em]
                  text-blue-200
                  drop-shadow-lg
                "
              >
                EL ORIGEN
              </p>

              <h2
                className="
                  mt-3
                  text-4xl
                  font-black
                  leading-tight
                  text-white
                  drop-shadow-[0_5px_15px_rgba(0,0,0,0.9)]
                  sm:text-5xl
                  md:text-6xl
                "
              >
                ¿Cómo nació?
              </h2>

            </div>

            <div
              className="
                rounded-3xl
                border
                border-white/15
                bg-black/35
                p-6
                shadow-2xl
                backdrop-blur-sm
                sm:p-8
                md:p-10
              "
            >

              <p
                className="
                  whitespace-pre-line
                  text-lg
                  leading-8
                  text-white
                  sm:text-xl
                "
              >
                {evento.como_nacio ||
                  "Una instancia para compartir, jugar y crear recuerdos."}
              </p>

            </div>

          </section>

          {/* ==================================================
              6. GALERÍA — ÚLTIMA SECCIÓN
              ================================================== */}

          <section className="mb-24">

            <div className="mb-8">

              <p
                className="
                  text-sm
                  font-bold
                  uppercase
                  tracking-[0.4em]
                  text-blue-200
                  drop-shadow-lg
                "
              >
                RECUERDOS
              </p>

              <h2
                className="
                  mt-3
                  text-4xl
                  font-black
                  leading-tight
                  text-white
                  drop-shadow-[0_5px_15px_rgba(0,0,0,0.9)]
                  sm:text-5xl
                  md:text-6xl
                "
              >
                Galería
              </h2>

            </div>

            <div
              className="
                rounded-3xl
                border
                border-white/15
                bg-black/30
                p-4
                shadow-2xl
                backdrop-blur-sm
                sm:p-6
                md:p-8
              "
            >

              <GaleriaFotos
                edicionId={edicion.id}
              />

            </div>

          </section>

        </div>

        {/* ====================================================
            FOOTER
            ==================================================== */}

        <footer
          className="
            border-t
            border-white/15
            bg-black/35
            px-6
            py-12
            text-center
            backdrop-blur-sm
          "
        >

          <p
            className="
              text-xs
              font-bold
              uppercase
              tracking-[0.35em]
              text-white/70
            "
          >
            THE GAME ARCHIVE
          </p>

          <p
            className="
              mt-3
              text-sm
              text-white/50
            "
          >
            Winterween · 2023
          </p>

        </footer>

      </div>
    </main>
  );
}