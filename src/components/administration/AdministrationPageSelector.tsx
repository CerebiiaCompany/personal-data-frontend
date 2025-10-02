"use client";

import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const tabs = [
  {
    href: "/admin/administracion/usuarios",
    icon: "heroicons-outline:user",
    label: "Usuarios",
  },
  { href: "/admin/administracion/areas", icon: "mdi:building", label: "Áreas" },
  {
    href: "/admin/administracion/roles",
    icon: "heroicons-outline:user-group",
    label: "Roles",
  },
];

const AdministrationPageSelector = () => {
  const pathname = usePathname();

  return (
    <div className="w-full flex items-center gap-2">
      {tabs.map((tab) => (
        <Link
          href={tab.href}
          key={tab.href}
          className={clsx([
            "flex-1 text-primary-900 rounded-lg py-1.5 px-3 flex gap-1 items-center justify-center border-primary-900 border",
            {
              "bg-primary-900 text-white": pathname === tab.href,
            },
          ])}
        >
          <p className="text-lg font-bold">{tab.label}</p>
          <Icon icon={tab.icon} className="text-xl" />
        </Link>
      ))}
    </div>
  );
};

export default AdministrationPageSelector;
