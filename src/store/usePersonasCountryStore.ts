import { PersonasCountryCode } from "@/types/personas.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PersonasCountryState {
  country: PersonasCountryCode;
  setCountry: (country: PersonasCountryCode) => void;
}

export const usePersonasCountryStore = create<PersonasCountryState>()(
  persist(
    (set) => ({
      country: "CO",
      setCountry: (country) => set({ country }),
    }),
    { name: "personas-country" }
  )
);
