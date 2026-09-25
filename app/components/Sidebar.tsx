"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Evento = {
  id: number;
  nombre: string;
  logo: string | null;
  slug: string;
};

const enlacesPrincipales = [
  { nombre: "Inicio", href: "/", icono: "⌂" },
  { nombre: "Eventos", href: "/eventos", icono: "🎮" },
  { nombre: "Calendario", href: "/calendario", icono: "📅" },
  { nombre: "Hall of Fame", href: "/hall-of-fame", icono: "🏆" },
  { nombre: "Amigxs", href: "/amigxs", icono: "👥" },
  { nombre: "Galería", href: "/galeria", icono: "📸" },
];

export default function Sidebar() {
  const [rutaActual, setRutaActual] = useState("");
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    setRutaActual(window.location.pathname);

    function actualizarRuta() {
      setRutaActual(window.location.pathname);
    }

    window.addEventListener("popstate", actualizarRuta);

    return () => {
      window.removeEventListener(
        "popstate",
        actualizarRuta
      );
    };
  }, []);

  useEffect(() => {
    async function cargarEventos() {
      const { data, error } = await supabase
        .from("eventos")
        .select("id, nombre, logo, slug")
        .order("nombre");

      if (error) {
        console.error(
          "Error cargando eventos:",
          error
        );

        return;
      }

      setEventos(data ?? []);
    }

    cargarEventos();
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuAbierto(false);
  }, [rutaActual]);

  function navegar(href: string) {
    setRutaActual(href);
    setMenuAbierto(false);
  }

  return (
    <>
      {/* SIDEBAR DESKTOP */}
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-72 flex-col border-r border-white/10 bg-black/80 backdrop-blur-xl lg:flex">
        <div className="border-b border-white/10 px-6 py-6">
          <Link
            href="/"
            onClick={() => navegar("/")}
            className="block"
          >
            <p className="text-xs font-semibold tracking-[0.35em] text-zinc-500">
              THE
            </p>

            <h1 className="text-2xl font-black tracking-tight text-white">
              GAME ARCHIVE
            </h1>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
            Navegación
          </p>

          <div className="space-y-1">
            {enlacesPrincipales.map((enlace) => {
              const activo =
                enlace.href === "/"
                  ? rutaActual === "/"
                  : rutaActual.startsWith(
                      enlace.href
                    );

              return (
                <Link
                  key={enlace.href}
                  href={enlace.href}
                  onClick={() => navegar(enlace.href)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    activo
                      ? "bg-violet-600/20 text-white"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="w-6 text-center text-base">
                    {enlace.icono}
                  </span>

                  <span>{enlace.nombre}</span>
                </Link>
              );
            })}
          </div>

          <div className="my-7 border-t border-white/10" />

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
            Eventos
          </p>

          <div className="space-y-1">
            {eventos.map((evento) => {
              const href = `/eventos/${evento.slug}`;

              const activo =
                rutaActual.startsWith(href);

              return (
                <Link
                  key={evento.id}
                  href={href}
                  onClick={() => navegar(href)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    activo
                      ? "bg-violet-600/20 text-white"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-white/10">
                    {evento.logo ? (
                      <Image
                        src={evento.logo}
                        alt={evento.nombre}
                        fill
                        className="object-contain p-1"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-xs">
                        🎮
                      </span>
                    )}
                  </div>

                  <span className="truncate">
                    {evento.nombre}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-white/10 px-6 py-5">
          <p className="text-xs text-zinc-600">
            Archivo histórico
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Eventos · Personas · Historias
          </p>
        </div>
      </aside>

      {/* BOTÓN MENÚ MÓVIL */}
      <button
        onClick={() => setMenuAbierto(true)}
        className="fixed left-4 top-4 z-[60] flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-black/70 text-xl text-white shadow-lg backdrop-blur-xl transition hover:bg-violet-600 lg:hidden"
        aria-label="Abrir menú"
      >
        ☰
      </button>

      {/* MENÚ MÓVIL */}
      {menuAbierto && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            onClick={() => setMenuAbierto(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="Cerrar menú"
          />

          <aside className="relative h-full w-[85%] max-w-sm overflow-y-auto border-r border-white/10 bg-zinc-950 shadow-2xl">
            {/* CABECERA */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-6">
              <Link
                href="/"
                onClick={() => navegar("/")}
                className="block"
              >
                <p className="text-xs font-semibold tracking-[0.35em] text-zinc-500">
                  THE
                </p>

                <h1 className="text-2xl font-black tracking-tight text-white">
                  GAME ARCHIVE
                </h1>
              </Link>

              <button
                onClick={() => setMenuAbierto(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-xl text-zinc-300 transition hover:bg-white/10 hover:text-white"
                aria-label="Cerrar menú"
              >
                ✕
              </button>
            </div>

            {/* NAVEGACIÓN */}
            <nav className="px-4 py-6">
              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                Navegación
              </p>

              <div className="space-y-1">
                {enlacesPrincipales.map((enlace) => {
                  const activo =
                    enlace.href === "/"
                      ? rutaActual === "/"
                      : rutaActual.startsWith(
                          enlace.href
                        );

                  return (
                    <Link
                      key={enlace.href}
                      href={enlace.href}
                      onClick={() =>
                        navegar(enlace.href)
                      }
                      className={`flex items-center gap-4 rounded-xl px-4 py-4 text-base font-medium transition ${
                        activo
                          ? "bg-violet-600/20 text-white"
                          : "text-zinc-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="w-7 text-center text-lg">
                        {enlace.icono}
                      </span>

                      <span>{enlace.nombre}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="my-7 border-t border-white/10" />

              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                Eventos
              </p>

              <div className="space-y-1">
                {eventos.map((evento) => {
                  const href = `/eventos/${evento.slug}`;

                  const activo =
                    rutaActual.startsWith(href);

                  return (
                    <Link
                      key={evento.id}
                      href={href}
                      onClick={() => navegar(href)}
                      className={`flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-medium transition ${
                        activo
                          ? "bg-violet-600/20 text-white"
                          : "text-zinc-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white/10">
                        {evento.logo ? (
                          <Image
                            src={evento.logo}
                            alt={evento.nombre}
                            fill
                            className="object-contain p-1"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-sm">
                            🎮
                          </span>
                        )}
                      </div>

                      <span className="truncate">
                        {evento.nombre}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* PIE */}
            <div className="border-t border-white/10 px-6 py-6">
              <p className="text-xs text-zinc-600">
                Archivo histórico
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Eventos · Personas · Historias
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}