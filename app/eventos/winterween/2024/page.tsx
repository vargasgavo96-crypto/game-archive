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
  contenido: Record<string, string> | null;
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
// PÁGINA WINTERWEEN 2024
// ============================================================

export default async function Winterween2024Page() {

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
  // EDICIÓN 2024
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
    .eq("año", 2024)
    .single();

  if (edicionError || !edicionData) {

    console.error(
      "Error cargando Winterween 2024:",
      edicionError
    );

    notFound();
  }

  const edicion: Edicion = {
    id: edicionData.id,
    evento_id: edicionData.evento_id,
    año: 2024,
    fecha: edicionData.fecha ?? null,
    contenido:
      (edicionData.contenido as Record<
        string,
        string
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
    .select(
      "id, nombre, imagen"
    )
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

  const contenido =
    edicion.contenido ?? {};

  // ==========================================================
  // HERO
  // ==========================================================

  const heroEtiqueta =
    contenido.hero_etiqueta ??
    "WINTERWEEN";

  const heroTitulo =
    contenido.hero_titulo ??
    "2024";

  const heroDescripcion =
    contenido.hero_descripcion ??
    "Una nueva edición de Winterween.";

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
    "Escribe aquí el resumen de Winterween 2024.";

  // ==========================================================
  // TEMÁTICA
  // ==========================================================

  const tematicaEtiqueta =
    contenido.tematica_etiqueta ??
    "WINTERWEEN";

  const tematicaTitulo =
    contenido.tematica_titulo ??
    "Temática de la edición";

  const tematica =
    contenido.tematica ??
    "Escribe aquí la temática de Winterween 2024.";

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

  const galeriaEtiqueta =
    contenido.galeria_etiqueta ??
    "RECUERDOS";

  const galeriaTitulo =
    contenido.galeria_titulo ??
    "Galería";

  // ==========================================================
  // FOOTER
  // ==========================================================

  const footerTitulo =
    contenido.footer_titulo ??
    "THE GAME ARCHIVE";

  const footerDescripcion =
    contenido.footer_descripcion ??
    "Winterween · 2024";

  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <main
      className="
        relative
        min-h-screen
        overflow-x-hidden
        text-white
      "
    >

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
              bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.12),transparent_55%)]
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

            {/* ETIQUETA */}

            <EditarTextoEdicion
              valor={heroEtiqueta}
              campo="hero_etiqueta"
              edicionId={edicion.id}
              claseTexto="
                text-sm
                font-bold
                uppercase
                tracking-[0.55em]
                text-blue-200
                drop-shadow-lg
                sm:text-base
              "
            />

            {/* AÑO */}

            <EditarTextoEdicion
              valor={heroTitulo}
              campo="hero_titulo"
              edicionId={edicion.id}
              claseTexto="
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
            />

            {/* DESCRIPCIÓN */}

            <EditarTextoEdicion
              valor={heroDescripcion}
              campo="hero_descripcion"
              edicionId={edicion.id}
              multilinea
              claseTexto="
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
              1. RESUMEN
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
                  text-blue-200
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
              2. TEMÁTICA
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
                  text-blue-200
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

              <EditarTextoEdicion
                valor={participantesEtiqueta}
                campo="participantes_etiqueta"
                edicionId={edicion.id}
                claseTexto="
                  text-sm
                  font-bold
                  uppercase
                  tracking-[0.4em]
                  text-blue-200
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
              4. GALERÍA
              ================================================== */}

          <section className="mb-24">

            <div className="mb-8">

              <EditarTextoEdicion
                valor={galeriaEtiqueta}
                campo="galeria_etiqueta"
                edicionId={edicion.id}
                claseTexto="
                  text-sm
                  font-bold
                  uppercase
                  tracking-[0.4em]
                  text-blue-200
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

          <EditarTextoEdicion
            valor={footerTitulo}
            campo="footer_titulo"
            edicionId={edicion.id}
            claseTexto="
              text-xs
              font-bold
              uppercase
              tracking-[0.35em]
              text-white/70
            "
          />

          <EditarTextoEdicion
            valor={footerDescripcion}
            campo="footer_descripcion"
            edicionId={edicion.id}
            claseTexto="
              mt-3
              text-sm
              text-white/50
            "
          />

        </footer>

      </div>

    </main>
  );
}