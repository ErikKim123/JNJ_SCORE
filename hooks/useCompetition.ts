'use client';

import { useEffect, useState } from 'react';

const KEY = 'jnj.competition';

export type SelectedCompetition = {
  id: string;
  name: string;
  masterFileId?: string;
};

export function setCompetition(c: SelectedCompetition): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    // ignore
  }
}

export function clearCompetition(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function readCompetition(): SelectedCompetition | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SelectedCompetition) : null;
  } catch {
    return null;
  }
}

export function useCompetition({
  requireSelection = false,
}: { requireSelection?: boolean } = {}): {
  competition: SelectedCompetition | null;
  hydrated: boolean;
} {
  const [hydrated, setHydrated] = useState(false);
  const [competition, setLocal] = useState<SelectedCompetition | null>(null);

  useEffect(() => {
    setLocal(readCompetition());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (requireSelection && !competition) {
      if (typeof window !== 'undefined') {
        window.location.replace('/competitions');
      }
    }
  }, [hydrated, competition, requireSelection]);

  return { competition, hydrated };
}
