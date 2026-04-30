'use client';

// Design Ref: §6.3 — localStorage-backed draft so reload + offline don't lose input.
// Plan SC-07: network-failure resilience.

import { useCallback, useEffect, useRef, useState } from 'react';

function safeRead<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function safeWrite<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded or disabled storage — silently ignore
  }
}

function safeRemove(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function useDraft<T>(
  key: string,
  initial: T,
): {
  value: T;
  setValue: React.Dispatch<React.SetStateAction<T>>;
  clear: () => void;
  hydrated: boolean;
} {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  const keyRef = useRef(key);
  keyRef.current = key;

  // Hydrate from storage after mount to avoid SSR/CSR mismatch.
  useEffect(() => {
    const stored = safeRead<T>(key);
    if (stored !== null) setValue(stored);
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    safeWrite(keyRef.current, value);
  }, [value, hydrated]);

  const clear = useCallback(() => {
    safeRemove(keyRef.current);
    setValue(initial);
  }, [initial]);

  return { value, setValue, clear, hydrated };
}
