import type { WeeklyStats } from "@/lib/types";

interface HeaderProps {
  streak: number;
  weeklyStats: WeeklyStats;
}

export function Header({ streak, weeklyStats }: HeaderProps) {
  return (
    <div style={{
      background: "linear-gradient(180deg, rgba(184,134,11,0.15) 0%, transparent 100%)",
      borderBottom: "1px solid rgba(184,134,11,0.2)",
      padding: "28px 24px 20px",
      textAlign: "center",
    }}>
      <div style={{ fontSize: "11px", letterSpacing: "6px", color: "#B8860B", marginBottom: "8px", fontFamily: "'Crimson Pro', serif" }}>
        PIANO PRACTICE
      </div>
      <h1 style={{ fontSize: "28px", fontWeight: "300", margin: 0, letterSpacing: "2px", color: "#F5E6C8" }}>
        연습 기록장
      </h1>
      <div style={{ display: "flex", justifyContent: "center", gap: "32px", marginTop: "20px" }}>
        <StatItem value={streak} label="연속일" />
        <div style={{ width: "1px", background: "rgba(184,134,11,0.2)" }} />
        <StatItem value={weeklyStats.days} label="이번 주" />
        <div style={{ width: "1px", background: "rgba(184,134,11,0.2)" }} />
        <StatItem value={weeklyStats.hanon + weeklyStats.czerny + weeklyStats.sonatine} label="주간(분)" />
      </div>
    </div>
  );
}

function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "24px", fontWeight: "600", color: "#B8860B", fontFamily: "'Crimson Pro', serif" }}>{value}</div>
      <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#8B7355", marginTop: "2px" }}>{label}</div>
    </div>
  );
}
