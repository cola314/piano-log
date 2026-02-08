export interface PracticeLog {
  hanon: number;
  czerny: number;
  sonatine: number;
  note: string;
  date?: string;
}

export interface Goal {
  title: string;
  completed: boolean;
}

export interface PracticeData {
  logs: Record<string, PracticeLog>;
  goals: {
    hanon: Record<string, Goal>;
    czerny: Record<string, Goal>;
    sonatine: Record<string, Goal>;
  };
}

export interface Category {
  id: string;
  name: string;
  sub: string;
  cycle: string;
  daily: string;
  color: string;
  bg: string;
  icon: string;
}

export type CategoryId = "hanon" | "czerny" | "sonatine";

export interface TimerState {
  elapsed: Record<CategoryId, number>;
  targets: Record<CategoryId, number>;
  running: boolean;
  activeCat: string | null;
  note: string;
  alerted: Record<CategoryId, boolean>;
}

export interface WeeklyStats {
  hanon: number;
  czerny: number;
  sonatine: number;
  days: number;
}
