"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import {
  SystemRecord,
  WIZARD_TOTAL_QUESTIONS,
  WizardAnswers,
  WizardDpoForm,
  WizardSessionState,
  WizardStatusValue,
  WizardTreatment,
} from "@/types/wizardRisk.types";

const STORAGE_KEY_PREFIX = "wizard_session_";

function storageKey(sessionId: string) {
  return `${STORAGE_KEY_PREFIX}${sessionId}`;
}

const initialState: WizardSessionState = {
  sessionId: null,
  organizationId: "",
  userId: "",
  status: "NOT_STARTED",
  currentBlock: 1,
  currentQuestion: 1,
  progressPercent: 0,
  answers: {},
  systems: [],
  treatments: [],
  dpoForm: null,
  isLoading: false,
  error: null,
  createdAt: null,
  lastActivityAt: null,
};

/** Transiciones válidas de la máquina de estados del wizard. */
const VALID_TRANSITIONS: Record<WizardStatusValue, WizardStatusValue[]> = {
  NOT_STARTED: ["IN_PROGRESS"],
  IN_PROGRESS: ["VALIDATING", "ABANDONED"],
  VALIDATING: ["IN_PROGRESS", "COMPLETED"],
  // Item N-15 — COMPLETED -> EDITING -> COMPLETED (ver reopenWizardSession).
  // state.status en sí nunca llega a EDITING (queda fijo en IN_PROGRESS, ver
  // comentario de WizardStatusValue) — esto solo completa el tipo.
  COMPLETED: ["EDITING"],
  ABANDONED: [],
  EDITING: ["COMPLETED"],
};

export function isValidWizardTransition(from: WizardStatusValue, to: WizardStatusValue): boolean {
  if (from === to) return true;
  return VALID_TRANSITIONS[from].includes(to);
}

type WizardAction =
  | { type: "INITIALIZE_SESSION"; sessionId: string; organizationId: string; userId: string }
  | { type: "SET_CURRENT_BLOCK"; blockNum: number }
  | { type: "SET_CURRENT_QUESTION"; questionNum: number }
  | { type: "UPDATE_ANSWER"; questionKey: string; answerValue: string[] }
  | { type: "SET_SYSTEMS"; systems: SystemRecord[] }
  | { type: "SET_TREATMENTS"; treatments: WizardTreatment[] }
  | { type: "SET_DPO_FORM"; dpoForm: WizardDpoForm }
  | { type: "SET_STATUS"; status: WizardStatusValue }
  | { type: "SET_LOADING"; isLoading: boolean }
  | { type: "SET_ERROR"; code: string; message: string }
  | { type: "CLEAR_ERROR" }
  | { type: "HYDRATE"; state: WizardSessionState }
  | { type: "RESET_WIZARD" };

function computeProgress(currentQuestion: number): number {
  return Math.min(100, Math.round((currentQuestion / WIZARD_TOTAL_QUESTIONS) * 100));
}

function touch(): Pick<WizardSessionState, "lastActivityAt"> {
  return { lastActivityAt: new Date().toISOString() };
}

function reducer(state: WizardSessionState, action: WizardAction): WizardSessionState {
  switch (action.type) {
    case "INITIALIZE_SESSION": {
      const now = new Date().toISOString();
      return {
        ...state,
        sessionId: action.sessionId,
        organizationId: action.organizationId,
        userId: action.userId,
        status: "IN_PROGRESS",
        createdAt: state.createdAt ?? now,
        lastActivityAt: now,
      };
    }
    case "SET_CURRENT_BLOCK":
      return { ...state, currentBlock: action.blockNum, ...touch() };
    case "SET_CURRENT_QUESTION":
      return {
        ...state,
        currentQuestion: action.questionNum,
        progressPercent: computeProgress(action.questionNum),
        ...touch(),
      };
    case "UPDATE_ANSWER": {
      const answers: WizardAnswers = { ...state.answers, [action.questionKey]: action.answerValue };
      return { ...state, answers, ...touch() };
    }
    case "SET_SYSTEMS":
      return { ...state, systems: action.systems, ...touch() };
    case "SET_TREATMENTS":
      return { ...state, treatments: action.treatments, ...touch() };
    case "SET_DPO_FORM":
      return { ...state, dpoForm: action.dpoForm, ...touch() };
    case "SET_STATUS": {
      if (!isValidWizardTransition(state.status, action.status)) {
        throw new Error(
          `Transición de estado inválida en el wizard: ${state.status} -> ${action.status}`
        );
      }
      return { ...state, status: action.status, ...touch() };
    }
    case "SET_LOADING":
      return { ...state, isLoading: action.isLoading };
    case "SET_ERROR":
      return { ...state, error: { code: action.code, message: action.message } };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "HYDRATE":
      return { ...action.state };
    case "RESET_WIZARD":
      return { ...initialState };
    default:
      return state;
  }
}

interface WizardContextValue {
  state: WizardSessionState;
  initializeSession: (sessionId: string, organizationId: string, userId: string) => void;
  setCurrentBlock: (blockNum: number) => void;
  setCurrentQuestion: (questionNum: number) => void;
  updateAnswer: (questionKey: string, answerValue: string[]) => void;
  setSystems: (systems: SystemRecord[]) => void;
  setTreatments: (treatments: WizardTreatment[]) => void;
  setDpoForm: (dpoForm: WizardDpoForm) => void;
  setStatus: (status: WizardStatusValue) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (code: string, message: string) => void;
  clearError: () => void;
  resetWizard: () => void;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export function useWizardContext() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizardContext debe usarse dentro de WizardProvider");
  return ctx;
}

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Sincroniza a localStorage tras cada cambio de estado (backup, no fuente de verdad).
  useEffect(() => {
    if (!state.sessionId || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey(state.sessionId), JSON.stringify(state));
    } catch (e) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[WizardContext] No se pudo persistir el estado en localStorage:", e);
      }
    }
  }, [state]);

  const initializeSession = useCallback(
    (sessionId: string, organizationId: string, userId: string) => {
      if (typeof window !== "undefined") {
        try {
          const raw = window.localStorage.getItem(storageKey(sessionId));
          if (raw) {
            const persisted = JSON.parse(raw) as WizardSessionState;
            dispatch({
              type: "HYDRATE",
              state: {
                ...persisted,
                treatments: persisted.treatments ?? [],
                systems: persisted.systems ?? [],
                isLoading: false,
                error: null,
              },
            });
            return;
          }
        } catch (e) {
          if (process.env.NODE_ENV !== "production") {
            console.error("[WizardContext] No se pudo leer localStorage:", e);
          }
        }
      }
      dispatch({ type: "INITIALIZE_SESSION", sessionId, organizationId, userId });
    },
    []
  );

  const setCurrentBlock = useCallback((blockNum: number) => {
    dispatch({ type: "SET_CURRENT_BLOCK", blockNum });
  }, []);

  const setCurrentQuestion = useCallback((questionNum: number) => {
    dispatch({ type: "SET_CURRENT_QUESTION", questionNum });
  }, []);

  const updateAnswer = useCallback((questionKey: string, answerValue: string[]) => {
    dispatch({ type: "UPDATE_ANSWER", questionKey, answerValue });
  }, []);

  const setSystems = useCallback((systems: SystemRecord[]) => {
    dispatch({ type: "SET_SYSTEMS", systems });
  }, []);

  const setTreatments = useCallback((treatments: WizardTreatment[]) => {
    dispatch({ type: "SET_TREATMENTS", treatments });
  }, []);

  const setDpoForm = useCallback((dpoForm: WizardDpoForm) => {
    dispatch({ type: "SET_DPO_FORM", dpoForm });
  }, []);

  const setStatus = useCallback((status: WizardStatusValue) => {
    dispatch({ type: "SET_STATUS", status });
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    dispatch({ type: "SET_LOADING", isLoading });
  }, []);

  const setError = useCallback((code: string, message: string) => {
    dispatch({ type: "SET_ERROR", code, message });
  }, []);

  const clearError = useCallback(() => dispatch({ type: "CLEAR_ERROR" }), []);

  const resetWizard = useCallback(() => {
    if (state.sessionId && typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(storageKey(state.sessionId));
      } catch {
        // localStorage no disponible; no bloquea el reseteo en memoria.
      }
    }
    dispatch({ type: "RESET_WIZARD" });
  }, [state.sessionId]);

  const value = useMemo<WizardContextValue>(
    () => ({
      state,
      initializeSession,
      setCurrentBlock,
      setCurrentQuestion,
      updateAnswer,
      setSystems,
      setTreatments,
      setDpoForm,
      setStatus,
      setLoading,
      setError,
      clearError,
      resetWizard,
    }),
    [
      state,
      initializeSession,
      setCurrentBlock,
      setCurrentQuestion,
      updateAnswer,
      setSystems,
      setTreatments,
      setDpoForm,
      setStatus,
      setLoading,
      setError,
      clearError,
      resetWizard,
    ]
  );

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}
