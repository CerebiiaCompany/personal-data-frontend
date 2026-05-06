"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import Button from "@/components/base/Button";
import SectionHeader from "@/components/base/SectionHeader";
import UpdatePasswordDialog from "@/components/dialogs/UpdatePasswordDialog";

const profileLinks = [
  { title: "Cuenta", path: "/perfil" },
  { title: "Cambiar Clave", path: "/perfil/cambiar-clave" },
  { title: "Historial de pagos", path: "/perfil/pagos" },
  { title: "Planes", path: "/perfil/planes" },
];

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col bg-[#F8FAFC]">
      {/* Dialogs globales del área de perfil */}
      <UpdatePasswordDialog />
      <SectionHeader />

      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col px-5 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8 xl:px-10 2xl:px-12">
        <article className="flex min-h-0 w-full min-w-0 flex-1 gap-4 rounded-2xl border border-[#E8EDF7] bg-white p-4 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:p-5">
          {/* Sidebar */}
          <nav className="flex h-full min-w-[160px] flex-col justify-between lg:min-w-[190px]">
            <ul className="flex w-full flex-col gap-2 text-left">
              {profileLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    className={clsx(
                      "inline-flex w-full rounded-xl px-4 py-2.5 text-sm transition-colors",
                      pathname === link.path
                        ? "bg-[#EEF3FF] text-[#1A2B5B] font-semibold"
                        : "text-[#64748B] hover:bg-[#F4F7FF] font-normal"
                    )}
                    href={link.path}
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="w-full pt-4">
              <Button
                className="w-full rounded-xl! bg-primary-900! border-primary-900! py-2.5! text-sm!"
                href="/perfil/planes"
              >
                Mejorar Plan
              </Button>
            </div>
          </nav>

          {/* Separador vertical */}
          <div role="separator" className="h-full w-[1px] bg-[#EEF2F8]" />

          {/* Contenido de cada sub-ruta */}
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            {children}
          </div>
        </article>
      </div>
    </div>
  );
}
