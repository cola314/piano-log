import { CATEGORIES } from "@/lib/constants";
import type { PracticeData } from "@/lib/types";
import { getWeekKey, getMonthKey } from "@/lib/utils";

interface ProgressTabProps {
  data: PracticeData;
  selectedDate: Date;
  weekKey: string;
  monthKey: string;
  onOpenGoalModal: () => void;
  onToggleGoal: (cat: string, key: string) => void;
}

export function ProgressTab({ data, selectedDate, weekKey, monthKey, onOpenGoalModal, onToggleGoal }: ProgressTabProps) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ fontSize: "14px", color: "#8B7355" }}>
          {getWeekKey(selectedDate)} · {getMonthKey(selectedDate)}
        </div>
        <button onClick={onOpenGoalModal} style={{
          background: "rgba(184,134,11,0.2)", border: "1px solid rgba(184,134,11,0.3)",
          color: "#F5E6C8", padding: "6px 16px", borderRadius: "6px",
          fontSize: "12px", cursor: "pointer", fontFamily: "'Noto Serif KR', serif", letterSpacing: "1px",
        }}>
          + 목표 설정
        </button>
      </div>

      {CATEGORIES.map((cat) => {
        const key = cat.id === "sonatine" ? monthKey : weekKey;
        const goal = data.goals[cat.id as keyof PracticeData["goals"]]?.[key];
        return (
          <div key={cat.id} style={{
            marginBottom: "16px", padding: "20px",
            background: `linear-gradient(135deg, ${cat.color}10 0%, transparent 100%)`,
            borderRadius: "12px", border: `1px solid ${cat.color}25`,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: cat.color, fontSize: "18px" }}>{cat.icon}</span>
                  <span style={{ fontSize: "15px", fontWeight: "500" }}>{cat.name}</span>
                </div>
                <div style={{ fontSize: "11px", color: "#8B7B65", marginTop: "4px", letterSpacing: "1px" }}>
                  {cat.cycle} · {cat.daily}
                </div>
              </div>
              <div style={{
                fontSize: "10px", padding: "3px 10px", borderRadius: "12px",
                background: cat.id === "sonatine" ? "rgba(47,79,79,0.2)" : "rgba(184,134,11,0.15)",
                color: cat.color, letterSpacing: "1px",
              }}>
                {cat.id === "sonatine" ? "월간" : "주간"}
              </div>
            </div>

            {goal ? (
              <div onClick={() => onToggleGoal(cat.id, key)} style={{
                display: "flex", alignItems: "center", gap: "10px", padding: "12px",
                background: goal.completed ? "rgba(184,134,11,0.1)" : "rgba(255,255,255,0.06)",
                borderRadius: "8px", cursor: "pointer", transition: "all 0.2s",
              }}>
                <div style={{
                  width: "20px", height: "20px", borderRadius: "50%",
                  border: `2px solid ${goal.completed ? "#B8860B" : "#6A5F50"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", color: "#B8860B", flexShrink: 0,
                }}>
                  {goal.completed && "✓"}
                </div>
                <span style={{
                  fontSize: "14px",
                  textDecoration: goal.completed ? "line-through" : "none",
                  color: goal.completed ? "#8B7B65" : "#E8DCC8",
                }}>
                  {goal.title}
                </span>
              </div>
            ) : (
              <div style={{
                padding: "14px", textAlign: "center", fontSize: "12px", color: "#6A5F50",
                background: "rgba(255,255,255,0.05)", borderRadius: "8px", border: "1px dashed rgba(184,134,11,0.15)",
              }}>
                목표를 설정해 보세요
              </div>
            )}
          </div>
        );
      })}

      {/* Completed Goals History */}
      <CompletedGoals data={data} />
    </div>
  );
}

function CompletedGoals({ data }: { data: PracticeData }) {
  const completed: { title: string; completed: boolean; cat: typeof CATEGORIES[number]; key: string }[] = [];
  CATEGORIES.forEach((cat) => {
    Object.entries(data.goals[cat.id as keyof PracticeData["goals"]] || {}).forEach(([key, goal]) => {
      if (goal.completed) completed.push({ ...goal, cat, key });
    });
  });
  completed.sort((a, b) => b.key.localeCompare(a.key));

  return (
    <div style={{ marginTop: "28px" }}>
      <div style={{
        fontSize: "11px", letterSpacing: "3px", color: "#8B7B65",
        marginBottom: "14px", paddingBottom: "8px", borderBottom: "1px solid rgba(184,134,11,0.1)",
      }}>
        완료 기록
      </div>
      {completed.length > 0 ? (
        completed.slice(0, 8).map((item, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "10px 0", borderBottom: "1px solid rgba(184,134,11,0.06)",
          }}>
            <span style={{ color: item.cat.color, fontSize: "14px" }}>{item.cat.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px" }}>{item.title}</div>
              <div style={{ fontSize: "10px", color: "#7A6E5A" }}>{item.key}</div>
            </div>
            <span style={{ color: "#B8860B", fontSize: "12px" }}>✓</span>
          </div>
        ))
      ) : (
        <div style={{ fontSize: "12px", color: "#6A5F50", textAlign: "center", padding: "16px 0" }}>
          아직 완료한 목표가 없습니다
        </div>
      )}
    </div>
  );
}
