"use client";

import { useWizardContext } from "@/contexts/WizardContext";
import { useWizardSession } from "@/hooks/useWizardSession";
import { getWizardBlockName } from "@/constants/wizardBlocks";
import WizardHeader from "./WizardHeader";
import ErrorHandler from "./ErrorHandler";
import WizardWelcome from "./WizardWelcome";
import WizardBlock1 from "./WizardBlock1";
import WizardBlock2 from "./WizardBlock2";
import WizardBlock3 from "./WizardBlock3";

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
  const { state } = useWizardContext();
  const { isLoading: sessionLoading, error: sessionError, resume } = useWizardSession();

  const showHeader = segment === "block" && (state.status === "IN_PROGRESS" || state.status === "VALIDATING");

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
  currentBlock,
  currentQuestion,
  resume,
}: {
  segment: WizardRouteSegment;
  status: string;
  currentBlock: number;
  currentQuestion: number;
  resume: boolean;
}) {
  if (segment === "bienvenida") {
    return <WizardWelcome resume={resume} currentBlock={currentBlock} currentQuestion={currentQuestion} />;
  }

  if (segment === "finalizacion") {
    return <p className="text-sm text-stone-500">Finalización — pantalla en construcción.</p>;
  }

  // segment === "block"
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

  return (
    <p className="text-sm text-stone-500">Bloque {currentBlock} — pantalla en construcción.</p>
  );
}
