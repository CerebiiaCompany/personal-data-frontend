"use client";

export type HorizontalBarCharItem = {
  id?: string | number;
  label: string;
  value: number; // current progress
  max: number; // target / total
  hintRight?: React.ReactNode; // optional custom right-side content
};

export type HorizontalBarChart = {
  title?: string;
  items?: HorizontalBarCharItem[];
  className?: string;
  showFraction?: boolean; // shows "80/500"
  showPercent?: boolean; // shows "16%"
  barHeight?: "sm" | "md" | "lg";
  trackClassName?: string; // track styling override
  barClassName?: string; // filled bar styling override
};

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

const HEIGHTS = {
  sm: "h-2.5",
  md: "h-3.5",
  lg: "h-4",
};

export default function HorizontalBarChart({
  items,
  className = "",
  showFraction = true,
  showPercent = false,
  barHeight = "md",
  trackClassName = "bg-gray-200/70",
  barClassName = "bg-blue-600",
}: HorizontalBarChart) {
  if (!items) return;

  return (
    <section className={className}>
      <ul role="list" className="space-y-4">
        {items.map((item, idx) => {
          const id = item.id ?? idx;
          const pct = clamp((item.value / Math.max(item.max, 1)) * 100);
          return (
            <li key={id} className="grid grid-cols-12 items-center gap-3">
              {/* Label */}
              <div className="col-span-5 sm:col-span-4 text-[13px] sm:text-sm text-gray-700 truncate">
                {item.label}
              </div>

              {/* Bar */}
              <div className="col-span-5 sm:col-span-6">
                <div
                  className={`relative w-full overflow-hidden rounded-full ${HEIGHTS[barHeight]} ${trackClassName}`}
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={item.max}
                  aria-valuenow={item.value}
                  aria-label={item.label}
                  title={`${Math.round(pct)}%`}
                >
                  <div
                    className={`h-full ${barClassName} rounded-full transition-[width] duration-500 ease-out`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Right-side value */}
              <div className="col-span-2 sm:col-span-2 text-right">
                {item.hintRight ?? (
                  <div className="text-[12px] sm:text-xs text-gray-500 tabular-nums">
                    {showFraction && (
                      <span>
                        {item.value}/{item.max}
                      </span>
                    )}
                    {showPercent && (
                      <span className={showFraction ? "ml-1" : ""}>
                        ({Math.round(pct)}%)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
