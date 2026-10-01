import { notFound } from "next/navigation";

import { supabase } from "@/lib/supabase";

import EditarTextoEdicion from "@/app/components/EditarTextoEdicion";
import ParticipantesMascarada from "@/app/components/ParticipantesMascarada";
import GaleriaFotos from "@/app/components/GaleriaFotos";

type Evento = {
  id: number;
  nombre: string;
  descripcion: string | null;
  logo: string | null;
  slug: string;
  historia: string | null;
  como_nacio: string | null;
  fondo?: string | null;
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

export default async function Mascarada2026Page() {
  // =====================================================
  // EVENTO
  // =====================================================

  const {
    data: eventoData,
    error: eventoError,
  } = await supabase
    .from("eventos")
    .select(
      "id, nombre, descripcion, logo, slug, historia, como_nacio, fondo"
    )
    .eq("slug", "mascarada")
    .single();

  if (eventoError || !eventoData) {
    console.error(
      "Error cargando La Mascarada:",
      eventoError
    );

    notFound();
  }

  const evento = eventoData as Evento;

  // =====================================================
  // EDICIÓN 2026
  // =====================================================

  const {
    data: edicionData,
    error: edicionError,
  } = await supabase
    .from("ediciones")
    .select(
      "id, evento_id, fecha, contenido"
    )
    .eq("evento_id", evento.id)
    .eq("año", 2026)
    .single();

  if (edicionError || !edicionData) {
    console.error(
      "Error cargando edición 2026:",
      edicionError
    );

    notFound();
  }

  const edicion: Edicion = {
    id: edicionData.id,
    evento_id: edicionData.evento_id,
    año: 2026,
    fecha: edicionData.fecha ?? null,
    contenido:
      (edicionData.contenido as Record<
        string,
        string
      > | null) ?? {},
  };

  // =====================================================
  // PARTICIPACIONES
  // =====================================================

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

  const participaciones =
    (participacionesData ??
      []) as Participacion[];

  // =====================================================
  // PERSONAS
  // =====================================================

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

  const personas =
    (personasData ??
      []) as Persona[];

  // =====================================================
  // CONTENIDO EDITABLE
  // =====================================================

  const contenido =
    edicion.contenido ?? {};

  const heroEtiqueta =
    contenido.hero_etiqueta ??
    "La Mascarada";

  const heroDescripcion =
    contenido.hero_descripcion ??
    "Una edición más de La Mascarada, donde nuestros amigos se transforman en personajes y disfraces únicos.";

  const resumenEtiqueta =
    contenido.resumen_etiqueta ??
    "La edición";

  const resumenTitulo =
    contenido.resumen_titulo ??
    "Resumen de la edición";

  const resumen =
    contenido.resumen ??
    "Escribe aquí el resumen de la edición.";

  const tematicaEtiqueta =
    contenido.tematica_etiqueta ??
    "Temática";

  const tematicaTitulo =
    contenido.tematica_titulo ??
    "Temática de la edición";

  const tematica =
    contenido.tematica ??
    "Escribe aquí la temática de la edición.";

  const participantesEtiqueta =
    contenido.participantes_etiqueta ??
    "Los invitados";

  const participantesTitulo =
    contenido.participantes_titulo ??
    "Participantes";

  const participantesDescripcion =
    contenido.participantes_descripcion ??
    "Agrega a las personas que participaron en esta edición y registra el disfraz que utilizaron.";

  const recuerdosEtiqueta =
    contenido.recuerdos_etiqueta ??
    "Recuerdos";

  const galeriaTitulo =
    contenido.galeria_titulo ??
    "Galería";

  const galeriaDescripcion =
    contenido.galeria_descripcion ??
    "Fotografías de La Mascarada 2026.";

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="relative min-h-screen overflow-hidden text-white">

      {/* =================================================
          FONDO
          ================================================= */}

      <div
        className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('/eventos/mascarada.png')",
        }}
      />

      <div className="fixed inset-0 -z-10 bg-black/65" />

      {/* =================================================
          CONTENIDO
          ================================================= */}

      <div className="relative z-10">

        {/* =================================================
            HERO
            ================================================= */}

        <section className="relative overflow-hidden border-b border-white/10">

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.25),_transparent_55%)]" />

          <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center md:py-32">

            {/* LOGO DEL EVENTO */}

            {evento.logo && (
              <img
                src={evento.logo}
                alt={evento.nombre}
                className="
                  mb-10
                  max-h-56
                  max-w-[320px]
                  object-contain
                  drop-shadow-2xl
                  md:max-h-72
                  md:max-w-[420px]
                "
              />
            )}

            {/* ETIQUETA */}

            <div className="w-full">
              <EditarTextoEdicion
                valor={heroEtiqueta}
                campo="hero_etiqueta"
                edicionId={edicion.id}
                claseTexto="
                  text-sm
                  font-bold
                  uppercase
                  tracking-[0.45em]
                  text-purple-400
                "
              />
            </div>

            {/* AÑO */}

            <h1 className="mt-4 text-6xl font-black tracking-tight md:text-8xl">
              2026
            </h1>

            {/* DESCRIPCIÓN */}

            <div className="mt-6 w-full max-w-2xl">
              <EditarTextoEdicion
                valor={heroDescripcion}
                campo="hero_descripcion"
                edicionId={edicion.id}
                multilinea
                claseTexto="
                  text-lg
                  leading-8
                  text-zinc-300
                  md:text-xl
                "
              />
            </div>

          </div>
        </section>

        {/* =================================================
            CONTENIDO PRINCIPAL
            ================================================= */}

        <div className="mx-auto max-w-7xl px-6 py-20">

          {/* =================================================
              RESUMEN
              ================================================= */}

          <section className="mb-24">

            <div className="mb-8">

              <div className="w-full">
                <EditarTextoEdicion
                  valor={resumenEtiqueta}
                  campo="resumen_etiqueta"
                  edicionId={edicion.id}
                  claseTexto="
                    text-sm
                    font-bold
                    uppercase
                    tracking-[0.35em]
                    text-purple-400
                  "
                />
              </div>

              <div className="mt-3 w-full">
                <EditarTextoEdicion
                  valor={resumenTitulo}
                  campo="resumen_titulo"
                  edicionId={edicion.id}
                  claseTexto="
                    text-4xl
                    font-black
                    md:text-5xl
                  "
                />
              </div>

            </div>

            <div className="rounded-3xl border border-white/10 bg-black/55 p-8 backdrop-blur-md md:p-12">

              <EditarTextoEdicion
                valor={resumen}
                campo="resumen"
                edicionId={edicion.id}
                multilinea
                claseTexto="
                  whitespace-pre-line
                  text-lg
                  leading-8
                  text-zinc-200
                  md:text-xl
                "
              />

            </div>

          </section>

          {/* =================================================
              TEMÁTICA
              ================================================= */}

          <section className="mb-24">

            <div className="mb-8">

              <div className="w-full">
                <EditarTextoEdicion
                  valor={tematicaEtiqueta}
                  campo="tematica_etiqueta"
                  edicionId={edicion.id}
                  claseTexto="
                    text-sm
                    font-bold
                    uppercase
                    tracking-[0.35em]
                    text-purple-400
                  "
                />
              </div>

              <div className="mt-3 w-full">
                <EditarTextoEdicion
                  valor={tematicaTitulo}
                  campo="tematica_titulo"
                  edicionId={edicion.id}
                  claseTexto="
                    text-4xl
                    font-black
                    md:text-5xl
                  "
                />
              </div>

            </div>

            <div className="rounded-3xl border border-purple-500/20 bg-black/55 p-8 backdrop-blur-md md:p-12">

              <EditarTextoEdicion
                valor={tematica}
                campo="tematica"
                edicionId={edicion.id}
                multilinea
                claseTexto="
                  whitespace-pre-line
                  text-2xl
                  font-bold
                  leading-9
                  text-purple-200
                  md:text-4xl
                "
              />

            </div>

          </section>

          {/* =================================================
              PARTICIPANTES
              ================================================= */}

          <section className="mb-24">

            <div className="mb-8">

              <div className="w-full">
                <EditarTextoEdicion
                  valor={participantesEtiqueta}
                  campo="participantes_etiqueta"
                  edicionId={edicion.id}
                  claseTexto="
                    text-sm
                    font-bold
                    uppercase
                    tracking-[0.35em]
                    text-purple-400
                  "
                />
              </div>

              <div className="mt-3 w-full">
                <EditarTextoEdicion
                  valor={participantesTitulo}
                  campo="participantes_titulo"
                  edicionId={edicion.id}
                  claseTexto="
                    text-4xl
                    font-black
                    md:text-5xl
                  "
                />
              </div>

              <div className="mt-4 max-w-2xl">
                <EditarTextoEdicion
                  valor={participantesDescripcion}
                  campo="participantes_descripcion"
                  edicionId={edicion.id}
                  multilinea
                  claseTexto="
                    text-zinc-400
                  "
                />
              </div>

            </div>

            <div className="rounded-3xl border border-white/10 bg-black/45 p-6 backdrop-blur-md md:p-8">

              <ParticipantesMascarada
                edicionId={edicion.id}
                personas={personas}
                participacionesIniciales={
                  participaciones
                }
              />

            </div>

          </section>

          {/* =================================================
              GALERÍA
              ================================================= */}

          <section className="mb-24">

            <div className="mb-8">

              <div className="w-full">
                <EditarTextoEdicion
                  valor={recuerdosEtiqueta}
                  campo="recuerdos_etiqueta"
                  edicionId={edicion.id}
                  claseTexto="
                    text-sm
                    font-bold
                    uppercase
                    tracking-[0.35em]
                    text-purple-400
                  "
                />
              </div>

              <div className="mt-3 w-full">
                <EditarTextoEdicion
                  valor={galeriaTitulo}
                  campo="galeria_titulo"
                  edicionId={edicion.id}
                  claseTexto="
                    text-4xl
                    font-black
                    md:text-5xl
                  "
                />
              </div>

              <div className="mt-4 max-w-2xl">
                <EditarTextoEdicion
                  valor={galeriaDescripcion}
                  campo="galeria_descripcion"
                  edicionId={edicion.id}
                  multilinea
                  claseTexto="
                    text-zinc-400
                  "
                />
              </div>

            </div>

            <div className="rounded-3xl border border-white/10 bg-black/45 p-6 backdrop-blur-md md:p-8">

              <GaleriaFotos
                edicionId={edicion.id}
              />

            </div>

          </section>

          {/* =================================================
              HISTORIA DEL EVENTO
              ================================================= */}

          <section className="grid gap-8 md:grid-cols-2">

            <div className="rounded-3xl border border-white/10 bg-black/50 p-8 backdrop-blur-md">

              <p className="text-sm font-bold uppercase tracking-[0.3em] text-purple-400">
                Evento
              </p>

              <h2 className="mt-3 text-3xl font-black">
                La Mascarada
              </h2>

              <p className="mt-5 whitespace-pre-line text-lg leading-8 text-zinc-300">
                {evento.historia ||
                  "La Mascarada es uno de los eventos de THE GAME ARCHIVE."}
              </p>

            </div>

            <div className="rounded-3xl border border-white/10 bg-black/50 p-8 backdrop-blur-md">

              <p className="text-sm font-bold uppercase tracking-[0.3em] text-purple-400">
                ¿Cómo nació?
              </p>

              <h2 className="mt-3 text-3xl font-black">
                El origen
              </h2>

              <p className="mt-5 whitespace-pre-line text-lg leading-8 text-zinc-300">
                {evento.como_nacio ||
                  "Una instancia para compartir, disfrazarse y crear recuerdos."}
              </p>

            </div>

          </section>

        </div>

        {/* =================================================
            FOOTER
            ================================================= */}

        <footer className="border-t border-white/10 bg-black/60 px-6 py-10 text-center">

          <p className="text-xs font-bold uppercase tracking-[0.35em] text-zinc-600">
            THE GAME ARCHIVE · LA MASCARADA 2026
          </p>

        </footer>

      </div>

    </main>
  );
}