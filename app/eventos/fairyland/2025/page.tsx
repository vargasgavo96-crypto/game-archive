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
// PÁGINA FAIRYLAND 2025
// ============================================================

export default async function Fairyland2025Page() {
  // ==========================================================
  // EVENTO
  // ==========================================================

  const {
    data: eventoData,
    error: eventoError,
  } = await supabase
    .from("eventos")
    .select(
      "id, nombre, descripcion, logo, slug"
    )
    .eq("slug", "fairyland")
    .single();

  if (eventoError || !eventoData) {
    console.error(
      "Error cargando Fairyland:",
      eventoError
    );

    notFound();
  }

  const evento = eventoData as Evento;

  // ==========================================================
  // EDICIÓN 2025
  // ==========================================================

  const {
    data: edicionData,
    error: edicionError,
  } = await supabase
    .from("ediciones")
    .select(
      "id, evento_id, fecha, contenido"
    )
    .eq("evento_id", evento.id)
    .eq("año", 2025)
    .single();

  if (edicionError || !edicionData) {
    console.error(
      "Error cargando Fairyland 2025:",
      edicionError
    );

    notFound();
  }

  const edicion: Edicion = {
    id: edicionData.id,
    evento_id: edicionData.evento_id,
    año: 2025,
    fecha: edicionData.fecha ?? null,
    contenido:
      (edicionData.contenido as Record<
        string,
        any
      > | null) ?? {},
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
    (participacionesData ??
      []) as Participacion[];

  // ==========================================================
  // CONTENIDO EDITABLE
  // ==========================================================

  const contenido = edicion.contenido ?? {};

  // ==========================================================
  // HERO
  // ==========================================================

  const heroEtiqueta =
    contenido.hero_etiqueta ??
    "FAIRYLAND";

  const heroDescripcion =
    contenido.hero_descripcion ??
    evento.descripcion ??
    "Evento de THE GAME ARCHIVE.";

  // ==========================================================
  // RESUMEN
  // ==========================================================

  const resumenEtiqueta =
    contenido.resumen_etiqueta ??
    "LA EDICIÓN";

  const resumenTitulo =
    contenido.resumen_titulo ??
    "Resumen de la edición";

  const resumen =
    contenido.resumen ??
    "Escribe aquí el resumen de Fairyland 2025.";

  // ==========================================================
  // TEMÁTICA
  // ==========================================================

  const tematicaEtiqueta =
    contenido.tematica_etiqueta ??
    "FAIRYLAND";

  const tematicaTitulo =
    contenido.tematica_titulo ??
    "Temática de la edición";

  const tematica =
    contenido.tematica ??
    "Escribe aquí la temática de Fairyland 2025.";

  // ==========================================================
  // PARTICIPANTES
  // ==========================================================

  const participantesEtiqueta =
    contenido.participantes_etiqueta ??
    "LOS PARTICIPANTES";

  const participantesTitulo =
    contenido.participantes_titulo ??
    "Participantes";

  // ==========================================================
  // GALERÍA
  // ==========================================================

  const recuerdosEtiqueta =
    contenido.recuerdos_etiqueta ??
    "RECUERDOS";

  const galeriaTitulo =
    contenido.galeria_titulo ??
    "Galería";

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <main className="relative min-h-screen overflow-x-hidden text-white">

      {/* ======================================================
          FONDO
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
            'url("/eventos/fairyland.png")',
        }}
      />

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
                rgba(168,85,247,0.12),
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

            {/* =================================================
                LOGO FAIRYLAND
                ================================================= */}

            {evento.logo && (
              <img
                src={evento.logo}
                alt={evento.nombre}
                className="
                  mb-10
                  max-h-72
                  max-w-md
                  object-contain
                  drop-shadow-[0_10px_35px_rgba(0,0,0,0.8)]
                "
              />
            )}

            {/* =================================================
                ETIQUETA EDITABLE
                ================================================= */}

            <EditarTextoEdicion
              valor={heroEtiqueta}
              campo="hero_etiqueta"
              edicionId={edicion.id}
              claseTexto="
                text-sm
                font-bold
                uppercase
                tracking-[0.55em]
                text-purple-200
                drop-shadow-lg
                sm:text-base
              "
            />

            {/* =================================================
                AÑO
                ================================================= */}

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
              2025
            </h1>

            {/* =================================================
                DESCRIPCIÓN EDITABLE
                ================================================= */}

            <EditarTextoEdicion
              valor={heroDescripcion}
              campo="hero_descripcion"
              edicionId={edicion.id}
              multilinea
              claseTexto="
                mx-auto
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
            />

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
              RESUMEN
              ================================================== */}

          <section className="mb-24">

            <div className="mb-8">

              <EditarTextoEdicion
                valor={resumenEtiqueta}
                campo="resumen_etiqueta"
                edicionId={edicion.id}
                claseTexto="
                  text-sm
                  font-bold
                  uppercase
                  tracking-[0.4em]
                  text-purple-200
                  drop-shadow-lg
                "
              />

              <EditarTextoEdicion
                valor={resumenTitulo}
                campo="resumen_titulo"
                edicionId={edicion.id}
                claseTexto="
                  mt-3
                  text-4xl
                  font-black
                  leading-tight
                  text-white
                  drop-shadow-[0_5px_15px_rgba(0,0,0,0.9)]
                  sm:text-5xl
                  md:text-6xl
                "
              />

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
              TEMÁTICA
              ================================================== */}

          <section className="mb-24">

            <div className="mb-8">

              <EditarTextoEdicion
                valor={tematicaEtiqueta}
                campo="tematica_etiqueta"
                edicionId={edicion.id}
                claseTexto="
                  text-sm
                  font-bold
                  uppercase
                  tracking-[0.4em]
                  text-purple-200
                  drop-shadow-lg
                "
              />

              <EditarTextoEdicion
                valor={tematicaTitulo}
                campo="tematica_titulo"
                edicionId={edicion.id}
                claseTexto="
                  mt-3
                  text-4xl
                  font-black
                  leading-tight
                  text-white
                  drop-shadow-[0_5px_15px_rgba(0,0,0,0.9)]
                  sm:text-5xl
                  md:text-6xl
                "
              />

            </div>

            <div
              className="
                rounded-3xl
                border
                border-purple-300/20
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
                  text-purple-100
                  sm:text-2xl
                  md:text-3xl
                "
              />

            </div>

          </section>

          {/* ==================================================
              PARTICIPANTES
              ================================================== */}

          <section className="mb-24">

            <div className="mb-8">

              <EditarTextoEdicion
                valor={participantesEtiqueta}
                campo="participantes_etiqueta"
                edicionId={edicion.id}
                claseTexto="
                  text-sm
                  font-bold
                  uppercase
                  tracking-[0.4em]
                  text-purple-200
                  drop-shadow-lg
                "
              />

              <EditarTextoEdicion
                valor={participantesTitulo}
                campo="participantes_titulo"
                edicionId={edicion.id}
                claseTexto="
                  mt-3
                  text-4xl
                  font-black
                  leading-tight
                  text-white
                  drop-shadow-[0_5px_15px_rgba(0,0,0,0.9)]
                  sm:text-5xl
                  md:text-6xl
                "
              />

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
              GALERÍA
              ================================================== */}

          <section className="mb-24">

            <div className="mb-8">

              <EditarTextoEdicion
                valor={recuerdosEtiqueta}
                campo="recuerdos_etiqueta"
                edicionId={edicion.id}
                claseTexto="
                  text-sm
                  font-bold
                  uppercase
                  tracking-[0.4em]
                  text-purple-200
                  drop-shadow-lg
                "
              />

              <EditarTextoEdicion
                valor={galeriaTitulo}
                campo="galeria_titulo"
                edicionId={edicion.id}
                claseTexto="
                  mt-3
                  text-4xl
                  font-black
                  leading-tight
                  text-white
                  drop-shadow-[0_5px_15px_rgba(0,0,0,0.9)]
                  sm:text-5xl
                  md:text-6xl
                "
              />

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
            Fairyland · 2025
          </p>

        </footer>

      </div>
    </main>
  );
}