"use client";

import Image from "next/image";
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import LogoCerebiia from "@public/logo-white.png";
import LogoCerebiiaCollapsed from "@public/logo-collapsed.svg";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { NAVBAR_DATA } from "@/constants/navbarData";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { toast } from "sonner";
import { useSessionStore } from "@/store/useSessionStore";
import { logoutUser } from "@/lib/auth.api";
import { SUPERADMIN_NAVBAR_DATA } from "@/constants/superadminNavbarData";
import { hasPermissionByPath } from "@/utils/permissions.utils";

const COMING_SOON_PATHS = new Set(["/admin/asistente-ia"]);

const DashboardNavbar = () => {
  const session = useSessionStore();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const navScrollRef = useRef<HTMLDivElement | null>(null);
  const navListRef = useRef<HTMLUListElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const [focusPill, setFocusPill] = useState<{
    top: number;
    height: number;
    width: number;
    left: number;
    opacity: number;
  }>({ top: 0, height: 0, width: 0, left: 0, opacity: 0 });

  const mainNavbarRoutes = useMemo(() => {
    const routes =
      session.user?.role === "SUPERADMIN"
        ? SUPERADMIN_NAVBAR_DATA
      : NAVBAR_DATA;

    return routes
      .filter((route) => {
        if (!route.icon) return false;

        if (route.minRole === "COMPANY_ADMIN") {
          if (
            session.user?.role !== "COMPANY_ADMIN" &&
            session.user?.role !== "SUPERADMIN"
          ) {
            return false;
          }
        }

        if (
          session.user?.role === "SUPERADMIN" ||
          session.user?.role === "COMPANY_ADMIN"
        ) {
          return true;
        }

        if (!session.permissions) {
          return false;
        }

        if (!route.requiredPermission) return true;

        return hasPermissionByPath(
          session.permissions,
          route.requiredPermission
        );
      });
  }, [session.user?.role, session.permissions]);

  const activeRoutePath = useMemo(() => {
    const match = mainNavbarRoutes.find((r) => r.path === pathname);
    return match?.path ?? null;
  }, [pathname, mainNavbarRoutes]);

  const router = useRouter();

  useLayoutEffect(() => {
    if (isCollapsed) {
      setFocusPill((prev) => ({ ...prev, opacity: 0 }));
      return;
    }

    const scrollEl = navScrollRef.current;
    if (!scrollEl) return;

    const updatePill = () => {
      if (!activeRoutePath) {
        setFocusPill((prev) => ({ ...prev, opacity: 0 }));
        return;
      }

      const li = itemRefs.current[activeRoutePath];
      if (!li) {
        setFocusPill((prev) => ({ ...prev, opacity: 0 }));
        return;
      }

      const liRect = li.getBoundingClientRect();
      const scRect = scrollEl.getBoundingClientRect();

      setFocusPill({
        top: liRect.top - scRect.top + scrollEl.scrollTop,
        left: liRect.left - scRect.left + scrollEl.scrollLeft,
        width: liRect.width,
        height: liRect.height,
        opacity: 1,
      });
    };

    updatePill();

    const ro = new ResizeObserver(() => updatePill());
    ro.observe(scrollEl);
    if (navListRef.current) ro.observe(navListRef.current);

    scrollEl.addEventListener("scroll", updatePill, { passive: true });
    window.addEventListener("resize", updatePill);

    return () => {
      ro.disconnect();
      scrollEl.removeEventListener("scroll", updatePill);
      window.removeEventListener("resize", updatePill);
    };
  }, [activeRoutePath, isCollapsed, mainNavbarRoutes, pathname, session.loading, session.permissions]);

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
    const name = session.user?.name;
    await logoutUser();
    toast.success(`Adiós, ${name}`);

    session.logout();

    router.push("/login");
  }

  return (
    <nav
      className={clsx([
        "w-full max-w-20 flex h-full flex-col items-stretch bg-[radial-gradient(120%_80%_at_0%_100%,#0A1F50_0%,rgba(10,31,80,0)_40%),linear-gradient(180deg,#081538_0%,#030B20_100%)] p-3 sm:p-4 gap-4 overflow-y-hidden transition-all text-white border-r border-[#112754]",
        { "max-w-[270px]": !isCollapsed },
      ])}
    >
      <Link
        href={"/admin"}
        className={clsx([
          "w-full flex justify-center relative h-full max-h-14",
          { "": isCollapsed },
        ])}
      >
        <Image
          src={LogoCerebiia}
          width={220}
          alt="Logo de Plataforma de Datos de Cerebiia"
          priority
          className={clsx([
            "h-full w-auto object-contain absolute m-auto inset-0 transition-opacity",
            { "opacity-0 pointer-events-none": isCollapsed },
          ])}
        />

        <Image
          src={LogoCerebiiaCollapsed}
          width={48}
          priority
          alt="Logo de Plataforma de Datos de Cerebiia"
          className={clsx([
            "h-10 w-auto object-contain absolute m-auto inset-0 transition-opacity",
            { "opacity-0 pointer-events-none": !isCollapsed },
          ])}
        />
      </Link>

      <div className="no-scrollbar flex-1 relative overflow-hidden">
        <div
          ref={navScrollRef}
          className={clsx([
            "absolute w-full transition-opacity h-full overflow-y-auto sidebar-scroll",
            { "opacity-0 pointer-events-none": isCollapsed },
          ])}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute z-[1] rounded-xl bg-[linear-gradient(90deg,#113A87_0%,#0A255D_100%)] shadow-[inset_0_0_0_1px_rgba(91,130,205,.34)] transition-[top,left,width,height,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[top,left,width,height]"
            style={{
              top: focusPill.top,
              left: focusPill.left,
              width: focusPill.width,
              height: focusPill.height,
              opacity: focusPill.opacity,
            }}
          >
            <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-[#2D7BFF]" />
          </span>

          <div className="sticky top-0 z-20 bg-[linear-gradient(180deg,#081538_0%,#071431_100%)] border-b border-[#1B366B]/70 mb-2">
            <p className="pl-4 font-semibold py-2 text-[10px] uppercase tracking-[0.2em] text-[#8FA7D6]">
              Menú
            </p>
          </div>
          <ul ref={navListRef} className="relative z-[2] flex flex-col items-stretch gap-1.5 w-full">
            {session.user?.role === "USER" && !session.permissions && session.loading && (
              <li className="w-full px-3 py-4 text-center text-[#9EB2DB] text-xs">
                <Icon
                  icon="tabler:loader-2"
                  className="animate-spin text-2xl mx-auto mb-2"
                />
                Cargando permisos...
              </li>
            )}

            {mainNavbarRoutes.map((e) => {
              const isComingSoon = COMING_SOON_PATHS.has(e.path);
              return (
                <li
                  key={e.path}
                  className="w-full"
                  ref={(el) => {
                    itemRefs.current[e.path] = el;
                  }}
                >
                  {isComingSoon ? (
                    <div className="relative z-[1] flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 w-full font-medium text-[13px] border border-transparent overflow-hidden opacity-55 cursor-not-allowed select-none">
                      <Icon
                        icon={e.icon || "tabler:question-mark"}
                        className="text-[16px] h-full aspect-square min-w-fit text-[#CFDBF6]"
                      />
                      <p className="w-full text-ellipsis whitespace-nowrap overflow-hidden text-[13px] text-[#D1DCF5]">
                        {e.title}
                      </p>
                      <span className="shrink-0 rounded-full border border-[#2B4F8F] bg-[#0A2049] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8FA7D6]">
                        Próximamente
                      </span>
                    </div>
                  ) : (
                    <Link
                      href={e.path}
                      className={clsx([
                        "relative z-[1] flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 w-full font-medium text-[13px] border border-transparent overflow-hidden transition-colors duration-300 ease-out",
                        {
                          "text-[#4B8DFF]": e.path === pathname,
                        },
                        {
                          "text-[#D1DCF5] hover:bg-[#0A2049] hover:text-white":
                            e.path !== pathname,
                        },
                      ])}
                    >
                      <Icon
                        icon={e.icon || "tabler:question-mark"}
                        className={clsx([
                          "text-[16px] h-full aspect-square min-w-fit transition-colors duration-300 ease-out",
                          { "text-[#2F80FF]": e.path === pathname },
                          { "text-[#CFDBF6]": e.path !== pathname },
                        ])}
                      />
                      <p className="w-full text-ellipsis whitespace-nowrap overflow-hidden text-[13px]">
                        {e.title}
                      </p>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <ul
          className={clsx([
            "flex flex-col items-stretch gap-2 h-full px-0.5 w-full transition-opacity",
            { "opacity-0 pointer-events-none": !isCollapsed },
          ])}
        >
          {session.user?.role === "USER" && !session.permissions && session.loading && (
            <li className="w-full aspect-square grid place-content-center">
              <Icon
                icon="tabler:loader-2"
                className="animate-spin text-2xl text-[#9EB2DB]"
              />
            </li>
          )}

          {mainNavbarRoutes.map((e) => {
            const isComingSoon = COMING_SOON_PATHS.has(e.path);
            return (
              <li key={e.path} className="w-full">
                {isComingSoon ? (
                  <div
                    title={`${e.title} (Próximamente)`}
                    className="grid place-content-center gap-2 rounded-lg w-full aspect-square relative border border-transparent overflow-hidden opacity-55 cursor-not-allowed"
                  >
                    <Icon
                      icon={e.icon || "tabler:question-mark"}
                      className="text-xl aspect-square text-[#CFDBF6]"
                    />
                  </div>
                ) : (
                  <Link
                    href={e.path}
                    title={e.title}
                    className={clsx([
                      "grid place-content-center gap-2 rounded-lg w-full aspect-square relative border border-transparent overflow-hidden transition-all duration-300 ease-out",
                      {
                        "bg-[linear-gradient(180deg,#113A87_0%,#0A255D_100%)] text-[#4B8DFF] shadow-[inset_0_0_0_1px_rgba(91,130,205,.34)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-6 before:w-[3px] before:rounded-r-full before:bg-[#2D7BFF]":
                          e.path === pathname,
                      },
                      {
                        "text-[#D1DCF5] hover:bg-[#0A2049] hover:text-white":
                          e.path !== pathname,
                      },
                    ])}
                  >
                    <Icon
                      icon={e.icon || "tabler:question-mark"}
                      className={clsx([
                        "text-xl aspect-square",
                        { "text-[#2F80FF]": e.path === pathname },
                        { "text-[#CFDBF6]": e.path !== pathname },
                      ])}
                    />
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="bg-[linear-gradient(180deg,rgba(10,34,84,0.78)_0%,rgba(7,24,61,0.82)_100%)] border border-[#2B4F8F]/45 h-fit flex flex-col rounded-xl w-full overflow-hidden shadow-[0_6px_16px_rgba(3,10,30,0.28)] backdrop-blur-sm">
        <Link
          href={"/perfil"}
          className={clsx([
            "flex items-center gap-2 w-full justify-start hover:bg-white/5 transition-colors",
            { "p-2": !isCollapsed },
            { "p-1.5 justify-center": isCollapsed },
          ])}
        >
          <div
            className="bg-[#2D60E0] max-w-8 min-w-8 w-full aspect-square grid place-content-center text-white font-bold rounded-lg text-[10px] shadow-[0_3px_10px_rgba(45,96,224,0.4)]"
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
            <h6 className="w-full text-ellipsis leading-tight font-semibold text-xs text-white">
              {session.user?.username}
            </h6>
            <p className="w-full text-ellipsis text-[#9EB2DB] text-[11px]">
              {session.user?.companyUserData?.personalEmail.toLowerCase()}
            </p>
          </div>
        </Link>

        <span className="inline-block w-full h-[1px] bg-gradient-to-r from-transparent via-[#2A4A86] to-transparent"></span>

        <button
          className={clsx([
            "flex items-center justify-center gap-1.5 p-2 hover:bg-white/5 transition-colors text-[#D1DCF5]",
            { "": isCollapsed },
          ])}
          onClick={logout}
        >
          <Icon
            icon={"tabler:logout-2"}
            className="text-[18px] min-w-8"
          />
          <span className={clsx(["text-ellipsis font-medium text-sm", { hidden: isCollapsed }])}>
            Cerrar sesión
          </span>
        </button>

        <span className="inline-block w-full h-[1px] bg-gradient-to-r from-transparent via-[#2A4A86] to-transparent"></span>

        <div className="w-full flex-1">
          <button
            onClick={toggleMenuIsCollapsed}
            className="flex items-center justify-center gap-1.5 p-2 hover:bg-white/5 rounded-b-xl transition-colors w-full text-[#D1DCF5]"
          >
            <Icon
              icon={"ci:chevron-left-duo"}
              className={clsx([
                "text-[18px] rotate-0 transition-transform min-w-8",
                { "rotate-180": isCollapsed },
              ])}
            />
            <span className={clsx(["text-ellipsis font-medium text-sm", { hidden: isCollapsed }])}>
              Colapsar menú
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
