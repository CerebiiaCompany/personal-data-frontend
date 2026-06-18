import clsx from "clsx";

interface Props {
  className?: string;
}

export default function Skeleton({ className }: Props) {
  return (
    <div
      className={clsx("rounded-lg skeleton-shimmer", className)}
      aria-hidden="true"
    />
  );
}
