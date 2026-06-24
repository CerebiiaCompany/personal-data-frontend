import clsx from "clsx";
import { Icon } from "@iconify/react";

interface Props {
  messages: string[];
  className?: string;
}

export default function CampaignWizardValidationBanner({
  messages,
  className,
}: Props) {
  if (!messages.length) return null;

  return (
    <div
      role="alert"
      className={clsx(
        "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800",
        className
      )}
    >
      <div className="flex items-start gap-2.5">
        <Icon
          icon="tabler:alert-circle"
          className="mt-0.5 shrink-0 text-lg text-red-600"
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-red-900">
            Revisa los siguientes puntos para continuar:
          </p>
          <ul className="mt-1.5 list-disc space-y-1 pl-4">
            {messages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
