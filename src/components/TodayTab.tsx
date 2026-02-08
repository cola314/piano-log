import { CATEGORIES } from "@/lib/constants";
import type { CategoryId, PracticeData, PracticeLog } from "@/lib/types";
import { formatDate, formatTimer, getDayKey } from "@/lib/utils";

interface TodayTabProps {
  data: PracticeData;
  timer: {
    activeCat: string | null;
    elapsed: Record<CategoryId, number>;
    targets: Record<CategoryId, number>;
    running: boolean;
    note: string;
    setNote: (n: string) => void;
    toggle: (catId: string) => void;
    reset: (catId: string) => void;
    setTarget: (catId: string, min: number) => void;
    saveToLog: () => void;
    totalElapsed: number;
    totalTarget: number;
    getRemaining: (catId: string) => number;
  };
  weekKey: string;
  monthKey: string;
  onOpenGoalModal: () => void;
  onTabChange: (tab: string) => void;
}

export function TodayTab({ data, timer, weekKey, monthKey, onOpenGoalModal, onTabChange }: TodayTabProps) {
  const { activeCat, elapsed, targets, running, note, setNote, toggle, reset, setTarget, saveToLog, totalElapsed, totalTarget, getRemaining } = timer;

  // Check goal status
  const goalStatus = CATEGORIES.map((cat) => {
    const key = cat.id === "sonatine" ? monthKey : weekKey;
    const goal = data.goals[cat.id as keyof PracticeData["goals"]]?.[key];
    return { cat, goal, key };
  });
  const goalsSet = goalStatus.filter((g) => g.goal);
  const hasNoGoals = goalsSet.length === 0;

  // Onboarding guard: no goals set at all
  if (hasNoGoals) {
    return (
      <div>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "14px", color: "#8B7355" }}>{formatDate(new Date())}</div>
        </div>
        <OnboardingGuard onOpenGoalModal={onOpenGoalModal} onTabChange={onTabChange} />
        <ExistingLog data={data} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <div style={{ fontSize: "14px", color: "#8B7355" }}>{formatDate(new Date())}</div>
      </div>

      {/* Today's Goals */}
      <GoalStatusCard goalStatus={goalStatus} onOpenGoalModal={onOpenGoalModal} onTabChange={onTabChange} />

      {/* Total Timer Display */}
      <TotalDisplay
        totalTarget={totalTarget}
        totalElapsed={totalElapsed}
        running={running}
        activeCat={activeCat}
      />

      {/* Category Timers */}
      {CATEGORIES.map((cat) => (
        <CategoryTimer
          key={cat.id}
          cat={cat}
          isActive={running && activeCat === cat.id}
          elapsed={elapsed[cat.id as CategoryId]}
          remaining={getRemaining(cat.id)}
          targetSecs={targets[cat.id as CategoryId]}
          onToggle={() => toggle(cat.id)}
          onReset={() => reset(cat.id)}
          onSetTarget={(min) => setTarget(cat.id, min)}
        />
      ))}

      {/* Save Section */}
      {totalElapsed > 0 && (
        <div style={{
          marginTop: "24px",
          padding: "20px",
          background: "rgba(184,134,11,0.06)",
          borderRadius: "12px",
          border: "1px solid rgba(184,134,11,0.12)",
        }}>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="오늘의 연습 메모..."
            rows={2}
            style={{
              width: "100%",
              background: "rgba(0,0,0,0.2)",
              border: "1px solid rgba(184,134,11,0.15)",
              borderRadius: "8px",
              padding: "10px",
              color: "#E8DCC8",
              fontSize: "13px",
              fontFamily: "'Noto Serif KR', serif",
              resize: "none",
              outline: "none",
              boxSizing: "border-box",
              marginBottom: "12px",
            }}
          />
          <button
            onClick={saveToLog}
            style={{
              width: "100%",
              padding: "14px",
              background: "linear-gradient(135deg, rgba(184,134,11,0.3) 0%, rgba(184,134,11,0.15) 100%)",
              border: "1px solid rgba(184,134,11,0.4)",
              borderRadius: "10px",
              color: "#F5E6C8",
              fontSize: "14px",
              cursor: "pointer",
              fontFamily: "'Noto Serif KR', serif",
              fontWeight: "500",
              letterSpacing: "2px",
              transition: "all 0.2s",
            }}
          >
            연습 완료 · 저장하기
          </button>
          <div style={{ marginTop: "8px", fontSize: "11px", color: "#5A4E3A", textAlign: "center" }}>
            하농 {Math.round(elapsed.hanon / 60)}분 · 체르니 {Math.round(elapsed.czerny / 60)}분 · 소나티네 {Math.round(elapsed.sonatine / 60)}분으로 기록됩니다
          </div>
        </div>
      )}

      {/* Today's existing log */}
      <ExistingLog data={data} />
    </div>
  );
}

function TotalDisplay({ totalTarget, totalElapsed, running, activeCat }: {
  totalTarget: number; totalElapsed: number; running: boolean; activeCat: string | null;
}) {
  const totalRemaining = totalTarget - totalElapsed;
  const isOvertime = totalRemaining < 0;

  return (
    <div style={{
      textAlign: "center",
      marginBottom: "28px",
      padding: "24px",
      background: "rgba(184,134,11,0.06)",
      borderRadius: "16px",
      border: "1px solid rgba(184,134,11,0.12)",
    }}>
      <div style={{ fontSize: "10px", letterSpacing: "3px", color: "#6B5B45", marginBottom: "10px" }}>
        총 남은 시간
      </div>
      <div style={{
        fontSize: "48px",
        fontWeight: "300",
        fontFamily: "'Crimson Pro', serif",
        color: isOvertime ? "#C0392B" : running ? "#F5E6C8" : "#B8860B",
        letterSpacing: "4px",
        transition: "color 0.3s",
      }}>
        {isOvertime && <span style={{ fontSize: "24px", verticalAlign: "middle", marginRight: "4px", color: "#C0392B" }}>+</span>}
        {formatTimer(Math.abs(totalRemaining))}
      </div>
      <div style={{ marginTop: "6px", fontSize: "11px", color: "#5A4E3A" }}>
        경과 {formatTimer(totalElapsed)} / 목표 {formatTimer(totalTarget)}
      </div>
      {running && activeCat && (
        <div style={{
          marginTop: "8px",
          fontSize: "11px",
          color: CATEGORIES.find(c => c.id === activeCat)?.color,
          letterSpacing: "1px",
          animation: "pulse 2s ease-in-out infinite",
        }}>
          ● {CATEGORIES.find(c => c.id === activeCat)?.name} 연습 중
        </div>
      )}
    </div>
  );
}

function CategoryTimer({ cat, isActive, elapsed, remaining, targetSecs, onToggle, onReset, onSetTarget }: {
  cat: typeof CATEGORIES[number];
  isActive: boolean;
  elapsed: number;
  remaining: number;
  targetSecs: number;
  onToggle: () => void;
  onReset: () => void;
  onSetTarget: (min: number) => void;
}) {
  const isOvertime = remaining < 0;
  const progress = Math.min(elapsed / targetSecs, 1) * 100;
  const targetMin = targetSecs / 60;

  return (
    <div style={{
      marginBottom: "12px",
      padding: "16px 20px",
      background: isActive
        ? `linear-gradient(135deg, ${cat.color}18 0%, ${cat.color}08 100%)`
        : "rgba(0,0,0,0.15)",
      borderRadius: "12px",
      border: isOvertime && elapsed > 0
        ? "1px solid rgba(192,57,43,0.3)"
        : isActive ? `1px solid ${cat.color}40` : "1px solid rgba(184,134,11,0.08)",
      transition: "all 0.3s",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "10px",
            background: isActive ? `${cat.color}30` : "rgba(184,134,11,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "18px", color: cat.color, transition: "all 0.3s",
          }}>
            {cat.icon}
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "500" }}>{cat.name}</div>
            <div style={{ fontSize: "10px", color: "#6B5B45", marginTop: "2px" }}>목표 {targetMin}분</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{
              fontSize: "22px", fontFamily: "'Crimson Pro', serif",
              color: isOvertime && elapsed > 0 ? "#C0392B"
                : isActive ? "#F5E6C8"
                : remaining < targetSecs && elapsed > 0 ? "#B8860B" : "#4A3F30",
              letterSpacing: "2px", fontWeight: isActive ? "500" : "300",
            }}>
              {isOvertime && elapsed > 0 ? "+" : ""}{formatTimer(Math.abs(remaining))}
            </div>
            {elapsed > 0 && (
              <div style={{ fontSize: "9px", color: "#5A4E3A", marginTop: "1px" }}>
                경과 {formatTimer(elapsed)}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <button onClick={onToggle} style={{
              width: "36px", height: "36px", borderRadius: "50%",
              border: `1.5px solid ${isActive ? cat.color : "rgba(184,134,11,0.2)"}`,
              background: isActive ? `${cat.color}25` : "rgba(0,0,0,0.2)",
              color: isActive ? "#F5E6C8" : "#8B7355",
              fontSize: "14px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
            }}>
              {isActive ? "❚❚" : "▶"}
            </button>
            {elapsed > 0 && (
              <button onClick={onReset} style={{
                width: "36px", height: "36px", borderRadius: "50%",
                border: "1.5px solid rgba(184,134,11,0.15)",
                background: "rgba(0,0,0,0.2)", color: "#6B5B45", fontSize: "12px",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                ↺
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginTop: "12px", height: "4px", background: "rgba(0,0,0,0.3)", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${Math.min(progress, 100)}%`,
          background: isOvertime ? "linear-gradient(90deg, #C0392B88, #C0392B)" : `linear-gradient(90deg, ${cat.color}88, ${cat.color})`,
          borderRadius: "2px", transition: "width 0.5s ease",
        }} />
      </div>

      {/* Target time buttons */}
      {elapsed === 0 && !isActive && (
        <div style={{ marginTop: "10px", display: "flex", gap: "5px", justifyContent: "center" }}>
          {[5, 10, 15, 20, 25, 30].map((m) => (
            <button key={m} onClick={() => onSetTarget(m)} style={{
              padding: "4px 10px", borderRadius: "4px",
              border: targetMin === m ? `1px solid ${cat.color}` : "1px solid rgba(184,134,11,0.1)",
              background: targetMin === m ? `${cat.color}20` : "transparent",
              color: targetMin === m ? "#F5E6C8" : "#5A4E3A",
              fontSize: "11px", cursor: "pointer", fontFamily: "'Crimson Pro', serif",
              transition: "all 0.15s",
            }}>
              {m}분
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function OnboardingGuard({ onOpenGoalModal, onTabChange }: { onOpenGoalModal: () => void; onTabChange: (tab: string) => void }) {
  return (
    <div style={{
      padding: "32px 24px",
      background: "rgba(184,134,11,0.06)",
      borderRadius: "16px",
      border: "1px solid rgba(184,134,11,0.12)",
      textAlign: "center",
    }}>
      <div style={{ fontSize: "36px", marginBottom: "16px" }}>🎹</div>
      <div style={{ fontSize: "16px", fontWeight: "500", marginBottom: "8px", color: "#E8DCC8" }}>
        연습을 시작하기 전에
      </div>
      <div style={{ fontSize: "13px", color: "#8B7355", marginBottom: "24px", lineHeight: "1.6" }}>
        이번 주/이번 달 목표를 먼저 설정해 보세요.<br />
        목표가 있으면 연습이 더 효과적이에요.
      </div>
      <button onClick={onOpenGoalModal} style={{
        width: "100%", padding: "14px",
        background: "linear-gradient(135deg, rgba(184,134,11,0.3) 0%, rgba(184,134,11,0.15) 100%)",
        border: "1px solid rgba(184,134,11,0.4)",
        borderRadius: "10px", color: "#F5E6C8", fontSize: "14px",
        cursor: "pointer", fontFamily: "'Noto Serif KR', serif",
        fontWeight: "500", letterSpacing: "2px", transition: "all 0.2s",
        marginBottom: "10px",
      }}>
        목표 설정하기
      </button>
      <button onClick={() => onTabChange("progress")} style={{
        width: "100%", padding: "12px",
        background: "transparent",
        border: "1px solid rgba(184,134,11,0.15)",
        borderRadius: "10px", color: "#6B5B45", fontSize: "12px",
        cursor: "pointer", fontFamily: "'Noto Serif KR', serif",
        letterSpacing: "1px",
      }}>
        진도 탭에서 자세히 설정
      </button>
    </div>
  );
}

function GoalStatusCard({ goalStatus, onOpenGoalModal, onTabChange }: {
  goalStatus: { cat: typeof CATEGORIES[number]; goal: { title: string; completed: boolean } | undefined; key: string }[];
  onOpenGoalModal: () => void;
  onTabChange: (tab: string) => void;
}) {
  const allSet = goalStatus.every((g) => g.goal);

  return (
    <div style={{
      marginBottom: "20px", padding: "16px",
      background: "rgba(184,134,11,0.06)",
      borderRadius: "12px",
      border: "1px solid rgba(184,134,11,0.12)",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: "12px",
      }}>
        <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#6B5B45" }}>
          오늘의 목표
        </div>
        {!allSet && (
          <button onClick={onOpenGoalModal} style={{
            background: "rgba(184,134,11,0.15)", border: "1px solid rgba(184,134,11,0.25)",
            color: "#B8860B", padding: "3px 10px", borderRadius: "4px",
            fontSize: "10px", cursor: "pointer", fontFamily: "'Noto Serif KR', serif",
            letterSpacing: "1px",
          }}>
            + 설정
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {goalStatus.map(({ cat, goal }) => (
          <div key={cat.id} style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "8px 10px",
            background: goal ? (goal.completed ? "rgba(184,134,11,0.08)" : "rgba(0,0,0,0.1)") : "rgba(0,0,0,0.05)",
            borderRadius: "8px",
            border: goal ? `1px solid ${cat.color}20` : "1px dashed rgba(184,134,11,0.1)",
          }}>
            <span style={{ color: cat.color, fontSize: "14px", flexShrink: 0 }}>{cat.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "12px", color: "#8B7355" }}>{cat.name}</div>
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
                <div style={{ fontSize: "11px", color: "#4A3F30" }}>미설정</div>
              )}
            </div>
            {goal && (
              <span style={{
                fontSize: "12px", flexShrink: 0,
                color: goal.completed ? "#B8860B" : "#4A3F30",
              }}>
                {goal.completed ? "✓" : "○"}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ExistingLog({ data }: { data: PracticeData }) {
  const tk = getDayKey(new Date());
  const existingLog = data.logs[tk];
  if (!existingLog) return null;
  const total = (existingLog.hanon || 0) + (existingLog.czerny || 0) + (existingLog.sonatine || 0);
  if (total === 0) return null;

  return (
    <div style={{
      marginTop: "20px", padding: "16px 20px",
      background: "rgba(0,0,0,0.15)", borderRadius: "12px",
      border: "1px solid rgba(184,134,11,0.08)",
    }}>
      <div style={{ fontSize: "11px", letterSpacing: "2px", color: "#6B5B45", marginBottom: "10px" }}>
        오늘 누적 기록
      </div>
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        {CATEGORIES.map((cat) => (
          <div key={cat.id} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "18px", fontFamily: "'Crimson Pro', serif", color: "#B8860B" }}>
              {(existingLog[cat.id as keyof PracticeLog] as number) || 0}
            </div>
            <div style={{ fontSize: "10px", color: "#5A4E3A", marginTop: "2px" }}>{cat.name} (분)</div>
          </div>
        ))}
      </div>
      {existingLog.note && (
        <div style={{ marginTop: "10px", fontSize: "12px", color: "#8B7355", fontStyle: "italic", textAlign: "center" }}>
          &ldquo;{existingLog.note}&rdquo;
        </div>
      )}
    </div>
  );
}
