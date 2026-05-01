import type {
  Contestant,
  Event,
  Judge,
  Round,
  SubmitPayload,
} from './sheet-schema';

// Source: Google Spreadsheet "2.심사위원" tab (gid 1547085887).
// https://docs.google.com/spreadsheets/d/1jLboWRedqNiTa2QYBzbzkYNKfcqehTKLR1dSvB-6DMw
const JUDGES: Judge[] = [
  { id: 'J01', name: '김도윤', active: true },
  { id: 'J02', name: '이서연', active: true },
  { id: 'J03', name: '박지호', active: true },
  { id: 'J04', name: '최유진', active: true },
  { id: 'J05', name: '정하람', active: true },
  { id: 'J06', name: '한민재', active: true },
  { id: 'J07', name: '강수빈', active: true },
  { id: 'J08', name: '임재현', active: true },
  { id: 'J09', name: '윤소희', active: true },
  { id: 'J10', name: '오태준', active: true },
  { id: 'J11', name: '오태준2', active: true },
];

// Source: Google Spreadsheet "1.대회정보" tab (gid 1379922472).
const EVENT: Event = {
  name: '2026 전국 댄스 챔피언십 : RISE UP',
  date: '2026-06-20',
  venue: '올림픽공원 SK핸드볼경기장',
  currentRound: 'prelim',
  roundStatus: { prelim: 'live', semi: 'open', final: 'open' },
};

const CONTESTANTS: Record<Round, Contestant[]> = {
  prelim: [
    { id: 'C01', number: '01', name1: '강하늘', name2: '윤서아' },
    { id: 'C02', number: '02', name1: '문재현', name2: '오유나' },
    { id: 'C03', number: '03', name1: '한지민', name2: '백승호' },
    { id: 'C04', number: '04', name1: '서지우', name2: '임채영' },
    { id: 'C05', number: '05', name1: '조은별', name2: '신동현' },
    { id: 'C06', number: '06', name1: '권태이', name2: '유다인' },
  ],
  semi: [
    { id: 'C01', number: '01', name1: '강하늘', name2: '윤서아' },
    { id: 'C03', number: '03', name1: '한지민', name2: '백승호' },
    { id: 'C05', number: '05', name1: '조은별', name2: '신동현' },
    { id: 'C06', number: '06', name1: '권태이', name2: '유다인' },
  ],
  final: [
    { id: 'C01', number: '01', name1: '강하늘', name2: '윤서아' },
    { id: 'C05', number: '05', name1: '조은별', name2: '신동현' },
  ],
};

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((r) => setTimeout(() => r(value), ms));
}

export async function getJudges(): Promise<Judge[]> {
  // Live read from Google Spreadsheet "2.심사위원" tab via local API route
  // (server-side CSV fetch to avoid CORS). Falls back to baked-in JUDGES on
  // any failure so dev mode still works offline.
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/sheet/judges', { cache: 'no-store' });
      if (res.ok) {
        const body = (await res.json()) as
          | { ok: true; data: Judge[] }
          | { ok: false; error: string };
        if (body.ok && body.data.length > 0) return body.data;
      }
    } catch {
      // swallow and fall back
    }
  }
  return delay(JUDGES);
}

export async function getEvent(): Promise<Event> {
  // Live read from Google Spreadsheet "1.대회정보" tab; falls back to baked-in
  // EVENT on any failure.
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/sheet/event', { cache: 'no-store' });
      if (res.ok) {
        const body = (await res.json()) as
          | { ok: true; data: Event }
          | { ok: false; error: string };
        if (body.ok) return body.data;
      }
    } catch {
      // swallow and fall back
    }
  }
  return delay(EVENT);
}

export async function getRound(round: Round): Promise<Contestant[]> {
  // Live read from the round-specific tab (4.예선통과 / 5.본선통과 / 6.결승).
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(`/api/sheet/round?round=${round}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const body = (await res.json()) as
          | { ok: true; data: Contestant[] }
          | { ok: false; error: string };
        if (body.ok) return body.data;
      }
    } catch {
      // swallow and fall back
    }
  }
  return delay(CONTESTANTS[round]);
}

export async function submitRound<R extends Round>(
  payload: SubmitPayload<R>,
): Promise<{ written: number }> {
  console.info('[mock] submitRound', payload);
  return delay({ written: payload.entries.length }, 500);
}
