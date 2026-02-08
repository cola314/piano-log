import { CATEGORIES } from "@/lib/constants";
import type { PracticeData, PracticeLog } from "@/lib/types";
import { formatDate, getDayKey, getWeekKey, getMonthKey, getCalendarDays } from "@/lib/utils";

const navBtnStyle: React.CSSProperties = {
  background: "none",
  border: "1px solid rgba(184,134,11,0.2)",
  color: "#B8860B",
  width: "36px", height: "36px", borderRadius: "8px",
  fontSize: "18px", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
};

interface CalendarTabProps {
  data: PracticeData;
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  viewMonth: { year: number; month: number };
  onNavMonth: (dir: number) => void;
  onOpenLogModal: () => void;
}

export function CalendarTab({ data, selectedDate, onSelectDate, viewMonth, onNavMonth, onOpenLogModal }: CalendarTabProps) {
  const dayKey = getDayKey(selectedDate);
  const todayKey = getDayKey(new Date());
  const todayLog = data.logs[dayKey];
  const calendarDays = getCalendarDays(viewMonth.year, viewMonth.month);

  const getLogDots = (date: Date) => {
    const dk = getDayKey(date);
    const log = data.logs[dk];
    if (!log) return [];
    const dots: string[] = [];
    if (log.hanon > 0) dots.push(CATEGORIES[0].color);
    if (log.czerny > 0) dots.push(CATEGORIES[1].color);
    if (log.sonatine > 0) dots.push(CATEGORIES[2].color);
    return dots;
  };

  return (
    <div>
      {/* Month Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <button onClick={() => onNavMonth(-1)} style={navBtnStyle}>&#8249;</button>
        <div style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "1px" }}>
          {viewMonth.year}년 {viewMonth.month + 1}월
        </div>
        <button onClick={() => onNavMonth(1)} style={navBtnStyle}>&#8250;</button>
      </div>

      {/* Day Headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", marginBottom: "4px" }}>
        {["월", "화", "수", "목", "금", "토", "일"].map((d) => (
          <div key={d} style={{ textAlign: "center", fontSize: "10px", color: "#6B5B45", letterSpacing: "2px", padding: "6px 0" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
        {calendarDays.map(({ date, current }, i) => {
          const dk = getDayKey(date);
          const isToday = dk === todayKey;
          const isSelected = dk === dayKey;
          const dots = getLogDots(date);
          return (
            <button key={i} onClick={() => onSelectDate(new Date(date))} style={{
              aspectRatio: "1",
              background: isSelected ? "rgba(184,134,11,0.25)" : isToday ? "rgba(184,134,11,0.08)" : "transparent",
              border: isToday ? "1px solid rgba(184,134,11,0.4)" : "1px solid transparent",
              borderRadius: "8px",
              color: current ? (isSelected ? "#F5E6C8" : "#C4B49A") : "#3D3525",
              fontSize: "13px", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px",
              fontFamily: "'Crimson Pro', serif", transition: "all 0.2s",
            }}>
              <span>{date.getDate()}</span>
              {dots.length > 0 && (
                <div style={{ display: "flex", gap: "2px" }}>
                  {dots.map((c, j) => (
                    <div key={j} style={{ width: "4px", height: "4px", borderRadius: "50%", background: c }} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Info */}
      <div style={{
        marginTop: "24px", padding: "20px",
        background: "rgba(184,134,11,0.06)", borderRadius: "12px",
        border: "1px solid rgba(184,134,11,0.12)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ fontSize: "14px", fontWeight: "500" }}>{formatDate(selectedDate)}</div>
          <button onClick={onOpenLogModal} style={{
            background: "rgba(184,134,11,0.2)", border: "1px solid rgba(184,134,11,0.3)",
            color: "#F5E6C8", padding: "6px 16px", borderRadius: "6px",
            fontSize: "12px", cursor: "pointer", fontFamily: "'Noto Serif KR', serif", letterSpacing: "1px",
          }}>
            {todayLog ? "수정" : "기록"}
          </button>
        </div>

        {todayLog ? (
          <div>
            {CATEGORIES.map((cat) => {
              const mins = (todayLog[cat.id as keyof PracticeLog] as number) || 0;
              return (
                <div key={cat.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 0", borderBottom: "1px solid rgba(184,134,11,0.08)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: cat.color, fontSize: "16px" }}>{cat.icon}</span>
                    <span style={{ fontSize: "13px" }}>{cat.name}</span>
                  </div>
                  <div style={{
                    fontSize: "14px",
                    color: mins > 0 ? "#B8860B" : "#4A3F30",
                    fontFamily: "'Crimson Pro', serif",
                    fontWeight: mins > 0 ? "500" : "300",
                  }}>
                    {mins}분
                  </div>
                </div>
              );
            })}
            {todayLog.note && (
              <div style={{ marginTop: "12px", fontSize: "12px", color: "#8B7355", fontStyle: "italic", lineHeight: "1.6" }}>
                &ldquo;{todayLog.note}&rdquo;
              </div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: "13px", color: "#5A4E3A", textAlign: "center", padding: "12px 0" }}>
            아직 기록이 없습니다
          </div>
        )}
      </div>

      {/* Selected Date's Weekly/Monthly Goals */}
      <SelectedDateGoals data={data} selectedDate={selectedDate} />
    </div>
  );
}

function SelectedDateGoals({ data, selectedDate }: { data: PracticeData; selectedDate: Date }) {
  const wk = getWeekKey(selectedDate);
  const mk = getMonthKey(selectedDate);

  const goals = CATEGORIES.map((cat) => {
    const key = cat.id === "sonatine" ? mk : wk;
    const goal = data.goals[cat.id as keyof PracticeData["goals"]]?.[key];
    return { cat, goal, periodLabel: cat.id === "sonatine" ? mk : wk };
  });

  const hasAny = goals.some((g) => g.goal);
  if (!hasAny) return null;

  return (
    <div style={{
      marginTop: "16px", padding: "16px",
      background: "rgba(184,134,11,0.06)", borderRadius: "12px",
      border: "1px solid rgba(184,134,11,0.12)",
    }}>
      <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#6B5B45", marginBottom: "12px" }}>
        해당 주/월 목표
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {goals.map(({ cat, goal, periodLabel }) => (
          <div key={cat.id} style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "8px 10px",
            background: goal ? "rgba(0,0,0,0.1)" : "transparent",
            borderRadius: "6px",
            opacity: goal ? 1 : 0.4,
          }}>
            <span style={{ color: cat.color, fontSize: "14px", flexShrink: 0 }}>{cat.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              {goal ? (
                <div style={{
                  fontSize: "13px",
                  color: goal.completed ? "#6B5B45" : "#E8DCC8",
                  textDecoration: goal.completed ? "line-through" : "none",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {goal.title}
                </div>
              ) : (
                <div style={{ fontSize: "11px", color: "#4A3F30" }}>{cat.name} — 미설정</div>
              )}
            </div>
            <span style={{ fontSize: "10px", color: "#5A4E3A", flexShrink: 0 }}>
              {cat.id === "sonatine" ? "월간" : "주간"}
            </span>
            {goal && (
              <span style={{ fontSize: "12px", flexShrink: 0, color: goal.completed ? "#B8860B" : "#4A3F30" }}>
                {goal.completed ? "✓" : "○"}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
