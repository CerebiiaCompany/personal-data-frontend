import React from "react";

interface Props extends React.ComponentProps<"input"> {
  label?: string;
}

const CustomCheckbox = ({ label, ...props }: Props) => {
  return (
    <label className="custom-checkbox">
      <input {...props} type="checkbox" />
      <div className="checkbox-visual"></div>
      <span className="">{label}</span>
    </label>
  );
};

export default CustomCheckbox;
