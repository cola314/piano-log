import { useRef, useState } from "react";
import { CATEGORIES } from "@/lib/constants";
import type { PracticeData, WeeklyStats } from "@/lib/types";
import { getDayKey, getMonthKey } from "@/lib/utils";

interface StatsTabProps {
  data: PracticeData;
  weeklyStats: WeeklyStats;
  onDataImport: (data: PracticeData) => void;
}

export function StatsTab({ data, weeklyStats, onDataImport }: StatsTabProps) {
  const todayKey = getDayKey(new Date());

  return (
    <div>
      {/* Weekly Breakdown */}
      <div style={{
        marginBottom: "24px", padding: "20px",
        background: "rgba(184,134,11,0.1)", borderRadius: "12px",
        border: "1px solid rgba(184,134,11,0.12)",
      }}>
        <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#8B7B65", marginBottom: "16px" }}>
          주간 연습 시간
        </div>
        {CATEGORIES.map((cat) => {
          const mins = weeklyStats[cat.id as keyof WeeklyStats] as number;
          const maxMins = cat.id === "hanon" ? 70 : 140;
          const pct = Math.min((mins / maxMins) * 100, 100);
          return (
            <div key={cat.id} style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ color: cat.color }}>{cat.icon}</span> {cat.name}
                </span>
                <span style={{ color: "#8B7355", fontFamily: "'Crimson Pro', serif" }}>
                  {mins}분 / {maxMins}분
                </span>
              </div>
              <div style={{ height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${pct}%`,
                  background: `linear-gradient(90deg, ${cat.color}88, ${cat.color})`,
                  borderRadius: "3px", transition: "width 0.5s ease",
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 7-Day Heatmap */}
      <div style={{
        marginBottom: "24px", padding: "20px",
        background: "rgba(184,134,11,0.1)", borderRadius: "12px",
        border: "1px solid rgba(184,134,11,0.12)",
      }}>
        <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#8B7B65", marginBottom: "16px" }}>
          최근 7일
        </div>
        <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
          {Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - 6 + i);
            const log = data.logs[getDayKey(d)];
            const total = log ? (log.hanon || 0) + (log.czerny || 0) + (log.sonatine || 0) : 0;
            const intensity = Math.min(total / 45, 1);
            const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
            return (
              <div key={i} style={{ textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: "10px", color: "#7A6E5A", marginBottom: "6px" }}>
                  {dayNames[d.getDay()]}
                </div>
                <div style={{
                  aspectRatio: "1", borderRadius: "6px",
                  background: total > 0 ? `rgba(184,134,11,${0.15 + intensity * 0.6})` : "rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "11px",
                  color: total > 0 ? "#F5E6C8" : "#5D5545",
                  fontFamily: "'Crimson Pro', serif",
                  border: getDayKey(d) === todayKey ? "1px solid rgba(184,134,11,0.5)" : "none",
                }}>
                  {total > 0 ? total : "·"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Summary */}
      <div style={{
        padding: "20px",
        background: "rgba(184,134,11,0.1)", borderRadius: "12px",
        border: "1px solid rgba(184,134,11,0.12)",
      }}>
        <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#8B7B65", marginBottom: "16px" }}>
          이번 달 요약
        </div>
        <MonthlySummary data={data} />
      </div>

      {/* Data Management */}
      <DataManagement data={data} onDataImport={onDataImport} />
    </div>
  );
}

function MonthlySummary({ data }: { data: PracticeData }) {
  let totalDays = 0;
  let totalMins = 0;
  const mk = getMonthKey(new Date());
  Object.entries(data.logs).forEach(([key, log]) => {
    if (key.startsWith(mk)) {
      const m = (log.hanon || 0) + (log.czerny || 0) + (log.sonatine || 0);
      if (m > 0) { totalDays++; totalMins += m; }
    }
  });

  return (
    <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
      <SummaryItem value={totalDays} label="연습일" />
      <div style={{ width: "1px", background: "rgba(184,134,11,0.15)" }} />
      <SummaryItem value={totalMins} label="총 시간(분)" />
      <div style={{ width: "1px", background: "rgba(184,134,11,0.15)" }} />
      <SummaryItem value={totalDays > 0 ? Math.round(totalMins / totalDays) : 0} label="평균(분/일)" />
    </div>
  );
}

function SummaryItem({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div style={{ fontSize: "28px", fontWeight: "300", color: "#B8860B", fontFamily: "'Crimson Pro', serif" }}>{value}</div>
      <div style={{ fontSize: "10px", color: "#8B7B65", letterSpacing: "1px", marginTop: "4px" }}>{label}</div>
    </div>
  );
}

function DataManagement({ data, onDataImport }: { data: PracticeData; onDataImport: (d: PracticeData) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");

  const handleExport = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `piano-log-${getDayKey(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg("내보내기 완료");
    setTimeout(() => setMsg(""), 2000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (parsed.logs && parsed.goals) {
          onDataImport(parsed);
          setMsg("가져오기 완료");
        } else {
          setMsg("올바른 형식이 아닙니다");
        }
      } catch {
        setMsg("파일을 읽을 수 없습니다");
      }
      setTimeout(() => setMsg(""), 2000);
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div style={{
      marginTop: "24px", padding: "20px",
      background: "rgba(184,134,11,0.1)", borderRadius: "12px",
      border: "1px solid rgba(184,134,11,0.12)",
    }}>
      <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#8B7B65", marginBottom: "16px" }}>
        데이터 관리
      </div>
      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={handleExport} style={{
          flex: 1, padding: "12px",
          background: "rgba(184,134,11,0.15)", border: "1px solid rgba(184,134,11,0.25)",
          borderRadius: "8px", color: "#E8DCC8", fontSize: "12px",
          cursor: "pointer", fontFamily: "'Noto Serif KR', serif", letterSpacing: "1px",
        }}>
          JSON 내보내기
        </button>
        <button onClick={() => fileRef.current?.click()} style={{
          flex: 1, padding: "12px",
          background: "rgba(255,255,255,0.08)", border: "1px solid rgba(184,134,11,0.15)",
          borderRadius: "8px", color: "#8B7355", fontSize: "12px",
          cursor: "pointer", fontFamily: "'Noto Serif KR', serif", letterSpacing: "1px",
        }}>
          JSON 가져오기
        </button>
        <input ref={fileRef} type="file" accept=".json" onChange={handleImport} style={{ display: "none" }} />
      </div>
      {msg && (
        <div style={{ marginTop: "10px", fontSize: "12px", color: "#B8860B", textAlign: "center" }}>
          {msg}
        </div>
      )}
    </div>
  );
}
