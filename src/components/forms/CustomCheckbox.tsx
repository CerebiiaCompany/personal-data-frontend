import clsx from "clsx";
import React from "react";

interface Props extends React.ComponentProps<"input"> {
  className?: string;
  label?: string;
}

const CustomCheckbox = ({ label, className, ...props }: Props) => {
  return (
    <label className={clsx(["custom-checkbox", className])}>
      <input {...props} className="hidden" type="checkbox" />
      <div className="checkbox-visual"></div>
      <span className="text-inherit">{label}</span>
    </label>
  );
};

export default CustomCheckbox;
