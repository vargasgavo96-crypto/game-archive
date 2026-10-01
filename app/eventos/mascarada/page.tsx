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
  fecha: string;
  galeria_portada_url: string | null;
};

export default async function MascaradaPage() {
  // ==================================================
  // EVENTO
  // ==================================================

  const {
    data: evento,
    error: eventoError,
  } = await supabase
    .from("eventos")
    .select(
      "id, nombre, descripcion, logo, slug, historia, como_nacio"
    )
    .eq("slug", "mascarada")
    .single();

  if (eventoError || !evento) {
    console.error(
      "Error cargando La Mascarada:",
      eventoError
    );

    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-400">
            No se pudo cargar La Mascarada
          </h1>

          <p className="mt-3 text-zinc-400">
            El evento no pudo ser encontrado.
          </p>
        </div>
      </main>
    );
  }

  // ==================================================
  // EDICIONES
  // ==================================================

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
      "Error cargando ediciones:",
      edicionesError
    );
  }

  const ediciones: Edicion[] =
    edicionesData ?? [];

  // ==================================================
  // HISTORIA
  // ==================================================

  const historia =
    evento.historia ??
    "La Mascarada es un evento de THE GAME ARCHIVE.";

  const comoNacio =
    evento.como_nacio ??
    "Una instancia para compartir, jugar y celebrar.";

  // ==================================================
  // RENDER
  // ==================================================

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
          "url('/eventos/mascarada.png')",
      }}
    >

      <div className="fixed inset-0 z-0 bg-black/55" />

      <div className="relative z-10">

        {/* ================================================== */}
        {/* HERO */}
        {/* ================================================== */}

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

            {evento.logo && (
              <img
                src={evento.logo}
                alt="La Mascarada"
                className="
                  max-h-72
                  max-w-md
                  object-contain
                "
              />
            )}

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
                valor={
                  evento.descripcion ?? ""
                }
                campo="descripcion"
                eventoId={evento.id}
                multilinea
              />
            </div>

          </div>
        </section>

        {/* ================================================== */}
        {/* HISTORIA */}
        {/* ================================================== */}

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
            ¿Qué es La Mascarada?
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

        {/* ================================================== */}
        {/* EDICIONES */}
        {/* ================================================== */}

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
              py-20
            "
          >

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
                  text-4xl
                  font-black
                  md:text-5xl
                "
              >
                EDICIONES
              </h2>

              <p
                className="
                  mx-auto
                  mt-4
                  max-w-xl
                  text-sm
                  leading-7
                  text-zinc-300
                  md:text-base
                "
              >
                Revive cada edición de La
                Mascarada y descubre los
                momentos que marcaron su
                historia.
              </p>

            </div>

            {ediciones.length === 0 ? (

              <div
                className="
                  mx-auto
                  mt-12
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
                  Próximamente
                </h3>

                <p
                  className="
                    mt-5
                    text-lg
                    text-zinc-300
                  "
                >
                  Las ediciones de La
                  Mascarada aparecerán aquí.
                </p>

              </div>

            ) : (

              <div
                className="
                  mt-12
                  grid
                  grid-cols-1
                  gap-6
                  sm:grid-cols-2
                  lg:grid-cols-3
                "
              >

                {ediciones.map(
                  (edicion) => {

                    const portada =
                      edicion.galeria_portada_url ??
                      evento.logo ??
                      "/logos/mascarada.png";

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
                          rounded-2xl
                          border
                          border-white/10
                          bg-zinc-950/95
                          shadow-2xl
                          transition
                          duration-300
                          hover:-translate-y-2
                          hover:border-violet-500/50
                        "
                      >

                        {/* ================================================== */}
                        {/* LINK A LA EDICIÓN */}
                        {/* ================================================== */}

                        <a
                          href={`/eventos/mascarada/${edicion.año}`}
                          className="block"
                        >

                          {/* ================================================== */}
                          {/* PORTADA */}
                          {/* ================================================== */}

                          <div
                            className="
                              relative
                              h-[330px]
                              overflow-hidden
                              bg-zinc-900
                            "
                          >

                            <img
                              src={portada}
                              alt={`La Mascarada ${edicion.año}`}
                              className={`
                                h-full
                                w-full
                                transition
                                duration-700
                                group-hover:scale-105
                                ${
                                  tienePortada
                                    ? "object-cover object-center"
                                    : "object-contain p-12 opacity-70"
                                }
                              `}
                            />

                            {/* GRADIENTE */}

                            <div
                              className="
                                absolute
                                inset-0
                                bg-gradient-to-t
                                from-black
                                via-black/30
                                to-transparent
                              "
                            />

                            {/* AÑO */}

                            <div
                              className="
                                absolute
                                bottom-5
                                left-5
                                z-20
                              "
                            >

                              <p
                                className="
                                  text-xs
                                  font-semibold
                                  uppercase
                                  tracking-[0.3em]
                                  text-violet-300
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
                                  text-white
                                "
                              >
                                {edicion.año}
                              </h3>

                            </div>

                          </div>

                          {/* ================================================== */}
                          {/* PIE DE TARJETA */}
                          {/* ================================================== */}

                          <div
                            className="
                              border-t
                              border-white/10
                              bg-zinc-900/95
                              px-5
                              py-4
                            "
                          >

                            <p
                              className="
                                text-sm
                                font-semibold
                                text-zinc-500
                                transition
                                group-hover:text-violet-400
                              "
                            >
                              VER EDICIÓN →
                            </p>

                          </div>

                        </a>

                        {/* ================================================== */}
                        {/* EDITAR PORTADA */}
                        {/* ================================================== */}

                        <EditarPortadaEdicion
                          edicionId={edicion.id}
                        />

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </div>
        </section>

        {/* ================================================== */}
        {/* FOOTER */}
        {/* ================================================== */}

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
              justify-between
              text-sm
              text-zinc-500
            "
          >

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