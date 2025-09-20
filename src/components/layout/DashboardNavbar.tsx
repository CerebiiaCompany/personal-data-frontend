"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import LogoCerebiia from "@public/logo.svg";
import LogoCerebiiaCollapsed from "@public/logo-collapsed.svg";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { NAVBAR_DATA } from "@/constants/navbarData";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { toast } from "sonner";
import { useSessionStore } from "@/store/useSessionStore";
import { logoutUser } from "@/lib/auth.api";

const DashboardNavbar = () => {
  const session = useSessionStore();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const mainNavbarRoutes = NAVBAR_DATA.filter((e) => e.icon);
  const router = useRouter();

  useEffect(() => {
    const storedState = localStorage.getItem("navbarIsCollapsed");

    setIsCollapsed(storedState === "true");
  }, []);

  useEffect(() => {
    if (isCollapsed != null) {
      localStorage.setItem("navbarIsCollapsed", isCollapsed.toString());
    }
  }, [isCollapsed]);

  function toggleMenuIsCollapsed() {
    setIsCollapsed(!isCollapsed);
  }

  async function logout() {
    let name = session.user?.name;
    await logoutUser();
    toast.success(`Adiós, ${name}`);

    session.logout();

    router.push("/login");
  }

  return (
    <nav
      className={clsx([
        "w-full max-w-20 flex h-full flex-col items-stretch bg-primary-50 p-3 gap-10 overflow-y-hidden transition-all",
        { "max-w-72 p-5": !isCollapsed },
      ])}
    >
      <div
        className={clsx([
          "w-full flex justify-center relative h-full max-h-12",
          { "": isCollapsed },
        ])}
      >
        <Image
          src={LogoCerebiia}
          width={200}
          alt="Logo de Plataforma de Datos de Cerebiia"
          priority
          className={clsx([
            "h-full w-auto absolute m-auto inset-0 transition-opacity",
            { "opacity-0": isCollapsed },
          ])}
        />

        <Image
          src={LogoCerebiiaCollapsed}
          width={200}
          priority
          alt="Logo de Plataforma de Datos de Cerebiia"
          className={clsx([
            "h-full w-auto absolute m-auto inset-0 transition-opacity",
            { "opacity-0": !isCollapsed },
          ])}
        />
      </div>

      <div className="no-scrollbar flex-1 relative overflow-hidden">
        {/* Navbar links expanded */}
        <div
          className={clsx([
            "absolute w-full transition-opacity h-full overflow-y-auto",
            { "opacity-0 pointer-events-none": isCollapsed },
          ])}
        >
          <p className={clsx(["pl-6 font-semibold sticky top-0 mb-4"])}>Menú</p>
          <ul className="flex flex-col items-stretch gap-2 w-full">
            {mainNavbarRoutes.map((e) => (
              <li key={e.title} className="w-full">
                <Link
                  href={e.path}
                  className={clsx([
                    "flex items-center gap-3 rounded-lg px-6 py-3 w-full font-medium",
                    {
                      "bg-white shadow-md text-primary-900":
                        e.path === pathname,
                    },
                    {
                      "hover:bg-stone-900/5 transition-colors":
                        e.path !== pathname,
                    },
                  ])}
                >
                  <Icon
                    icon={e.icon || "tabler:question-mark"}
                    className="text-2xl h-full aspect-square min-w-fit"
                  />
                  <p className="w-full text-ellipsis whitespace-nowrap overflow-hidden">
                    {e.title}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Navbar links collapsed */}
        <ul
          className={clsx([
            "flex flex-col items-stretch gap-2 h-full px-1 w-full transition-opacity",
            { "opacity-0 pointer-events-none": !isCollapsed },
          ])}
        >
          {mainNavbarRoutes.map((e) => (
            <li key={e.title} className="w-full">
              <Link
                href={e.path}
                title={e.title}
                className={clsx([
                  "grid place-content-center gap-3 rounded-lg w-full aspect-square relative",
                  {
                    "bg-white shadow-md text-primary-900": e.path === pathname,
                  },
                  {
                    "hover:bg-stone-900/5 transition-colors":
                      e.path !== pathname,
                  },
                ])}
              >
                <Icon
                  icon={e.icon || "tabler:question-mark"}
                  className="text-2xl aspect-square"
                />
                {/*  <span className="absolute bg-red-500 px-2 py-1 h-fit inline-block rounded-lg group-hover:opacity-1 left-full bottom-0 top-0 my-auto">
                  {e.title}
                </span> */}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* End Content */}
      <div className="border border-disabled bg-white h-fit flex flex-col rounded-lg w-full">
        <div
          className={clsx([
            "flex items-center gap-2 w-full justify-start",
            { "p-3": !isCollapsed },
            { "p-1.5": isCollapsed },
          ])}
        >
          <div
            className={clsx([
              "bg-primary-900 max-w-12 min-w-10 w-full aspect-square grid place-content-center text-white font-bold rounded-md",
            ])}
          >
            {session.user?.name[0]}
            {session.user?.lastName[0]}
          </div>
          <div
            className={clsx([
              "w-0 flex-1 transition-opacity",
              { hidden: isCollapsed },
            ])}
          >
            <h6 className="w-full text-ellipsis leading-tight font-medium">
              {session.user?.username}
            </h6>
            <p className="w-full text-ellipsis text-stone-500">
              {session.user?.companyUserData?.personalEmail.toLowerCase()}
            </p>
          </div>
        </div>

        {/* Box separator */}
        <span className="inline-block w-full h-[1px] bg-disabled"></span>

        {/* Logout button */}
        <button
          className={clsx([
            "flex items-center justify-center gap-1 p-3 hover:bg-stone-200 transition-colors",
            { "": isCollapsed },
          ])}
          onClick={logout}
        >
          <Icon
            icon={"tabler:logout-2"}
            className="text-3xl min-w-10 text-primary-900"
          />
          <span className={clsx(["text-ellipsis", { hidden: isCollapsed }])}>
            Cerrar sesión
          </span>
        </button>

        {/* Box separator */}
        <span className="inline-block w-full h-[1px] bg-disabled"></span>

        {/* Collapse navbar button */}
        <div className="w-full flex-1">
          <button
            onClick={toggleMenuIsCollapsed}
            className="flex items-center justify-center gap-1 p-3 hover:bg-stone-200 rounded-b-lg transition-colors w-full"
          >
            <Icon
              icon={"ci:chevron-left-duo"}
              className={clsx([
                "text-3xl rotate-0 transition-transform min-w-10",
                { "rotate-180": isCollapsed },
              ])}
            />
            <span className={clsx(["text-ellipsis", { hidden: isCollapsed }])}>
              Colapsar menú
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
