import { fetchAppSettings } from "@/lib/appSetting.api";
import { useAppSettingsStore } from "@/store/useAppSettingsStore";
import { QueryParams } from "@/types/api.types";
import { AppSetting, AppSettingKey } from "@/types/appSetting.types";
import { parseApiError } from "@/utils/parseApiError";
import { useEffect, useState } from "react";

export function useAppSetting(key: AppSettingKey) {
  const [data, setData] = useState<AppSetting | undefined>(undefined);
  const { settings, loading, error } = useAppSettingsStore();

  useEffect(() => {
    if (settings?.length) {
      setData(settings.find((setting) => setting.key === key));
    }
  }, [settings]);

  return {
    data,
    loading,
    error,
  };
}
