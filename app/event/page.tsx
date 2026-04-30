// Design Ref: §7.2 /event — event info + 3 round entry buttons, currentRound emphasized.
// Plan SC-06: design-token application.

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { JudgeBadge } from '../../components/JudgeBadge';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { useCompetition } from '../../hooks/useCompetition';
import { useJudge } from '../../hooks/useJudge';
import { AppsScriptError, getEvent } from '../../lib/apps-script';
import {
  ROUND_LABEL,
  ROUNDS,
  type Event,
  type Round,
} from '../../lib/sheet-schema';

type LoadState =
  | { kind: 'loading' }
  | { kind: 'ready'; event: Event }
  | { kind: 'error'; message: string };

export default function EventPage() {
  const { hydrated } = useJudge({ requireJudge: true });
  const { competition, hydrated: compHydrated } = useCompetition({
    requireSelection: true,
  });
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!hydrated || !compHydrated) return;
    let cancelled = false;
    setState({ kind: 'loading' });
    getEvent(competition?.masterFileId)
      .then((event) => {
        if (cancelled) return;
        setState({ kind: 'ready', event });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({ kind: 'error', message: errorMessage(err) });
      });
    return () => {
      cancelled = true;
    };
  }, [hydrated, compHydrated, competition?.masterFileId, reloadKey]);

  return (
    <main
      style={{
        minHeight: '100dvh',
        padding: 'var(--jnj-space-5)',
        maxWidth: 720,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--jnj-space-7)',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--jnj-space-3)',
          paddingTop: 'var(--jnj-space-3)',
        }}
      >
        <span className="jnj-small" style={{ color: 'var(--jnj-text-secondary)' }}>
          STEP 2 / 3
        </span>
        <JudgeBadge />
      </header>

      {state.kind === 'loading' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--jnj-space-5)' }}>
          <LoadingSkeleton count={1} height={120} radius="var(--jnj-radius-lg)" />
          <LoadingSkeleton count={3} height={56} />
        </section>
      )}

      {state.kind === 'error' && (
        <ErrorBlock
          message={state.message}
          onRetry={() => setReloadKey((k) => k + 1)}
        />
      )}

      {state.kind === 'ready' && <EventBody event={state.event} />}
    </main>
  );
}

function EventBody({ event }: { event: Event }) {
  return (
    <>
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--jnj-space-3)' }}>
        <h1
          className="jnj-h1"
          style={{
            fontFamily: 'var(--jnj-font-display)',
            fontSize: 'clamp(32px, 7vw, 56px)',
            textTransform: 'uppercase',
            letterSpacing: '-0.01em',
            lineHeight: 1,
            margin: 0,
          }}
        >
          {event.name}
        </h1>
        <p
          className="jnj-caption"
          style={{
            margin: 0,
            color: 'var(--jnj-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {formatDate(event.date)} · {event.venue}
        </p>
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--jnj-space-4)' }}>
        <h2
          className="jnj-h3"
          style={{
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--jnj-text-secondary)',
          }}
        >
          Round
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--jnj-space-3)' }}>
          {ROUNDS.map((round) => (
            <RoundEntry
              key={round}
              round={round}
              active={round === event.currentRound}
            />
          ))}
        </div>
        <p
          className="jnj-small"
          style={{ margin: 0, color: 'var(--jnj-text-secondary)' }}
        >
          현재 라운드: {ROUND_LABEL[event.currentRound]}
        </p>
      </section>
    </>
  );
}

function RoundEntry({ round, active }: { round: Round; active: boolean }) {
  return (
    <Link
      href={`/round/${round}`}
      className={active ? 'jnj-btn jnj-btn-primary' : 'jnj-btn jnj-btn-secondary'}
      style={{
        width: '100%',
        padding: 'var(--jnj-space-4) var(--jnj-space-6)',
        justifyContent: 'space-between',
      }}
    >
      <span style={{ letterSpacing: '0.08em' }}>{ROUND_LABEL[round]}</span>
      <span
        style={{
          fontFamily: 'var(--jnj-font-text)',
          fontWeight: 400,
          fontSize: 'var(--jnj-size-small)',
          opacity: active ? 1 : 0.7,
        }}
      >
        {active ? 'Live' : 'Open'}
      </span>
    </Link>
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

function formatDate(iso: string): string {
  // accept either ISO strings or already-formatted strings; never throw on the page.
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function errorMessage(err: unknown): string {
  if (err instanceof AppsScriptError) {
    switch (err.code) {
      case 'NOT_CONFIGURED':
        return 'Apps Script URL not set. Update .env.local.';
      case 'TIMEOUT':
        return 'Server took too long. Try again.';
      case 'NETWORK':
        return 'No connection. Check your network.';
      case 'API':
        return `Server: ${err.message}`;
      case 'HTTP':
        return `Server error: ${err.message}.`;
      default:
        return 'Couldn’t load event. Try again.';
    }
  }
  return 'Couldn’t load event. Try again.';
}
