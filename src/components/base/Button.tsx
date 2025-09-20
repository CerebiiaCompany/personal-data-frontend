import clsx from "clsx";
import Link from "next/link";
import React, { JSX } from "react";
import LoadingCover from "../layout/LoadingCover";

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
}: Props) => {
  const baseClassName = clsx([
    "px-3 py-2 rounded-lg flex items-center text-center justify-center gap-2 font-sans font-semibold transition-[filter_.3s] hover:brightness-90",
    { "text-white bg-primary-900": hierarchy === "primary" }, //? for primary buttons
    {
      "border border-disabled bg-transparent": hierarchy === "secondary",
    }, //? for secondary buttons
    { "": hierarchy === "tertiary" }, //? for tertiary buttons
    { "w-fit rounded-full! p-2!": isIconOnly },
    customClassName,
  ]);

  return href ? (
    <Link href={href} className={baseClassName}>
      {startContent}
      {children}
      {endContent}
    </Link>
  ) : (
    <button type={type} onClick={onClick} className={baseClassName}>
      {startContent}
      <div className="flex-1 h-full relative">
        {loading && <LoadingCover size="sm" />}
        <div
          className={clsx([
            "transition-opacity w-full h-full",
            { "opacity-0": loading },
          ])}
        >
          {children}
        </div>
      </div>
      {endContent}
    </button>
  );
};

export default Button;
