// GoalRadioGroup.tsx
import { CampaignGoal } from "@/types/campaign.types";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import * as React from "react";
import { FieldError } from "react-hook-form";

interface GoalRadioGroupProps<T extends string> {
  value: T | undefined;
  onChange: (v: T) => void;
  name: string;
  label?: string;
  error?: FieldError;
  options: {
    value: T;
    title: string;
    desc?: string;
    icon?: string;
    disabled?: boolean;
  }[];
}

export function CustomRadioGroup<T extends string>({
  value,
  onChange,
  name,
  options,
  error,
  label,
}: GoalRadioGroupProps<T>) {
  return (
    <fieldset className="grid gap-3">
      {label && (
        <p className="font-medium w-full pl-2 text-stone-500 text-sm">
          {label}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((opt) => {
          const id = `goal-${opt.value.toLowerCase()}`;
          const checked = value === opt.value;
          const isDisabled = opt.disabled || false;

          return (
            <label
              key={opt.value}
              htmlFor={id}
              className={clsx([
                "relative flex items-center gap-3 rounded-2xl border p-4 transition",
                isDisabled
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer hover:shadow-md",
                checked && !isDisabled
                  ? "border-transparent ring-2 ring-offset-0 ring-primary-500 shadow-lg"
                  : "border-neutral-200",
              ])}
            >
              {/* Visually hidden native radio (for a11y + form compatibility) */}
              <input
                id={id}
                type="radio"
                name={name}
                value={opt.value}
                checked={checked}
                disabled={isDisabled}
                onChange={() => !isDisabled && onChange(opt.value)}
                className="peer sr-only"
                aria-describedby={`${id}-desc`}
              />

              {/* Custom radio visual */}
              <span
                aria-hidden
                className={clsx([
                  "mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border",
                  checked
                    ? "border-primary-500"
                    : "border-neutral-300 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-500",
                ])}
              >
                <span
                  className={clsx([
                    "block h-2.5 w-2.5 rounded-full transition",
                    checked
                      ? "bg-primary-500 scale-100"
                      : "bg-transparent scale-50",
                  ])}
                />
              </span>

              <span className="flex gap-2 items-center flex-1">
                {opt.icon && <Icon icon={opt.icon} className={"text-3xl"} />}

                <div className="flex flex-col items-start gap-0 flex-1">
                  <span className="text-sm font-semibold leading-5">
                    {opt.title}
                  </span>
                  {opt.desc && (
                    <span
                      id={`${id}-desc`}
                      className="text-xs text-stone-500 leading-5"
                    >
                      {opt.desc}
                    </span>
                  )}
                </div>
              </span>
            </label>
          );
        })}
      </div>

      {error && (
        <span className="text-red-400 text-sm font-semibold">
          {error.message}
        </span>
      )}
    </fieldset>
  );
}
