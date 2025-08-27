import clsx from "clsx";
import React, { JSX } from "react";

interface Props {
  children: React.ReactNode;
  startContent?: JSX.Element;
  endContent?: JSX.Element;
  hierarchy?: "PRIMARY" | "SECONDARY" | "TERTIARY";
}

const Button = ({
  children,
  hierarchy = "PRIMARY",
  startContent,
  endContent,
}: Props) => {
  const baseClassName = clsx([
    "px-3 py-2 rounded-lg flex items-center gap-2 font-sans",
    { "text-white bg-primary-900": hierarchy === "PRIMARY" }, //? for primary buttons
    {
      "border border-disabled bg-white": hierarchy === "SECONDARY",
    }, //? for secondary buttons
    { "": hierarchy === "TERTIARY" }, //? for tertiary buttons
  ]);

  return (
    <button className={baseClassName}>
      {startContent}
      {children}
      {endContent}
    </button>
  );
};

export default Button;
