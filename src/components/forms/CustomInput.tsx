import clsx from "clsx";
import React from "react";

interface Props extends React.ComponentProps<"input"> {
  label?: string;
  variant?: "bordered" | "underline";
}

const CustomInput = ({ label, variant = "bordered", ...props }: Props) => {
  return (
    <div className="flex flex-col items-start gap-1 text-left flex-1">
      {label && (
        <label
          htmlFor={`${props.name}Field`}
          className="font-normal w-full text-lg text-primary-900 pl-3"
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
    </div>
  );
};

export default CustomInput;
