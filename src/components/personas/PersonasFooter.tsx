"use client";

import { personasTheme } from "@/constants/personasTheme";
import { usePersonasCountryContent } from "@/hooks/usePersonasCountryContent";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import Link from "next/link";

const PersonasFooter = () => {
  const content = usePersonasCountryContent();

  return (
    <footer className="border-t border-zinc-200/80 bg-white">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="sm:col-span-2">
          <p className="mb-2 font-semibold text-primary-900">
            Portal del titular · Cerebiia
          </p>
          <p className="max-w-sm text-sm leading-relaxed text-zinc-600">
            Ejercicio de derechos en {content.label}. Marco: {content.legalBadge}
          </p>
        </div>

        <div>
          <p className="mb-3 text-xs font-medium text-zinc-400">Enlaces</p>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <Link href="/personas#como-funciona" className={personasTheme.link}>
                Proceso
              </Link>
            </li>
            <li>
              <Link href="/personas#tus-derechos" className={personasTheme.link}>
                Derechos
              </Link>
            </li>
            <li>
              <Link href="/personas/ingresar" className={personasTheme.link}>
                Ingresar
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-medium text-zinc-400">Legal</p>
          <ul className="flex flex-col gap-2 text-sm text-zinc-600">
            {content.legalReferences.map((ref) => (
              <li key={ref.text} className="flex items-center gap-2">
                <Icon icon={ref.icon} className="shrink-0 text-primary-600" />
                {ref.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        className={clsx(
          "border-t border-zinc-100 py-5 text-center text-xs text-zinc-400"
        )}
      >
        © {new Date().getFullYear()} Cerebiia
      </div>
    </footer>
  );
};

export default PersonasFooter;
