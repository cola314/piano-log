import { useState } from "react";
import { CATEGORIES, KEYS, SCALE_TYPES } from "@/lib/constants";

interface GoalModalProps {
  onSave: (category: string, title: string) => void;
  onClose: () => void;
}

export function GoalModal({ onSave, onClose }: GoalModalProps) {
  const [category, setCategory] = useState("hanon");
  const [title, setTitle] = useState("");
  const [hanonStep, setHanonStep] = useState(0);
  const [hanonKey, setHanonKey] = useState("");

  const handleCategoryChange = (catId: string) => {
    setCategory(catId);
    setTitle("");
    setHanonStep(0);
    setHanonKey("");
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(category, title);
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100, padding: "20px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "linear-gradient(180deg, #2a2010 0%, #1e1810 100%)",
        borderRadius: "16px", border: "1px solid rgba(184,134,11,0.2)",
        padding: "24px", width: "100%", maxWidth: "400px",
      }}>
        <div style={{ fontSize: "16px", fontWeight: "500", marginBottom: "20px", textAlign: "center" }}>
          목표 설정
        </div>

        {/* Category Selection */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "12px", color: "#8B7B65", marginBottom: "8px" }}>카테고리</div>
          <div style={{ display: "flex", gap: "8px" }}>
            {CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => handleCategoryChange(cat.id)} style={{
                flex: 1, padding: "10px 8px", borderRadius: "8px",
                border: category === cat.id ? `1px solid ${cat.color}` : "1px solid rgba(184,134,11,0.1)",
                background: category === cat.id ? `${cat.color}20` : "rgba(255,255,255,0.08)",
                color: category === cat.id ? "#F5E6C8" : "#8B7B65",
                fontSize: "12px", cursor: "pointer", fontFamily: "'Noto Serif KR', serif", textAlign: "center",
              }}>
                <div style={{ color: cat.color, fontSize: "16px", marginBottom: "4px" }}>{cat.icon}</div>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Title Input */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "12px", color: "#8B7B65", marginBottom: "8px" }}>
            {category === "sonatine" ? "이번 달 곡" : category === "hanon" ? (hanonStep === 0 ? "조성 선택" : "종류 선택") : "이번 주 곡"}
          </div>

          {category === "hanon" ? (
            <div>
              {hanonStep === 0 ? (
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {KEYS.map((k) => (
                    <button key={k} onClick={() => { setHanonKey(k); setHanonStep(1); }} style={{
                      padding: "8px 14px", borderRadius: "6px",
                      border: "1px solid rgba(184,134,11,0.15)", background: "rgba(255,255,255,0.08)",
                      color: "#C4B49A", fontSize: "13px", cursor: "pointer",
                      fontFamily: "'Crimson Pro', serif", transition: "all 0.2s",
                    }}>
                      {k}
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  <button onClick={() => setHanonStep(0)} style={{
                    background: "none", border: "none", color: "#8B7B65",
                    fontSize: "12px", cursor: "pointer", padding: "0 0 10px",
                    fontFamily: "'Noto Serif KR', serif",
                  }}>
                    &#8249; {hanonKey} — 종류 선택
                  </button>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {SCALE_TYPES.map((st) => (
                      <button key={st} onClick={() => setTitle(`${hanonKey} ${st}`)} style={{
                        padding: "10px 16px", borderRadius: "8px",
                        border: title === `${hanonKey} ${st}` ? "1px solid #B8860B" : "1px solid rgba(184,134,11,0.12)",
                        background: title === `${hanonKey} ${st}` ? "rgba(184,134,11,0.2)" : "rgba(255,255,255,0.08)",
                        color: title === `${hanonKey} ${st}` ? "#F5E6C8" : "#8B7355",
                        fontSize: "13px", cursor: "pointer", fontFamily: "'Noto Serif KR', serif",
                        transition: "all 0.2s",
                      }}>
                        {st}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={category === "czerny" ? "예: No. 5" : "예: 클레멘티 소나티네 Op.36 No.1"}
              style={{
                width: "100%", background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(184,134,11,0.15)", borderRadius: "8px",
                padding: "10px", color: "#E8DCC8", fontSize: "13px",
                fontFamily: "'Noto Serif KR', serif", outline: "none", boxSizing: "border-box",
              }}
            />
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "12px", background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(184,134,11,0.15)", borderRadius: "8px",
            color: "#8B7355", fontSize: "13px", cursor: "pointer", fontFamily: "'Noto Serif KR', serif",
          }}>취소</button>
          <button onClick={handleSave} style={{
            flex: 1, padding: "12px", background: "rgba(184,134,11,0.25)",
            border: "1px solid rgba(184,134,11,0.4)", borderRadius: "8px",
            color: "#F5E6C8", fontSize: "13px", cursor: "pointer",
            fontFamily: "'Noto Serif KR', serif", fontWeight: "500",
          }}>설정</button>
        </div>
      </div>
    </div>
  );
}
