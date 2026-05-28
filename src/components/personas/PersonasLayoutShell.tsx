"use client";

import PersonasAnimateIn from "@/components/personas/PersonasAnimateIn";
import PersonasFooter from "@/components/personas/PersonasFooter";
import PersonasHeader from "@/components/personas/PersonasHeader";
import { personasTheme } from "@/constants/personasTheme";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const PersonasLayoutShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  const backConfig = (() => {
    if (pathname === "/personas/ingresar") {
      return { href: "/personas", label: "Inicio" };
    }
    if (pathname === "/personas/verificar") {
      return { href: "/personas/ingresar", label: "Documento" };
    }
    if (pathname === "/personas/portal") {
      return { href: "/personas", label: "Inicio" };
    }
    return undefined;
  })();

  return (
    <div
      className={clsx(
        "flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto",
        personasTheme.pageBg
      )}
    >
      <PersonasAnimateIn variant="fade-in" delay={0} className="relative z-40 overflow-visible">
        <PersonasHeader
          showNav={pathname === "/personas"}
          backHref={backConfig?.href}
          backLabel={backConfig?.label}
        />
      </PersonasAnimateIn>

      <main key={pathname} className="personas-page-enter flex-1">
        {children}
      </main>

      <PersonasRevealFooter />
    </div>
  );
};

function PersonasRevealFooter() {
  return (
    <PersonasAnimateIn delay={100} variant="fade-in">
      <PersonasFooter />
    </PersonasAnimateIn>
  );
}

export default PersonasLayoutShell;
