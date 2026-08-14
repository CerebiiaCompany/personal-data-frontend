"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import type { OnboardingStatus, OnboardingStep } from "@/lib/onboarding.api";
import Button from "@/components/base/Button";

type StepId = OnboardingStep["id"];

const STEP_COPY: Record<
  StepId,
  { title: string; description: string; ctaLabel: string; href: string }
> = {
  dataProtectionOfficer: {
    title: "Asigna tu Oficial de Protección de Datos",
    description:
      "Es la persona responsable de atender solicitudes de titulares y garantizar el cumplimiento normativo.",
    ctaLabel: "Ir al perfil de empresa",
    href: "/admin/administracion/perfil-empresa#oficial-proteccion-datos",
  },
  firstTreatment: {
    title: "Crea tu primer Registro de Actividades de Tratamiento (RAT)",
    description:
      "Documenta qué datos personales trata tu empresa, con qué finalidad y base legal — es la base de tu cumplimiento.",
    ctaLabel: "Crear tratamiento",
    href: "/admin/tratamientos/crear",
  },
  firstPolicyTemplate: {
    title: "Sube o genera tu primera política de tratamiento",
    description:
      "Es el documento legal que tus titulares deben aceptar antes de entregarte sus datos.",
    ctaLabel: "Ir a políticas de tratamiento",
    href: "/admin/plantillas",
  },
  firstCollectForm: {
    title: "Crea tu primer formulario de recolección",
    description:
      "Es el canal (web, evento, etc.) donde capturas datos y consentimiento de tus titulares.",
    ctaLabel: "Crear formulario",
    href: "/admin/recoleccion/crear-formulario",
  },
  inviteTeamMember: {
    title: "Invita a tu equipo",
    description:
      "Delega tareas operativas (recolección, atención de solicitudes) sin compartir tu usuario de administrador.",
    ctaLabel: "Invitar usuario",
    href: "/admin/administracion/usuarios/crear",
  },
};

const MINIMIZED_STORAGE_KEY = "cerebiia.onboardingChecklist.minimized";

function readMinimizedPreference(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(MINIMIZED_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeMinimizedPreference(value: boolean) {
  try {
    window.localStorage.setItem(MINIMIZED_STORAGE_KEY, value ? "1" : "0");
  } catch {
    // ignore quota / private mode
  }
}

interface Props {
  status?: OnboardingStatus | null;
  focusFirstSteps?: boolean;
  onFocusHandled?: () => void;
  hidden?: boolean;
}

export default function OnboardingChecklistWidget({
  status,
  focusFirstSteps = false,
  onFocusHandled,
  hidden = false,
}: Props) {
  const [minimized, setMinimized] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [highlighted, setHighlighted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const prevCompletedIds = useRef<Set<StepId>>(new Set());
  const [celebratingIds, setCelebratingIds] = useState<Set<StepId>>(new Set());
  const [exitingIds, setExitingIds] = useState<Set<StepId>>(new Set());
  /** Pasos ya completados en API pero aún visibles en pendientes durante la animación. */
  const [deferredCompletedIds, setDeferredCompletedIds] = useState<Set<StepId>>(
    new Set()
  );
  const [enteringCompletedIds, setEnteringCompletedIds] = useState<Set<StepId>>(
    new Set()
  );
  const hydratedRef = useRef(false);

  useEffect(() => {
    setMinimized(readMinimizedPreference());
  }, []);

  function minimize() {
    setMinimized(true);
    writeMinimizedPreference(true);
  }

  function expand() {
    setMinimized(false);
    writeMinimizedPreference(false);
  }

  useEffect(() => {
    if (!focusFirstSteps || !status) return;
    if (status.completedCount >= status.totalCount) return;

    expand();
    setShowTip(true);
    setHighlighted(true);
    onFocusHandled?.();

    const focusTimer = window.setTimeout(() => {
      panelRef.current?.focus({ preventScroll: true });
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 80);

    const highlightTimer = window.setTimeout(() => {
      setHighlighted(false);
    }, 10000);

    return () => {
      window.clearTimeout(focusTimer);
      window.clearTimeout(highlightTimer);
    };
  }, [focusFirstSteps, status, onFocusHandled]);

  useEffect(() => {
    if (!status) return;

    const currentCompleted = new Set(
      status.steps.filter((s) => s.completed).map((s) => s.id)
    );

    // Primera carga: sincroniza sin animar.
    if (!hydratedRef.current) {
      prevCompletedIds.current = currentCompleted;
      hydratedRef.current = true;
      return;
    }

    const newlyCompleted = [...currentCompleted].filter(
      (id) => !prevCompletedIds.current.has(id)
    );

    if (newlyCompleted.length === 0) {
      prevCompletedIds.current = currentCompleted;
      return;
    }

    expand();
    setDeferredCompletedIds((prev) => new Set([...prev, ...newlyCompleted]));
    setCelebratingIds((prev) => new Set([...prev, ...newlyCompleted]));

    const exitTimer = window.setTimeout(() => {
      setExitingIds((prev) => new Set([...prev, ...newlyCompleted]));
    }, 750);

    const moveTimer = window.setTimeout(() => {
      setCelebratingIds((prev) => {
        const next = new Set(prev);
        newlyCompleted.forEach((id) => next.delete(id));
        return next;
      });
      setExitingIds((prev) => {
        const next = new Set(prev);
        newlyCompleted.forEach((id) => next.delete(id));
        return next;
      });
      setDeferredCompletedIds((prev) => {
        const next = new Set(prev);
        newlyCompleted.forEach((id) => next.delete(id));
        return next;
      });
      setEnteringCompletedIds((prev) => new Set([...prev, ...newlyCompleted]));
      prevCompletedIds.current = currentCompleted;
    }, 750 + 450);

    const enterClearTimer = window.setTimeout(() => {
      setEnteringCompletedIds((prev) => {
        const next = new Set(prev);
        newlyCompleted.forEach((id) => next.delete(id));
        return next;
      });
    }, 750 + 450 + 500);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(moveTimer);
      window.clearTimeout(enterClearTimer);
    };
  }, [status]);

  const pendingSteps = useMemo(() => {
    if (!status) return [];
    return status.steps.filter(
      (step) => !step.completed || deferredCompletedIds.has(step.id)
    );
  }, [status, deferredCompletedIds]);

  const completedSteps = useMemo(() => {
    if (!status) return [];
    return status.steps.filter(
      (step) => step.completed && !deferredCompletedIds.has(step.id)
    );
  }, [status, deferredCompletedIds]);

  if (hidden || !status) return null;

  const { completedCount, totalCount } = status;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isAnimatingCompletion =
    deferredCompletedIds.size > 0 ||
    celebratingIds.size > 0 ||
    exitingIds.size > 0 ||
    enteringCompletedIds.size > 0;
  const hasPendingSteps =
    completedCount < totalCount || deferredCompletedIds.size > 0;

  // Oculta solo cuando no quedan pendientes ni animaciones en curso.
  if (completedCount >= totalCount && !isAnimatingCompletion) return null;
  if (!hasPendingSteps && completedSteps.length === 0 && !isAnimatingCompletion) {
    return null;
  }

  const pendingCount = Math.max(totalCount - completedCount, 0);

  if (minimized) {
    return (
      <div className="fixed bottom-5 right-5 z-30 flex flex-col items-end gap-2">
        {showTip && (
          <div className="onboarding-tip max-w-[220px] rounded-xl border border-primary-300/40 bg-primary-50 px-3 py-2 text-xs font-medium text-primary-900 shadow-md">
            Completa tus primeros pasos ({completedCount}/{totalCount}).
            <button
              type="button"
              onClick={() => setShowTip(false)}
              className="ml-2 inline-flex align-middle text-primary-700 hover:text-primary-900"
              aria-label="Cerrar aviso"
            >
              <Icon icon="tabler:x" className="text-sm" />
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={expand}
          aria-label={`Abrir primeros pasos (${completedCount} de ${totalCount})`}
          title={`Primeros pasos · ${completedCount}/${totalCount}`}
          className={`onboarding-dot-pending group relative grid size-12 place-content-center rounded-full border border-primary-500/35 bg-primary-900 text-white shadow-[0_8px_18px_rgba(0,11,80,0.28)] transition-transform hover:scale-105 hover:bg-primary-700 ${
            highlighted ? "ring-4 ring-primary-300/45" : ""
          }`}
        >
          <Icon icon="tabler:list-check" className="text-xl" />
          {pendingCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-content-center rounded-full bg-amber-400 px-1 py-0.5 text-[10px] font-bold leading-none text-primary-950 shadow-sm">
              {pendingCount}
            </span>
          )}
          <span className="pointer-events-none absolute bottom-full right-0 mb-2 hidden whitespace-nowrap rounded-md bg-primary-950/95 px-2 py-1 text-[11px] font-semibold text-white shadow-md group-hover:block">
            Primeros pasos · {completedCount}/{totalCount}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-30 flex w-full max-w-sm flex-col items-stretch gap-2">
      {showTip && (
        <div className="onboarding-tip flex items-start gap-2 rounded-xl border border-primary-300/35 bg-primary-50 px-3.5 py-3 text-sm text-primary-900 shadow-md">
          <Icon
            icon="tabler:info-circle-filled"
            className="mt-0.5 shrink-0 text-lg text-primary-500"
          />
          <div className="flex-1">
            <p className="font-semibold">Completa tus primeros pasos</p>
            <p className="mt-0.5 text-xs leading-relaxed text-primary-700/85">
              Es importante que hagas estos primeros pasos de la aplicación para
              dejar tu empresa lista y aprovechar toda la plataforma.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowTip(false)}
            className="rounded-md p-0.5 text-primary-700 hover:bg-primary-100"
            aria-label="Cerrar aviso"
          >
            <Icon icon="tabler:x" className="text-base" />
          </button>
        </div>
      )}

      <div
        ref={panelRef}
        tabIndex={-1}
        className={`flex flex-col gap-3 rounded-xl border-2 bg-white p-4 outline-none ${
          hasPendingSteps
            ? "onboarding-panel-pending"
            : "border-disabled shadow-xl"
        } ${
          highlighted ? "onboarding-spotlight ring-4 ring-primary-300/40" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <h3 className="text-base font-bold text-primary-900">
                Primeros pasos
              </h3>
              {hasPendingSteps && (
                <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-primary-700 uppercase">
                  Requerido
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500">
              Completa esto para que tu empresa aproveche toda la plataforma.
            </p>
          </div>
          <button
            type="button"
            onClick={minimize}
            aria-label="Minimizar a un punto"
            title="Minimizar a un punto (abajo a la derecha)"
            className="rounded-lg p-1 transition-colors hover:bg-stone-100"
          >
            <Icon icon="tabler:circle-minus" className="text-lg" />
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
            <div
              className="h-full rounded-full bg-primary-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-stone-500">
            {completedCount} de {totalCount} completados
          </p>
        </div>

        <div className="flex max-h-80 flex-col gap-3 overflow-y-auto pr-0.5">
          {pendingSteps.length > 0 && (
            <ul className="flex flex-col gap-2">
              {pendingSteps.map((step) => {
                const copy = STEP_COPY[step.id];
                const celebrating = celebratingIds.has(step.id);
                const exiting = exitingIds.has(step.id);

                return (
                  <li
                    key={step.id}
                    className={[
                      "flex flex-col gap-2 rounded-lg border p-3 transition-colors",
                      celebrating || exiting
                        ? "onboarding-step-celebrate border-emerald-300 bg-emerald-50"
                        : "onboarding-step-pending border-primary-300",
                      exiting ? "onboarding-step-exit" : "",
                    ].join(" ")}
                  >
                    <div className="flex items-start gap-2">
                      <Icon
                        icon={
                          celebrating || exiting
                            ? "tabler:circle-check-filled"
                            : "tabler:alert-circle-filled"
                        }
                        className={`mt-0.5 shrink-0 text-lg ${
                          celebrating || exiting
                            ? "text-emerald-600"
                            : "onboarding-step-icon-pending"
                        }`}
                      />
                      <div className="flex flex-col gap-0.5">
                        <p
                          className={`text-sm font-semibold ${
                            celebrating || exiting
                              ? "text-emerald-800"
                              : "text-primary-900"
                          }`}
                        >
                          {copy.title}
                        </p>
                        <p className="text-xs text-stone-500">
                          {celebrating || exiting
                            ? "¡Paso completado!"
                            : copy.description}
                        </p>
                      </div>
                    </div>
                    {!celebrating && !exiting && (
                      <Button
                        href={copy.href}
                        hierarchy="secondary"
                        className="w-fit border-primary-300! px-2! py-1! text-xs! text-primary-900!"
                      >
                        {copy.ctaLabel}
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {completedSteps.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 pt-1">
                <div className="h-px flex-1 bg-emerald-100" />
                <p className="text-[11px] font-bold tracking-wide text-emerald-700 uppercase">
                  Completadas ({completedSteps.length})
                </p>
                <div className="h-px flex-1 bg-emerald-100" />
              </div>
              <ul className="flex flex-col gap-2">
                {completedSteps.map((step) => {
                  const copy = STEP_COPY[step.id];
                  const entering = enteringCompletedIds.has(step.id);

                  return (
                    <li
                      key={step.id}
                      className={[
                        "flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3",
                        entering ? "onboarding-step-enter" : "",
                      ].join(" ")}
                    >
                      <Icon
                        icon="tabler:circle-check-filled"
                        className="mt-0.5 shrink-0 text-lg text-emerald-600"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-emerald-900">
                          {copy.title}
                        </p>
                        <p className="text-xs text-emerald-700/80">Completado</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
