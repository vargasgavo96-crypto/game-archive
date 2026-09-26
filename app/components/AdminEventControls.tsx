"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  permiso?: string;
  href: string;
  label: string;
  icon?: string;
  variant?: "default" | "gold";
};

export default function AdminEventControls({
  permiso,
  href,
  label,
  icon = "✏️",
  variant = "default",
}: Props) {
  const [visible, setVisible] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    async function comprobarPermiso() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (activo) {
            setVisible(false);
            setCargando(false);
          }

          return;
        }

        const { data: perfil, error: perfilError } =
          await supabase
            .from("perfiles")
            .select("id, rol, activo")
            .eq("id", user.id)
            .single();

        if (
          perfilError ||
          !perfil ||
          !perfil.activo
        ) {
          if (activo) {
            setVisible(false);
            setCargando(false);
          }

          return;
        }

        if (perfil.rol === "superadmin") {
          if (activo) {
            setVisible(true);
            setCargando(false);
          }

          return;
        }

        if (!permiso) {
          if (activo) {
            setVisible(false);
            setCargando(false);
          }

          return;
        }

        const {
          data: permisoUsuario,
          error: permisoError,
        } = await supabase
          .from("permisos_usuario")
          .select("permiso")
          .eq("usuario_id", user.id)
          .eq("permiso", permiso)
          .maybeSingle();

        if (activo) {
          setVisible(
            !permisoError && !!permisoUsuario
          );

          setCargando(false);
        }
      } catch (error) {
        console.error(
          "Error comprobando permiso:",
          error
        );

        if (activo) {
          setVisible(false);
          setCargando(false);
        }
      }
    }

    comprobarPermiso();

    return () => {
      activo = false;
    };
  }, [permiso]);

  if (cargando || !visible) {
    return null;
  }

  const estilos =
    variant === "gold"
      ? "border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37] hover:border-[#d4af37]/60 hover:bg-[#d4af37]/20"
      : "border-violet-500/30 bg-violet-500/10 text-violet-300 hover:border-violet-500/60 hover:bg-violet-500/20";

  return (
    <Link
      href={href}
      onClick={(event) => {
        event.stopPropagation();
      }}
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] transition ${estilos}`}
    >
      <span className="text-sm">
        {icon}
      </span>

      <span>{label}</span>
    </Link>
  );
}