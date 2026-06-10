"use client";

import { personasTheme } from "@/constants/personasTheme";
import { ArcoOppositionScope } from "@/types/arco.types";
import {
  isOppositionScopeDisabled,
  toggleOppositionScope,
} from "@/utils/arcoOppositionScopes.utils";
import clsx from "clsx";

interface ScopeOption {
  value: ArcoOppositionScope;
  label: string;
  description: string;
}

const ALL_CAMPAIGNS_OPTION: ScopeOption = {
  value: "ALL_CAMPAIGNS",
  label: "Bloquear TODAS las campañas",
  description:
    "Incluye marketing y consentimiento. Puedes combinarlo con «Compartir datos con terceros».",
};

const CAMPAIGN_TYPE_OPTIONS: ScopeOption[] = [
  {
    value: "MARKETING_CAMPAIGNS",
    label: "Campañas de marketing",
    description: "Publicidad, promociones y comunicaciones comerciales.",
  },
  {
    value: "CONSENT_CAMPAIGNS",
    label: "Campañas de consentimiento",
    description: "Invitaciones para renovar o confirmar tu autorización.",
  },
];

const THIRD_PARTY_OPTION: ScopeOption = {
  value: "THIRD_PARTY_SHARING",
  label: "Compartir datos con terceros",
  description:
    "Te opones a que compartan tus datos con otras organizaciones. Se puede marcar junto con cualquier opción de campaña.",
};

interface Props {
  value: ArcoOppositionScope[];
  onChange: (scopes: ArcoOppositionScope[]) => void;
}

function ScopeCheckbox({
  option,
  checked,
  disabled,
  onToggle,
}: {
  option: ScopeOption;
  checked: boolean;
  disabled: boolean;
  onToggle: (checked: boolean) => void;
}) {
  return (
    <label
      className={clsx(
        "flex gap-3 rounded-xl border p-3 transition-colors",
        disabled
          ? "cursor-not-allowed border-zinc-100 bg-zinc-50 opacity-60"
          : "cursor-pointer",
        !disabled &&
          (checked
            ? "border-primary-900 bg-primary-50/40"
            : "border-zinc-200/80 bg-zinc-50/50 hover:border-zinc-300")
      )}
    >
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 accent-primary-900 disabled:cursor-not-allowed"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onToggle(e.target.checked)}
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-primary-900">
          {option.label}
        </span>
        <span className="mt-0.5 block text-xs text-zinc-500">
          {option.description}
        </span>
      </span>
    </label>
  );
}

const PersonasOppositionScopesPicker = ({ value, onChange }: Props) => {
  function handleToggle(scope: ArcoOppositionScope, checked: boolean) {
    onChange(toggleOppositionScope(value, scope, checked));
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="pl-2 text-sm font-medium text-stone-500">
          ¿A qué uso de tus datos te opones?{" "}
          <span className="text-red-500">*</span>
        </p>
        <p className="px-2 mt-1 text-xs text-zinc-500">
          Las opciones de campaña son excluyentes entre sí. «Compartir con
          terceros» siempre se puede combinar con otra opción.
        </p>
      </div>

      <ScopeCheckbox
        option={ALL_CAMPAIGNS_OPTION}
        checked={value.includes("ALL_CAMPAIGNS")}
        disabled={isOppositionScopeDisabled(value, "ALL_CAMPAIGNS")}
        onToggle={(checked) => handleToggle("ALL_CAMPAIGNS", checked)}
      />

      <div className="flex items-center gap-3 px-2">
        <div className="h-px flex-1 bg-zinc-200" />
        <span className="text-xs font-medium text-zinc-400">
          O selecciona por tipo
        </span>
        <div className="h-px flex-1 bg-zinc-200" />
      </div>

      <ul className="flex flex-col gap-2">
        {CAMPAIGN_TYPE_OPTIONS.map((option) => (
          <li key={option.value}>
            <ScopeCheckbox
              option={option}
              checked={value.includes(option.value)}
              disabled={isOppositionScopeDisabled(value, option.value)}
              onToggle={(checked) => handleToggle(option.value, checked)}
            />
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3 px-2">
        <div className="h-px flex-1 bg-zinc-200" />
        <span className="text-xs font-medium text-zinc-400">
          Siempre combinable
        </span>
        <div className="h-px flex-1 bg-zinc-200" />
      </div>

      <ScopeCheckbox
        option={THIRD_PARTY_OPTION}
        checked={value.includes("THIRD_PARTY_SHARING")}
        disabled={isOppositionScopeDisabled(value, "THIRD_PARTY_SHARING")}
        onToggle={(checked) => handleToggle("THIRD_PARTY_SHARING", checked)}
      />

      {(value.includes("ALL_CAMPAIGNS") ||
        value.includes("MARKETING_CAMPAIGNS") ||
        value.includes("CONSENT_CAMPAIGNS")) && (
        <p className={clsx(personasTheme.infoBox, "text-xs leading-relaxed")}>
          {value.includes("ALL_CAMPAIGNS")
            ? "Puedes añadir «Compartir datos con terceros» si también te opones a ese uso. No combines «Todas las campañas» con marketing o consentimiento por separado."
            : "Solo puedes elegir un tipo de campaña a la vez. Si necesitas bloquear marketing y consentimiento, usa «Bloquear todas las campañas»."}
        </p>
      )}
    </div>
  );
};

export default PersonasOppositionScopesPicker;
