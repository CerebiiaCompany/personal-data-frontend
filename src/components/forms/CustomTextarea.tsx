import React from "react";
import { FieldError } from "react-hook-form";

interface Props extends React.ComponentProps<"textarea"> {
  label?: string;
  error?: FieldError;
}

const CustomTextarea = ({ label, error, ...props }: Props) => {
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
      <textarea
        id={`${props.name}Field`}
        {...props}
        className="rounded-lg gap-2 w-full text-primary-900 border border-disabled flex-1 relative px-3 py-2"
      />
      {error && (
        <span className="text-red-400 text-sm font-semibold">
          {error.message}
        </span>
      )}
    </div>
  );
};

export default CustomTextarea;
