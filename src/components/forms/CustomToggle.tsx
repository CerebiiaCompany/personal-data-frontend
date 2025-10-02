import clsx from "clsx";
import React, { useState } from "react";
import { FieldError } from "react-hook-form";

interface Props extends React.ComponentProps<"input"> {
  label?: string;
  error?: FieldError;
}

const CustomToggle = ({
  label,
  checked,
  className,
  error,
  ...props
}: Props) => {
  return (
    <div className="flex flex-col items-start gap-2 w-fit">
      <label className={clsx(["cursor-pointer", className])}>
        <input {...props} className="hidden" type="checkbox" />
        <div
          className={clsx([
            "w-10 h-3.5 rounded-full relative",
            checked ? "bg-primary-500" : "bg-stone-300",
          ])}
        >
          {/* Toggle ball */}
          <span
            className={clsx([
              "h-[180%] aspect-square inline-block rounded-full border-[3px] border-white shadow-sm absolute top-0 bottom-0 my-auto transition-all left-[-15%]",
              checked ? "translate-x-[110%] bg-primary-500!" : "bg-stone-300",
            ])}
          />
        </div>
        <span className="text-inherit">{label}</span>
      </label>
      {error && (
        <span className="text-red-400 text-sm font-semibold">
          {error.message}
        </span>
      )}
    </div>
  );
};

export default CustomToggle;
