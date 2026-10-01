import { supabase } from "@/lib/supabase";

import EditarTexto from "@/app/components/EditarTexto";
import EditarPortadaEdicion from "@/app/components/EditarPortadaEdicion";

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
  año: string;
  fecha: string | null;
  galeria_portada_url: string | null;
};

export default async function WinterweenPage() {
  // =====================================================
  // EVENTO
  // =====================================================

  const {
    data: evento,
    error: eventoError,
  } = await supabase
    .from("eventos")
    .select(
      "id, nombre, descripcion, logo, slug, historia, como_nacio"
    )
    .eq("slug", "winterween")
    .single();

  if (eventoError || !evento) {
    console.error(
      "Error cargando Winterween:",
      eventoError
    );

    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-400">
            No se pudo cargar Winterween
          </h1>

          <p className="mt-3 text-zinc-400">
            El evento no pudo ser encontrado.
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // EDICIONES
  // =====================================================

  const {
    data: edicionesData,
    error: edicionesError,
  } = await supabase
    .from("ediciones")
    .select(
      "id, evento_id, fecha, galeria_portada_url"
    )
    .eq("evento_id", evento.id)
    .order("fecha", {
      ascending: false,
    });

  if (edicionesError) {
    console.error(
      "Error cargando ediciones de Winterween:",
      edicionesError
    );
  }

  const ediciones: Edicion[] =
    (edicionesData ?? []) as Edicion[];

  // =====================================================
  // HISTORIA
  // =====================================================

  const historia =
    evento.historia ??
    "Winterween es un evento de THE GAME ARCHIVE.";

  const comoNacio =
    evento.como_nacio ??
    "Una instancia para compartir, jugar y crear recuerdos.";

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main
      className="
        relative
        min-h-screen
        bg-cover
        bg-center
        bg-fixed
        text-white
      "
      style={{
        backgroundImage:
          "url('/eventos/winterween.png')",
      }}
    >
      {/* =================================================
          FONDO
          ================================================= */}

      <div className="fixed inset-0 z-0 bg-black/60" />

      <div className="relative z-10">
        {/* =================================================
            HERO
            ================================================= */}

        <section
          className="
            relative
            overflow-hidden
            border-b
            border-white/10
          "
        >
          <div
            className="
              absolute
              inset-0
              bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.25),_transparent_50%)]
            "
          />

          <div
            className="
              relative
              mx-auto
              flex
              max-w-7xl
              flex-col
              items-center
              px-6
              py-24
              text-center
            "
          >
            {/* LOGO */}

            {evento.logo && (
              <img
                src={evento.logo}
                alt={evento.nombre}
                className="
                  max-h-72
                  max-w-md
                  object-contain
                "
              />
            )}

            {/* ETIQUETA */}

            <p
              className="
                mt-12
                text-sm
                font-semibold
                uppercase
                tracking-[0.4em]
                text-violet-400
              "
            >
              Nuestro evento
            </p>

            {/* NOMBRE */}

            <div className="mt-4 w-full">
              <EditarTexto
                valor={evento.nombre}
                campo="nombre"
                eventoId={evento.id}
                claseTexto="
                  text-5xl
                  font-black
                  md:text-7xl
                "
              />
            </div>

            {/* DESCRIPCIÓN */}

            <div
              className="
                mx-auto
                mt-8
                max-w-3xl
                text-lg
                leading-8
                text-zinc-300
              "
            >
              <EditarTexto
                valor={evento.descripcion ?? ""}
                campo="descripcion"
                eventoId={evento.id}
                multilinea
              />
            </div>
          </div>
        </section>

        {/* =================================================
            HISTORIA
            ================================================= */}

        <section
          className="
            mx-auto
            max-w-5xl
            px-6
            py-24
            text-center
          "
        >
          <p
            className="
              text-sm
              font-semibold
              uppercase
              tracking-[0.3em]
              text-violet-400
            "
          >
            La historia
          </p>

          <h2
            className="
              mt-4
              text-4xl
              font-bold
              md:text-5xl
            "
          >
            ¿Qué es Winterween?
          </h2>

          <div
            className="
              mt-10
              text-lg
              leading-8
              text-zinc-300
            "
          >
            <EditarTexto
              valor={historia}
              campo="historia"
              eventoId={evento.id}
              multilinea
            />
          </div>

          <div
            className="
              mt-8
              text-lg
              leading-8
              text-zinc-300
            "
          >
            <EditarTexto
              valor={comoNacio}
              campo="como_nacio"
              eventoId={evento.id}
              multilinea
            />
          </div>
        </section>

        {/* =================================================
            EDICIONES
            ================================================= */}

        <section
          className="
            border-y
            border-white/10
            bg-black/40
          "
        >
          <div
            className="
              mx-auto
              max-w-7xl
              px-6
              py-24
            "
          >
            {/* ENCABEZADO */}

            <div className="text-center">
              <p
                className="
                  text-sm
                  font-semibold
                  uppercase
                  tracking-[0.3em]
                  text-violet-400
                "
              >
                Archivo histórico
              </p>

              <h2
                className="
                  mt-4
                  text-5xl
                  font-black
                "
              >
                EDICIONES
              </h2>

              <p
                className="
                  mx-auto
                  mt-5
                  max-w-xl
                  text-zinc-300
                "
              >
                Las ediciones de Winterween.
              </p>
            </div>

            {/* =================================================
                SIN EDICIONES
                ================================================= */}

            {ediciones.length === 0 ? (
              <div
                className="
                  mx-auto
                  mt-14
                  max-w-2xl
                  rounded-3xl
                  border
                  border-white/10
                  bg-zinc-900/90
                  p-12
                  text-center
                "
              >
                <p
                  className="
                    text-sm
                    font-semibold
                    uppercase
                    tracking-[0.3em]
                    text-violet-400
                  "
                >
                  Próximamente
                </p>

                <h3
                  className="
                    mt-5
                    text-4xl
                    font-black
                    md:text-5xl
                  "
                >
                  Winterween
                </h3>

                <p
                  className="
                    mt-5
                    text-lg
                    text-zinc-300
                  "
                >
                  Las ediciones de Winterween aparecerán aquí.
                </p>
              </div>
            ) : (
              /* =================================================
                 TARJETAS
                 ================================================= */

              <div
                className="
                  mt-14
                  grid
                  grid-cols-1
                  gap-6
                  md:grid-cols-2
                  lg:grid-cols-3
                "
              >
                {ediciones.map((edicion) => {
                  // =================================================
                  // PORTADA
                  //
                  // 1. portada personalizada
                  // 2. logo del evento
                  // 3. imagen de respaldo
                  // =================================================

                  const portada =
                    edicion.galeria_portada_url ??
                    evento.logo ??
                    "/logos/winterween.png";

                  const tienePortada =
                    Boolean(
                      edicion.galeria_portada_url
                    );

                  return (
                    <div
                      key={edicion.id}
                      className="
                        group
                        relative
                        overflow-hidden
                        rounded-3xl
                        border
                        border-white/10
                        bg-zinc-900/90
                        shadow-2xl
                        transition
                        duration-300
                        hover:-translate-y-2
                        hover:border-violet-500/50
                      "
                    >
                      {/* =================================================
                          TARJETA
                          ================================================= */}

                      <a
                        href={`/eventos/winterween/${edicion.año}`}
                        className="block"
                      >
                        {/* =================================================
                            PORTADA
                            ================================================= */}

                        <div
                          className="
                            relative
                            h-[400px]
                            overflow-hidden
                            bg-zinc-950
                          "
                        >
                          {/* FONDO */}

                          <div
                            className="
                              absolute
                              inset-0
                              scale-110
                              bg-cover
                              bg-center
                              opacity-30
                              blur-2xl
                              transition
                              duration-700
                              group-hover:scale-125
                            "
                            style={{
                              backgroundImage:
                                `url('${portada}')`,
                            }}
                          />

                          {/* OSCURECER */}

                          <div
                            className="
                              absolute
                              inset-0
                              bg-black/40
                            "
                          />

                          {/* IMAGEN */}

                          <img
                            src={portada}
                            alt={`Winterween ${edicion.año}`}
                            className={`
                              relative
                              z-10
                              h-full
                              w-full
                              transition
                              duration-700
                              group-hover:scale-105
                              ${
                                tienePortada
                                  ? "object-cover object-center"
                                  : "object-contain p-12"
                              }
                            `}
                          />

                          {/* DEGRADADO */}

                          <div
                            className="
                              absolute
                              inset-0
                              z-20
                              bg-gradient-to-t
                              from-black
                              via-black/20
                              to-transparent
                            "
                          />

                          {/* AÑO */}

                          <div
                            className="
                              absolute
                              bottom-7
                              left-7
                              z-30
                            "
                          >
                            <p
                              className="
                                text-xs
                                font-semibold
                                uppercase
                                tracking-[0.3em]
                                text-violet-400
                              "
                            >
                              Edición
                            </p>

                            <h3
                              className="
                                mt-1
                                text-5xl
                                font-black
                                tracking-tight
                              "
                            >
                              {edicion.año}
                            </h3>
                          </div>
                        </div>

                        {/* =================================================
                            PARTE INFERIOR
                            ================================================= */}

                        <div
                          className="
                            border-t
                            border-white/10
                            bg-zinc-900/95
                            px-6
                            py-5
                          "
                        >
                          <p
                            className="
                              text-xs
                              font-semibold
                              uppercase
                              tracking-[0.2em]
                              text-zinc-500
                            "
                          >
                            Winterween
                          </p>

                          <p
                            className="
                              mt-1
                              text-xl
                              font-bold
                              text-white
                            "
                          >
                            Edición {edicion.año}
                          </p>

                          <p
                            className="
                              mt-4
                              text-xs
                              font-semibold
                              uppercase
                              tracking-[0.2em]
                              text-zinc-500
                              transition
                              group-hover:text-violet-400
                            "
                          >
                            VER EDICIÓN →
                          </p>
                        </div>
                      </a>

                      {/* =================================================
                          EDITAR PORTADA
                          ================================================= */}

                      <EditarPortadaEdicion
                        edicionId={edicion.id}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* =================================================
            FOOTER
            ================================================= */}

        <footer
          className="
            border-t
            border-white/10
            bg-black/40
            px-6
            py-10
          "
        >
          <div
            className="
              mx-auto
              flex
              max-w-7xl
              flex-col
              gap-3
              text-sm
              text-zinc-500
              md:flex-row
              md:justify-between
            "
          >
            <p>
              THE GAME ARCHIVE
            </p>

            <p>
              Juegos · Eventos
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
