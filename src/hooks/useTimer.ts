import { useState, useEffect, useCallback } from "react";
import type { CategoryId, PracticeData, PracticeLog } from "@/lib/types";
import { getDayKey } from "@/lib/utils";

const initial = { hanon: 0, czerny: 0, sonatine: 0 };

export function useTimer(data: PracticeData, save: (d: PracticeData) => void) {
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState<Record<CategoryId, number>>({ ...initial });
  const [targets, setTargets] = useState<Record<CategoryId, number>>({ hanon: 600, czerny: 1200, sonatine: 1200 });
  const [running, setRunning] = useState(false);
  const [note, setNote] = useState("");
  const [alerted, setAlerted] = useState<Record<CategoryId, boolean>>({ hanon: false, czerny: false, sonatine: false });

  const playAlarm = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      playTone(880, ctx.currentTime, 0.15);
      playTone(880, ctx.currentTime + 0.2, 0.15);
      playTone(1100, ctx.currentTime + 0.4, 0.3);
    } catch {}
  }, []);

  useEffect(() => {
    if (!running || !activeCat) return;
    const cat = activeCat as CategoryId;
    const interval = setInterval(() => {
      setElapsed((prev) => {
        const newVal = prev[cat] + 1;
        if (newVal === targets[cat] && !alerted[cat]) {
          playAlarm();
          setAlerted((a) => ({ ...a, [cat]: true }));
        }
        return { ...prev, [cat]: newVal };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, activeCat, targets, alerted, playAlarm]);

  const toggle = (catId: string) => {
    if (running && activeCat === catId) {
      setRunning(false);
    } else {
      setActiveCat(catId);
      setRunning(true);
    }
  };

  const reset = (catId: string) => {
    if (activeCat === catId) setRunning(false);
    setElapsed((prev) => ({ ...prev, [catId]: 0 }));
    setAlerted((prev) => ({ ...prev, [catId]: false }));
  };

  const setTarget = (catId: string, minutes: number) => {
    setTargets((prev) => ({ ...prev, [catId]: minutes * 60 }));
    if (elapsed[catId as CategoryId] === 0) {
      setAlerted((prev) => ({ ...prev, [catId]: false }));
    }
  };

  const saveToLog = () => {
    const tk = getDayKey(new Date());
    const existing = data.logs[tk] || { hanon: 0, czerny: 0, sonatine: 0, note: "" };
    const newLog: PracticeLog = {
      ...existing,
      hanon: (existing.hanon || 0) + Math.round(elapsed.hanon / 60),
      czerny: (existing.czerny || 0) + Math.round(elapsed.czerny / 60),
      sonatine: (existing.sonatine || 0) + Math.round(elapsed.sonatine / 60),
      note: note ? (existing.note ? existing.note + " | " + note : note) : existing.note,
      date: tk,
    };
    save({ ...data, logs: { ...data.logs, [tk]: newLog } });
    setRunning(false);
    setActiveCat(null);
    setElapsed({ ...initial });
    setAlerted({ hanon: false, czerny: false, sonatine: false });
    setNote("");
  };

  const totalElapsed = elapsed.hanon + elapsed.czerny + elapsed.sonatine;
  const totalTarget = targets.hanon + targets.czerny + targets.sonatine;
  const getRemaining = (catId: string) => targets[catId as CategoryId] - elapsed[catId as CategoryId];

  return {
    activeCat, elapsed, targets, running, note, setNote,
    toggle, reset, setTarget, saveToLog,
    totalElapsed, totalTarget, getRemaining,
  };
}
