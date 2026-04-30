// Design Ref: §5 routing — single dynamic route, branches by `round`.
// Plan SC-02 (pass/fail records), SC-03 (final scores), SC-04 (P95 ≤ 3s),
// SC-07 (network-failure resilience via localStorage drafts).

'use client';

import { notFound, useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { JudgeBadge } from '../../../components/JudgeBadge';
import { LoadingSkeleton } from '../../../components/LoadingSkeleton';
import { RefreshButton } from '../../../components/RefreshButton';
import {
  PassFailToggle,
  type RowStatus,
} from '../../../components/PassFailToggle';
import { ScoreInput, isValidScore } from '../../../components/ScoreInput';
import { ToastViewport, useToasts } from '../../../components/Toast';
import { useCompetition } from '../../../hooks/useCompetition';
import { useDraft } from '../../../hooks/useDraft';
import { useJudge } from '../../../hooks/useJudge';
import {
  AppsScriptError,
  getRound,
  submitRound,
} from '../../../lib/apps-script';
import {
  FINAL_SCORE_MAX,
  ROUND_LABEL,
  ROUND_STATUS_LABEL,
  ROUNDS,
  type Contestant,
  type FinalEntry,
  type PassFailEntry,
  type Round,
  type RoundStatus,
  totalFinalScore,
} from '../../../lib/sheet-schema';

type Loaded =
  | { kind: 'loading' }
  | { kind: 'ready'; contestants: Contestant[] }
  | { kind: 'error'; message: string };

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'locked' };

export default function RoundPage() {
  const params = useParams<{ round: string }>();
  const router = useRouter();
  const round = params.round as Round;

  if (!ROUNDS.includes(round)) notFound();

  const { judge, hydrated } = useJudge({ requireJudge: true });
  const { competition, hydrated: compHydrated } = useCompetition({
    requireSelection: true,
  });
  const [loaded, setLoaded] = useState<Loaded>({ kind: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!hydrated || !compHydrated || !judge) return;
    let cancelled = false;
    setLoaded({ kind: 'loading' });
    getRound(round, competition?.masterFileId, judge?.id)
      .then((cs) => {
        if (cancelled) return;
        setLoaded({ kind: 'ready', contestants: cs });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoaded({ kind: 'error', message: errorMessage(err) });
      });
    return () => {
      cancelled = true;
    };
  }, [hydrated, compHydrated, judge, round, competition?.masterFileId, reloadKey]);

  return (
    <main
      style={{
        minHeight: '100dvh',
        padding: 'var(--jnj-space-5) var(--jnj-space-4) calc(var(--jnj-space-10) + env(safe-area-inset-bottom, 0px))',
        maxWidth: 720,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--jnj-space-5)',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--jnj-space-3)',
        }}
      >
        <button
          type="button"
          onClick={() => router.push('/event')}
          style={{
            appearance: 'none',
            background: 'transparent',
            border: 'none',
            padding: 0,
            color: 'var(--jnj-text-secondary)',
            fontFamily: 'var(--jnj-font-text-medium)',
            fontSize: 'var(--jnj-size-link-sm)',
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--jnj-space-2)' }}>
          <RefreshButton
            loading={loaded.kind === 'loading'}
            onClick={() => {
              // Discard local draft so the refresh re-seeds VOTE state from
              // the sheet (O → ON / X → OFF for the logged-in judge).
              if (judge && (round === 'prelim' || round === 'semi')) {
                try {
                  window.localStorage.removeItem(
                    `jnj.draft.${round}.${judge.id}`,
                  );
                } catch {
                  // ignore — quota / disabled storage
                }
              } else if (judge && round === 'final') {
                try {
                  window.localStorage.removeItem(
                    `jnj.draft.final.${judge.id}`,
                  );
                } catch {
                  // ignore
                }
              }
              setReloadKey((k) => k + 1);
            }}
          />
          <button
            type="button"
            onClick={() => router.push('/competitions')}
            aria-label="대회 목록으로 이동"
            style={{
              appearance: 'none',
              cursor: 'pointer',
              background: 'transparent',
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: 'var(--jnj-grey-300)',
              borderRadius: 'var(--jnj-radius-pill)',
              padding: 'var(--jnj-space-1) var(--jnj-space-3)',
              fontFamily: 'var(--jnj-font-text-medium)',
              fontSize: 'var(--jnj-size-link-sm)',
              color: 'var(--jnj-text-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'var(--jnj-transition)',
            }}
          >
            <span aria-hidden style={{ fontSize: 14, lineHeight: 1 }}>
              ☰
            </span>
            대회목록
          </button>
          <JudgeBadge />
        </div>
      </header>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--jnj-space-2)' }}>
        <span
          className="jnj-small"
          style={{ color: 'var(--jnj-text-secondary)', letterSpacing: '0.08em' }}
        >
          ROUND
        </span>
        <h1
          style={{
            fontFamily: 'var(--jnj-font-display)',
            fontSize: 'clamp(40px, 11vw, 88px)',
            fontWeight: 500,
            lineHeight: 0.9,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          {ROUND_LABEL[round]}
        </h1>
      </section>

      {loaded.kind === 'loading' && <LoadingSkeleton count={5} height={72} />}
      {loaded.kind === 'error' && (
        <ErrorBlock
          message={loaded.message}
          onRetry={() => setReloadKey((k) => k + 1)}
        />
      )}
      {loaded.kind === 'ready' && judge && (
        <RoundBody
          round={round}
          contestants={loaded.contestants}
          judgeId={judge.id}
          sheetId={competition?.masterFileId}
          maxPrelimVotes={judge.maxPrelimVotes}
          maxSemiVotes={judge.maxSemiVotes}
        />
      )}
    </main>
  );
}

function RoundBody({
  round,
  contestants,
  judgeId,
  sheetId,
  maxPrelimVotes,
  maxSemiVotes,
}: {
  round: Round;
  contestants: Contestant[];
  judgeId: string;
  sheetId?: string;
  maxPrelimVotes?: number;
  maxSemiVotes?: number;
}) {
  const toastApi = useToasts();
  if (round === 'final') {
    return (
      <FinalBody
        contestants={contestants}
        judgeId={judgeId}
        sheetId={sheetId}
        {...toastApi}
      />
    );
  }
  const maxVotes = round === 'prelim' ? maxPrelimVotes : maxSemiVotes;
  return (
    <PassFailBody
      round={round}
      contestants={contestants}
      judgeId={judgeId}
      sheetId={sheetId}
      maxVotes={maxVotes}
      {...toastApi}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pass/Fail (prelim, semi)
// ─────────────────────────────────────────────────────────────────────────────

// 'absent' is a sheet-side status only — judges set pass/fail via UI; absent
// (Non) is recorded externally and shown via the read-only StatusBadge.
type Verdict = 'pass' | 'fail';
type PassFailDraft = Record<string, Verdict | null>;

function PassFailBody({
  round,
  contestants,
  judgeId,
  sheetId,
  maxVotes,
  toasts,
  push,
  dismiss,
}: {
  round: Exclude<Round, 'final'>;
  contestants: Contestant[];
  judgeId: string;
  sheetId?: string;
  maxVotes?: number;
  toasts: ReturnType<typeof useToasts>['toasts'];
  push: ReturnType<typeof useToasts>['push'];
  dismiss: ReturnType<typeof useToasts>['dismiss'];
}) {
  const draftKey = `jnj.draft.${round}.${judgeId}`;
  const initial: PassFailDraft = useMemo(() => {
    const o: PassFailDraft = {};
    // Prefill from sheet outcome; READY/null = no toggle preselected.
    for (const c of contestants) {
      o[c.id] = outcomeToVerdict(c.outcome);
    }
    return o;
  }, [contestants]);
  const { value: draft, setValue: setDraft, clear } = useDraft<PassFailDraft>(
    draftKey,
    initial,
  );
  // Single batch submit — one 반영 button at the bottom for all rows.
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: 'idle' });
  const locked = submitState.kind === 'locked';
  const submitting = submitState.kind === 'submitting';

  // Ensure every contestant has a verdict — if missing or null (e.g. stale
  // localStorage from before the 'fail' default was added), seed from sheet
  // outcome (READY → 'fail').
  useEffect(() => {
    setDraft((cur) => {
      const next: PassFailDraft = { ...cur };
      let changed = false;
      for (const c of contestants) {
        if (next[c.id] == null) {
          next[c.id] = outcomeToVerdict(c.outcome);
          changed = true;
        }
      }
      return changed ? next : cur;
    });
  }, [contestants, setDraft]);

  const total = contestants.length;
  const votableContestants = useMemo(
    () => contestants.filter((c) => c.outcome !== 'absent'),
    [contestants],
  );
  const voteOnCount = useMemo(
    () =>
      votableContestants.filter((c) => draft[c.id] === 'pass').length,
    [votableContestants, draft],
  );
  // Vote-cap accounting. When `maxVotes` is undefined (legacy judge in
  // localStorage), treat as unlimited — Infinity remaining, gating disabled.
  const cap = typeof maxVotes === 'number' ? maxVotes : Infinity;
  const remaining = cap - voteOnCount;
  const capExhausted = remaining <= 0 && Number.isFinite(cap);

  function handleVoteChange(c: Contestant, next: Verdict | null) {
    const current = draft[c.id] ?? null;
    // Block ON when cap reached. OFF→ON only allowed when remaining > 0.
    if (
      next === 'pass' &&
      current !== 'pass' &&
      Number.isFinite(cap) &&
      voteOnCount >= cap
    ) {
      push(
        'error',
        `투표 한도(${cap}) 초과 — 다른 참가자의 VOTE를 OFF로 돌린 뒤 다시 시도하세요.`,
      );
      return;
    }
    setDraft((cur) => ({ ...cur, [c.id]: next }));
  }

  function handleSubmit() {
    const entries: (PassFailEntry & { pass: boolean })[] = [];
    for (const c of votableContestants) {
      const val = draft[c.id] ?? 'fail';
      // Send both `status` (new) and `pass` (legacy) for Apps Script back-compat.
      entries.push({
        contestantId: c.id,
        status: val,
        pass: val === 'pass',
      });
    }
    if (entries.length === 0) {
      push('error', '반영할 참가자가 없습니다.');
      return;
    }
    setSubmitState({ kind: 'submitting' });
    submitRound({ judgeId, round, entries }, sheetId)
      .then((res) => {
        setSubmitState({ kind: 'locked' });
        push('success', `Saved ${res.written}.`);
        clear();
      })
      .catch((err) => {
        setSubmitState({ kind: 'idle' });
        push('error', errorMessage(err));
      });
  }

  return (
    <>
      <VoteCounter
        used={voteOnCount}
        cap={cap}
        round={round}
      />
      <ProgressLine done={voteOnCount} total={total} />

      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--jnj-space-2)',
        }}
      >
        {contestants.map((c, i) => {
          const verdict = draft[c.id];
          const isAbsent = c.outcome === 'absent';
          // While locked (post-submit), reflect the just-submitted verdict in
          // the badge instead of the stale sheet snapshot from page load.
          const displayedStatus: RoundStatus =
            locked && verdict
              ? verdict
              : c.outcome ?? 'ready';
          const rowStatus: RowStatus = locked
            ? 'saved'
            : submitting
              ? 'submitting'
              : 'idle';
          return (
            <li
              key={c.id}
              style={{
                padding: 'var(--jnj-space-3) 0',
                borderTop:
                  i === 0 ? 'none' : '1px solid var(--jnj-grey-200)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--jnj-space-3)',
                opacity: isAbsent ? 0.45 : locked ? 0.7 : 1,
                pointerEvents: isAbsent ? 'none' : 'auto',
              }}
              aria-disabled={isAbsent || undefined}
            >
              <div
                style={{
                  minWidth: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--jnj-space-3)',
                }}
              >
                <ContestantAvatar
                  photoUrl={c.photoUrl}
                  number={c.number}
                  size={48}
                />
                <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--jnj-space-2)',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--jnj-font-text-medium)',
                        fontSize: 'var(--jnj-size-h3)',
                        fontWeight: 500,
                      }}
                    >
                      #{c.number}
                    </span>
                    {c.role && <RoleBadge role={c.role} />}
                    {/* Hide 통과/READY/불합격 badges — only surface 불참 for visual disability cue. */}
                    {displayedStatus === 'absent' && (
                      <StatusBadge value={displayedStatus} />
                    )}
                  </div>
                  <div
                    className="jnj-caption"
                    style={{ color: 'var(--jnj-text-secondary)', margin: 0 }}
                  >
                    {c.name1}
                    {c.name2 ? ` · ${c.name2}` : ''}
                  </div>
                </div>
              </div>
              <PassFailToggle
                value={draft[c.id] ?? null}
                status={rowStatus}
                disabled={
                  isAbsent ||
                  submitting ||
                  // Once cap reached, freeze rows that are still OFF so judge
                  // can only flip OFF on already-ON rows to free up budget.
                  (capExhausted && draft[c.id] !== 'pass')
                }
                onChange={(next) => handleVoteChange(c, next)}
              />
            </li>
          );
        })}
      </ul>

      <SubmitFooter
        primaryLabel={
          submitting
            ? 'Saving…'
            : locked
              ? 'Saved'
              : `반영 (VOTE ON ${voteOnCount}/${total})`
        }
        onPrimary={locked ? undefined : handleSubmit}
        disabled={submitting || locked}
        secondary={
          locked
            ? { label: '수정', onClick: () => setSubmitState({ kind: 'idle' }) }
            : undefined
        }
      />

      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Final scores
// ─────────────────────────────────────────────────────────────────────────────

type FinalDraft = Record<
  string,
  { basics: number | null; connection: number | null; musicality: number | null }
>;

function FinalBody({
  contestants,
  judgeId,
  sheetId,
  toasts,
  push,
  dismiss,
}: {
  contestants: Contestant[];
  judgeId: string;
  sheetId?: string;
  toasts: ReturnType<typeof useToasts>['toasts'];
  push: ReturnType<typeof useToasts>['push'];
  dismiss: ReturnType<typeof useToasts>['dismiss'];
}) {
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: 'idle' });
  const draftKey = `jnj.draft.final.${judgeId}`;
  const initial: FinalDraft = useMemo(() => {
    const o: FinalDraft = {};
    for (const c of contestants) {
      o[c.id] = { basics: null, connection: null, musicality: null };
    }
    return o;
  }, [contestants]);
  const { value: draft, setValue: setDraft, clear } = useDraft<FinalDraft>(
    draftKey,
    initial,
  );

  useEffect(() => {
    setDraft((cur) => {
      const next: FinalDraft = { ...cur };
      let changed = false;
      for (const c of contestants) {
        if (!(c.id in next)) {
          next[c.id] = { basics: null, connection: null, musicality: null };
          changed = true;
        }
      }
      return changed ? next : cur;
    });
  }, [contestants, setDraft]);

  const validCount = useMemo(
    () =>
      contestants.filter((c) => {
        const e = draft[c.id];
        return (
          e &&
          isValidScore(e.basics) &&
          isValidScore(e.connection) &&
          isValidScore(e.musicality)
        );
      }).length,
    [contestants, draft],
  );
  const total = contestants.length;
  const locked = submitState.kind === 'locked';
  const submitting = submitState.kind === 'submitting';
  const allValid = validCount === total && total > 0;

  function handleSubmit() {
    const entries: FinalEntry[] = [];
    for (const c of contestants) {
      const e = draft[c.id];
      if (
        !e ||
        !isValidScore(e.basics) ||
        !isValidScore(e.connection) ||
        !isValidScore(e.musicality)
      ) {
        push('error', `#${c.number} 점수가 비어있습니다.`);
        return;
      }
      entries.push({
        contestantId: c.id,
        basics: e.basics,
        connection: e.connection,
        musicality: e.musicality,
      });
    }

    setSubmitState({ kind: 'submitting' });
    submitRound({ judgeId, round: 'final', entries }, sheetId)
      .then((res) => {
        push('success', `Saved ${res.written}.`);
        setSubmitState({ kind: 'locked' });
        clear();
      })
      .catch((err) => {
        setSubmitState({ kind: 'idle' });
        push('error', errorMessage(err));
      });
  }

  return (
    <>
      <ProgressLine done={validCount} total={total} />

      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--jnj-space-5)',
        }}
      >
        {contestants.map((c) => {
          const entry =
            draft[c.id] ?? {
              basics: null,
              connection: null,
              musicality: null,
            };
          const sum = totalFinalScore({
            contestantId: c.id,
            basics: entry.basics ?? 0,
            connection: entry.connection ?? 0,
            musicality: entry.musicality ?? 0,
          });
          const allFilled =
            isValidScore(entry.basics) &&
            isValidScore(entry.connection) &&
            isValidScore(entry.musicality);
          return (
            <li
              key={c.id}
              style={{
                padding: 'var(--jnj-space-4)',
                borderRadius: 'var(--jnj-radius-lg)',
                border: '1px solid var(--jnj-grey-200)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--jnj-space-3)',
                opacity: allFilled ? 1 : 0.85,
                background: 'var(--jnj-white)',
              }}
            >
              <header
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 'var(--jnj-space-3)',
                }}
              >
                <div
                  style={{
                    minWidth: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--jnj-space-3)',
                  }}
                >
                  <ContestantAvatar
                    photoUrl={c.photoUrl}
                    number={c.number}
                    size={56}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--jnj-space-2)',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--jnj-font-text-medium)',
                          fontSize: 'var(--jnj-size-h2)',
                          fontWeight: 500,
                        }}
                      >
                        #{c.number}
                      </span>
                      {c.role && <RoleBadge role={c.role} />}
                    </div>
                    <div
                      className="jnj-caption"
                      style={{ color: 'var(--jnj-text-secondary)' }}
                    >
                      {c.name1}
                      {c.name2 ? ` · ${c.name2}` : ''}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: 'var(--jnj-font-display)',
                    fontSize: 32,
                    lineHeight: 1,
                    color: allFilled
                      ? 'var(--jnj-text-primary)'
                      : 'var(--jnj-text-disabled)',
                  }}
                >
                  {allFilled ? sum : '—'}
                  <span
                    style={{
                      fontFamily: 'var(--jnj-font-text-medium)',
                      fontSize: 'var(--jnj-size-small)',
                      letterSpacing: '0.08em',
                      marginLeft: 6,
                      color: 'var(--jnj-text-secondary)',
                    }}
                  >
                    /{FINAL_SCORE_MAX * 3}
                  </span>
                </div>
              </header>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: 'var(--jnj-space-3)',
                }}
              >
                <ScoreInput
                  label="기본기"
                  value={entry.basics}
                  invalid={entry.basics !== null && !isValidScore(entry.basics)}
                  disabled={locked || submitting}
                  onChange={(n) =>
                    setDraft((cur) => ({
                      ...cur,
                      [c.id]: { ...cur[c.id]!, basics: n },
                    }))
                  }
                />
                <ScoreInput
                  label="연결성"
                  value={entry.connection}
                  invalid={
                    entry.connection !== null && !isValidScore(entry.connection)
                  }
                  disabled={locked || submitting}
                  onChange={(n) =>
                    setDraft((cur) => ({
                      ...cur,
                      [c.id]: { ...cur[c.id]!, connection: n },
                    }))
                  }
                />
                <ScoreInput
                  label="음악성"
                  value={entry.musicality}
                  invalid={
                    entry.musicality !== null && !isValidScore(entry.musicality)
                  }
                  disabled={locked || submitting}
                  onChange={(n) =>
                    setDraft((cur) => ({
                      ...cur,
                      [c.id]: { ...cur[c.id]!, musicality: n },
                    }))
                  }
                />
              </div>
            </li>
          );
        })}
      </ul>

      <SubmitFooter
        primaryLabel={
          submitting ? 'Saving…' : locked ? 'Saved' : `반영 (${validCount}/${total})`
        }
        onPrimary={locked ? undefined : handleSubmit}
        disabled={submitting || (!allValid && !locked)}
        secondary={
          locked
            ? { label: '수정', onClick: () => setSubmitState({ kind: 'idle' }) }
            : undefined
        }
      />

      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared UI bits
// ─────────────────────────────────────────────────────────────────────────────

function outcomeToVerdict(o: RoundStatus | null | undefined): Verdict | null {
  if (o === 'pass' || o === 'fail') return o;
  // READY (or absent / unknown) defaults the VOTE switch to OFF (= 'fail');
  // the judge explicitly flips to ON (= 'pass') to cast a vote.
  return 'fail';
}

function ContestantAvatar({
  photoUrl,
  number,
  size,
}: {
  photoUrl?: string;
  number: string;
  size: number;
}) {
  // Number-derived stable placeholder (5 monochrome shades from design tokens).
  const palette = [
    'var(--jnj-grey-200)',
    'var(--jnj-grey-300)',
    'var(--jnj-grey-500)',
    'var(--jnj-text-primary)',
    'var(--jnj-grey-600, #707072)',
  ];
  const numHash = parseInt(number.replace(/\D/g, ''), 10) || 0;
  const bg = palette[numHash % palette.length];
  // White text for the two darkest shades.
  const dark = bg.includes('text-primary') || bg.includes('500') || bg.includes('600');
  const fg = dark ? 'var(--jnj-white)' : 'var(--jnj-text-primary)';
  const common: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    flexShrink: 0,
    border: '1px solid var(--jnj-grey-200)',
    overflow: 'hidden',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: bg,
    color: fg,
    fontFamily: 'var(--jnj-font-display)',
    fontSize: Math.round(size * 0.4),
    fontWeight: 500,
    letterSpacing: '0.02em',
    lineHeight: 1,
  };
  if (photoUrl) {
    return (
      <span style={common} aria-label={`참가자 ${number} 사진`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl}
          alt={`#${number}`}
          width={size}
          height={size}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
          onError={(e) => {
            // Hide broken image; placeholder bg + number remain visible.
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      </span>
    );
  }
  return (
    <span style={common} aria-label={`참가자 ${number}`}>
      {number.replace(/^0+/, '') || number}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  // 리더 = filled black pill, 팔로워 = outlined, 그 외 (솔로 등) = grey outline.
  const isLeader = role === '리더' || role.toLowerCase() === 'leader';
  const isFollower = role === '팔로워' || role.toLowerCase() === 'follower';
  let bg = 'transparent';
  let fg = 'var(--jnj-text-secondary)';
  let border = '1px solid var(--jnj-grey-300)';
  if (isLeader) {
    bg = 'var(--jnj-text-primary)';
    fg = 'var(--jnj-white)';
    border = '1px solid var(--jnj-text-primary)';
  } else if (isFollower) {
    bg = 'var(--jnj-white)';
    fg = 'var(--jnj-text-primary)';
    border = '1px solid var(--jnj-text-primary)';
  }
  return (
    <span
      aria-label={`역할 ${role}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: bg,
        color: fg,
        border,
        fontFamily: 'var(--jnj-font-text-medium)',
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.04em',
        padding: '2px 8px',
        borderRadius: 'var(--jnj-radius-pill)',
      }}
    >
      {role}
    </span>
  );
}

function StatusBadge({ value }: { value: RoundStatus }) {
  const palette: Record<RoundStatus, { bg: string; fg: string }> = {
    ready: { bg: 'var(--jnj-grey-100)', fg: 'var(--jnj-grey-600)' },
    pass: { bg: 'var(--jnj-green)', fg: 'var(--jnj-white)' },
    fail: { bg: 'var(--jnj-red)', fg: 'var(--jnj-white)' },
    absent: { bg: 'var(--jnj-grey-500)', fg: 'var(--jnj-white)' },
  };
  const c = palette[value];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: c.bg,
        color: c.fg,
        fontFamily: 'var(--jnj-font-text-medium)',
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.06em',
        padding: '2px 8px',
        borderRadius: 'var(--jnj-radius-pill)',
        textTransform: 'uppercase',
      }}
    >
      {ROUND_STATUS_LABEL[value]}
    </span>
  );
}

function ProgressLine({ done, total }: { done: number; total: number }) {
  return (
    <div
      className="jnj-small"
      style={{
        color: 'var(--jnj-text-secondary)',
        letterSpacing: '0.06em',
      }}
    >
      {done} / {total}
    </div>
  );
}

function VoteCounter({
  used,
  cap,
  round,
}: {
  used: number;
  cap: number;
  round: Exclude<Round, 'final'>;
}) {
  // No cap configured for this judge → hide counter (legacy / missing column).
  if (!Number.isFinite(cap)) return null;
  const remaining = Math.max(0, cap - used);
  const exhausted = remaining === 0;
  return (
    <section
      aria-label="VOTE budget"
      style={{
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'space-between',
        gap: 'var(--jnj-space-3)',
        padding: 'var(--jnj-space-4)',
        borderRadius: 'var(--jnj-radius-lg)',
        border: `1.5px solid ${exhausted ? 'var(--jnj-red)' : 'var(--jnj-text-primary)'}`,
        background: exhausted ? 'var(--jnj-red-50, #FFF1F1)' : 'var(--jnj-white)',
        transition: 'border-color var(--jnj-transition), background var(--jnj-transition)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span
          className="jnj-small"
          style={{
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--jnj-text-secondary)',
          }}
        >
          {round === 'prelim' ? 'Prelim' : 'Semi'} · 남은 투표
        </span>
        <span
          style={{
            fontFamily: 'var(--jnj-font-display)',
            fontSize: 48,
            fontWeight: 500,
            lineHeight: 1,
            color: exhausted
              ? 'var(--jnj-red)'
              : 'var(--jnj-text-primary)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {remaining}
          <span
            style={{
              fontFamily: 'var(--jnj-font-text-medium)',
              fontSize: 'var(--jnj-size-small)',
              letterSpacing: '0.08em',
              marginLeft: 8,
              color: 'var(--jnj-text-secondary)',
            }}
          >
            / {cap}
          </span>
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 4,
          minWidth: 0,
        }}
      >
        <span
          className="jnj-small"
          style={{
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--jnj-text-secondary)',
          }}
        >
          Vote On
        </span>
        <span
          style={{
            fontFamily: 'var(--jnj-font-text-medium)',
            fontSize: 'var(--jnj-size-h3)',
            fontWeight: 500,
            color: 'var(--jnj-green)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {used}
        </span>
        {exhausted && (
          <span
            className="jnj-small"
            style={{
              color: 'var(--jnj-red)',
              fontFamily: 'var(--jnj-font-text-medium)',
              letterSpacing: '0.04em',
            }}
          >
            한도 도달
          </span>
        )}
      </div>
    </section>
  );
}

function SubmitFooter({
  primaryLabel,
  onPrimary,
  disabled,
  secondary,
}: {
  primaryLabel: string;
  onPrimary?: () => void;
  disabled: boolean;
  secondary?: { label: string; onClick: () => void };
}) {
  return (
    <div
      style={{
        position: 'sticky',
        bottom: 'env(safe-area-inset-bottom, 0px)',
        marginInline: 'calc(-1 * var(--jnj-space-4))',
        padding: 'var(--jnj-space-3) var(--jnj-space-4) calc(var(--jnj-space-3) + env(safe-area-inset-bottom, 0px))',
        background: 'var(--jnj-white)',
        boxShadow: '0px -1px 0px 0px var(--jnj-grey-200) inset',
        display: 'flex',
        gap: 'var(--jnj-space-2)',
      }}
    >
      {secondary && (
        <button
          type="button"
          className="jnj-btn jnj-btn-secondary"
          onClick={secondary.onClick}
          style={{ flexShrink: 0 }}
        >
          {secondary.label}
        </button>
      )}
      <button
        type="button"
        className="jnj-btn jnj-btn-primary"
        onClick={onPrimary}
        disabled={disabled || !onPrimary}
        style={{ flex: 1 }}
      >
        {primaryLabel}
      </button>
    </div>
  );
}

function ErrorBlock({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      style={{
        padding: 'var(--jnj-space-5)',
        border: '1px solid var(--jnj-red)',
        borderRadius: 'var(--jnj-radius-lg)',
        background: 'var(--jnj-red-50)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--jnj-space-3)',
      }}
    >
      <p
        className="jnj-body-medium"
        style={{ color: 'var(--jnj-red)', margin: 0 }}
      >
        {message}
      </p>
      <button
        type="button"
        className="jnj-btn jnj-btn-primary jnj-btn-sm"
        style={{ alignSelf: 'flex-start' }}
        onClick={onRetry}
      >
        Try again
      </button>
    </div>
  );
}

function errorMessage(err: unknown): string {
  if (err instanceof AppsScriptError) {
    switch (err.code) {
      case 'NOT_CONFIGURED':
        return 'Apps Script URL not set. Update .env.local.';
      case 'TIMEOUT':
        return 'Server took too long. Try again.';
      case 'NETWORK':
        return 'No connection. Try again.';
      case 'API':
        return `Server: ${err.message}`;
      case 'HTTP':
        return `Server error: ${err.message}.`;
      default:
        return 'Couldn’t complete. Try again.';
    }
  }
  return 'Couldn’t complete. Try again.';
}
