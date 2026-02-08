import { CATEGORIES } from "@/lib/constants";
import type { PracticeLog } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface LogModalProps {
  selectedDate: Date;
  logForm: PracticeLog;
  onFormChange: (updater: (f: PracticeLog) => PracticeLog) => void;
  onSave: () => void;
  onClose: () => void;
}

export function LogModal({ selectedDate, logForm, onFormChange, onSave, onClose }: LogModalProps) {
  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        zIndex: 100, padding: "20px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "linear-gradient(180deg, #2a2010 0%, #1e1810 100%)",
        borderRadius: "16px 16px 0 0",
        border: "1px solid rgba(184,134,11,0.2)", borderBottom: "none",
        padding: "24px", width: "100%", maxWidth: "440px",
      }}>
        <div style={{ width: "40px", height: "4px", background: "rgba(184,134,11,0.3)", borderRadius: "2px", margin: "0 auto 20px" }} />
        <div style={{ fontSize: "16px", fontWeight: "500", marginBottom: "20px", textAlign: "center" }}>
          {formatDate(selectedDate)}
        </div>

        {CATEGORIES.map((cat) => (
          <div key={cat.id} style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: cat.color }}>{cat.icon}</span> {cat.name}
              </span>
              <span style={{ fontSize: "14px", color: "#B8860B", fontFamily: "'Crimson Pro', serif", minWidth: "40px", textAlign: "right" }}>
                {logForm[cat.id as keyof PracticeLog] as number}분
              </span>
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {[0, 5, 10, 15, 20, 25, 30].map((v) => (
                <button
                  key={v}
                  onClick={() => onFormChange((f) => ({ ...f, [cat.id]: v }))}
                  style={{
                    padding: "6px 12px", borderRadius: "6px",
                    border: (logForm[cat.id as keyof PracticeLog] as number) === v ? `1px solid ${cat.color}` : "1px solid rgba(184,134,11,0.1)",
                    background: (logForm[cat.id as keyof PracticeLog] as number) === v ? `${cat.color}25` : "rgba(0,0,0,0.2)",
                    color: (logForm[cat.id as keyof PracticeLog] as number) === v ? "#F5E6C8" : "#6B5B45",
                    fontSize: "12px", cursor: "pointer", fontFamily: "'Crimson Pro', serif",
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "12px", color: "#6B5B45", marginBottom: "6px" }}>메모</div>
          <textarea
            value={logForm.note}
            onChange={(e) => onFormChange((f) => ({ ...f, note: e.target.value }))}
            placeholder="오늘의 연습 느낌..."
            rows={2}
            style={{
              width: "100%", background: "rgba(0,0,0,0.2)",
              border: "1px solid rgba(184,134,11,0.15)", borderRadius: "8px",
              padding: "10px", color: "#E8DCC8", fontSize: "13px",
              fontFamily: "'Noto Serif KR', serif", resize: "none", outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <ModalButton label="취소" variant="secondary" onClick={onClose} />
          <ModalButton label="저장" variant="primary" onClick={onSave} />
        </div>
      </div>
    </div>
  );
}

function ModalButton({ label, variant, onClick }: { label: string; variant: "primary" | "secondary"; onClick: () => void }) {
  const isPrimary = variant === "primary";
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: "12px",
      background: isPrimary ? "rgba(184,134,11,0.25)" : "rgba(0,0,0,0.3)",
      border: isPrimary ? "1px solid rgba(184,134,11,0.4)" : "1px solid rgba(184,134,11,0.15)",
      borderRadius: "8px",
      color: isPrimary ? "#F5E6C8" : "#8B7355",
      fontSize: "13px", cursor: "pointer", fontFamily: "'Noto Serif KR', serif",
      fontWeight: isPrimary ? "500" : "400",
    }}>
      {label}
    </button>
  );
}
