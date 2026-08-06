"use client";

import clsx from "clsx";

interface Props {
  id: string;
  as?: "div" | "section" | "span" | "header";
  className?: string;
  children: React.ReactNode;
}

/**
 * Marca una zona del módulo como objetivo del tutorial (`data-tour`).
 */
export default function TourTarget({
  id,
  as: Tag = "div",
  className,
  children,
}: Props) {
  return (
    <Tag data-tour={id} className={clsx(className)}>
      {children}
    </Tag>
  );
}
