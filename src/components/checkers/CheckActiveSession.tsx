"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSessionStore } from "@/store/useSessionStore";
import { parseApiError } from "@/utils/parseApiError";
import { getSession } from "@/lib/auth.api";

const CheckActiveSession = () => {
  const pathname = usePathname();
  const { user, setUser, loading, setError, setLoading, error } =
    useSessionStore();

  const router = useRouter();

  async function checkSession() {
    console.log("Recovering session...");

    try {
      setLoading(true);

      const session = await getSession();

      if (session.error) {
        let parsedError = parseApiError(session.error);
        setError(parsedError);
        return;
      }

      setUser(session.data);
    } catch (error) {
      console.log(error);
      return setError((error as Error).message || "Unknown error");
    }
  }

  useEffect(() => {
    if (!user && !error) {
      //try to recover session only once
      checkSession();
    }
  }, [pathname]);

  return <></>;
};

export default CheckActiveSession;
