import clsx from "clsx";
import React, { JSX } from "react";

interface Props {
  children: React.ReactNode;
  startContent?: JSX.Element;
  endContent?: JSX.Element;
  hierarchy?: "primary" | "secondary" | "tertiary";
  className?: string;
  onClick?: () => void;
}

const Button = ({
  children,
  hierarchy = "primary",
  startContent,
  endContent,
  onClick,
  className: customClassName,
}: Props) => {
  const baseClassName = clsx([
    "px-3 py-2 rounded-lg flex items-center text-center justify-center gap-2 font-sans font-semibold",
    customClassName,
    { "text-white bg-primary-900": hierarchy === "primary" }, //? for primary buttons
    {
      "border border-disabled bg-white": hierarchy === "secondary",
    }, //? for secondary buttons
    { "": hierarchy === "tertiary" }, //? for tertiary buttons
  ]);

  return (
    <button onClick={onClick} className={baseClassName}>
      {startContent}
      {children}
      {endContent}
    </button>
  );
};

export default Button;
