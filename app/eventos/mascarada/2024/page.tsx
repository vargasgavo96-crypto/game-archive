import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

import EditarTextoEdicion from "@/app/components/EditarTextoEdicion";
import ParticipantesMascarada from "@/app/components/ParticipantesMascarada";
import GaleriaFotos from "@/app/components/GaleriaFotos";

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

export default async function Mascarada2024Page() {
  // =====================================================
  // EVENTO
  // =====================================================

  const { data: evento, error: eventoError } =
    await supabase
      .from("eventos")
      .select("id, nombre, slug, logo")
      .eq("slug", "mascarada")
      .single();

  if (eventoError || !evento) {
    console.error(
      "Error buscando La Mascarada:",
      eventoError
    );

    notFound();
  }

  // =====================================================
  // EDICIÓN 2024
  // =====================================================

  const { data: edicion, error: edicionError } =
    await supabase
      .from("ediciones")
      .select(
        "id, evento_id, año, fecha, contenido"
      )
      .eq("evento_id", evento.id)
      .eq("año", 2024)
      .single();

  if (edicionError || !edicion) {
    console.error(
      "Error buscando edición 2024:",
      edicionError
    );

    notFound();
  }

  // =====================================================
  // PERSONAS
  // =====================================================

  const { data: personas, error: personasError } =
    await supabase
      .from("personas")
      .select("id, nombre, imagen")
      .order("nombre", { ascending: true });

  if (personasError) {
    console.error(
      "Error cargando personas:",
      personasError
    );
  }

  // =====================================================
  // PARTICIPACIONES
  // =====================================================

  const {
    data: participaciones,
    error: participacionesError,
  } = await supabase
    .from("participaciones")
    .select(
      "id, persona_id, edicion_id, posicion, puntos_finales, personaje, imagen"
    )
    .eq("edicion_id", edicion.id)
    .order("id", { ascending: true });

  if (participacionesError) {
    console.error(
      "Error cargando participaciones:",
      participacionesError
    );
  }

  // =====================================================
  // CONTENIDO
  // =====================================================

  const contenido =
    edicion.contenido &&
    typeof edicion.contenido === "object"
      ? (edicion.contenido as {
          resumen?: string;
          tematica?: string;
        })
      : {};

  const listaPersonas: Persona[] =
    personas ?? [];

  const listaParticipaciones: Participacion[] =
    participaciones ?? [];

  return (
    <main className="relative min-h-screen text-white">

      {/* =================================================
          FONDO DE TODA LA PÁGINA
      ================================================= */}

      <div
        className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('/eventos/mascarada.png')",
        }}
      />

      {/* =================================================
          OSCURECER EL FONDO
      ================================================= */}

      <div className="fixed inset-0 -z-10 bg-black/65" />

      {/* =================================================
          HERO
      ================================================= */}

      <section className="relative min-h-[75vh] flex items-center justify-center">

        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-24 text-center">

          <p className="text-sm md:text-base tracking-[0.4em] text-purple-300 mb-5 uppercase">
            Archivo histórico
          </p>

          <h1 className="text-6xl md:text-8xl font-black tracking-tight uppercase">
            La Mascarada
          </h1>

          <div className="mt-6 inline-flex items-center rounded-full border border-purple-400/40 bg-purple-950/70 px-8 py-3 backdrop-blur-sm">
            <span className="text-2xl md:text-3xl font-bold text-purple-200">
              2024
            </span>
          </div>

        </div>
      </section>

      {/* =================================================
          CONTENIDO
      ================================================= */}

      <section className="relative max-w-6xl mx-auto px-6 py-20">

        {/* =================================================
            RESUMEN
        ================================================= */}

        <div className="mb-20">

          <p className="text-sm tracking-[0.3em] text-purple-300 uppercase mb-3">
            La edición
          </p>

          <h2 className="text-4xl md:text-5xl font-black uppercase mb-8">
            Resumen
          </h2>

          <div className="rounded-3xl border border-white/10 bg-black/55 backdrop-blur-md p-8 md:p-10">

            <EditarTextoEdicion
              edicionId={edicion.id}
              campo="resumen"
              valor={
                contenido.resumen ??
                "Escribe aquí el resumen de la edición."
              }
            />

          </div>
        </div>

        {/* =================================================
            TEMÁTICA
        ================================================= */}

        <div className="mb-20">

          <p className="text-sm tracking-[0.3em] text-purple-300 uppercase mb-3">
            La edición
          </p>

          <h2 className="text-4xl md:text-5xl font-black uppercase mb-8">
            Temática
          </h2>

          <div className="rounded-3xl border border-white/10 bg-black/55 backdrop-blur-md p-8 md:p-10">

            <EditarTextoEdicion
              edicionId={edicion.id}
              campo="tematica"
              valor={
                contenido.tematica ??
                "Escribe aquí la temática de la edición."
              }
            />

          </div>
        </div>

        {/* =================================================
            PARTICIPANTES
        ================================================= */}

        <div className="mb-20">

          <p className="text-sm tracking-[0.3em] text-purple-300 uppercase mb-3">
            Los protagonistas
          </p>

          <h2 className="text-4xl md:text-5xl font-black uppercase mb-4">
            Participantes
          </h2>

          <p className="text-gray-200 max-w-2xl mb-10">
            Agrega a las personas que participaron
            en La Mascarada 2024 y registra el
            personaje que utilizaron.
          </p>

          <ParticipantesMascarada
            edicionId={edicion.id}
            personas={listaPersonas}
            participacionesIniciales={
              listaParticipaciones
            }
          />

        </div>

        {/* =================================================
            GALERÍA
        ================================================= */}

        <div>

          <p className="text-sm tracking-[0.3em] text-purple-300 uppercase mb-3">
            Recuerdos
          </p>

          <h2 className="text-4xl md:text-5xl font-black uppercase mb-4">
            Galería 2024
          </h2>

          <p className="text-gray-200 max-w-2xl mb-10">
            Fotografías de La Mascarada 2024.
          </p>

          <GaleriaFotos
            edicionId={edicion.id}
            año={2024}
          />

        </div>

      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <section className="relative border-t border-white/10 py-12 text-center bg-black/40 backdrop-blur-sm">

        <p className="text-gray-300 text-sm">
          THE GAME ARCHIVE · LA MASCARADA · 2024
        </p>

      </section>

    </main>
  );
}