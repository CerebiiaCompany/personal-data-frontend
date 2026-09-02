"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSessionStore } from "@/store/useSessionStore";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { fetchWizardStatus } from "@/lib/wizard.api";
import { WizardStatus } from "@/types/wizard.types";
import {
  isWizardPhase1Done,
  isWizardPhase2Done,
  isWizardPhase2Pending,
  isWizardPhase3Done,
  isWizardPhase3Pending,
  isWizardPhase4Done,
  isWizardPhase4Pending,
  isWizardPhase5Pending,
  resolveWizardEntryPhase,
} from "@/utils/wizardPhase.utils";
import {
  hasSeenWelcomeTour,
  markWelcomeTourSeen,
} from "@/utils/welcomeTour.utils";
import WelcomeTourDialog from "@/components/onboarding/WelcomeTourDialog";
import SetupWizard from "./SetupWizard";
import SetupWizardPhase2 from "./SetupWizardPhase2";
import SetupWizardPhase3 from "./SetupWizardPhase3";
import SetupWizardPhase4 from "./SetupWizardPhase4";
import SetupWizardPhase5 from "./SetupWizardPhase5";

interface SetupWizardContextValue {
  openWizard: () => void;
  openPolicySyncReview: () => void;
  closeWizard: () => void;
  isOpen: boolean;
  /** Tour de bienvenida visible antes de la primera fase del asistente. */
  isWelcomeVisible: boolean;
  canOpen: boolean;
  phase1Completed: boolean;
  phase2Completed: boolean;
  phase3Completed: boolean;
  phase4Completed: boolean;
  phase5Pending: boolean;
  lastAppliedAt: string | null;
  refreshStatus: () => Promise<void>;
}

const SetupWizardContext = createContext<SetupWizardContextValue | null>(null);

export function useSetupWizard() {
  const ctx = useContext(SetupWizardContext);
  if (!ctx) throw new Error("useSetupWizard debe usarse dentro de SetupWizardProvider");
  return ctx;
}

export function useSetupWizardOptional() {
  return useContext(SetupWizardContext);
}

export function SetupWizardProvider({ children }: { children: React.ReactNode }) {
  const role = useSessionStore((store) => store.user?.role);
  const userId = useSessionStore((store) => store.user?._id);
  const userName = useSessionStore((store) => store.user?.name);
  const companyId = useActiveCompanyId();
  const canOpen = role === "COMPANY_ADMIN" && Boolean(companyId);

  const [status, setStatus] = useState<WizardStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [flowOpen, setFlowOpen] = useState(false);
  const [flowPhase, setFlowPhase] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [flowMode, setFlowMode] = useState<"required" | "voluntary">("required");
  const [welcomeReady, setWelcomeReady] = useState(false);
  const holdingPhaseRef = useRef<1 | 2 | 3 | 4 | 5 | null>(null);

  const refreshStatus = useCallback(async () => {
    if (!companyId || !canOpen) {
      setLoading(false);
      return null;
    }
    setLoading(true);
    const res = await fetchWizardStatus(companyId);
    if (res.data) {
      const onRatStep = String(res.data.currentStepId || "").startsWith("rat_");
      const hasPhase2Proof = Boolean(res.data.phase2AppliedAt || res.data.phase2TreatmentId);
      const phase2Completed =
        onRatStep && !hasPhase2Proof ? false : hasPhase2Proof || res.data.phase2Completed;
      setStatus({ ...res.data, phase2Completed });
      setErrored(false);
    } else if (res.error) {
      console.warn("[setup-wizard] Error al cargar status:", res.error);
      setErrored(true);
    }
    setLoading(false);
    return res.data ?? null;
  }, [companyId, canOpen]);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    if (hasSeenWelcomeTour(userId)) {
      setWelcomeReady(true);
    }
  }, [userId]);

  const phase1Done = isWizardPhase1Done(status);
  const phase2Done = isWizardPhase2Done(status);
  const phase3Done = isWizardPhase3Done(status);
  const phase4Done = isWizardPhase4Done(status);
  const phase2Pending = isWizardPhase2Pending(status);
  const phase3Pending = isWizardPhase3Pending(status);
  const phase4Pending = isWizardPhase4Pending(status);
  const phase5Pending = isWizardPhase5Pending(status);

  const blockingPhase: 1 | 2 | 3 | 4 | 5 | null =
    canOpen && !errored && status
      ? !phase1Done
        ? 1
        : phase2Pending
          ? 2
          : phase3Pending
            ? 3
            : phase4Pending
              ? 4
              : phase5Pending
                ? 5
                : null
      : null;

  const shouldOfferWelcome =
    canOpen && !loading && !errored && Boolean(blockingPhase) && !hasSeenWelcomeTour(userId);
  const showWelcomeTour = shouldOfferWelcome && !welcomeReady;

  function openFlow(phase: 1 | 2 | 3 | 4 | 5, mode: "required" | "voluntary") {
    setFlowPhase(phase);
    setFlowMode(mode);
    setFlowOpen(true);
  }

  useEffect(() => {
    if (loading || manualOpen || errored) return;
    if (shouldOfferWelcome && !welcomeReady) {
      setFlowOpen(false);
      return;
    }
    if (holdingPhaseRef.current) {
      openFlow(holdingPhaseRef.current, "required");
      return;
    }
    if (blockingPhase) openFlow(blockingPhase, "required");
    else if (!manualOpen) setFlowOpen(false);
  }, [blockingPhase, loading, manualOpen, errored, shouldOfferWelcome, welcomeReady]);

  const handleWelcomeComplete = useCallback(() => {
    markWelcomeTourSeen(userId);
    setWelcomeReady(true);
  }, [userId]);

  const value = useMemo<SetupWizardContextValue>(
    () => ({
      openWizard: () => {
        if (!canOpen) return;
        holdingPhaseRef.current = null;
        openFlow(resolveWizardEntryPhase(status), "voluntary");
        setManualOpen(true);
      },
      openPolicySyncReview: () => {
        if (!canOpen) return;
        holdingPhaseRef.current = null;
        setManualOpen(false);
        openFlow(5, "required");
      },
      closeWizard: () => {
        setManualOpen(false);
        if (blockingPhase || holdingPhaseRef.current) {
          openFlow(blockingPhase ?? holdingPhaseRef.current ?? 5, "required");
        } else {
          setFlowOpen(false);
        }
      },
      isOpen: flowOpen,
      isWelcomeVisible: showWelcomeTour,
      canOpen,
      phase1Completed: phase1Done,
      phase2Completed: phase2Done,
      phase3Completed: phase3Done,
      phase4Completed: phase4Done,
      phase5Pending,
      lastAppliedAt: status?.lastAppliedAt ?? null,
      refreshStatus: async () => {
        await refreshStatus();
      },
    }),
    [blockingPhase, canOpen, flowOpen, phase1Done, phase2Done, phase3Done, phase4Done, phase5Pending, refreshStatus, showWelcomeTour, status]
  );

  function handlePhase1Required() {
    holdingPhaseRef.current = 1;
    setFlowPhase(1);
    setFlowOpen(true);
  }

  function handlePhase1Applied(nextStatus?: WizardStatus) {
    holdingPhaseRef.current = 2;
    setStatus(nextStatus ? { ...nextStatus, phase1Completed: true } : status);
    setManualOpen(false);
    setFlowMode("required");
    setFlowPhase(2);
    setFlowOpen(true);
  }

  function handlePhase2Applied(nextStatus?: WizardStatus) {
    holdingPhaseRef.current = 3;
    if (nextStatus) setStatus(nextStatus);
    setManualOpen(false);
    setFlowMode("required");
    setFlowPhase(3);
    setFlowOpen(true);
  }

  function handlePhase3Applied(nextStatus?: WizardStatus) {
    holdingPhaseRef.current = 4;
    if (nextStatus) setStatus(nextStatus);
    setManualOpen(false);
    setFlowMode("required");
    setFlowPhase(4);
    setFlowOpen(true);
  }

  function handlePhase4Applied(nextStatus?: WizardStatus) {
    const next = nextStatus ?? status;
    if (next && isWizardPhase5Pending(next)) {
      holdingPhaseRef.current = 5;
      setStatus(next);
      setFlowPhase(5);
      setFlowOpen(true);
      return;
    }
    handleAllCompleted();
  }

  function handleAllCompleted() {
    holdingPhaseRef.current = null;
    setManualOpen(false);
    setFlowOpen(false);
    void refreshStatus();
  }

  function handleDismiss() {
    if (holdingPhaseRef.current) return;
    if (blockingPhase && flowMode === "required") return;
    setManualOpen(false);
    setFlowOpen(false);
  }

  return (
    <SetupWizardContext.Provider value={value}>
      <WelcomeTourDialog
        open={showWelcomeTour}
        userName={userName}
        context="initial-setup"
        onComplete={handleWelcomeComplete}
      />
      {canOpen && flowOpen && companyId && flowPhase === 1 && (
        <SetupWizard
          companyId={companyId}
          mode={flowMode}
          onPhase1Applied={handlePhase1Applied}
          onCompleted={handleAllCompleted}
          onDismiss={handleDismiss}
        />
      )}
      {canOpen && flowOpen && companyId && flowPhase === 2 && (
        <SetupWizardPhase2
          companyId={companyId}
          mode={flowMode}
          onPhase2Applied={handlePhase2Applied}
          onCompleted={handleAllCompleted}
          onDismiss={handleDismiss}
          onPhase1Required={handlePhase1Required}
        />
      )}
      {canOpen && flowOpen && companyId && flowPhase === 3 && (
        <SetupWizardPhase3
          companyId={companyId}
          mode={flowMode}
          onPhase3Applied={handlePhase3Applied}
          onCompleted={handleAllCompleted}
          onDismiss={handleDismiss}
        />
      )}
      {canOpen && flowOpen && companyId && flowPhase === 4 && (
        <SetupWizardPhase4
          companyId={companyId}
          mode={flowMode}
          onPhase4Applied={handlePhase4Applied}
          onCompleted={handleAllCompleted}
          onDismiss={handleDismiss}
        />
      )}
      {canOpen && flowOpen && companyId && flowPhase === 5 && (
        <SetupWizardPhase5
          companyId={companyId}
          mode={flowMode}
          policySync={status?.policySync}
          onCompleted={handleAllCompleted}
          onDismiss={handleDismiss}
        />
      )}
      {children}
    </SetupWizardContext.Provider>
  );
}
