"use client";

import clsx from "clsx";

interface Option {
  value: string;
  title: string;
}

interface Props {
  label: string;
  options: Option[];
  values: string[];
  onChange: (values: string[]) => void;
}

export default function WizardCheckboxGroup({ label, options, values, onChange }: Props) {
  function toggle(value: string) {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  }

  return (
    <div className={clsx("flex flex-col gap-2", !label && "gap-0")}>
      {label ? <p className="pl-2 text-sm font-semibold text-[#1A2B5B]">{label}</p> : null}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((opt) => {
          const checked = values.includes(opt.value);
          return (
            <label
              key={opt.value}
              className={clsx(
                "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors",
                checked
                  ? "border-[#1A2B5B] bg-[#F8FAFF] text-[#1A2B5B]"
                  : "border-[#E8EDF7] bg-white text-[#64748B] hover:border-[#CBD5E1]"
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(opt.value)}
                className="size-4 rounded border-[#CBD5E1] text-[#1A2B5B]"
              />
              <span>{opt.title}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
