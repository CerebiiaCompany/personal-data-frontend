"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSessionStore } from "@/store/useSessionStore";
import { NAVBAR_DATA } from "@/constants/navbarData";
import LoadingCover from "../layout/LoadingCover";

const CheckRole = () => {
  const pathname = usePathname();
  const { user, error, loading } = useSessionStore();

  const router = useRouter();

  useEffect(() => {
    console.log("Checking role...", { user, loading, error, pathname });
    if (pathname === "/login") return;

    // Solo redirigir a login si NO está cargando Y no hay usuario
    if (!loading && !user) {
      console.log("Redirecting to login - no user");
      return router.push(`/login?callback_url=${pathname}`);
    }

    if (!loading && user) {
      const pathData = NAVBAR_DATA.find((e) => e.path === pathname);

      if (
        pathname.includes("/admin") &&
        !["COMPANY_ADMIN", "SUPERADMIN"].includes(user.role)
      ) {
        console.log("Redirecting to login - insufficient role");
        return router.push(`/login?callback_url=${pathname}`);
      }
    }
  }, [pathname, user, loading, error]);

  if (!user || loading) {
    return <LoadingCover wholePage={true} />;
  }

  return <></>;
};

export default CheckRole;
