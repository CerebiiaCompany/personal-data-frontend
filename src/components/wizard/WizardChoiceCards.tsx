"use client";

import clsx from "clsx";

export interface WizardChoiceOption {
  value: string;
  title: string;
  description?: string;
}

interface Props {
  options: WizardChoiceOption[];
  value: string;
  onChange: (value: string) => void;
  columns?: 1 | 2;
}

/** Selección única tipo tarjeta — más legible que un dropdown técnico. */
export default function WizardChoiceCards({ options, value, onChange, columns = 1 }: Props) {
  return (
    <div
      className={clsx(
        "grid gap-2",
        columns === 2 ? "sm:grid-cols-2" : "grid-cols-1"
      )}
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={clsx(
              "rounded-xl border px-4 py-3 text-left transition-colors",
              selected
                ? "border-[#1A2B5B] bg-white shadow-sm ring-1 ring-[#1A2B5B]/10"
                : "border-[#E8EDF7] bg-white text-[#64748B] hover:border-[#CBD5E1]"
            )}
          >
            <span className={clsx("block text-sm font-medium", selected ? "text-[#1A2B5B]" : "text-[#334155]")}>
              {opt.title}
            </span>
            {opt.description ? (
              <span className="mt-1 block text-xs leading-relaxed text-[#94A3B8]">{opt.description}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
