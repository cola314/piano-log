import type { Category } from "./types";

export const CATEGORIES: Category[] = [
  { id: "hanon", name: "하농", sub: "스케일", cycle: "주 1조성", daily: "5-10분", color: "#B8860B", bg: "#FDF6E3", icon: "♯" },
  { id: "czerny", name: "체르니 30", sub: "에튀드", cycle: "주 1곡", daily: "15-20분", color: "#8B4513", bg: "#FFF8F0", icon: "♪" },
  { id: "sonatine", name: "소나티네", sub: "악곡", cycle: "월 1곡", daily: "20분", color: "#2F4F4F", bg: "#F0F5F5", icon: "♫" },
];

export const KEYS = ["C", "G", "D", "A", "E", "B", "F♯/G♭", "D♭", "A♭", "E♭", "B♭", "F"];
export const SCALE_TYPES = ["장조", "자연단조", "화성단조", "가락단조"];

export const STORAGE_KEY = "piano-practice-data";
