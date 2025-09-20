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
    console.log("Checking role...");
    if (pathname == "/login") return;
    if (!user && !loading && error) {
      return router.push("/login");
    }

    if (!loading && user) {
      const pathData = NAVBAR_DATA.find((e) => e.path === pathname);

      if (
        pathname.includes("/admin") &&
        !["COMPANY_ADMIN", "SUEPERADMIN"].includes(user.role)
      ) {
        return router.push("/login");
      }
    }
  }, [pathname, user, loading]);

  if (!user || loading) {
    return <LoadingCover wholePage={true} />;
  }

  return <></>;
};

export default CheckRole;
