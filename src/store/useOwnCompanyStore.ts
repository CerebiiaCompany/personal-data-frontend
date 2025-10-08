import { Company } from "@/types/company.types";
import { SessionUser } from "@/types/user.types";
import { create } from "zustand";

interface OwnCompanyStore {
  company?: Company;
  loading: boolean;
  error?: string;
  setCompany: (user: OwnCompanyStore["company"]) => void;
  setError: (error: string) => void;
  setLoading: (value: boolean) => void;
}

export const useOwnCompanyStore = create<OwnCompanyStore>((set) => ({
  company: undefined,
  loading: false,
  error: undefined,
  setCompany: (user) =>
    set({ company: user, loading: false, error: undefined }),
  setError: (error) => set({ error, loading: false }),
  setLoading: (value) => set({ loading: value }),
}));
