import clsx from "clsx";
import React from "react";

interface Props {
  wholePage?: boolean;
  size?: "sm" | "md" | "lg";
}

const LoadingCover = ({ wholePage = false, size = "md" }: Props) => {
  return (
    <div
      className={clsx([
        "w-full top-0 left-0 flex items-center justify-center",
        { "absolute h-full z-10": !wholePage },
        { "fixed h-dvh z-50 bg-white": wholePage },
      ])}
    >
      <div
        className={clsx([
          "border-primary-50 border-t-primary-900 rounded-full animate-spin",
          { "w-6 border-4 h-6": size === "sm" },
          { "w-12 border-[.35rem] h-12": size === "md" },
          { "w-20 border-[.6rem] h-20": size === "lg" },
        ])}
      ></div>
    </div>
  );
};

export default LoadingCover;
