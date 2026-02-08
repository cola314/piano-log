import { useState, useEffect, useCallback } from "react";
import type { PracticeData } from "@/lib/types";
import { STORAGE_KEY } from "@/lib/constants";

const defaultData = (): PracticeData => ({
  logs: {},
  goals: { hanon: {}, czerny: {}, sonatine: {} },
});

export function usePracticeData() {
  const [data, setData] = useState<PracticeData>(defaultData);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setData(JSON.parse(saved));
    } catch {}
  }, []);

  const save = useCallback((newData: PracticeData) => {
    setData(newData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch {}
  }, []);

  return { data, save };
}
