import { notFound } from "next/navigation";

import { supabase } from "@/lib/supabase";

import EditarTextoEdicion from "@/app/components/EditarTextoEdicion";
import ParticipantesMascarada from "@/app/components/ParticipantesMascarada";
import GaleriaFotos from "@/app/components/GaleriaFotos";

type Evento = {
  id: number;
  nombre: string;
  descripcion: string;
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

export default async function Mascarada2024Page() {
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

  const evento =
    eventoData as Evento;

  // =====================================================
  // EDICIÓN 2024
  // =====================================================

  const {
    data: edicionData,
    error: edicionError,
  } = await supabase
    .from("ediciones")
    .select(
      "id, evento_id, año, fecha, contenido"
    )
    .eq("evento_id", evento.id)
    .eq("año", 2024)
    .single();

  if (edicionError || !edicionData) {
    console.error(
      "Error cargando edición 2024:",
      edicionError
    );

    notFound();
  }

  const edicion =
    edicionData as Edicion;

  // =====================================================
  // PARTICIPACIONES
  //
  // IMPORTANTE:
  // Separamos la consulta y hacemos el cast después
  // para evitar el ParserError que estaba apareciendo
  // en el build de Vercel.
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
  // CONTENIDO DE LA EDICIÓN
  // =====================================================

  const contenido =
    edicion.contenido ?? {};

  const resumen =
    contenido.resumen ??
    "Escribe aquí el resumen de la edición.";

  const tematica =
    contenido.tematica ??
    "Escribe aquí la temática de la edición.";

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

            <p className="text-sm font-bold uppercase tracking-[0.45em] text-purple-400">
              La Mascarada
            </p>

            <h1 className="mt-4 text-6xl font-black tracking-tight md:text-8xl">
              2024
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300 md:text-xl">
              Una edición más de La Mascarada,
              donde nuestros amigos se transforman
              en personajes y disfraces únicos.
            </p>

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

              <p className="text-sm font-bold uppercase tracking-[0.35em] text-purple-400">
                La edición
              </p>

              <h2 className="mt-3 text-4xl font-black md:text-5xl">
                Resumen de la edición
              </h2>

            </div>

            <div className="rounded-3xl border border-white/10 bg-black/55 p-8 backdrop-blur-md md:p-12">

              <EditarTextoEdicion
                valor={resumen}
                campo="resumen"
                edicionId={edicion.id}
                multilinea
                claseTexto="whitespace-pre-line text-lg leading-8 text-zinc-200 md:text-xl"
              />

            </div>

          </section>

          {/* =================================================
              TEMÁTICA
              ================================================= */}

          <section className="mb-24">

            <div className="mb-8">

              <p className="text-sm font-bold uppercase tracking-[0.35em] text-purple-400">
                Temática
              </p>

              <h2 className="mt-3 text-4xl font-black md:text-5xl">
                Temática de la edición
              </h2>

            </div>

            <div className="rounded-3xl border border-purple-500/20 bg-black/55 p-8 backdrop-blur-md md:p-12">

              <EditarTextoEdicion
                valor={tematica}
                campo="tematica"
                edicionId={edicion.id}
                multilinea
                claseTexto="whitespace-pre-line text-2xl font-bold leading-9 text-purple-200 md:text-4xl"
              />

            </div>

          </section>

          {/* =================================================
              PARTICIPANTES
              ================================================= */}

          <section className="mb-24">

            <div className="mb-8">

              <p className="text-sm font-bold uppercase tracking-[0.35em] text-purple-400">
                Los invitados
              </p>

              <h2 className="mt-3 text-4xl font-black md:text-5xl">
                Participantes
              </h2>

              <p className="mt-4 max-w-2xl text-zinc-400">
                Agrega a las personas que participaron
                en esta edición y registra el disfraz
                que utilizaron.
              </p>

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

              <p className="text-sm font-bold uppercase tracking-[0.35em] text-purple-400">
                Recuerdos
              </p>

              <h2 className="mt-3 text-4xl font-black md:text-5xl">
                Galería
              </h2>

              <p className="mt-4 max-w-2xl text-zinc-400">
                Fotografías de La Mascarada 2024.
              </p>

            </div>

            <div className="rounded-3xl border border-white/10 bg-black/45 p-6 backdrop-blur-md md:p-8">

              <GaleriaFotos
                edicionId={edicion.id}
              />

            </div>

          </section>

          {/* =================================================
              INFORMACIÓN
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
            THE GAME ARCHIVE · LA MASCARADA 2024
          </p>

        </footer>

      </div>

    </main>
  );
}