import { useState, useEffect } from "react";

export function useDebouncedSearch(delay: number = 500) {
  const [search, setSearch] = useState<string>("");
  const [debouncedValue, setDebouncedValue] = useState(search);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(search);
    }, delay);

    return () => clearTimeout(handler);
  }, [search, delay]);

  return { debouncedValue, setDebouncedValue, search, setSearch };
}
