import clsx from "clsx";
import React from "react";
import { FieldError } from "react-hook-form";

interface Props extends React.ComponentProps<"input"> {
  className?: string;
  label?: string | React.ReactNode;
  error?: FieldError;
}

const CustomCheckbox = ({ label, className, error, disabled, ...props }: Props) => {
  return (
    <div className="flex flex-col items-start gap-2 w-fit">
      <label 
        className={clsx([
          "custom-checkbox",
          {
            "cursor-pointer": !disabled,
            "cursor-not-allowed": disabled,
          },
          className
        ])}
      >
        <input {...props} disabled={disabled} className="hidden" type="checkbox" />
        <div className="checkbox-visual"></div>
        <span className={clsx(["text-inherit", { "text-stone-400": disabled }])}>
          {label}
        </span>
      </label>
      {error && (
        <span className="text-red-400 text-sm font-semibold">
          {error.message}
        </span>
      )}
    </div>
  );
};

export default CustomCheckbox;
