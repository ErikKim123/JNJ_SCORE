// Design Ref: §7.2 /event header — current judge name + logout link.
// Re-used across /event and /round/* pages.

'use client';

import * as React from 'react';
import { useJudge } from '../hooks/useJudge';

export function JudgeBadge(): React.ReactElement | null {
  const { judge, hydrated, logout } = useJudge();

  if (!hydrated || !judge) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--jnj-space-3)',
        padding: 'var(--jnj-space-2) var(--jnj-space-4)',
        borderRadius: 'var(--jnj-radius-pill)',
        background: 'var(--jnj-grey-100)',
        fontFamily: 'var(--jnj-font-text-medium)',
        fontSize: 'var(--jnj-size-link-sm)',
      }}
    >
      <span
        style={{
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          fontSize: 'var(--jnj-size-small)',
          color: 'var(--jnj-text-secondary)',
        }}
      >
        Judge
      </span>
      <span style={{ color: 'var(--jnj-text-primary)' }}>{judge.name}</span>
      <button
        type="button"
        onClick={logout}
        style={{
          appearance: 'none',
          background: 'transparent',
          border: 'none',
          padding: 0,
          marginLeft: 'var(--jnj-space-1)',
          color: 'var(--jnj-text-secondary)',
          fontFamily: 'inherit',
          fontSize: 'var(--jnj-size-small)',
          cursor: 'pointer',
          textDecoration: 'underline',
          textUnderlineOffset: 2,
        }}
      >
        Logout
      </button>
    </div>
  );
}
