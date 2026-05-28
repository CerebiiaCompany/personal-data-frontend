"use client";

import PersonasCountrySelect from "@/components/personas/PersonasCountrySelect";
import Image from "next/image";
import Link from "next/link";
import LogoCerebiia from "@public/logo.svg";
import { personasTheme } from "@/constants/personasTheme";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import { usePathname } from "next/navigation";

interface Props {
  showNav?: boolean;
  backHref?: string;
  backLabel?: string;
}

const navLinks = [
  { href: "/personas#como-funciona", label: "Proceso" },
  { href: "/personas#tus-derechos", label: "Derechos" },
  { href: "/personas#preguntas", label: "FAQ" },
];

const PersonasHeader = ({
  showNav = false,
  backHref,
  backLabel = "Volver",
}: Props) => {
  const pathname = usePathname();
  const isLanding = pathname === "/personas";

  return (
    <header className={personasTheme.header}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {backHref && (
          <div className="border-b border-zinc-100 py-2">
            <Link
              href={backHref}
              className={clsx(
                "inline-flex w-fit items-center gap-1 text-sm font-medium",
                personasTheme.body,
                "hover:text-primary-900"
              )}
            >
              <Icon icon="tabler:arrow-left" className="text-base" />
              {backLabel}
            </Link>
          </div>
        )}

        <div className="flex h-14 items-center justify-between gap-4 sm:h-16">
          <Link href="/personas" className="shrink-0">
            <Image
              src={LogoCerebiia}
              width={160}
              alt="Cerebiia"
              priority
              className="h-8 w-auto sm:h-9"
            />
          </Link>

          {(showNav || isLanding) && (
            <nav
              className="hidden flex-1 items-center justify-center gap-1 md:flex"
              aria-label="Secciones"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-primary-900"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          <div className="relative z-50 ml-auto shrink-0 overflow-visible">
            <PersonasCountrySelect />
          </div>
        </div>
      </div>
    </header>
  );
};

export default PersonasHeader;
