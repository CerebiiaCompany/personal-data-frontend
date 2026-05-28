"use client";

import clsx from "clsx";
import { CSSProperties, ElementType, ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  /** Retardo en ms antes de iniciar la animación */
  delay?: number;
  as?: ElementType;
  variant?: "fade-up" | "fade-in";
}

const PersonasAnimateIn = ({
  children,
  className,
  delay = 0,
  as: Tag = "div",
  variant = "fade-up",
}: Props) => {
  const style: CSSProperties | undefined =
    delay > 0 ? { animationDelay: `${delay}ms` } : undefined;

  return (
    <Tag
      className={clsx(
        variant === "fade-in" ? "personas-fade-in" : "personas-fade-up",
        className
      )}
      style={style}
    >
      {children}
    </Tag>
  );
};

export default PersonasAnimateIn;
