"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSessionStore } from "@/store/useSessionStore";
import { parseApiError } from "@/utils/parseApiError";
import { getSession } from "@/lib/auth.api";
import { useAppSettingsStore } from "@/store/useAppSettingsStore";
import { fetchAppSettings } from "@/lib/appSetting.api";
import { toast } from "sonner";

const LoadCloudAppSettings = () => {
  const pathname = usePathname();
  const { settings, setSettings, loading, setError, setLoading, error } =
    useAppSettingsStore();

  async function recoverSettings() {
    console.log("Recovering cloud settings...");

    try {
      setLoading(true);

      const settings = await fetchAppSettings({});

      if (settings.error) {
        let parsedError = parseApiError(settings.error);
        setError(parsedError);
        toast.error(parsedError);
        return;
      }

      setSettings(settings.data);
    } catch (error) {
      console.log(error);
      return setError((error as Error).message || "Unknown error");
    }
  }

  useEffect(() => {
    if (!settings) {
      //try to recover session while settings are undefined
      recoverSettings();
    }
  }, [pathname]);

  return <></>;
};

export default LoadCloudAppSettings;
