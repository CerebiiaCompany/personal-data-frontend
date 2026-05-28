"use client";

import { APIError } from "@/types/api.types";
import {
  ApiErrorPresentation,
  ApiErrorToastVariant,
  getApiErrorPresentation,
} from "@/utils/apiErrorPresentation";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import { toast } from "sonner";

const VARIANT_CONFIG: Record<
  ApiErrorToastVariant,
  {
    icon: string;
    iconBox: string;
    border: string;
    title: string;
  }
> = {
  "rate-limit": {
    icon: "tabler:clock-pause",
    iconBox: "bg-amber-50 text-amber-700",
    border: "border-amber-200/90",
    title: "text-amber-950",
  },
  auth: {
    icon: "tabler:lock",
    iconBox: "bg-rose-50 text-rose-700",
    border: "border-rose-200/90",
    title: "text-rose-950",
  },
  validation: {
    icon: "tabler:alert-circle",
    iconBox: "bg-orange-50 text-orange-700",
    border: "border-orange-200/90",
    title: "text-orange-950",
  },
  network: {
    icon: "tabler:wifi-off",
    iconBox: "bg-slate-100 text-slate-700",
    border: "border-slate-200/90",
    title: "text-slate-900",
  },
  server: {
    icon: "tabler:server-off",
    iconBox: "bg-red-50 text-red-700",
    border: "border-red-200/90",
    title: "text-red-950",
  },
  default: {
    icon: "tabler:info-circle",
    iconBox: "bg-primary-50 text-primary-700",
    border: "border-zinc-200/90",
    title: "text-primary-900",
  },
};

interface FeedbackToastProps {
  toastId: string | number;
  presentation: ApiErrorPresentation;
}

function FeedbackToast({ toastId, presentation }: FeedbackToastProps) {
  const config = VARIANT_CONFIG[presentation.variant];

  return (
    <div
      className={clsx(
        "pointer-events-auto flex w-full max-w-[min(100vw-2rem,28rem)] gap-3 rounded-2xl border bg-white p-4 shadow-lg shadow-zinc-900/10",
        config.border
      )}
      role="alert"
      aria-live="assertive"
    >
      <div
        className={clsx(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          config.iconBox
        )}
      >
        <Icon icon={config.icon} className="text-xl" />
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <p className={clsx("text-sm font-semibold leading-snug", config.title)}>
          {presentation.title}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-zinc-600">
          {presentation.message}
        </p>
        {presentation.hint && (
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            {presentation.hint}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => toast.dismiss(toastId)}
        className="shrink-0 rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
        aria-label="Cerrar"
      >
        <Icon icon="tabler:x" className="text-lg" />
      </button>
    </div>
  );
}

function showFeedbackToast(presentation: ApiErrorPresentation) {
  toast.custom(
    (toastId) => (
      <FeedbackToast toastId={toastId} presentation={presentation} />
    ),
    {
      duration: presentation.duration,
      position: "top-center",
    }
  );
}

export function showApiErrorToast(error: APIError, httpStatus?: number) {
  showFeedbackToast(getApiErrorPresentation(error, httpStatus));
}

export function showPersonasMessageToast(
  message: string,
  options?: {
    title?: string;
    variant?: ApiErrorToastVariant;
    hint?: string;
    duration?: number;
  }
) {
  showFeedbackToast({
    title: options?.title ?? "Revisa la información",
    message,
    variant: options?.variant ?? "validation",
    duration: options?.duration ?? 6000,
    hint: options?.hint,
  });
}
