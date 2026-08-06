"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { getModuleTour } from "@/constants/moduleTours";
import { ModuleTourDefinition, ModuleTourId } from "@/types/moduleTour.types";
import ModuleTourOverlay from "./ModuleTourOverlay";

interface ModuleTourContextValue {
  activeTour: ModuleTourDefinition | null;
  stepIndex: number;
  startTour: (tourId: ModuleTourId) => void;
  stopTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
}

const ModuleTourContext = createContext<ModuleTourContextValue | null>(null);

export function ModuleTourProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeTour, setActiveTour] = useState<ModuleTourDefinition | null>(
    null
  );
  const [stepIndex, setStepIndex] = useState(0);

  const stopTour = useCallback(() => {
    setActiveTour(null);
    setStepIndex(0);
  }, []);

  const startTour = useCallback((tourId: ModuleTourId) => {
    const tour = getModuleTour(tourId);
    if (!tour.steps.length) return;
    setActiveTour(tour);
    setStepIndex(0);
  }, []);

  const nextStep = useCallback(() => {
    setStepIndex((current) => {
      if (!activeTour) return 0;
      if (current >= activeTour.steps.length - 1) {
        // Cierra al terminar el último paso.
        setTimeout(() => {
          setActiveTour(null);
          setStepIndex(0);
        }, 0);
        return current;
      }
      return current + 1;
    });
  }, [activeTour]);

  const prevStep = useCallback(() => {
    setStepIndex((current) => Math.max(0, current - 1));
  }, []);

  const value = useMemo(
    () => ({
      activeTour,
      stepIndex,
      startTour,
      stopTour,
      nextStep,
      prevStep,
    }),
    [activeTour, stepIndex, startTour, stopTour, nextStep, prevStep]
  );

  return (
    <ModuleTourContext.Provider value={value}>
      {children}
      <ModuleTourOverlay />
    </ModuleTourContext.Provider>
  );
}

export function useModuleTour() {
  const ctx = useContext(ModuleTourContext);
  if (!ctx) {
    throw new Error("useModuleTour debe usarse dentro de ModuleTourProvider");
  }
  return ctx;
}
