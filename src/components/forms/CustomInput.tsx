import clsx from "clsx";
import React from "react";
import { FieldError, useFormContext, useFormState } from "react-hook-form";

interface Props extends React.ComponentProps<"input"> {
  label?: string;
  variant?: "bordered" | "underline";
  error?: FieldError;
}

const CustomInput = ({
  label,
  error,
  variant = "bordered",
  ...props
}: Props) => {
  return (
    <div
      className={clsx([
        "flex flex-col items-start gap-1 text-left flex-1",
        props.className,
      ])}
    >
      {label && (
        <label
          htmlFor={`${props.name}Field`}
          className="font-medium w-full pl-2 text-stone-500 text-sm"
        >
          {label}
        </label>
      )}
      <input
        id={`${props.name}Field`}
        aria-invalid={Boolean(error) || undefined}
        {...props}
        className={clsx([
          "gap-2 w-full text-primary-900 flex-1 relative px-3 py-2 outline-none transition-colors",
          {
            "border rounded-lg": variant === "bordered",
            "border-disabled focus:border-primary-400":
              variant === "bordered" && !error,
            "border-red-400 bg-red-50/40 focus:border-red-500":
              variant === "bordered" && error,
          },
          {
            "border-b": variant === "underline",
            "border-disabled": variant === "underline" && !error,
            "border-red-400": variant === "underline" && error,
          },
        ])}
      />

      {error && (
        <span className="text-sm font-semibold text-red-500">
          {error.message}
        </span>
      )}
    </div>
  );
};

export default CustomInput;
