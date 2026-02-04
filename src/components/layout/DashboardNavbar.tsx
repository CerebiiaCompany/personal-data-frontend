"use client";

import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
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
import { SUPERADMIN_NAVBAR_DATA } from "@/constants/superadminNavbarData";
import { hasPermissionByPath } from "@/utils/permissions.utils";

const DashboardNavbar = () => {
  const session = useSessionStore();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  
  // Debug: Log del estado de sesión
  useEffect(() => {
    console.log("[Navbar] Estado de sesión actualizado:", {
      user: session.user?.username,
      role: session.user?.role,
      hasPermissions: !!session.permissions,
      isSuperAdmin: session.permissions?.isSuperAdmin,
      loading: session.loading
    });
  }, [session]);
  
  // Filtrar rutas basándose en rol y permisos del usuario
  const mainNavbarRoutes = useMemo(() => {
    console.log("[Navbar] Recalculando rutas del navbar...");
    console.log("[Navbar] Estado para filtrado:", {
      role: session.user?.role,
      hasPermissions: !!session.permissions,
      loading: session.loading
    });
    const routes = session.user?.role === "SUPERADMIN" 
      ? SUPERADMIN_NAVBAR_DATA 
      : NAVBAR_DATA;
    
    return routes
      .filter((route) => {
        // Solo mostrar rutas con icono
        if (!route.icon) return false;
        
        // ⭐ Verificar minRole primero
        if (route.minRole === "COMPANY_ADMIN") {
          // Solo COMPANY_ADMIN y SUPERADMIN pueden ver estas rutas
          if (session.user?.role !== "COMPANY_ADMIN" && session.user?.role !== "SUPERADMIN") {
            return false;
          }
        }
        
        // Si es SUPERADMIN o COMPANY_ADMIN, mostrar todas las rutas (no esperar permisos)
        if (session.user?.role === "SUPERADMIN" || session.user?.role === "COMPANY_ADMIN") {
          return true;
        }
        
        // Para usuarios USER, si los permisos aún no están cargados, no mostrar
        if (!session.permissions) {
          return false;
        }
        
        // Si no requiere permiso específico, mostrar la ruta
        if (!route.requiredPermission) return true;
        
        // Verificar si el usuario tiene el permiso requerido
        const hasPermission = hasPermissionByPath(session.permissions, route.requiredPermission);
        console.log(`[Navbar] Ruta "${route.title}" (${route.requiredPermission}): ${hasPermission ? '✅ PERMITIDA' : '❌ DENEGADA'}`);
        return hasPermission;
      });
    
    console.log(`[Navbar] Total de rutas visibles: ${routes.filter((route) => {
      if (!route.icon) return false;
      if (route.minRole === "COMPANY_ADMIN") {
        if (session.user?.role !== "COMPANY_ADMIN" && session.user?.role !== "SUPERADMIN") {
          return false;
        }
      }
      if (session.user?.role === "SUPERADMIN" || session.user?.role === "COMPANY_ADMIN") {
        return true;
      }
      if (!session.permissions) {
        return false;
      }
      if (!route.requiredPermission) return true;
      return hasPermissionByPath(session.permissions, route.requiredPermission);
    }).length}`);
    
    return routes;
  }, [session.user?.role, session.permissions]);
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
        "w-full max-w-16 sm:max-w-20 flex h-full flex-col items-stretch bg-primary-50 p-2 sm:p-3 gap-4 sm:gap-6 md:gap-10 overflow-y-hidden transition-all",
        { "max-w-64 sm:max-w-72 p-3 sm:p-4 md:p-5": !isCollapsed },
      ])}
    >
      <Link
        href={"/admin"}
        className={clsx([
          "w-full flex justify-center relative h-full max-h-10 sm:max-h-12",
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
            { "opacity-0 pointer-events-none": isCollapsed },
          ])}
        />

        <Image
          src={LogoCerebiiaCollapsed}
          width={200}
          priority
          alt="Logo de Plataforma de Datos de Cerebiia"
          className={clsx([
            "h-full w-auto absolute m-auto inset-0 transition-opacity",
            { "opacity-0 pointer-events-none": !isCollapsed },
          ])}
        />
      </Link>

      <div className="no-scrollbar flex-1 relative overflow-hidden">
        {/* Navbar links expanded */}
        <div
          className={clsx([
            "absolute w-full transition-opacity h-full overflow-y-auto",
            { "opacity-0 pointer-events-none": isCollapsed },
          ])}
        >
          <div className="sticky top-0 z-10 bg-primary-50 border-b border-disabled">
            <p
              className={clsx([
                "pl-3 sm:pl-4 md:pl-6 font-semibold py-2 text-xs sm:text-sm",
              ])}
            >
              Menú
            </p>
          </div>
          <ul className="flex flex-col items-stretch gap-1.5 sm:gap-2 w-full">
            {/* Mostrar loading si es USER y los permisos no están cargados */}
            {session.user?.role === "USER" && !session.permissions && session.loading && (
              <li className="w-full px-3 py-4 text-center text-stone-500 text-xs">
                <Icon icon="tabler:loader-2" className="animate-spin text-2xl mx-auto mb-2" />
                Cargando permisos...
              </li>
            )}
            
            {mainNavbarRoutes.map((e) => (
              <li key={e.title} className="w-full">
                <Link
                  href={e.path}
                  className={clsx([
                    "flex items-center gap-2 sm:gap-3 rounded-lg px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 w-full font-medium text-xs sm:text-sm",
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
                    className="text-lg sm:text-xl md:text-2xl h-full aspect-square min-w-fit"
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
            "flex flex-col items-stretch gap-1.5 sm:gap-2 h-full px-0.5 sm:px-1 w-full transition-opacity",
            { "opacity-0 pointer-events-none": !isCollapsed },
          ])}
        >
          {/* Mostrar loading si es USER y los permisos no están cargados */}
          {session.user?.role === "USER" && !session.permissions && session.loading && (
            <li className="w-full aspect-square grid place-content-center">
              <Icon icon="tabler:loader-2" className="animate-spin text-2xl text-stone-500" />
            </li>
          )}
          
          {mainNavbarRoutes.map((e) => (
            <li key={e.title} className="w-full">
              <Link
                href={e.path}
                title={e.title}
                className={clsx([
                  "grid place-content-center gap-2 sm:gap-3 rounded-lg w-full aspect-square relative",
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
                  className="text-lg sm:text-xl md:text-2xl aspect-square"
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
        <Link
          href={"/perfil"}
          className={clsx([
            "flex items-center gap-2 w-full justify-start hover:bg-stone-200 transition-colors",
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
        </Link>

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
