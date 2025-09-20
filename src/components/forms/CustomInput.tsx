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
    <div className="flex flex-col items-start gap-1 text-left flex-1">
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
        {...props}
        className={clsx([
          "gap-2 w-full text-primary-900 flex-1 relative px-3 py-2",
          { "border border-disabled rounded-lg": variant === "bordered" },
          { "border-b border-disabled": variant === "underline" },
        ])}
      />

      {error && (
        <span className="text-red-400 text-sm font-semibold">
          {error.message}
        </span>
      )}
    </div>
  );
};

export default CustomInput;
