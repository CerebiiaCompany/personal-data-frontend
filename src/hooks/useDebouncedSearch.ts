import { useState, useRef, useEffect } from "react";

export function useDebouncedSearch(delay: number = 500) {
  const [search, setSearch] = useState<string>("");
  const [debouncedValue, setDebouncedValue] = useState(search);
  const [stats, setStats] = useState({ count: 0, lastTime: 0, avgDelay: 0 });
  const lastChangeRef = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeSinceLast = now - lastChangeRef.current;
    lastChangeRef.current = now;

    setStats((prev) => {
      const newCount = prev.count + 1;
      const newAvg = prev.count
        ? (prev.avgDelay * prev.count + timeSinceLast) / newCount
        : 0;
      return { count: newCount, lastTime: now, avgDelay: newAvg };
    });

    const handler = setTimeout(() => {
      setDebouncedValue(search);
    }, delay);

    return () => clearTimeout(handler);
  }, [search, delay]);

  return { debouncedValue, setDebouncedValue, search, setSearch };
}
