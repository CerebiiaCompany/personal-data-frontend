"use client";

import { personasTheme } from "@/constants/personasTheme";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";

const steps = [
  {
    id: 1,
    icon: "tabler:building",
    title: "Elige una empresa",
    description: "Toca la tarjeta de la organización que quieres consultar.",
  },
  {
    id: 2,
    icon: "tabler:click",
    title: "Indica qué necesitas",
    description:
      "Ver tus datos, corregirlos, pedir que los borren u oponerte al uso.",
  },
  {
    id: 3,
    icon: "tabler:history",
    title: "Revisa el avance",
    description:
      "En el historial verás el estado y la respuesta de cada solicitud.",
  },
] as const;

const PersonasPortalQuickGuide = () => {
  return (
    <div
      className={clsx(personasTheme.infoBox, "mb-8 p-4 sm:p-5")}
      aria-label="Cómo usar este panel"
    >
      <p className="mb-4 text-sm font-semibold text-primary-900">
        ¿Cómo funciona? Sigue estos pasos
      </p>
      <ol className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        {steps.map((step) => (
          <li
            key={step.id}
            className="personas-guide-step flex cursor-default gap-3 rounded-xl p-3 sm:flex-col sm:items-start"
          >
            <span
              className="personas-guide-step-badge flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-600"
              aria-hidden
            >
              {step.id}
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-primary-900">
                <Icon
                  icon={step.icon}
                  className="personas-guide-step-icon text-primary-600"
                />
                {step.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-600">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default PersonasPortalQuickGuide;
