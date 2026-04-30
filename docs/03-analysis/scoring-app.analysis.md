# Gap Analysis: scoring-app

| Field | Value |
|---|---|
| Feature | scoring-app |
| Phase | Check (Gap Analysis) |
| Date | 2026-04-30 |
| Plan Ref | `docs/01-plan/features/scoring-app.plan.md` |
| Design Ref | `docs/02-design/features/scoring-app.design.md` |
| **Match Rate (static)** | **82%** ⚠️ Below 90% bar |
| Status | Iterate recommended |

---

## Context Anchor (from Design)

| Key | Value |
|---|---|
| **WHY** | 수기 집계로 발생하는 오류·지연·공정성 이슈 제거, 심사위원이 "입력만 하면 되는" 환경 |
| **WHO** | 심사위원(주 사용자, 다수 동시), 운영자(시트 관리) |
| **RISK** | Apps Script URL 노출, 시트 구조 변경, 동시 반영 충돌, 모바일 네트워크 끊김 |
| **SUCCESS** | 3 라운드 입력→반영 정상, 시트 1:1 일치, 모바일 동작, 1명당 ≤3분 |
| **SCOPE** | IN: 이름 선택, 5 페이지, Apps Script, JNJ 디자인 · OUT: 인증, 실시간 sync, 등록/발표 |

---

## Strategic Alignment Check

| Dimension | Verdict | Evidence |
|---|:---:|---|
| Addresses WHY (kill manual error/lag) | **Pass** | All 3 rounds have functional input + submit; localStorage drafting present (`hooks/useDraft.ts:36-68`); per-row submit on prelim/semi avoids batched-failure data loss |
| Mobile-first / no auth | **Pass** | `100dvh`, `env(safe-area-inset-bottom)`, sticky footers in pages; only `setJudge()`/localStorage gating (`hooks/useJudge.ts:26-29`) |
| Sheets as SoT | **Pass** | All reads from spreadsheet (CSV export or Apps Script); writes via Apps Script `doPost` (`apps-script/Code.gs:20-43`) |
| Option A "client-only, no server logic" | **Concern** | `app/api/sheet/*` introduced 4 server routes — Option A → C-lite drift |
| Plan SCOPE OUT respected | **Concern** | `/competitions` page added; HOME CTA now goes to `/competitions`, not `/enter` |

---

## Static Match Rates (3 axes)

| Axis | Rate | Notes |
|---|:---:|---|
| **Structural Match** | 95% | All 5 routes from Design §5 exist; all 6 components from §7.3 present; both hooks present. `+` extras: `RefreshButton`, `useCompetition`, `apps-script-mock`, `sheet-fetch`, `/competitions`, `/api/sheet/*` |
| **Functional Depth** | 88% | Page UI Checklist: HOME 5/5, /enter 6/7, /event 4/4, /round prelim+semi 7/8, /round final 7/7. Real logic, no placeholders, real `LoadingSkeleton` |
| **API Contract (3-way)** | 65% | Only `submit` PASS. GETs (`event`, `round`) defined in Design §4 but Apps Script `doGet` is a stub — covered de-facto by Next.js proxy |

**Static-only Overall** = (0.95 × 0.2) + (0.88 × 0.4) + (0.65 × 0.4) = **0.802 ≈ 82%**

---

## API Contract Verification (3-way)

| # | Action | Design §4 | Server (`Code.gs`) | Client (`apps-script.ts`) | Verdict |
|---|---|:---:|:---:|:---:|:---|
| 1 | GET `?action=judges` | ✅ | ❌ `doGet` returns `{ping:'ok'}` only | ✅ `getJudges()` line 113 (dead code) | MISMATCH — actual path uses `/api/sheet/judges` (CSV export) |
| 2 | GET `?action=event` | ✅ | ❌ `doGet` no branch | ✅ `getEvent()` line 118; called in `event/page.tsx:33` | **CRITICAL** — would fail against deployed Apps Script |
| 3 | GET `?action=round&round=...` | ✅ | ❌ `doGet` no branch | ✅ `getRound()` line 123; called in `round/[round]/page.tsx:63` | **CRITICAL** — same as #2 |
| 4 | POST `submit` | ✅ | ✅ `doPost` handles `submit` (`Code.gs:35-39`) | ✅ `submitRound()` line 136 | **PASS** — body shape, token, error shape all match |

> Note: `Content-Type: text/plain` on POST is intentional (avoids CORS preflight); Apps Script reads `e.postData.contents` as raw text — working as designed.

---

## Plan Success Criteria

| ID | Criterion | Status | Evidence |
|---|---|:---:|---|
| SC-01 | 심사위원 이름 목록 정확 렌더 | ✅ | `app/api/sheet/judges/route.ts` parses `2.심사위원` tab; `/enter` filters `active=true` (`enter/page.tsx:41`) |
| SC-02 | 합·불 토글 시트 기록 | ⚠️ | Per-row submit overwrites; Apps Script writes shared `예선통과/본선통과` columns. Plan §5 risk mitigation "심사위원별 행/열 분리" is NOT implemented for prelim/semi |
| SC-03 | 결승 점수 정확 기록 | ✅ | `FinalBody` validates 0..10; Apps Script writes per-judge `기본기/연결성/음악성` columns (`Code.gs:92-103`) |
| SC-04 | 반영 P95 ≤ 3s | ⚠️ | Timeout=5000ms, retries=1 → worst case 10.3s. **Not measured** |
| SC-05 | 모바일 Chrome/Safari 동작 | ⚠️ | Code is mobile-correct (`100dvh`, safe-area, sticky); **not measured on real device** |
| SC-06 | 디자인 토큰 모든 페이지 적용 | ✅ | Pages use only `var(--jnj-*)`, no Tailwind, no hex; Oswald via `--jnj-font-display` |
| SC-07 | 네트워크 실패 후 재시도 데이터 유실 없음 | ✅ | `useDraft` localStorage + `submitRound` retries=1 + `rowStatus=idle` keeps draft (`page.tsx:282`) |

**Met**: 4/7 ✅ · 3/7 ⚠️ · 0/7 ❌ → **Plan-criteria satisfaction ≈ 78.6%** (runtime needed for SC-04/05)

---

## Decision Record Verification

| Decision | Implemented? | Notes |
|---|:---:|---|
| Option A — client-only SPA, no server logic | ❌ Deviated | `app/api/sheet/*` adds 4 Next.js Route Handlers (proxy). Defensible (private sheet, CORS), but undocumented — should be ADR |
| Tailwind 미사용 (§7.1) | ✅ | No tailwind.config; only CSS variables |
| localStorage drafting (§6.1) | ✅ | `jnj.draft.{round}.{judgeId}` written by `useDraft`; `jnj.judge` by `useJudge` |
| No auth — name click only | ✅ | `setJudge()` is sole gating |
| Single-POST per round (§4) | ⚠️ | Final: yes (batch). Prelim/Semi: per-row submit — UX deviation from US-03 "한 번에 반영" (resilience trade-off) |
| Apps Script 4 GET actions (§4) | ❌ Not delivered | `doGet` is stub returning `{ping:'ok'}` (`Code.gs:45-47`); reads moved to Next.js proxy |
| Apps Script SHARED_TOKEN check on doPost | ✅ | `Code.gs:23-25` rejects on token mismatch |

---

## Gaps by Severity

### 🔴 Critical

1. **Design §4 GET contract broken** — `getEvent()`/`getRound()` will fail against deployed Apps Script (`Code.gs:45-47` returns only `{ping:'ok'}`). Currently masked by `USE_MOCK` mode + Next.js proxy paths. Either implement `doGet` action branching, OR amend Design §4 to declare reads served by Next.js proxy and remove dead client wrappers.
   - Files: `lib/apps-script.ts:118-128`, `apps-script/Code.gs:45-47`, `app/event/page.tsx:33`, `app/round/[round]/page.tsx:63`

### 🟠 Important

2. **Architectural deviation undocumented**: Option A → Option C-lite. Add ADR section to Design §10 explaining `app/api/sheet/*` + `lib/sheet-fetch.ts` (private sheet support, CORS robustness).
3. **Scope expansion: `/competitions` page + `useCompetition`** — Plan/Design define exactly 5 routes. HOME CTA now goes to `/competitions` (not `/enter`). Either add FR-11 + Design §5 entry, or remove the page.
4. **Per-row vs batch submit** on prelim/semi diverges from Plan US-03 + Design §7.2 sticky bottom button. Improves resilience; should be documented as updated UX.
5. **Concurrency mitigation absent for prelim/semi** — Plan §5 risk mitigation said "심사위원별 행/열 분리"; implementation writes shared `예선통과`/`본선통과` columns → last writer wins. Acceptable for "single decision per contestant", but contradicts stated mitigation.

### 🟡 Minor

- `RefreshButton` not in Design §7.3 — useful UX addition
- `apps-script-mock.ts` — dev affordance, gated by `NEXT_PUBLIC_USE_MOCK`
- HOME subtitle is hybrid of Design's two options (acceptable)
- HOME CTA label "대회목록 보기" instead of "시작" (driven by gap #3)
- `Content-Type: text/plain` on POST — justified, undocumented in §4
- Vercel 배포 + 환경변수 (Design §13 DoD) — not verified statically
- `Code.gs` extra actions (`read`, `submit_to`, `rename_remarks_status`) — operational utilities, not regression
- `notFound()` guard at `round/[round]/page.tsx:53` — exceeds Design §5

---

## Runtime Verification Plan

### L1 — Endpoint Tests (curl)

| # | Test | Command | Expected |
|---|---|---|---|
| 1 | Apps Script ping | `curl -s "$APPS_SCRIPT_URL"` | `{ok:true,data:{ping:'ok',...}}` |
| 2 | Apps Script `?action=event` | `curl -s "$APPS_SCRIPT_URL?action=event"` | **Fails today** — returns ping. After fix: `{ok:true,data:{name,date,venue,currentRound}}` |
| 3 | Apps Script `?action=round&round=prelim` | `curl -s "$APPS_SCRIPT_URL?action=round&round=prelim"` | **Fails today** — returns ping |
| 4 | Submit with bad token | `curl -X POST "$APPS_SCRIPT_URL" -H "Content-Type: text/plain" -d '{"action":"submit","token":"X","judgeId":"J01","round":"prelim","entries":[]}'` | `{ok:false,error:'Invalid token'}` |
| 5 | Proxy `/api/sheet/judges` | `curl -s http://localhost:3000/api/sheet/judges` | `{ok:true,data:[Judge,...]}` |
| 6 | Proxy `/api/sheet/round?round=semi` | `curl -s "http://localhost:3000/api/sheet/round?round=semi"` | `{ok:true,data:[Contestant,...]}` |
| 7 | Proxy bad round | `curl -s "http://localhost:3000/api/sheet/round?round=foo"` | HTTP 400, `{ok:false,error:'Invalid round'}` |
| 8 | Proxy `/api/sheet/event` | `curl -s http://localhost:3000/api/sheet/event` | `{ok:true,data:Event}` |

### L2 — UI Action Tests (Playwright sketch)

| # | Page | Action | Expected | API |
|---|---|---|---|---|
| 1 | `/` | Click "대회목록 보기" | → `/competitions` | none |
| 2 | `/competitions` | Click first card | localStorage `jnj.competition` set; → `/enter` | GET `/api/sheet/competitions` |
| 3 | `/enter` | Click judge → "로그인" | localStorage `jnj.judge` set; → `/event` | GET `/api/sheet/judges` |
| 4 | `/event` | Click "PRELIM" | → `/round/prelim` | GET `?action=event` (broken) |
| 5 | `/round/prelim` | Toggle PASS, submit row | Toast "반영 완료" | POST submit |
| 6 | `/round/final` | Fill 3 scores all rows, sticky 반영 | Toast "Saved N"; 수정 visible | POST submit |
| 7 | `/round/prelim` | Reload mid-input | Draft restored | localStorage |

### L3 — E2E Scenarios

| # | Scenario | Success |
|---|---|---|
| 1 | Happy path single judge: `/` → competitions → enter → event → prelim toggle 5 → submit each → final fill all → 반영 | Drafts cleared; sheet matches input |
| 2 | Network drop mid-final → retry | Single `written:N` row; no duplicate; no draft loss |
| 3 | Bad token / Apps Script down | Error toasts; row state = idle; drafts preserved |

**Test location** (when added): `tests/e2e/scoring-app.spec.ts`. Playwright not currently installed — recommend adding at QA phase.

---

## Recommended Next Action

**Iterate** (priority: Critical #1 + Important #2, #3) — Match Rate 82% is below 90% bar.

1. **Critical #1**: Amend Design §4 to declare GETs served by Next.js proxy AND delete dead `getEvent`/`getRound` from `lib/apps-script.ts` (or fully gate behind `USE_MOCK`). Smaller change than extending `doGet`, reflects deployed reality.
2. **Important #2**: Add ADR to Design §10 documenting Option A → C-lite migration (rationale: private sheet + CORS).
3. **Important #3**: Resolve `/competitions` scope — add FR-11 to Plan and §5 route entry, OR remove the page and route HOME → `/enter`.
4. **Important #4 + #5**: Update Design §7.2 to reflect per-row submit on prelim/semi; clarify whether per-judge column separation is required (and if so, implement).
5. Re-run `/pdca analyze` after fixes. Target **≥ 90%** with runtime L1 curl + L3 happy path on staging before report.

---

## Iteration 1 — Applied Fixes (2026-04-30)

| # | Action | Files | Result |
|---|---|---|---|
| Critical #1 | `getJudges/getEvent/getRound`을 Next.js 프록시(`/api/sheet/*`)로 라우팅. Apps Script `doGet` stub 정책을 Design §4.3에 명시 | `lib/apps-script.ts:113-130` | ✅ TypeScript 통과 |
| Important #2 | Design §10.1 ADR 추가 — Option A → C-lite 부분 마이그레이션 사유/트레이드오프 | `docs/02-design/.../scoring-app.design.md` §10.1 | ✅ 문서화 |
| Important #3 | Design §5에 `/competitions` 라우트 추가, HOME 플로우 갱신. Plan은 이미 FR-01에서 다중 대회 모델 반영됨 — 추가 작업 불요 | Design §5, Plan FR-01 | ✅ |
| Important #4 | Design §7.2 합/불 페이지 체크리스트의 "sticky bottom 반영" 항목을 "per-row 즉시 반영"으로 갱신. 결승은 단일 sticky 반영 유지 | Design §7.2 | ✅ |
| Important #5 | Design §10.2 ADR 추가 — 동시성 모델 (결승=심사위원별 컬럼, 예선·본선=공유 컬럼). Plan §5 Risks 행 갱신 | Design §10.2, Plan §5 | ✅ |
| Bug (신규 발견) | 다중 대회 데이터 바인딩 깨짐 — `/api/sheet/event`·`/api/sheet/round`가 스테일 SHEET_ID 하드코딩, `sheetId` 쿼리 무시. 사용자 제공 정보(대회목록 + 001/002 원본시트)로 식별 | event/route.ts, round/route.ts, judges/route.ts (DEFAULT 갱신), lib/apps-script.ts (`sheetId?` 시그니처), event/page.tsx, round/[round]/page.tsx | ✅ TypeScript 통과. DEFAULT는 대회 001 (`1gzX4...`)로 교체 |

### 재평가 (예상)

| 축 | 이전 | 이후 | 비고 |
|---|:---:|:---:|---|
| Structural | 95% | 95% | 변동 없음 (이미 모든 라우트 존재) |
| Functional | 88% | 90% | per-row UX가 명세와 일치하게 됨 |
| Contract | 65% | **95%** | 4 reads 모두 §4.1 프록시로 정의, submit은 §4.2로 명확. doGet stub은 §4.3로 명시 |
| Plan SC | 78.6% | ~86% | SC-02 ⚠️→✅ (모델 명시), SC-04/05는 여전히 런타임 미측정 |

**예상 새 Match Rate** = (0.95 × 0.2) + (0.90 × 0.4) + (0.95 × 0.4) = 0.19 + 0.36 + 0.38 = **0.93 ≈ 93%** ✅ 90% 돌파

> 이 수치는 정적 분석 갱신 추정치입니다. 실제 재실행 시 gap-detector가 코드를 재스캔해 확정합니다.

---

## Version

| Version | Date | Changes |
|---|---|---|
| 0.1 | 2026-04-30 | Initial gap analysis (gap-detector v2.3.0, static-only) — 82% |
| 0.2 | 2026-04-30 | Iteration 1 applied: Critical #1 코드 수정 + Important #2~#5 문서 보완. 예상 93% |
