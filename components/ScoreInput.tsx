// Design Ref: §7.2 final — number input, 0..FINAL_SCORE_MAX integer.
// Visual states: idle (grey-100), focus (border active), invalid (red border).

'use client';

import * as React from 'react';
import { FINAL_SCORE_MAX, FINAL_SCORE_MIN } from '../lib/sheet-schema';

type Props = {
  label: string;
  value: number | null;
  onChange: (next: number | null) => void;
  disabled?: boolean;
  invalid?: boolean;
};

export function ScoreInput({
  label,
  value,
  onChange,
  disabled = false,
  invalid = false,
}: Props): React.ReactElement {
  const id = React.useId();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--jnj-space-1)' }}>
      <label
        htmlFor={id}
        style={{
          fontFamily: 'var(--jnj-font-text-medium)',
          fontWeight: 500,
          fontSize: 'var(--jnj-size-small)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--jnj-text-secondary)',
        }}
      >
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        pattern="[0-9]*"
        min={FINAL_SCORE_MIN}
        max={FINAL_SCORE_MAX}
        step={1}
        value={value === null ? '' : value}
        disabled={disabled}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === '') return onChange(null);
          const n = Number.parseInt(raw, 10);
          if (Number.isFinite(n)) onChange(n);
        }}
        className={['jnj-input', invalid ? 'jnj-input--error' : '']
          .filter(Boolean)
          .join(' ')}
        style={{
          fontFamily: 'var(--jnj-font-text-medium)',
          fontWeight: 500,
          fontSize: 'var(--jnj-size-h2)',
          textAlign: 'center',
          padding: 'var(--jnj-space-3) var(--jnj-space-2)',
        }}
      />
    </div>
  );
}

export function isValidScore(n: number | null): n is number {
  if (n === null) return false;
  if (!Number.isInteger(n)) return false;
  return n >= FINAL_SCORE_MIN && n <= FINAL_SCORE_MAX;
}
