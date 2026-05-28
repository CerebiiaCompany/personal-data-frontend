"use client";

import { personasTheme } from "@/constants/personasTheme";
import { ARCO_OTP_CHANNEL_OPTIONS, ArcoOtpChannel } from "@/types/arco.types";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";

interface Props {
  value: ArcoOtpChannel;
  onChange: (channel: ArcoOtpChannel) => void;
  smsAvailable?: boolean;
}

const PersonasOtpChannelPicker = ({
  value,
  onChange,
  smsAvailable = true,
}: Props) => {
  return (
    <div className="flex flex-col gap-2">
      <p className="pl-2 text-sm font-medium text-stone-500">
        ¿Cómo quieres recibir el código?
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {ARCO_OTP_CHANNEL_OPTIONS.map((option) => {
          const isSms = option.value === "SMS";
          const disabled = isSms && !smsAvailable;
          const isActive = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onChange(option.value)}
              className={clsx(
                "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all",
                disabled && "cursor-not-allowed opacity-50",
                isActive
                  ? "border-primary-900 bg-primary-50 ring-2 ring-primary-900/10"
                  : "border-zinc-200/90 bg-white hover:border-zinc-300"
              )}
              aria-pressed={isActive}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <div
                  className={clsx(
                    personasTheme.iconBox,
                    "h-9 w-9",
                    isActive && "bg-white"
                  )}
                >
                  <Icon icon={option.icon} className="text-lg" />
                </div>
                {isActive && (
                  <Icon
                    icon="tabler:circle-check-filled"
                    className="text-lg text-primary-900"
                  />
                )}
              </div>
              <span className="font-semibold text-primary-900">{option.label}</span>
              <span className="text-xs leading-relaxed text-zinc-600">
                {disabled
                  ? "Disponible solo con celular colombiano registrado"
                  : option.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PersonasOtpChannelPicker;
