# Plan: 젝앤질 대회 채점 앱 (scoring-app)

| Field | Value |
|---|---|
| Feature | scoring-app |
| Created | 2026-04-29 |
| Author | bandnara123@gmail.com |
| Phase | Plan |
| Level | Dynamic (Next.js + 외부 데이터 백엔드) |

---

## Executive Summary

| 관점 | 내용 |
|---|---|
| **Problem** | 댄스 컴페티션(젝앤질) 현장에서 번호 배정·파트너 매칭·심사 집계가 수작업으로 처리되어 인적 오류, 운영 시간 증가, 심사 공정성 이슈가 반복된다. |
| **Solution** | 심사위원이 자기 이름을 선택해 입장하고 예선/본선(합·불) · 결승(기본기/연결성/음악성 점수)을 입력 후 "반영" 버튼으로 Google Apps Script Web App에 일괄 전송하는 Next.js 15 웹 앱. |
| **Function/UX Effect** | 종이/엑셀 왕복 없이 모바일·태블릿에서 즉시 입력 → Google Sheets 자동 집계. JNJ SCORE 디자인 시스템(모노크롬 + Oswald 헤드라인)으로 현장 가독성 확보. |
| **Core Value** | 심사 입력 시간 단축(목표 -50%), 전사 오류 0건, 라운드 결과 즉시 가시화 — "입력만 하면 끝." |

---

## Context Anchor

| Key | Value |
|---|---|
| **WHY** | 수기 집계로 발생하는 오류·지연·공정성 이슈를 제거하고, 심사위원이 "입력만 하면 되는" 환경 제공 |
| **WHO** | 심사위원(주 사용자, 다수 동시 사용), 운영자(시트 관리, 결과 확인) |
| **RISK** | Apps Script 엔드포인트 노출(누구나 POST 가능), 시트 ID/구조 변경 시 전체 영향, 동시 반영 충돌, 모바일 네트워크 끊김 |
| **SUCCESS** | (1) 3개 라운드 전 페이지에서 입력→반영 정상 동작, (2) 시트 데이터와 1:1 일치, (3) Vercel 배포 후 모바일 Safari/Chrome에서 동작, (4) 심사위원 1명 입력 ≤ 3분 |
| **SCOPE** | IN: 이름 선택 입장, 대회 페이지, 예선/본선/결승 페이지, Apps Script 연동, 모노크롬 UI · OUT: 인증/권한, 실시간 동기화, 참가자 등록, 결과 발표 화면 |

---

## 1. Requirements

### 1.1 Functional Requirements

| ID | Requirement | Priority |
|---|---|:---:|
| FR-00 | HOME 페이지에서 시작을 눌러버튼을 표시한다  버튼을 누르면 대회페이지로 이동한다.| P0 |
| FR-01 | 대회 페이지에서 대회시트의 대회정보목록을 불러와 리스트 형태로 표시한다 | P0 |
| FR-02 | 심사위원이 자기 이름을 선택하면 세션(localStorage)에 저장 후 대회 페이지로 이동한다 | P0 |
| FR-03 | 대회 페이지에 대회 정보(대회명·일자·장소 등)를 시트에서 읽어 표시하고 예선/본선/결승 진입 버튼을 제공한다 | P0 |
| FR-04 | 예선 페이지에서 예선 참가자 목록을 표시하고 각 참가자에 대해 [합격/불합격] 토글을 제공한다 | P0 |
| FR-05 | 본선 페이지에서 본선 참가자 목록을 표시하고 각 참가자에 대해 [합격/불합격] 토글을 제공한다 | P0 |
| FR-06 | 결승 페이지에서 결승 참가자 목록을 표시하고 각 참가자에 대해 기본기/연결성/음악성 점수를 입력받는다 | P0 |
| FR-07 | 각 라운드 페이지 하단의 "반영" 버튼 클릭 시 입력 전체를 Apps Script Web App에 단일 POST로 전송하고 성공/실패 토스트를 표시한다 | P0 |
| FR-08 | 반영 후 입력값을 잠금/표시(읽기 전용) 상태로 전환하고, "수정" 버튼으로 재편집 가능 | P1 |
| FR-09 | 입력 중 페이지 이탈 시 경고 (`beforeunload`) 또는 localStorage drafting | P1 |
| FR-10 | JNJ SCORE Design System 토큰(색·타이포·radius)을 모든 화면에 일관 적용 | P0 |

### 1.2 Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-01 | 모바일/태블릿 우선(360px~1024px). 데스크톱(1440px) 보조 |
| NFR-02 | 반영 요청 P95 ≤ 3초 (Apps Script 응답 포함) |
| NFR-03 | 오프라인/네트워크 끊김 시 입력값 유실 없음 (localStorage 백업) |
| NFR-04 | 빌드/배포: Vercel + Next.js 15 App Router, TypeScript strict |
| NFR-05 | 시트 ID·Apps Script URL은 `.env.local` / Vercel env로만 관리 (코드 하드코딩 금지) |
| NFR-06 | Lighthouse Accessibility ≥ 90 (모노크롬 대비비 확보) |

### 1.3 Out of Scope

- 심사위원 인증/로그인 (이름 클릭만으로 입장 — 사용자 명시 결정)
- 실시간 동기화 / 타 심사위원 진행상황 표시
- 참가자 등록·번호 배정 워크플로우 (시트에서 사전 등록)
- 결과 발표/순위 화면
- 관리자 대시보드

---

## 2. User Stories

| ID | Story |
|---|---|
| US-01 | 심사위원으로서, HOME에서 내 이름을 클릭해 별도 로그인 절차 없이 바로 입장하고 싶다. |
| US-02 | 심사위원으로서, 대회 페이지에서 진행 중인 라운드를 한눈에 보고 해당 라운드로 이동하고 싶다. |
| US-03 | 심사위원으로서, 예선/본선에서 참가자별 합·불 체크를 빠르게 토글하고 한 번에 반영하고 싶다. |
| US-04 | 심사위원으로서, 결승에서 기본기/연결성/음악성 3개 항목을 점수로 입력하고 합계를 즉시 확인하고 싶다. |
| US-05 | 심사위원으로서, 반영 실패 시 입력값이 사라지지 않고 재시도할 수 있어야 한다. |

---

## 3. Success Criteria

| ID | Criterion | Verification |
|---|---|---|
| SC-01 | HOME에서 시트의 심사위원 이름 목록이 정확히 렌더된다 | UI 비교 (시트 vs 화면) |
| SC-02 | 예선/본선 합·불 토글 결과가 시트의 해당 행/열에 정확히 기록된다 | E2E: 토글 → 반영 → 시트 확인 |
| SC-03 | 결승 점수(0~10 또는 0~100 정수, 최종 시트 컬럼과 일치)가 정확히 기록된다 | E2E: 점수 입력 → 반영 → 시트 확인 |
| SC-04 | 반영 P95 ≤ 3초 | DevTools Network 측정 |
| SC-05 | 모바일 Chrome/Safari에서 모든 페이지 정상 동작 | 실기기 테스트 |
| SC-06 | JNJ SCORE 디자인 토큰(색·radius·타이포) 모든 페이지 적용 | 시각 회귀 + 디자인 리뷰 |
| SC-07 | 네트워크 실패 후 재시도 시 데이터 유실 없음 | 비행기 모드 토글 시나리오 |

---

## 4. Architecture Decisions (high-level)

> 상세 옵션 비교는 Design 단계에서 수행. 여기서는 사용자 결정사항을 고정한다.

| 영역 | 결정 | 근거 |
|---|---|---|
| 인증 | **없음** — 이름 클릭만 | 사용자 명시: "이름만 선택 (인증 없음)" |
| 데이터 백엔드 | **Google Apps Script Web App (doGet/doPost webhook)** | 사용자 명시. 별도 서버 자격증명 불필요, 시트 소유자가 통제 |
| 동시성 | **로컬 입력 + "반영" 단일 POST** | 사용자 명시. Apps Script rate limit·충돌 최소화 |
| 클라이언트 | Next.js 15 App Router · React 19 · TypeScript 5.3 | 설명.txt 명시 |
| 스타일 | JNJ SCORE Design System (`colors_and_type.css`) + Tailwind 또는 CSS Modules (Design 단계 결정) | 설명.txt 디자인 참고 폴더 |
| 배포 | Vercel | 설명.txt 명시 |

---

## 5. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|---|:---:|:---:|---|
| Apps Script URL 노출 → 임의 POST | High | Med | URL을 환경변수로만 보관, 요청 본문에 공유 시크릿(token) 포함, Apps Script에서 검증 |
| 시트 컬럼/시트명 변경 시 앱 깨짐 | High | Med | 시트 구조를 Design §3 데이터 모델에 명세, 컬럼 매핑을 한 파일에 집중(`lib/sheet-schema.ts`) |
| 동시 반영 시 마지막 쓰기 우선 → 다른 심사위원 입력 덮어씀 | High | Med | 결승은 심사위원별 컬럼 분리(`기본기/연결성/음악성` × 심사위원). 예선/본선은 합의된 단일 합·불 모델(공유 컬럼 `예선통과`/`본선통과`)로 운영자 합의 기반 — Design §10.2 ADR 참고 (Analysis iter-1) |
| 모바일 네트워크 끊김 → 반영 실패 | Med | High | localStorage drafting + 자동 재시도(지수 백오프) + 명확한 실패 토스트 |
| Apps Script 응답 지연(쿼터/실행 시간) | Med | Med | 응답 5초 타임아웃 + 재시도 1회, 사용자에 진행 인디케이터 |
| 점수 입력 오타(잘못된 범위) | Med | Med | 0~max 정수 클라이언트 검증 + 시각적 invalid 상태 |

---

## 6. Open Questions for Design Phase

다음 항목은 Design 단계에서 시트 실데이터 확인 후 확정한다.

- Q1. 시트 탭 구조 — 심사위원 목록 탭, 대회정보 탭, 예선/본선/결승 참가자 탭이 각각 존재하는가? 현재 시트 구조 캡처 필요
- Q2. 결승 점수 범위 — 0~10 / 0~100 / 1~5 중 어느 것? 항목별 가중치는?
- Q3. 합격/불합격 기록 위치 — 심사위원별 컬럼? 한 컬럼에 누적?
- Q4. 대회 정보 필드 (대회명/일자/장소/회차 등)
- Q5. 라운드별 "반영 마감 시간" 또는 잠금 정책 존재 여부
- Q6. Tailwind 도입 여부 vs CSS Modules + 디자인 시스템 CSS 변수 직접 사용

---

## 7. Milestones

| # | Milestone | Owner | Phase |
|---|---|---|---|
| M1 | Plan 승인 | User | Plan ✅ |
| M2 | 시트 구조 분석 + 3-옵션 아키텍처 비교 + Design 확정 | Claude | Design |
| M3 | Apps Script Web App 작성·배포 (doGet: 마스터 데이터, doPost: 채점 반영) | User + Claude | Do |
| M4 | Next.js 페이지 5종 구현 + 디자인 토큰 통합 | Claude | Do |
| M5 | Gap 분석 ≥ 90% + 모바일 실기기 검증 | Claude | Check |
| M6 | Vercel 배포 + 운영자 매뉴얼 | User | Done |

---

## 8. References

- 설명.txt (요구사항 원본)
- Google Sheets 원본: `1DkSXHxjFS6nu06Kc_YRvvMAAeK86F5pjZkFESx8hWn8`
- `JNJ SCORE Design System/README.md` (디자인 토큰·보이스·아이코노그래피)
- `JNJ SCORE Design System/colors_and_type.css` (CSS 변수)
- Next.js 15 App Router 공식 문서
- Google Apps Script Web Apps 공식 문서
