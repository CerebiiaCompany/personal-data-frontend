"use client";

import { useWizardContext } from "@/contexts/WizardContext";
import { useWizardSession } from "@/hooks/useWizardSession";
import { useWizardAbandonDetector } from "@/hooks/useWizardAbandonDetector";
import { getWizardBlockName } from "@/constants/wizardBlocks";
import WizardHeader from "./WizardHeader";
import ErrorHandler from "./ErrorHandler";

/**
 * Componente raíz del Wizard de Diagnóstico de Riesgo. Orquesta la carga de
 * sesión, el estado de error, la barra de progreso y el bloque activo.
 *
 * Las pantallas de cada bloque (WizardWelcome, WizardBlock1..5,
 * WizardCompletion) se incorporan en batches posteriores; por ahora se
 * renderiza un placeholder para cada estado.
 */
export default function WizardContainer() {
  const { state } = useWizardContext();
  const { isLoading: sessionLoading, error: sessionError } = useWizardSession();
  useWizardAbandonDetector();

  const showHeader = state.status === "IN_PROGRESS" || state.status === "VALIDATING";

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
        <WizardBody status={state.status} currentBlock={state.currentBlock} />
      </div>

      <ErrorHandler />
    </div>
  );
}

function WizardBody({ status, currentBlock }: { status: string; currentBlock: number }) {
  switch (status) {
    case "NOT_STARTED":
      return <p className="text-sm text-stone-500">Bienvenida — pantalla en construcción (Batch 2).</p>;
    case "IN_PROGRESS":
      return (
        <p className="text-sm text-stone-500">
          Bloque {currentBlock} — pantalla en construcción (Batch 3+).
        </p>
      );
    case "VALIDATING":
      return <p className="text-sm text-stone-500">Bloque 5 (validación) — pantalla en construcción.</p>;
    case "COMPLETED":
      return <p className="text-sm text-stone-500">Finalización — pantalla en construcción.</p>;
    case "ABANDONED":
      return (
        <p className="text-sm text-stone-500">
          Esta sesión fue marcada como abandonada. Puedes retomarla como una nueva sesión.
        </p>
      );
    default:
      return null;
  }
}
