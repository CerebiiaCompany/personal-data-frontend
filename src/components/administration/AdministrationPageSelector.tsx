"use client";

import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const tabs = [
  {
    href: "/admin/administracion/usuarios",
    icon: "tabler:users",
    label: "Usuarios",
  },
  {
    href: "/admin/administracion/areas",
    icon: "tabler:building-community",
    label: "Áreas",
  },
  {
    href: "/admin/administracion/roles",
    icon: "tabler:shield-lock",
    label: "Roles",
  },
];

const AdministrationPageSelector = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Submódulos de administración"
      className="rounded-xl border border-[#E8EDF7] bg-[#EFF3FA] p-1 shadow-[0_1px_3px_rgba(15,35,70,0.06)] sm:inline-flex sm:max-w-full"
    >
      <div className="grid grid-cols-3 gap-1 sm:flex sm:w-full sm:min-w-[min(100%,520px)]">
        {tabs.map((tab) => {
          const active =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              href={tab.href}
              key={tab.href}
              className={clsx(
                "flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-2 py-2.5 text-center text-[12px] font-semibold transition-all sm:flex-1 sm:px-3 sm:text-[13px]",
                active
                  ? "bg-white text-[#1A2B5B] shadow-[0_1px_4px_rgba(15,35,70,0.08)] ring-1 ring-[#E2E8F0]"
                  : "text-[#64748B] hover:bg-white/60 hover:text-[#334155]"
              )}
            >
              <Icon
                icon={tab.icon}
                className={clsx(
                  "shrink-0 text-[17px] sm:text-lg",
                  active ? "text-[#2563EB]" : "text-[#94A3B8]"
                )}
              />
              <span className="leading-tight">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default AdministrationPageSelector;
