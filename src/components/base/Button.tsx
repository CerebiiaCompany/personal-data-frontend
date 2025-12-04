import clsx from "clsx";
import Link from "next/link";
import React, { JSX } from "react";

interface Props {
  children: React.ReactNode;
  startContent?: JSX.Element;
  endContent?: JSX.Element;
  hierarchy?: "primary" | "secondary" | "tertiary";
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  href?: string;
  type?: "button" | "submit";
  isIconOnly?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

const Button = ({
  children,
  hierarchy = "primary",
  startContent,
  endContent,
  onClick,
  className: customClassName,
  href,
  type = "button",
  isIconOnly,
  loading = false,
  disabled = false,
}: Props) => {
  const baseClassName = clsx([
    "px-3 py-2 rounded-lg flex items-center text-center justify-center gap-2 font-sans font-semibold transition-all",
    {
      "text-white bg-primary-900 border border-primary-900":
        hierarchy === "primary",
    }, //? for primary buttons
    {
      "border border-disabled bg-transparent": hierarchy === "secondary",
    }, //? for secondary buttons
    { "": hierarchy === "tertiary" }, //? for tertiary buttons
    { "w-fit rounded-full! p-2!": isIconOnly },
    {
      "hover:brightness-90":
        !disabled && !loading && hierarchy !== "tertiary",
    },
    { "pointer-events-none opacity-40 cursor-not-allowed": disabled || loading },
    customClassName,
  ]);

  return href ? (
    <Link href={href} className={baseClassName}>
      {startContent}
      {children}
      {endContent}
    </Link>
  ) : (
    <button
      disabled={disabled || loading}
      type={type}
      onClick={onClick}
      className={baseClassName}
    >
      {startContent}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="flex-1 h-fit">{children}</div>
      )}
      {endContent}
    </button>
  );
};

export default Button;
