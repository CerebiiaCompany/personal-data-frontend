import React from "react";

interface Props extends React.ComponentProps<"textarea"> {
  label?: string;
}

const CustomTextarea = ({ label, ...props }: Props) => {
  return (
    <div className="flex flex-col items-start gap-1 text-left">
      {label && (
        <label
          htmlFor={`${props.name}Field`}
          className="font-normal w-full text-primary-900 pl-2"
        >
          {label}
        </label>
      )}
      <textarea
        id={`${props.name}Field`}
        {...props}
        className="rounded-lg gap-2 w-full text-primary-900 border border-disabled flex-1 relative px-3 py-2"
      />
    </div>
  );
};

export default CustomTextarea;
