"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSessionStore } from "@/store/useSessionStore";
import { parseApiError } from "@/utils/parseApiError";
import { useAppSettingsStore } from "@/store/useAppSettingsStore";
import { fetchAppSettings } from "@/lib/appSetting.api";
import { toast } from "sonner";

const LoadCloudAppSettings = () => {
  const pathname = usePathname();
  const user = useSessionStore((store) => store.user);
  const error = useSessionStore((store) => store.error);
  const loading = useSessionStore((store) => store.loading);
  
  const settings = useAppSettingsStore((store) => store.settings);
  const setSettings = useAppSettingsStore((store) => store.setSettings);
  const setError = useAppSettingsStore((store) => store.setError);
  const setLoading = useAppSettingsStore((store) => store.setLoading);
  
  const hasTriedRef = useRef(false);

  async function recoverSettings() {
    // Don't fetch if there's no user or there's an auth error
    if (!user || error || pathname === "/login") {
      return;
    }

    if (hasTriedRef.current) return;
    hasTriedRef.current = true;

    try {
      setLoading(true);

      const settingsData = await fetchAppSettings({});

      if (settingsData.error) {
        // Don't show error toast for auth errors, just set error
        const parsedError = parseApiError(settingsData.error);
        setError(parsedError);
        
        // Only show toast if it's not an auth error
        if (settingsData.error.code !== "auth/unauthenticated") {
          toast.error(parsedError);
        }
        return;
      }

      setSettings(settingsData.data);
      setLoading(false);
    } catch (error) {
      setError((error as Error).message || "Unknown error");
      setLoading(false);
    }
  }

  useEffect(() => {
    // Only try to load settings if we have a user and no auth error
    if (user && !error && !settings && !loading && pathname !== "/login") {
      recoverSettings();
    }
    
    // Reset ref when user changes
    if (user) {
      hasTriedRef.current = false;
    }
  }, [user, error, settings, loading, pathname]);

  return null;
};

export default LoadCloudAppSettings;
