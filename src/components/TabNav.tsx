const TABS = [
  { id: "today", label: "오늘" },
  { id: "calendar", label: "달력" },
  { id: "progress", label: "진도" },
  { id: "stats", label: "통계" },
];

interface TabNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <div style={{
      display: "flex",
      borderBottom: "1px solid rgba(184,134,11,0.15)",
      background: "rgba(255,255,255,0.08)",
    }}>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            flex: 1,
            padding: "14px",
            background: "none",
            border: "none",
            borderBottom: activeTab === tab.id ? "2px solid #B8860B" : "2px solid transparent",
            color: activeTab === tab.id ? "#F5E6C8" : "#8B7B65",
            fontSize: "13px",
            fontFamily: "'Noto Serif KR', serif",
            cursor: "pointer",
            letterSpacing: "2px",
            transition: "all 0.3s",
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
