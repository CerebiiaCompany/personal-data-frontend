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
    <div className="flex flex-col h-full">
      {/* Dialogs globales del área de perfil */}
      <UpdatePasswordDialog />
      <SectionHeader />

      <div className="px-8 py-6 flex flex-col gap-6 flex-1">
        <article className="p-5 gap-4 flex border border-disabled rounded-md flex-1">
          {/* Sidebar */}
          <nav className="w-fit flex flex-col min-w-[120px] items-center h-full justify-between">
            <ul className="flex flex-col w-full text-left gap-2">
              {profileLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    className={clsx(
                      "rounded-md px-4 py-2 text-sm transition-colors inline-flex w-full",
                      pathname === link.path
                        ? "bg-primary-50 text-primary-900 font-semibold"
                        : "text-stone-500 hover:bg-stone-100 font-normal"
                    )}
                    href={link.path}
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="w-full sticky bottom-5">
              <Button className="w-full" href="/perfil/planes">
                Mejorar Plan
              </Button>
            </div>
          </nav>

          {/* Separador vertical */}
          <div role="separator" className="w-[1px] h-full bg-disabled" />

          {/* Contenido de cada sub-ruta */}
          <div className="flex-1 flex flex-col gap-3 max-h-full overflow-y-auto">
            {children}
          </div>
        </article>
      </div>
    </div>
  );
}
