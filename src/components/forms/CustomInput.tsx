import React from "react";

interface Props extends React.ComponentProps<"input"> {
  label?: string;
}

const CustomInput = ({ label, ...props }: Props) => {
  return (
    <div className="flex flex-col items-start gap-1 text-left">
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
        className="rounded-lg gap-2 w-full text-primary-900 border border-disabled flex-1 relative px-3 py-2"
      />
    </div>
  );
};

export default CustomInput;
