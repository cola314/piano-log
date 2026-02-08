import { useState, useEffect, useCallback, useRef } from "react";
import type { CategoryId, PracticeData, PracticeLog } from "@/lib/types";
import { getDayKey } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";
import { useNotification } from "./useNotification";

const initialElapsed = { hanon: 0, czerny: 0, sonatine: 0 };

export function useTimer(data: PracticeData, save: (d: PracticeData) => void) {
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState<Record<CategoryId, number>>({ ...initialElapsed });
  const [targets, setTargets] = useState<Record<CategoryId, number>>({ hanon: 600, czerny: 1200, sonatine: 1200 });
  const [running, setRunning] = useState(false);
  const [note, setNote] = useState("");
  const [alerted, setAlerted] = useState<Record<CategoryId, boolean>>({ hanon: false, czerny: false, sonatine: false });

  // Timestamp-based tracking
  const startTimeRef = useRef<number | null>(null);
  const baseElapsedRef = useRef<Record<CategoryId, number>>({ ...initialElapsed });

  // Background notifications
  const notification = useNotification();

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

  // Schedule background notification for current timer
  const scheduleNotificationForCat = useCallback((catId: string) => {
    const cat = catId as CategoryId;
    const currentElapsed = baseElapsedRef.current[cat];
    const remaining = targets[cat] - currentElapsed;
    if (remaining <= 0 || alerted[cat]) return;

    const catName = CATEGORIES.find((c) => c.id === catId)?.name || catId;
    const mins = Math.round(targets[cat] / 60);
    notification.scheduleNotification(
      remaining * 1000,
      catName,
      `${catName} ${mins}분 연습 완료!`
    );
  }, [targets, alerted, notification]);

  // Calculate elapsed from timestamp
  const syncElapsed = useCallback(() => {
    if (!activeCat || !startTimeRef.current) return;
    const cat = activeCat as CategoryId;
    const sessionSecs = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const newVal = baseElapsedRef.current[cat] + sessionSecs;

    setElapsed((prev) => {
      if (prev[cat] === newVal) return prev;
      return { ...prev, [cat]: newVal };
    });

    // Alarm check
    if (newVal >= targets[cat] && !alerted[cat]) {
      playAlarm();
      setAlerted((a) => ({ ...a, [cat]: true }));
    }
  }, [activeCat, targets, alerted, playAlarm]);

  // Tick every second
  useEffect(() => {
    if (!running || !activeCat) return;
    syncElapsed();
    const interval = setInterval(syncElapsed, 1000);
    return () => clearInterval(interval);
  }, [running, activeCat, syncElapsed]);

  // Recalculate on page visibility change (screen wake / tab focus)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && running) {
        syncElapsed();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [running, syncElapsed]);

  // Finalize current category's elapsed into baseElapsed
  const finalizeCurrent = () => {
    if (!activeCat || !startTimeRef.current) return;
    const cat = activeCat as CategoryId;
    const sessionSecs = Math.floor((Date.now() - startTimeRef.current) / 1000);
    baseElapsedRef.current = {
      ...baseElapsedRef.current,
      [cat]: baseElapsedRef.current[cat] + sessionSecs,
    };
    setElapsed((prev) => ({ ...prev, [cat]: baseElapsedRef.current[cat] }));
    startTimeRef.current = null;
  };

  const toggle = (catId: string) => {
    if (running && activeCat === catId) {
      // Pause
      finalizeCurrent();
      notification.cancelNotification();
      setRunning(false);
    } else {
      // Switch or start
      if (running && activeCat) {
        finalizeCurrent();
      }
      startTimeRef.current = Date.now();
      setActiveCat(catId);
      setRunning(true);

      // Schedule background notification
      scheduleNotificationForCat(catId);
    }
  };

  const reset = (catId: string) => {
    if (activeCat === catId) {
      setRunning(false);
      startTimeRef.current = null;
      notification.cancelNotification();
    }
    baseElapsedRef.current = { ...baseElapsedRef.current, [catId]: 0 };
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
    finalizeCurrent();
    notification.cancelNotification();
    const currentElapsed = baseElapsedRef.current;
    const tk = getDayKey(new Date());
    const existing = data.logs[tk] || { hanon: 0, czerny: 0, sonatine: 0, note: "" };
    const newLog: PracticeLog = {
      ...existing,
      hanon: (existing.hanon || 0) + Math.round(currentElapsed.hanon / 60),
      czerny: (existing.czerny || 0) + Math.round(currentElapsed.czerny / 60),
      sonatine: (existing.sonatine || 0) + Math.round(currentElapsed.sonatine / 60),
      note: note ? (existing.note ? existing.note + " | " + note : note) : existing.note,
      date: tk,
    };
    save({ ...data, logs: { ...data.logs, [tk]: newLog } });
    setRunning(false);
    setActiveCat(null);
    startTimeRef.current = null;
    baseElapsedRef.current = { ...initialElapsed };
    setElapsed({ ...initialElapsed });
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
    notificationPermission: notification.permission,
    requestNotificationPermission: notification.requestPermission,
  };
}
