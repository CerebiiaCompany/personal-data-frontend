import { AppSetting, AppSettingKey } from "@/types/appSetting.types";
import { create } from "zustand";

interface AppSettingsStore {
  settings?: AppSetting[];
  loading: boolean;
  error?: string;
  setSettings: (settings: AppSettingsStore["settings"]) => void;
  setError: (error: string) => void;
  setLoading: (value: boolean) => void;
}

export const useAppSettingsStore = create<AppSettingsStore>((set, get) => ({
  settings: undefined,
  loading: false,
  error: undefined,
  setSettings: (settings) =>
    set({ settings, loading: false, error: undefined }),
  setError: (error) => set({ error, loading: false }),
  setLoading: (value) => set({ loading: value }),
}));
