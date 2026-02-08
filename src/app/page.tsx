'use client';

import { useState } from "react";
import { usePracticeData } from "@/hooks/usePracticeData";
import { useTimer } from "@/hooks/useTimer";
import { getDayKey, getWeekKey, getMonthKey } from "@/lib/utils";
import type { PracticeData, PracticeLog } from "@/lib/types";
import { Header } from "@/components/Header";
import { TabNav } from "@/components/TabNav";
import { TodayTab } from "@/components/TodayTab";
import { CalendarTab } from "@/components/CalendarTab";
import { ProgressTab } from "@/components/ProgressTab";
import { StatsTab } from "@/components/StatsTab";
import { LogModal } from "@/components/LogModal";
import { GoalModal } from "@/components/GoalModal";

export default function PracticeTracker() {
  const { data, save } = usePracticeData();
  const timer = useTimer(data, save);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMonth, setViewMonth] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() });
  const [activeTab, setActiveTab] = useState("today");
  const [showLogModal, setShowLogModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [logForm, setLogForm] = useState<PracticeLog>({ hanon: 0, czerny: 0, sonatine: 0, note: "" });

  const dayKey = getDayKey(selectedDate);
  const weekKey = getWeekKey(selectedDate);
  const monthKey = getMonthKey(selectedDate);

  // Stats
  const getWeeklyStats = () => {
    const startOfWeek = new Date(selectedDate);
    const dayOfWeek = (startOfWeek.getDay() + 6) % 7;
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
    const stats = { hanon: 0, czerny: 0, sonatine: 0, days: 0 };
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      const log = data.logs[getDayKey(d)];
      if (log) {
        stats.hanon += log.hanon || 0;
        stats.czerny += log.czerny || 0;
        stats.sonatine += log.sonatine || 0;
        if ((log.hanon || 0) + (log.czerny || 0) + (log.sonatine || 0) > 0) stats.days++;
      }
    }
    return stats;
  };

  const getStreak = () => {
    let streak = 0;
    const d = new Date();
    while (true) {
      const log = data.logs[getDayKey(d)];
      if (log && ((log.hanon || 0) + (log.czerny || 0) + (log.sonatine || 0) > 0)) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    return streak;
  };

  const weeklyStats = getWeeklyStats();
  const streak = getStreak();

  // Actions
  const navMonth = (dir: number) => {
    setViewMonth((prev) => {
      let m = prev.month + dir;
      let y = prev.year;
      if (m < 0) { m = 11; y--; }
      if (m > 11) { m = 0; y++; }
      return { year: y, month: m };
    });
  };

  const openLogModal = () => {
    const existing = data.logs[dayKey];
    setLogForm(existing || { hanon: 0, czerny: 0, sonatine: 0, note: "" });
    setShowLogModal(true);
  };

  const handleSaveLog = () => {
    save({ ...data, logs: { ...data.logs, [dayKey]: { ...logForm, date: dayKey } } });
    setShowLogModal(false);
  };

  const handleSaveGoal = (category: string, title: string) => {
    const key = category === "sonatine" ? monthKey : weekKey;
    const catKey = category as keyof PracticeData["goals"];
    save({
      ...data,
      goals: {
        ...data.goals,
        [catKey]: { ...data.goals[catKey], [key]: { title, completed: false } },
      },
    });
    setShowGoalModal(false);
  };

  const toggleGoalComplete = (cat: string, key: string) => {
    const catKey = cat as keyof PracticeData["goals"];
    save({
      ...data,
      goals: {
        ...data.goals,
        [catKey]: {
          ...data.goals[catKey],
          [key]: { ...data.goals[catKey][key], completed: !data.goals[catKey][key]?.completed },
        },
      },
    });
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#000",
      fontFamily: "'Noto Serif KR', 'Georgia', serif",
      color: "#E8DCC8",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;500;600;700&family=Crimson+Pro:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      <Header streak={streak} weeklyStats={weeklyStats} />
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

      <div style={{ padding: "20px", maxWidth: "480px", margin: "0 auto" }}>
        {activeTab === "today" && (
          <TodayTab
            data={data}
            timer={timer}
            weekKey={weekKey}
            monthKey={monthKey}
            onOpenGoalModal={() => setShowGoalModal(true)}
            onTabChange={setActiveTab}
          />
        )}
        {activeTab === "calendar" && (
          <CalendarTab
            data={data}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            viewMonth={viewMonth}
            onNavMonth={navMonth}
            onOpenLogModal={openLogModal}
          />
        )}
        {activeTab === "progress" && (
          <ProgressTab
            data={data}
            selectedDate={selectedDate}
            weekKey={weekKey}
            monthKey={monthKey}
            onOpenGoalModal={() => setShowGoalModal(true)}
            onToggleGoal={toggleGoalComplete}
          />
        )}
        {activeTab === "stats" && <StatsTab data={data} weeklyStats={weeklyStats} onDataImport={save} />}
      </div>

      {showLogModal && (
        <LogModal
          selectedDate={selectedDate}
          logForm={logForm}
          onFormChange={setLogForm}
          onSave={handleSaveLog}
          onClose={() => setShowLogModal(false)}
        />
      )}
      {showGoalModal && (
        <GoalModal
          onSave={handleSaveGoal}
          onClose={() => setShowGoalModal(false)}
        />
      )}
    </div>
  );
}
