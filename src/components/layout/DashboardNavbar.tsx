"use client";

import Image from "next/image";
import React from "react";
import LogoCerebiia from "@public/logo.svg";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { NAVBAR_DATA } from "@/constants/navbarData";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const DashboardNavbar = () => {
  const pathname = usePathname();

  return (
    <nav className="col-span-2 flex flex-col items-stretch bg-primary-50 px-5 py-10 gap-10">
      <div className="w-full flex justify-center">
        <Image
          src={LogoCerebiia}
          width={200}
          alt="Logo de Plataforma de Datos de Cerebiia"
          className="w-3/4"
        />
      </div>

      {/* Navbar links */}
      <div className="flex-1 flex flex-col items-start gap-5">
        <p className="pl-6 font-semibold">Menú</p>
        <ul className="flex flex-col items-stretch gap-2 w-full">
          {NAVBAR_DATA.map((e) => (
            <li key={e.title}>
              <Link
                href={e.path}
                className={clsx([
                  "flex items-center gap-3 rounded-lg px-6 py-3 w-full font-medium",
                  {
                    "bg-white shadow-md text-primary-900": e.path === pathname,
                  },
                  {
                    "hover:bg-stone-900/5 transition-colors":
                      e.path !== pathname,
                  },
                ])}
              >
                <Icon icon={e.icon} className="text-2xl" />
                {e.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* End Content */}
      <div className="border border-disabled bg-white h-fit flex flex-col rounded-lg">
        <div className="flex items-center gap-2 p-3 w-full justify-start">
          <div className="bg-primary-900 p-4 text-white font-bold text-2xl rounded-md">
            LS
          </div>
          <div className="w-0 flex-1">
            <h6>Luis Sandoval</h6>
            <p className="w-full text-ellipsis whitespace-nowrap overflow-hidden">
              luissandoval@gmail.com
            </p>
          </div>
        </div>

        {/* Box separator */}
        <span className="inline-block w-full h-[1px] bg-disabled"></span>

        {/* Logout button */}
        <button
          className="flex items-center gap-1 p-3 hover:bg-stone-200 rounded-b-lg transition-colors"
          onClick={(e) => console.log("Logging out")}
        >
          <Icon
            icon={"tabler:logout-2"}
            className="text-3xl text-primary-900"
          />
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
