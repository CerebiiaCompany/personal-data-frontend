"use client";
import { useEffect } from "react";
import { useSessionStore } from "@/store/useSessionStore";
import { parseApiError } from "@/utils/parseApiError";
import { toast } from "sonner";
import { getSession } from "@/lib/auth.api";

export function AuthHydrator() {
  const { setUser, setError, setLoading } = useSessionStore();
  useEffect(() => {
    (async () => {
      setLoading(true);

      const session = await getSession();

      if (session.error) {
        let parsedError = parseApiError(session.error);
        setError(parsedError);
        toast.error(parsedError);
        return;
      }

      setUser(session.data);
    })();
  }, [setUser]);
  return null;
}
