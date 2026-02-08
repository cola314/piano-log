# Piano Practice Tracker

## Project Overview
Next.js 16 (App Router, Turbopack) 기반 피아노 연습 트래커 앱.
localStorage로 데이터를 저장하며, 인라인 스타일을 사용한다 (CSS 프레임워크 없음).

## Tech Stack
- Next.js 16.1.6 (App Router, Turbopack)
- TypeScript
- React (client components, `'use client'`)
- Google Fonts: Noto Serif KR, Crimson Pro
- 데이터 저장: localStorage (key: `piano-practice-data`)
- 스타일: 인라인 스타일 (Tailwind 등 CSS 프레임워크 미사용)

## Architecture

### Directory Structure
```
src/
  app/
    layout.tsx          # 루트 레이아웃
    page.tsx            # 메인 오케스트레이터 (상태 관리 + 탭 라우팅)
    globals.css         # 최소 CSS 리셋
  components/
    Header.tsx          # 헤더 (연속일수, 주간 통계)
    TabNav.tsx          # 탭 네비게이션 (오늘/달력/진도/통계)
    TodayTab.tsx        # 오늘 탭 (목표 상태, 타이머, 온보딩)
    CalendarTab.tsx     # 달력 탭 (월 탐색, 날짜별 기록, 주간 목표)
    ProgressTab.tsx     # 진도 탭 (목표 관리, 완료 기록)
    StatsTab.tsx        # 통계 탭 (주간 분석, 히트맵, 월간 요약)
    LogModal.tsx        # 연습 기록 모달
    GoalModal.tsx       # 목표 설정 모달
  hooks/
    usePracticeData.ts  # localStorage 데이터 관리 훅
    useTimer.ts         # 타이머 로직 훅 (Web Audio API 알람)
  lib/
    types.ts            # TypeScript 인터페이스 (PracticeLog, Goal, PracticeData 등)
    constants.ts        # 상수 (CATEGORIES, KEYS, SCALE_TYPES)
    utils.ts            # 유틸리티 (날짜 포맷, 캘린더 계산)
```

### Data Model
- **PracticeLog**: `{ hanon, czerny, sonatine, note, date? }` — 일별 연습 기록 (분 단위)
- **Goal**: `{ title, completed }` — 목표
- **PracticeData**: `{ logs: Record<dayKey, PracticeLog>, goals: { hanon, czerny, sonatine } }` — 전체 데이터
- Key 포맷: dayKey=`YYYY-MM-DD`, weekKey=`YYYY-WXX`, monthKey=`YYYY-MM`

### Categories
| ID | 이름 | 주기 | 일일 권장 |
|---|---|---|---|
| hanon | 하농 (스케일) | 주 1조성 | 5-10분 |
| czerny | 체르니 30 (에튀드) | 주 1곡 | 15-20분 |
| sonatine | 소나티네 (악곡) | 월 1곡 | 20분 |

## UX Flow

### 오늘 탭 (Today)
1. 목표가 하나도 없으면 → 온보딩 가드 (목표 설정 유도)
2. 목표가 있으면 → 목표 상태 카드 + 타이머 UI
3. 연습 후 저장 가능

### 달력 탭 (Calendar)
- 월 탐색, 날짜 선택 → 해당 날짜 기록 + 해당 주/월 목표 표시
- 기록 추가/수정 모달

### 진도 탭 (Progress)
- 카테고리별 주간/월간 목표 관리
- 목표 설정/완료 토글
- 완료 기록 히스토리

### 통계 탭 (Stats)
- 주간 연습 시간 바 차트
- 최근 7일 히트맵
- 이번 달 요약 (연습일, 총 시간, 평균)

## Development Rules

### 문서 싱크 규칙
- 기획 변경 시 반드시 이 CLAUDE.md의 UX Flow / Data Model / Architecture 섹션도 함께 업데이트할 것
- 새로운 컴포넌트 추가 시 Directory Structure에 반영할 것
- 데이터 구조 변경 시 Data Model 섹션을 업데이트할 것
- 기획 문서(PRD 등)와 개발 문서(이 파일)는 항상 동기화 상태를 유지할 것

### Git / 배포 주의사항
- **민감 정보(API 키, 토큰, 비밀번호 등)를 절대 커밋하지 말 것**
- `.env`, `.env.local`, 인증 관련 파일은 반드시 `.gitignore`에 포함할 것
- 커밋 전 `git diff`로 민감 정보 포함 여부를 확인할 것
- GitHub Pages로 배포 (정적 export) — `https://cola314.github.io/piano-log/`

### 코드 스타일
- 인라인 스타일 사용 (CSS 파일 추가하지 않음)
- 컴포넌트별 파일 분리 유지
- 커스텀 훅으로 비즈니스 로직 분리
- 한국어 UI 텍스트
