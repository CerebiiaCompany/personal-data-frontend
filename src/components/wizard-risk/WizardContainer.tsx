"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWizardContext } from "@/contexts/WizardContext";
import { useWizardSession } from "@/hooks/useWizardSession";
import { getWizardBlockName } from "@/constants/wizardBlocks";
import WizardHeader from "./WizardHeader";
import ErrorHandler from "./ErrorHandler";
import WizardWelcome from "./WizardWelcome";
import WizardBlock1 from "./WizardBlock1";
import WizardBlock2 from "./WizardBlock2";
import WizardBlock3 from "./WizardBlock3";
import WizardBlock4 from "./WizardBlock4";
import WizardBlock5 from "./WizardBlock5";
import ConfirmationSummary from "./ConfirmationSummary";

type WizardRouteSegment = "bienvenida" | "block" | "finalizacion";

interface WizardContainerProps {
  segment: WizardRouteSegment;
}

/**
 * Componente raíz del Wizard de Diagnóstico de Riesgo. Orquesta la carga de
 * sesión, el estado de error, la barra de progreso y la pantalla activa.
 *
 * La pantalla a mostrar se decide por `segment` (viene de la URL, ver
 * WizardRouter), NO por `state.status` — el backend pone `status` en
 * IN_PROGRESS apenas se crea/retoma la sesión (batch 1), incluso estando
 * todavía en /wizard/bienvenida, así que status por sí solo no distingue
 * "en la bienvenida" de "respondiendo un bloque".
 *
 * La detección de abandono es responsabilidad exclusiva del backend (cron
 * horario, ver wizardRiskAbandonDetector.job.ts) — el cliente no la
 * replica: al retomar, si el backend ya marcó la sesión ABANDONED,
 * simplemente no la encuentra IN_PROGRESS y crea una nueva.
 */
export default function WizardContainer({ segment }: WizardContainerProps) {
  const router = useRouter();
  const { state } = useWizardContext();
  const { isLoading: sessionLoading, error: sessionError, resume, status: sessionStatus } = useWizardSession();

  const showHeader = segment === "block" && (state.status === "IN_PROGRESS" || state.status === "VALIDATING");

  // Batch 10 — una sesión COMPLETED puede volver como `resume: true` desde
  // createOrResumeWizardSession (ver wizardRiskSession.service.ts, fallback
  // a la última sesión COMPLETED). Si el usuario cae en /wizard/block/* con
  // esa sesión (deep-link viejo, back del navegador), se redirige al resumen
  // en vez de mostrarle preguntas ya respondidas de un diagnóstico cerrado.
  useEffect(() => {
    if (segment === "block" && sessionStatus === "COMPLETED") {
      router.replace("/wizard/finalizacion");
    }
  }, [segment, sessionStatus, router]);

  if (!state.sessionId && sessionLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-stone-500">Cargando sesión...</p>
      </div>
    );
  }

  if (sessionError || state.error) {
    return (
      <ErrorHandler
        onRetry={() => {
          if (typeof window !== "undefined") window.location.reload();
        }}
      />
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col">
      {showHeader && (
        <WizardHeader
          currentBlock={state.currentBlock}
          currentQuestion={state.currentQuestion}
          blockName={getWizardBlockName(state.currentBlock)}
        />
      )}

      <div className="flex-1 p-4 sm:p-6">
        <WizardBody
          segment={segment}
          status={state.status}
          sessionStatus={sessionStatus}
          currentBlock={state.currentBlock}
          currentQuestion={state.currentQuestion}
          resume={resume}
        />
      </div>

      <ErrorHandler />
    </div>
  );
}

function WizardBody({
  segment,
  status,
  sessionStatus,
  currentBlock,
  currentQuestion,
  resume,
}: {
  segment: WizardRouteSegment;
  status: string;
  sessionStatus: string;
  currentBlock: number;
  currentQuestion: number;
  resume: boolean;
}) {
  if (segment === "bienvenida") {
    return (
      <WizardWelcome
        resume={resume}
        sessionStatus={sessionStatus}
        currentBlock={currentBlock}
        currentQuestion={currentQuestion}
      />
    );
  }

  if (segment === "finalizacion") {
    return <ConfirmationSummary sessionStatus={sessionStatus} />;
  }

  // segment === "block" — si sessionStatus es COMPLETED, el useEffect de
  // arriba ya está redirigiendo a /wizard/finalizacion; no renderizar un
  // bloque de preguntas mientras tanto.
  if (sessionStatus === "COMPLETED") {
    return null;
  }

  if (status === "ABANDONED") {
    return (
      <p className="text-sm text-stone-500">
        Esta sesión fue marcada como abandonada. Puedes retomarla como una nueva sesión.
      </p>
    );
  }

  if (currentBlock === 1) {
    return <WizardBlock1 />;
  }

  if (currentBlock === 2) {
    return <WizardBlock2 />;
  }

  if (currentBlock === 3) {
    return <WizardBlock3 />;
  }

  if (currentBlock === 4) {
    return <WizardBlock4 />;
  }

  return <WizardBlock5 />;
}
