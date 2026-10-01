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
  contenido: Record<string, string> | null;
  galeria_portada_url: string | null;
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
};

type Premio = {
  id: number;
  persona_id: number;
  edicion_id: number;
  nombre: string;
  descripcion: string | null;
  imagen: string | null;
};

export default async function UglySweatersPage() {

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
    .eq("slug", "ugly-sweaters")
    .single();

  if (eventoError || !evento) {
    console.error(
      "Error cargando Ugly Sweaters Party:",
      eventoError
    );

    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">

        <div className="text-center">

          <h1 className="text-3xl font-bold text-red-400">
            No se pudo cargar Ugly Sweaters Party
          </h1>

          <p className="mt-3 text-zinc-400">
            El evento no pudo ser encontrado.
          </p>

        </div>

      </main>
    );
  }

  // =====================================================
  // EDICIÓN ACTUAL 2026
  // =====================================================

  const {
    data: edicion2026Data,
    error: edicion2026Error,
  } = await supabase
    .from("ediciones")
    .select(
      "id, evento_id, año, fecha, contenido, galeria_portada_url"
    )
    .eq("evento_id", evento.id)
    .eq("año", 2026)
    .maybeSingle();

  if (edicion2026Error) {
    console.error(
      "Error cargando edición 2026:",
      edicion2026Error
    );
  }

  const edicion2026 =
    edicion2026Data as Edicion | null;

  // =====================================================
  // PREMIO 2026
  // =====================================================

  let premio2026: Premio | null = null;

  if (edicion2026) {

    const {
      data: premioData,
      error: premioError,
    } = await supabase
      .from("premios")
      .select(
        "id, persona_id, edicion_id, nombre, descripcion, imagen"
      )
      .eq(
        "edicion_id",
        edicion2026.id
      )
      .maybeSingle();

    if (premioError) {
      console.error(
        "Error cargando premio 2026:",
        premioError
      );
    }

    premio2026 =
      (premioData as Premio | null) ??
      null;
  }

  // =====================================================
  // GANADOR 2026
  // =====================================================

  let participacion2026:
    | Participacion
    | null = null;

  if (edicion2026) {

    const {
      data: participacionData,
      error: participacionError,
    } = await supabase
      .from("participaciones")
      .select(
        "id, persona_id, edicion_id, posicion, puntos_finales"
      )
      .eq(
        "edicion_id",
        edicion2026.id
      )
      .eq("posicion", 1)
      .maybeSingle();

    if (participacionError) {
      console.error(
        "Error cargando ganador 2026:",
        participacionError
      );
    }

    participacion2026 =
      (participacionData as Participacion | null) ??
      null;
  }

  // =====================================================
  // PERSONA GANADORA 2026
  // =====================================================

  const ganadorId =
    premio2026?.persona_id ??
    participacion2026?.persona_id ??
    null;

  let ganador2026:
    | Persona
    | null = null;

  if (ganadorId) {

    const {
      data: personaData,
      error: personaError,
    } = await supabase
      .from("personas")
      .select(
        "id, nombre, imagen"
      )
      .eq("id", ganadorId)
      .maybeSingle();

    if (personaError) {
      console.error(
        "Error cargando persona ganadora:",
        personaError
      );
    }

    ganador2026 =
      (personaData as Persona | null) ??
      null;
  }

  // =====================================================
  // IMAGEN DE RESPALDO 2026
  // =====================================================

  const imagen2026 =
    premio2026?.imagen ??
    ganador2026?.imagen ??
    null;

  // =====================================================
  // HISTORIA
  // =====================================================

  const historia =
    evento.historia ??
    "Ugly Sweaters Party es un evento de THE GAME ARCHIVE.";

  const comoNacio =
    evento.como_nacio ??
    "Una instancia para compartir, jugar y crear recuerdos.";

  // =====================================================
  // PORTADA DE 2026
  //
  // Primero usa la portada personalizada de la edición.
  // Si no existe, usa la imagen del ganador.
  // Si tampoco existe, usa el logo.
  // =====================================================

  const portada2026 =
    edicion2026?.galeria_portada_url ??
    imagen2026 ??
    evento.logo ??
    "/eventos/ugly-sweaters.png";

  // =====================================================
  // RENDER
  // =====================================================

  return (

    <main className="relative min-h-screen text-white">

      {/* =================================================
          FONDO GENERAL
          ================================================= */}

      <div className="fixed inset-0 z-0 overflow-hidden">

        <img
          src="/eventos/ugly-sweaters.png"
          alt=""
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
            object-center
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-black/65
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.12),_transparent_60%)]
          "
        />

      </div>

      <div className="relative z-10">

        {/* =================================================
            HERO
            ================================================= */}

        <section
          className="
            border-b
            border-white/10
          "
        >

          <div
            className="
              mx-auto
              flex
              min-h-[680px]
              max-w-6xl
              flex-col
              items-center
              justify-center
              px-6
              py-28
              text-center
            "
          >

            {/* LOGO */}

            {evento.logo && (

              <img
                src={evento.logo}
                alt={evento.nombre}
                className="
                  max-h-64
                  max-w-md
                  object-contain
                  drop-shadow-[0_10px_45px_rgba(0,0,0,0.8)]
                "
              />

            )}

            {/* IDENTIDAD */}

            <p
              className="
                mt-12
                text-xs
                font-bold
                uppercase
                tracking-[0.5em]
                text-violet-400
              "
            >
              THE GAME ARCHIVE
            </p>

            <div className="mt-5">

              <EditarTexto
                valor={evento.nombre}
                campo="nombre"
                eventoId={evento.id}
                claseTexto="
                  text-5xl
                  font-black
                  tracking-tight
                  md:text-7xl
                "
              />

            </div>

            {/* DESCRIPCIÓN */}

            <div
              className="
                mx-auto
                mt-7
                max-w-2xl
                text-base
                leading-8
                text-zinc-300
                md:text-lg
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

        {/* =================================================
            HISTORIA
            ================================================= */}

        <section
          className="
            mx-auto
            max-w-4xl
            px-6
            py-28
            text-center
          "
        >

          <p
            className="
              text-xs
              font-bold
              uppercase
              tracking-[0.4em]
              text-violet-400
            "
          >
            La historia
          </p>

          <h2
            className="
              mt-5
              text-4xl
              font-black
              md:text-5xl
            "
          >
            ¿Qué es Ugly Sweaters Party?
          </h2>

          <div
            className="
              mt-8
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

        </section>

        {/* =================================================
            ORIGEN
            ================================================= */}

        <section
          className="
            border-y
            border-white/10
            bg-black/30
          "
        >

          <div
            className="
              mx-auto
              max-w-4xl
              px-6
              py-28
              text-center
            "
          >

            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.4em]
                text-violet-400
              "
            >
              El origen
            </p>

            <h2
              className="
                mt-5
                text-4xl
                font-black
                md:text-5xl
              "
            >
              ¿Cómo nació?
            </h2>

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

          </div>

        </section>

        {/* =================================================
            EDICIONES
            ================================================= */}

        <section
          className="
            border-y
            border-white/10
            bg-black/35
          "
        >

          <div
            className="
              mx-auto
              max-w-7xl
              px-6
              py-28
            "
          >

            {/* =================================================
                ENCABEZADO
                ================================================= */}

            <div className="text-center">

              <p
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.45em]
                  text-violet-400
                "
              >
                Ugly Sweaters Party
              </p>

              <h2
                className="
                  mt-4
                  text-4xl
                  font-black
                  uppercase
                  md:text-5xl
                "
              >
                Ediciones
              </h2>

              <p
                className="
                  mx-auto
                  mt-4
                  max-w-xl
                  text-sm
                  leading-7
                  text-zinc-400
                "
              >
                Conoce la edición actual y revisa
                nuestro archivo histórico.
              </p>

            </div>

            {/* =================================================
                DOS TARJETAS — 3 COLUMNAS
                ================================================= */}

            <div
              className="
                mx-auto
                mt-16
                grid
                max-w-7xl
                grid-cols-1
                gap-6
                md:grid-cols-2
                xl:grid-cols-3
              "
            >

              {/* =================================================
                  TARJETA 2026
                  ================================================= */}

              <div
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-[2rem]
                  border
                  border-white/10
                  bg-zinc-950/90
                  shadow-2xl
                  transition
                  duration-500
                  hover:-translate-y-1
                  hover:border-violet-400/40
                "
              >

                <a
                  href="/eventos/ugly-sweaters/2026"
                  className="block"
                >

                  {/* IMAGEN */}

                  <div
                    className="
                      relative
                      h-[390px]
                      overflow-hidden
                      bg-zinc-950
                    "
                  >

                    {/* FONDO DIFUMINADO */}

                    <div
                      className="
                        absolute
                        inset-0
                        scale-110
                        bg-cover
                        bg-center
                        opacity-35
                        blur-2xl
                        transition
                        duration-700
                        group-hover:scale-125
                      "
                      style={{
                        backgroundImage:
                          `url('${portada2026}')`,
                      }}
                    />

                    {/* FOTO */}

                    <img
                      src={portada2026}
                      alt="Ugly Sweaters Party 2026"
                      className="
                        relative
                        z-10
                        h-full
                        w-full
                        object-cover
                        transition
                        duration-700
                        group-hover:scale-105
                      "
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

                    {/* INFORMACIÓN SOBRE FOTO */}

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
                          font-bold
                          uppercase
                          tracking-[0.35em]
                          text-violet-300
                        "
                      >
                        Edición actual
                      </p>

                      <h3
                        className="
                          mt-1
                          text-6xl
                          font-black
                        "
                      >
                        2026
                      </h3>

                    </div>

                  </div>

                  {/* INFORMACIÓN */}

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-5
                      border-t
                      border-white/10
                      px-7
                      py-6
                    "
                  >

                    <div>

                      <p
                        className="
                          text-xs
                          font-bold
                          uppercase
                          tracking-[0.2em]
                          text-zinc-500
                        "
                      >
                        Ugly Sweaters Party
                      </p>

                      <p
                        className="
                          mt-1
                          text-xl
                          font-bold
                          text-white
                        "
                      >
                        Edición 2026
                      </p>

                    </div>

                    <span
                      className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-white/10
                        text-lg
                        text-zinc-500
                        transition
                        duration-300
                        group-hover:border-violet-400/40
                        group-hover:bg-violet-500/10
                        group-hover:text-violet-400
                      "
                    >
                      →
                    </span>

                  </div>

                </a>

                {/* =================================================
                    EDITAR PORTADA
                    EXACTAMENTE COMO LA MASCARADA
                    ================================================= */}

                {edicion2026 && (

                  <EditarPortadaEdicion
                    edicionId={edicion2026.id}
                  />

                )}

              </div>


              {/* =================================================
                  TARJETA HISTÓRICO
                  ================================================= */}

              <a
                href="/eventos/ugly-sweaters/historico"
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-[2rem]
                  border
                  border-white/10
                  bg-zinc-950/90
                  shadow-2xl
                  transition
                  duration-500
                  hover:-translate-y-1
                  hover:border-violet-400/40
                "
              >

                {/* IMAGEN / LOGO */}

                <div
                  className="
                    relative
                    h-[390px]
                    overflow-hidden
                    bg-zinc-950
                  "
                >

                  {/* FOTO DE FONDO */}

                  <img
                    src="/eventos/ugly-sweaters.png"
                    alt=""
                    className="
                      absolute
                      inset-0
                      h-full
                      w-full
                      object-cover
                      opacity-20
                      transition
                      duration-700
                      group-hover:scale-105
                      group-hover:opacity-30
                    "
                  />

                  {/* OSCURECER */}

                  <div
                    className="
                      absolute
                      inset-0
                      bg-black/75
                    "
                  />

                  {/* DEGRADADO */}

                  <div
                    className="
                      absolute
                      inset-0
                      bg-gradient-to-b
                      from-black/40
                      via-black/50
                      to-black
                    "
                  />

                  {/* CONTENIDO */}

                  <div
                    className="
                      relative
                      z-10
                      flex
                      h-full
                      flex-col
                      items-center
                      justify-center
                      px-8
                      text-center
                    "
                  >

                    {/* LOGO */}

                    {evento.logo && (

                      <img
                        src={evento.logo}
                        alt="Ugly Sweaters Party"
                        className="
                          max-h-36
                          max-w-[75%]
                          object-contain
                          drop-shadow-[0_8px_30px_rgba(0,0,0,0.8)]
                          transition
                          duration-500
                          group-hover:scale-105
                        "
                      />

                    )}

                    {/* LÍNEA */}

                    <div
                      className="
                        mt-8
                        h-px
                        w-16
                        bg-violet-400/60
                      "
                    />

                    {/* TÍTULO */}

                    <h3
                      className="
                        mt-7
                        text-4xl
                        font-black
                        uppercase
                        tracking-[0.12em]
                        text-white
                        md:text-5xl
                      "
                    >
                      Histórico
                    </h3>

                    {/* DESCRIPCIÓN */}

                    <p
                      className="
                        mt-4
                        max-w-sm
                        text-sm
                        leading-6
                        text-zinc-300
                      "
                    >
                      Revive las ediciones anteriores
                      de Ugly Sweaters Party.
                    </p>

                  </div>

                </div>

                {/* =================================================
                    INFORMACIÓN
                    ================================================= */}

                <div
                  className="
                    border-t
                    border-white/10
                    bg-zinc-900/95
                    px-7
                    py-7
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-6
                    "
                  >

                    <div>

                      <p
                        className="
                          text-xs
                          font-bold
                          uppercase
                          tracking-[0.25em]
                          text-zinc-500
                        "
                      >
                        Archivo histórico
                      </p>

                      <p
                        className="
                          mt-2
                          text-2xl
                          font-black
                          text-white
                        "
                      >
                        2022 — 2025
                      </p>

                    </div>

                    <span
                      className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-white/10
                        text-lg
                        text-zinc-500
                        transition
                        duration-300
                        group-hover:border-violet-400/40
                        group-hover:bg-violet-500/10
                        group-hover:text-violet-400
                      "
                    >
                      →
                    </span>

                  </div>

                  <p
                    className="
                      mt-6
                      text-xs
                      font-bold
                      uppercase
                      tracking-[0.2em]
                      text-zinc-500
                      transition
                      group-hover:text-violet-400
                    "
                  >
                    Ver histórico
                  </p>

                </div>

              </a>

            </div>

          </div>

        </section>

        {/* =================================================
            FOOTER
            ================================================= */}

        <footer
          className="
            border-t
            border-white/10
            bg-black/45
            px-6
            py-10
          "
        >

          <div
            className="
              mx-auto
              flex
              max-w-6xl
              flex-col
              justify-between
              gap-3
              text-sm
              text-zinc-500
              md:flex-row
            "
          >

            <p>
              THE GAME ARCHIVE
            </p>

            <p>
              Ugly Sweaters Party
            </p>

          </div>

        </footer>

      </div>

    </main>
  );
}