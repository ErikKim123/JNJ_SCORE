# Design: 젝앤질 대회 채점 앱 (scoring-app)

| Field | Value |
|---|---|
| Feature | scoring-app |
| Created | 2026-04-29 |
| Phase | Design |
| Architecture | **Option A — Minimal (Client-only SPA-style on Next.js App Router)** |
| Plan Reference | `docs/01-plan/features/scoring-app.plan.md` |

---

## Context Anchor (from Plan)

| Key | Value |
|---|---|
| **WHY** | 수기 집계로 발생하는 오류·지연·공정성 이슈 제거, 심사위원이 "입력만 하면 되는" 환경 |
| **WHO** | 심사위원(주 사용자, 다수 동시), 운영자(시트 관리) |
| **RISK** | Apps Script URL 노출, 시트 구조 변경, 동시 반영 충돌, 모바일 네트워크 끊김 |
| **SUCCESS** | 3 라운드 입력→반영 정상, 시트 1:1 일치, 모바일 동작, 1명당 ≤3분 |
| **SCOPE** | IN: 이름 선택 입장, 5개 페이지, Apps Script 연동, JNJ 디자인 · OUT: 인증, 실시간 sync, 등록/발표 |

---

## 1. Overview

본 설계는 **Option A — Minimal**을 채택한다. 모든 페이지는 클라이언트 컴포넌트로 동작하며, 브라우저가 직접 Google Apps Script Web App에 GET/POST를 호출한다. 별도 서버 로직·DB·인증 미들웨어 없이 Next.js를 정적 호스팅 셸로 사용하고, 데이터 단일 진실 원천(SoT)은 Google Sheets다.

**왜 Option A인가**
- MVP 한 번에 손에 넣어야 함 — 운영자가 Apps Script 한 파일만 관리하면 됨
- 별도 서버/DB 없음 → Vercel 무료 티어로 충분
- 시크릿 노출 리스크는 §10에서 완화 전략으로 보완

---

## 2. Architecture

```
┌──────────────────────────────────────────────┐
│ Browser (Next.js client-side)                │
│  ┌────────────────────────────────────────┐  │
│  │ App Router pages (all 'use client')    │  │
│  │  / → /enter → /event → /round/{r}      │  │
│  └────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────┐  │
│  │ lib/apps-script.ts  (fetch wrapper)    │  │
│  │ lib/sheet-schema.ts (types + mapping)  │  │
│  │ hooks/useDraft.ts   (localStorage)     │  │
│  └────────────────────────────────────────┘  │
└──────────────┬───────────────────────────────┘
               │ HTTPS POST/GET (JSON)
               ▼
┌──────────────────────────────────────────────┐
│ Google Apps Script Web App (doGet/doPost)    │
│  - getJudges()                               │
│  - getEvent()                                │
│  - getRound(round)                           │
│  - submitRound(judge, round, payload, token) │
└──────────────┬───────────────────────────────┘
               │ SpreadsheetApp
               ▼
       Google Sheets (SoT)
```

---

## 3. Data Model

### 3.1 Sheet Tabs (가정 — Design Q1으로 검증 필요)

| Tab | Purpose | Required Columns |
|---|---|---|
| `JUDGES` | 심사위원 목록 | `id`, `name`, `active` |
| `EVENT` | 대회 정보 (1행) | `name`, `date`, `venue`, `currentRound` |
| `PRELIM` | 예선 참가자 | `id`, `number`, `name1`, `name2`, `j1_pass`, `j2_pass`, ... |
| `SEMI` | 본선 참가자 | `id`, `number`, `name1`, `name2`, `j1_pass`, `j2_pass`, ... |
| `FINAL` | 결승 참가자 | `id`, `number`, `name1`, `name2`, `j1_basics`, `j1_connection`, `j1_musicality`, ... |

> 심사위원별 컬럼을 분리해 동시 반영 충돌을 회피한다. 각 심사위원은 자기 컬럼(`j{N}_*`)에만 쓴다.

### 3.2 TypeScript Types (`lib/sheet-schema.ts`)

```ts
export type Judge = { id: string; name: string; active: boolean };

export type Event = {
  name: string;
  date: string;        // ISO
  venue: string;
  currentRound: 'prelim' | 'semi' | 'final';
};

export type Contestant = {
  id: string;
  number: string;
  name1: string;
  name2: string;       // 파트너
};

export type PassFailEntry = {
  contestantId: string;
  pass: boolean;
};

export type FinalEntry = {
  contestantId: string;
  basics: number;       // 0~10
  connection: number;   // 0~10
  musicality: number;   // 0~10
};

export type Round = 'prelim' | 'semi' | 'final';
```

---

## 4. API Contract (revised — Analysis iter-1)

> **Architectural change**: 읽기는 Next.js 프록시(`app/api/sheet/*`)가 처리, 쓰기만 Apps Script `doPost`로 직접 전송. 자세한 ADR은 §10 참고.

### 4.1 Read APIs — Next.js Route Handlers (`app/api/sheet/*`)

브라우저 → Next.js 서버(같은 origin) → Google Sheets CSV export(공개 시트) 또는 Apps Script `read` action(비공개 시트 폴백, `lib/sheet-fetch.ts`).

| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/api/sheet/competitions` | — | `{ ok: true, data: Competition[] }` |
| GET | `/api/sheet/judges?sheetId=<id>` | `sheetId` (선택) | `{ ok: true, data: Judge[] }` |
| GET | `/api/sheet/event` | — | `{ ok: true, data: Event }` |
| GET | `/api/sheet/round?round=prelim\|semi\|final` | `round` (필수) | `{ ok: true, data: Contestant[] }` |

### 4.2 Write API — Apps Script `doPost`

브라우저 → 직접 Apps Script Web App. `Content-Type: text/plain` 으로 CORS preflight 회피.

| Method | Action | Request body | Response |
|---|---|---|---|
| POST | `submit` | `{ action:'submit', token, judgeId, round, entries }` | `{ ok: true, written: number }` |

### 4.3 Apps Script `doGet`

`doGet`은 의도적으로 stub(헬스체크용 `{ok:true,data:{ping:'ok'}}`)이다. 모든 GET 읽기는 §4.1 프록시가 담당한다.

### 4.1 Error Shape
```json
{ "ok": false, "error": "INVALID_TOKEN" | "JUDGE_NOT_FOUND" | "SCHEMA_ERROR" | "..." }
```

### 4.2 Apps Script Pseudocode (운영자 작성)
```javascript
const SHARED_TOKEN = PropertiesService.getScriptProperties().getProperty('TOKEN');

function doGet(e) {
  const action = e.parameter.action;
  if (action === 'judges') return json({ ok:true, data: readJudges() });
  if (action === 'event')  return json({ ok:true, data: readEvent() });
  if (action === 'round')  return json({ ok:true, data: readRound(e.parameter.round) });
  return json({ ok:false, error:'UNKNOWN_ACTION' });
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  if (body.token !== SHARED_TOKEN) return json({ ok:false, error:'INVALID_TOKEN' });
  if (body.action === 'submit') return json({ ok:true, written: writeEntries(body) });
  return json({ ok:false, error:'UNKNOWN_ACTION' });
}
```

---

## 5. Routing

| Path | Component | Purpose |
|---|---|---|
| `/` | `app/page.tsx` | HOME — 로고 + "대회목록 보기" CTA |
| `/competitions` | `app/competitions/page.tsx` | 대회 선택(다중 대회 지원, FR-11) |
| `/enter` | `app/enter/page.tsx` | 심사위원 이름 그리드 + 선택 |
| `/event` | `app/event/page.tsx` | 대회 정보 + 라운드 진입 3버튼 |
| `/round/prelim` | `app/round/[round]/page.tsx` | 예선 참가자 합/불 |
| `/round/semi` | `app/round/[round]/page.tsx` | 본선 참가자 합/불 |
| `/round/final` | `app/round/[round]/page.tsx` | 결승 참가자 점수 |

`/round/[round]`는 `round` 값으로 분기하여 PassFail UI 또는 FinalScore UI를 렌더한다.

플로우: `/` → `/competitions` (선택, localStorage `jnj.competition` 기록) → `/enter` (선택, `jnj.judge` 기록) → `/event` → `/round/{round}`.

---

## 6. State Management

### 6.1 세션 상태 (localStorage)

| Key | Type | TTL | Notes |
|---|---|---|---|
| `jnj.judge` | `{ id, name }` | 세션 | `/enter`에서 set, 모든 라운드에서 read |
| `jnj.draft.{round}.{judgeId}` | `Record<contestantId, entry>` | 24h | 입력 중 자동 저장, 반영 성공 시 삭제 |

### 6.2 컴포넌트 상태 트리
```
RoundPage
  ├── header  (judge name, round name, "반영" button)
  ├── ContestantList
  │     └── ContestantRow
  │           ├── PassFailToggle  (prelim/semi)
  │           └── ScoreInput × 3  (final)
  └── SubmitFooter (총 입력 수 / 반영 상태 토스트)
```

### 6.3 useDraft 훅 (`hooks/useDraft.ts`)
```ts
export function useDraft<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => readLS(key) ?? initial);
  useEffect(() => writeLS(key, value), [key, value]);
  const clear = () => removeLS(key);
  return { value, setValue, clear };
}
```

---

## 7. UI / Design Tokens

### 7.1 디자인 시스템 적용

`JNJ SCORE Design System/colors_and_type.css`를 `app/globals.css`에서 import. 모든 컬러·타이포·radius는 CSS 변수로만 사용 (Tailwind 미사용 — Option A의 단순함 유지).

### 7.2 Page UI Checklist

#### `/` HOME
- [ ] 풀블리드 백그라운드 (모노크롬)
- [ ] `JNJ SCORE` 워드마크 (Oswald 96px, line-height 0.90, uppercase)
- [ ] 부제 "DON'T STOP. NEVER SETTLE." 또는 "JUDGE ONLY THE DANCE."
- [ ] Primary CTA "시작" → `/enter`
- [ ] 8px grid 정렬

#### `/enter` 심사위원 입장
- [ ] H1 "SELECT JUDGE" (Oswald, uppercase)
- [ ] 심사위원 카드 그리드 (2 col mobile, 3 col tablet, 4 col desktop)
- [ ] 카드: 이름 (Helvetica medium 16px), 1.5px border, 30px radius pill
- [ ] hover: border `#707072`, bg `#E5E5E5`
- [ ] 클릭 → `localStorage` 저장 → `/event` 이동
- [ ] 시트 로드 실패 시: "Couldn't load judges. Try again." + 재시도 버튼

#### `/event` 대회 페이지
- [ ] 상단: 현재 심사위원 이름 + 로그아웃(이름 클리어) 링크
- [ ] 대회명 (Oswald 32px), 일자·장소 (caption)
- [ ] 라운드 진입 3버튼: PRELIM · SEMI · FINAL (primary pill, 풀와이드 모바일)
- [ ] 현재 라운드 강조 (`event.currentRound`와 일치하는 버튼만 black, 나머지 outlined)

#### `/round/prelim`, `/round/semi` 합/불 페이지
- [ ] 헤더: 라운드명 (uppercase), 진행률 (`5/12`)
- [ ] 참가자 행: 번호 (medium 16px) + 이름1 / 이름2 + PASS/FAIL 토글
- [ ] PASS = `#007D48` 채움, FAIL = `#D30005` outline. 미선택은 grey-300 outline
- [ ] 8px 행 간격, 1px divider
- [ ] **반영 모델: per-row 즉시 반영** (Analysis iter-1 결정). 토글 변경 직후 행 단위로 POST. 네트워크 오류 시 해당 행만 영향, 다른 입력은 유지. 결승은 §아래 단일 sticky 반영 유지.
- [ ] 반영 성공 → 행 우측에 통과/탈락 배지 + "수정" 트리거
- [ ] 반영 실패 → 토스트 "Couldn't save. Try again." + 토글 입력값/draft 유지

#### `/round/final` 점수 페이지
- [ ] 헤더: "FINAL"
- [ ] 참가자 카드: 번호 + 이름 + 3개 입력 (기본기 / 연결성 / 음악성)
- [ ] 입력: number type, 0~10 정수, 8px radius, grey-100 fill
- [ ] 합계 (자동 계산) 카드 우측 표시
- [ ] 모든 항목 미입력시 row 흐림 처리
- [ ] sticky bottom: "반영" 버튼 (모든 행에 3개 다 입력해야 활성)
- [ ] 검증 실패 (범위/빈값) → border `#D30005`

### 7.3 공통 컴포넌트 (`components/`)
- `Button.tsx` (primary / secondary)
- `Card.tsx`
- `Toast.tsx` (성공/실패)
- `LoadingSkeleton.tsx`
- `PassFailToggle.tsx`
- `ScoreInput.tsx`

---

## 8. Test Plan

### 8.1 수동 테스트 (MVP 우선)

| ID | Scenario | Expected |
|---|---|---|
| T-01 | HOME 진입 | Oswald 헤드라인, 시작 버튼 표시 |
| T-02 | `/enter` 심사위원 목록 로드 | 시트 `JUDGES.active=TRUE` 행만 카드 표시 |
| T-03 | 심사위원 클릭 | localStorage `jnj.judge` 세팅, `/event` 이동 |
| T-04 | 예선 합/불 → 반영 | 시트 해당 행/심사위원 컬럼에 TRUE/FALSE 기록 |
| T-05 | 결승 점수 입력 → 반영 | 시트에 3개 컬럼 정수 기록, 합계 = 시트 합계 |
| T-06 | 반영 중 네트워크 끊김 | 토스트 실패 + 입력값 유지 + 재시도 가능 |
| T-07 | 페이지 새로고침 (반영 전) | localStorage 드래프트 복원 |
| T-08 | 잘못된 토큰으로 POST (수동 curl) | Apps Script가 401 응답 |
| T-09 | 모바일 Chrome (Pixel) | 360px에서 카드 그리드 2col, 버튼 풀와이드 |
| T-10 | iOS Safari | 폰트·radius·sticky 정상 |

### 8.2 자동화 (선택, post-MVP)
- Playwright E2E: 입장 → 라운드 → 반영 시나리오 1개
- API contract: Apps Script 모킹 fetch로 4개 액션 응답 형태 검증

---

## 9. File Structure

```
app/
  layout.tsx                      # html 셸 + globals.css import
  globals.css                     # @import jnj design system + 기본 재정의
  page.tsx                        # HOME
  enter/page.tsx                  # 심사위원 선택
  event/page.tsx                  # 대회 페이지
  round/[round]/page.tsx          # prelim / semi / final 분기

components/
  Button.tsx
  Card.tsx
  Toast.tsx
  PassFailToggle.tsx
  ScoreInput.tsx
  LoadingSkeleton.tsx
  JudgeBadge.tsx                  # 헤더 우측 심사위원 이름

hooks/
  useDraft.ts                     # localStorage 동기화
  useJudge.ts                     # 현재 심사위원 read/clear/redirect

lib/
  apps-script.ts                  # fetch 래퍼: getJudges/getEvent/getRound/submitRound
  sheet-schema.ts                 # 타입 + 시트 스키마 매핑 상수

styles/
  colors_and_type.css             # 디자인 시스템 (복사 또는 alias)

public/
  logo.svg
  monogram.svg

.env.local
  NEXT_PUBLIC_APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
  NEXT_PUBLIC_APPS_SCRIPT_TOKEN=<현장 운영 토큰>
```

---

## 10. Security Considerations (Option A 보완)

Option A는 클라이언트에서 직접 Apps Script를 호출하므로 URL과 토큰이 번들에 노출된다. 다음 방법으로 위험을 완화한다.

| 위협 | 완화 |
|---|---|
| URL 노출 → 외부 임의 POST | Apps Script doPost에서 `body.token === SHARED_TOKEN` 검증 (방화벽 1차) |
| 토큰까지 노출 → 임의 POST | (1) 토큰을 매 대회마다 회전 (2) Apps Script가 `judgeId`를 시트의 active 심사위원과 대조 (3) 시트는 운영자만 편집 가능, doPost는 정해진 컬럼에만 쓰기 |
| CORS | Apps Script Web App은 기본적으로 모든 origin 허용 — 별도 처리 불필요 |
| 악의적 점수 조작 | 운영자가 채점 종료 후 시트 잠금 / 변경 이력 확인. 본 시스템 범위 외 |
| XSS via 시트 데이터 | React가 기본 escape — 시트 cell을 `dangerouslySetInnerHTML`로 절대 사용 금지 |

> **Note**: 더 강한 보안이 필요하면 Phase 2에서 Option C(Server Actions 프록시)로 마이그레이션. 본 MVP의 위협 모델은 "현장 신뢰 환경 + 운영자 시트 통제"를 가정한다.

### 10.1 ADR — Option A → C-lite 부분 마이그레이션 (Analysis iter-1)

**Decision**: 읽기 경로(`getJudges`/`getEvent`/`getRound`)를 Next.js Route Handler `app/api/sheet/*` 프록시로 옮긴다. 쓰기는 Apps Script `doPost` 직호출 유지.

**Why**:
- 비공개 시트 지원 — CSV export는 공개 시트에서만 동작. 운영자가 시트를 비공개로 두고 싶을 때 Apps Script `read` action 폴백이 필요 (`lib/sheet-fetch.ts`).
- CORS 견고성 — 프록시는 같은 origin이라 preflight/CORS 이슈 없음.
- Apps Script 쿼터 분산 — CSV export는 별도 쿼터, doGet 호출 절약.

**Trade-off**: Next.js 서버 콜드스타트(Vercel) 비용 발생. Apps Script `doGet`은 stub로 남고 §4.3에 명시. Option A의 "별도 서버 로직 없이" 원칙은 깨졌으나, 서버 로직은 단순 페치/파싱에 한정 — 비즈니스 로직은 여전히 Apps Script가 담당.

**Files**: `app/api/sheet/{competitions,judges,event,round}/route.ts`, `lib/sheet-fetch.ts`.

### 10.2 ADR — 동시성 모델 (Analysis iter-1)

**Decision**: 예선/본선은 "참가자별 단일 결정"(공유 컬럼 `예선통과`/`본선통과`, last-writer-wins) 모델. 결승만 심사위원별 컬럼 분리(`기본기/연결성/음악성`).

**Why**: 실제 운영에서 예선·본선은 합의된 단일 합·불이 시트에 기록되며, 다수 심사위원이 동시에 같은 참가자를 토글하더라도 마지막 입력이 곧 결정사항이 된다. 결승은 심사위원별 점수가 별도로 보존되어야 하므로 컬럼 분리.

**Trade-off**: Plan §5 위험 행 "동시 반영 시 마지막 쓰기 우선" 의 완화책 "심사위원별 행/열 분리"는 결승에만 적용. 예선/본선은 운영자 합의로 갈음.

---

## 11. Implementation Guide

### 11.1 Order

1. **Bootstrap** — Next.js 15 프로젝트 초기화, 디자인 시스템 CSS import, 환경변수 설정
2. **Lib + Types** — `lib/sheet-schema.ts`, `lib/apps-script.ts`
3. **Hooks** — `useJudge`, `useDraft`
4. **HOME (`/`) + `/enter`** — 데이터 로드 + 심사위원 선택 흐름
5. **`/event`** — 대회 정보 + 라운드 분기
6. **`/round/[round]`** — 합/불 UI(prelim/semi)
7. **`/round/final` 분기** — 점수 입력 UI
8. **반영(submit) 로직** — 토스트, 잠금/수정, 재시도
9. **Apps Script 작성·배포** — 운영자와 협업 (doGet/doPost)
10. **모바일 검증 + Vercel 배포**

### 11.2 Dependencies

```bash
npx create-next-app@latest jnj-score --typescript --app --no-tailwind --no-src-dir
# 추가 의존성: 없음 (React + Next.js 표준만 사용)
```

### 11.3 Session Guide (Module Map)

| Scope Key | Module | Files | Est. Lines |
|---|---|---|---|
| `module-1` | Foundation | `app/layout.tsx`, `app/globals.css`, `lib/sheet-schema.ts`, `lib/apps-script.ts`, `hooks/useJudge.ts`, `hooks/useDraft.ts`, `.env.local` | ~250 |
| `module-2` | HOME + Enter | `app/page.tsx`, `app/enter/page.tsx`, `components/Button.tsx`, `components/Card.tsx`, `components/LoadingSkeleton.tsx`, `components/JudgeBadge.tsx` | ~300 |
| `module-3` | Event Page | `app/event/page.tsx` | ~120 |
| `module-4` | Round Pages | `app/round/[round]/page.tsx`, `components/PassFailToggle.tsx`, `components/ScoreInput.tsx`, `components/Toast.tsx` | ~450 |
| `module-5` | Apps Script | `apps-script/Code.gs` (Google Apps Script 프로젝트 별도) | ~150 |
| `module-6` | Polish + Deploy | 모바일 검증, Vercel 환경변수, 빌드 픽스 | ~50 |

**권장 세션 분할**: M1 → M2 → M3 → M4 → M5 → M6 (각 1세션)

`/pdca do scoring-app --scope module-1` 형태로 모듈별 진행 가능.

---

## 12. Open Questions (Plan 이월)

Design 단계에서도 시트 실데이터 미확인으로 다음은 Do 직전에 운영자와 확인 필요:

- Q1. 시트 탭 이름·컬럼 정확한 형태 (현재 §3.1은 가정)
- Q2. 결승 점수 범위 (0~10 가정 — 0~100이면 Input max만 변경)
- Q3. 심사위원별 컬럼 위치 (j1, j2 ... 형태인지)
- Q4. 대회 정보 필드 정확 형태
- Q5. 반영 마감/잠금 정책 (현 단계에서는 운영자 수동 잠금으로 가정)

---

## 13. Definition of Done

- [ ] 5개 페이지 라우팅 동작
- [ ] Apps Script 4개 액션 정상 호출
- [ ] localStorage 드래프트 동작 (새로고침 후 복원)
- [ ] JNJ 디자인 토큰 적용 (Oswald 헤드라인, 모노크롬, 30px pill 버튼)
- [ ] 모바일 Chrome/Safari 검증
- [ ] 반영 실패시 데이터 유지 + 재시도
- [ ] Vercel 배포 + 환경변수 설정
- [ ] Gap Analysis Match Rate ≥ 90%
