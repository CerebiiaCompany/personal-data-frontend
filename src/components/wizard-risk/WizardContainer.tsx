"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWizardContext } from "@/contexts/WizardContext";
import { useWizardSession } from "@/hooks/useWizardSession";
import { getWizardBlockName } from "@/constants/wizardBlocks";
import WizardHeader from "./WizardHeader";
import WizardContextRail, { WizardMobileContext } from "./WizardContextRail";
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
      <div className="flex min-h-full flex-1 items-center justify-center bg-[#F4F7FB]">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#E4EAF6] bg-white px-8 py-6 shadow-[0_12px_40px_rgba(15,35,70,0.08)]">
          <span className="h-8 w-8 rounded-full border-2 border-[#E4EAF6] border-t-[#1A2B5B] animate-spin" />
          <p className="text-sm font-medium text-[#64748B]">Preparando tu asistente…</p>
        </div>
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

  const isWelcome = segment === "bienvenida";

  return (
    <div className={isWelcome ? "flex min-h-full flex-1 flex-col" : "flex min-h-full flex-1 flex-col bg-[#F4F7FB]"}>
      {showHeader && (
        <WizardHeader
          currentBlock={state.currentBlock}
          currentQuestion={state.currentQuestion}
          blockName={getWizardBlockName(state.currentBlock)}
        />
      )}

      {isWelcome ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <WizardBody
            segment={segment}
            status={state.status}
            sessionStatus={sessionStatus}
            currentBlock={state.currentBlock}
            currentQuestion={state.currentQuestion}
            resume={resume}
          />
        </div>
      ) : (
        <div className="relative flex-1 bg-[#F4F7FB]">
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-24 top-0 h-64 w-64 rounded-full bg-[#1A2B5B]/6 blur-3xl" />
            <div className="absolute -right-16 top-24 h-72 w-72 rounded-full bg-[#C7D7F5]/40 blur-3xl" />
          </div>
          <div
            className={
              showHeader
                ? "relative mx-auto grid w-full max-w-6xl gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-8 lg:py-8"
                : "relative mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8"
            }
          >
            {showHeader && (
              <WizardContextRail currentBlock={state.currentBlock} currentQuestion={state.currentQuestion} />
            )}
            <div className="min-w-0">
              {showHeader && (
                <WizardMobileContext currentBlock={state.currentBlock} currentQuestion={state.currentQuestion} />
              )}
              <WizardBody
                segment={segment}
                status={state.status}
                sessionStatus={sessionStatus}
                currentBlock={state.currentBlock}
                currentQuestion={state.currentQuestion}
                resume={resume}
              />
            </div>
          </div>
        </div>
      )}

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

  return <WizardBlock5 sessionStatus={sessionStatus} />;
}
