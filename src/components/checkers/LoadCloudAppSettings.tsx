"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSessionStore } from "@/store/useSessionStore";
import { parseApiError } from "@/utils/parseApiError";
import { toastApiError } from "@/utils/toastApiError";
import { useAppSettingsStore } from "@/store/useAppSettingsStore";
import { fetchAppSettings } from "@/lib/appSetting.api";

const LoadCloudAppSettings = () => {
  const pathname = usePathname();
  const userId = useSessionStore((store) => store.user?._id);
  const sessionError = useSessionStore((store) => store.error);

  const settings = useAppSettingsStore((store) => store.settings);
  const setSettings = useAppSettingsStore((store) => store.setSettings);
  const setError = useAppSettingsStore((store) => store.setError);
  const setLoading = useAppSettingsStore((store) => store.setLoading);

  const attemptedForUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) {
      attemptedForUserRef.current = null;
      return;
    }

    if (sessionError || settings || pathname === "/login") {
      return;
    }

    if (attemptedForUserRef.current === userId) {
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const settingsData = await fetchAppSettings({});
        if (cancelled) return;

        attemptedForUserRef.current = userId;

        if (settingsData.error) {
          const parsedError = parseApiError(settingsData.error);
          setError(parsedError);
          if (settingsData.error.code !== "auth/unauthenticated") {
            toastApiError(parsedError);
          }
          return;
        }

        setSettings(settingsData.data);
      } catch (error) {
        if (cancelled) return;
        attemptedForUserRef.current = userId;
        setError((error as Error).message || "Unknown error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, sessionError, settings, pathname, setError, setLoading, setSettings]);

  return null;
};

export default LoadCloudAppSettings;
