"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Evento = {
  id: number;
  nombre: string;
  slug: string;
};

type Edicion = {
  id: number;
  evento_id: number;
  fecha: string | null;
};

type Mes = {
  numero: number;
  nombre: string;
  archivo: string;
};

const meses: Mes[] = [
  { numero: 0, nombre: "ENERO", archivo: "enero" },
  { numero: 1, nombre: "FEBRERO", archivo: "febrero" },
  { numero: 2, nombre: "MARZO", archivo: "marzo" },
  { numero: 3, nombre: "ABRIL", archivo: "abril" },
  { numero: 4, nombre: "MAYO", archivo: "mayo" },
  { numero: 5, nombre: "JUNIO", archivo: "junio" },
  { numero: 6, nombre: "JULIO", archivo: "julio" },
  { numero: 7, nombre: "AGOSTO", archivo: "agosto" },
  { numero: 8, nombre: "SEPTIEMBRE", archivo: "septiembre" },
  { numero: 9, nombre: "OCTUBRE", archivo: "octubre" },
  { numero: 10, nombre: "NOVIEMBRE", archivo: "noviembre" },
  { numero: 11, nombre: "DICIEMBRE", archivo: "diciembre" },
];

export default function CalendarioPage() {
  const [mesActual] = useState<number>(() =>
    new Date().getMonth()
  );
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [ediciones, setEdiciones] = useState<Edicion[]>([]);

  useEffect(() => {
    async function cargarEventosCalendario() {
      const { createClient } = await import(
        "@supabase/supabase-js"
      );

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
      );

      const [
        { data: eventosData, error: eventosError },
        { data: edicionesData, error: edicionesError },
      ] = await Promise.all([
        supabase
          .from("eventos")
          .select("id, nombre, slug"),
        supabase
          .from("ediciones")
          .select("id, evento_id, fecha"),
      ]);

      if (eventosError) {
        console.error(
          "Error cargando eventos:",
          eventosError
        );
      }

      if (edicionesError) {
        console.error(
          "Error cargando ediciones:",
          edicionesError
        );
      }

      setEventos(eventosData ?? []);
      setEdiciones(edicionesData ?? []);
    }

    cargarEventosCalendario();
  }, []);

  const mesDestacado =
    meses.find((mes) => mes.numero === mesActual) ??
    meses[0];

  function obtenerEventoDelMes(numeroMes: number) {
    const edicionesDelMes = ediciones.filter((edicion) => {
      if (!edicion.fecha) return false;

      const fecha = new Date(
        `${edicion.fecha}T12:00:00`
      );

      return fecha.getMonth() === numeroMes;
    });

    if (edicionesDelMes.length === 0) {
      return null;
    }

    const edicion =
      edicionesDelMes[edicionesDelMes.length - 1];

    return (
      eventos.find(
        (evento) => evento.id === edicion.evento_id
      ) ?? null
    );
  }

  const eventoDelMes =
    obtenerEventoDelMes(mesActual);

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="fixed inset-0">
        <Image
          src="/eventos/todos.jfif"
          alt=""
          fill
          priority
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-black/85" />
      </div>

      <div className="relative z-10">
        {/* BANNER DEL MES ACTUAL */}
        <section className="relative overflow-hidden border-b border-white/10 bg-black">
          <div className="relative w-full">
            <Image
              src={`/presentaciones/${mesDestacado.archivo}banner.png`}
              alt={mesDestacado.nombre}
              width={1920}
              height={600}
              priority
              className="block h-auto w-full"
            />

            <div className="absolute inset-0 bg-black/30" />

            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/10 to-black/45" />

            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/10" />

            <div className="absolute inset-0 flex items-end">
              <div className="mx-auto w-full max-w-7xl px-6 py-8 md:px-10 md:py-10">
                <div className="max-w-6xl">
                  {/* TÍTULO DE LA SECCIÓN */}
                  <p className="text-base font-black uppercase tracking-[0.35em] text-[#d4af37] md:text-xl">
                    CALENDARIO DE ACTIVIDADES
                  </p>

                  {/* MES */}
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.3em] text-zinc-300 md:text-sm">
                    {mesDestacado.nombre}
                  </p>

                  {/* EVENTO */}
                  <h1 className="mt-2 whitespace-nowrap text-4xl font-black uppercase leading-none tracking-tight text-white drop-shadow-2xl md:text-5xl lg:text-6xl">
                    {eventoDelMes
                      ? eventoDelMes.nombre
                      : mesDestacado.nombre}
                  </h1>

                  {/* INDICADOR MES ACTUAL */}
                  <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/60 bg-black/60 px-4 py-2 text-xs font-bold text-[#f3d675] backdrop-blur-md md:text-sm">
                    <span className="h-2 w-2 rounded-full bg-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.9)]" />
                    MES ACTUAL
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CALENDARIO */}
        <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24">
          <div className="mb-12 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-violet-400">
              Año completo
            </p>

            <h2 className="mt-3 text-4xl font-black md:text-6xl">
              CALENDARIO
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-zinc-400">
              Explora las actividades organizadas durante el año.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {meses.map((mes) => {
              const esActual = mes.numero === mesActual;
              const eventoDelMes =
                obtenerEventoDelMes(mes.numero);

              const tieneEvento = eventoDelMes !== null;

              return (
                <article
                  key={mes.numero}
                  onClick={() => {
                    if (!eventoDelMes) return;

                    window.location.href = `/eventos/${eventoDelMes.slug}`;
                  }}
                  className={`group relative overflow-hidden rounded-3xl border bg-black/60 transition duration-500 ${
                    esActual
                      ? "border-[#d4af37] shadow-[0_0_0_2px_rgba(212,175,55,0.75),0_0_40px_rgba(212,175,55,0.45)]"
                      : "border-white/10"
                  } ${
                    tieneEvento
                      ? "cursor-pointer hover:-translate-y-2 hover:border-violet-500/60 hover:shadow-2xl"
                      : "cursor-default"
                  }`}
                >
                  {esActual && (
                    <div className="pointer-events-none absolute -inset-2 z-0 rounded-[2rem] bg-[#d4af37]/10 blur-2xl" />
                  )}

                  <div className="relative z-10 overflow-hidden">
                    <Image
                      src={`/presentaciones/${mes.archivo}.png`}
                      alt={mes.nombre}
                      width={1200}
                      height={800}
                      className={`block h-auto w-full transition duration-700 ${
                        tieneEvento
                          ? "group-hover:scale-[1.02]"
                          : ""
                      }`}
                    />

                    {esActual && (
                      <div className="absolute left-4 top-4 rounded-full border border-[#d4af37]/70 bg-black/70 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#f3d675] backdrop-blur-md">
                        MES ACTUAL
                      </div>
                    )}

                    {tieneEvento && (
                      <div className="absolute bottom-4 right-4 rounded-full border border-white/20 bg-black/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white opacity-0 backdrop-blur-md transition duration-300 group-hover:opacity-100">
                        VER EVENTO →
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}