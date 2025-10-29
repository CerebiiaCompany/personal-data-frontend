"use client";
import { useEffect, useRef } from "react";
import { useSessionStore } from "@/store/useSessionStore";
import { parseApiError } from "@/utils/parseApiError";
import { toast } from "sonner";
import { getSession } from "@/lib/auth.api";

export function AuthHydrator() {
  const setUser = useSessionStore((store) => store.setUser);
  const setError = useSessionStore((store) => store.setError);
  const setLoading = useSessionStore((store) => store.setLoading);
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;

    (async () => {
      setLoading(true);

      const session = await getSession();

      if (session.error) {
        let parsedError = parseApiError(session.error);
        setError(parsedError);
        toast.error(parsedError);
        setLoading(false);
        return;
      }

      setUser(session.data);
    })();
  }, [setUser, setError, setLoading]);
  
  return null;
}
