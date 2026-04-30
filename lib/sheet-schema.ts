// Design Ref: §3 Data Model — schema mapping is centralized here so future sheet
// structure changes only touch this file (Plan SC-01..SC-03 traceability).

export type Round = 'prelim' | 'semi' | 'final';

export const ROUNDS: readonly Round[] = ['prelim', 'semi', 'final'] as const;

export const ROUND_LABEL: Record<Round, string> = {
  prelim: 'PRELIM',
  semi: 'SEMI',
  final: 'FINAL',
};

export type Judge = {
  id: string;
  name: string;
  active: boolean;
  // Per-round vote ceilings from `2.심사위원` sheet (예선투표최대수 / 본선투표최대수).
  // Optional for back-compat with sheets that don't have these columns.
  maxPrelimVotes?: number;
  maxSemiVotes?: number;
};

export type Event = {
  name: string;
  date: string; // ISO 8601
  venue: string;
  currentRound: Round;
};

export type Competition = {
  id: string; // 고유번호 (e.g. "202606-0001")
  name: string; // 대회명
  date: string; // 대회 일시
  organizer?: string; // 주최
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  masterFileId?: string; // spreadsheet ID extracted from masterFileUrl
  masterFileUrl?: string;
  masterFileName?: string;
};

export type RoundStatus = 'ready' | 'pass' | 'fail' | 'absent';

export const ROUND_STATUS_LABEL: Record<RoundStatus, string> = {
  ready: 'READY',
  pass: '통과',
  fail: '불합격',
  absent: '불참',
};

// Sheet cell value (string) ↔ app status mapping.
// READY = before judging, TRUE = 통과, FALSE = 불합격, Non = 불참.
export const ROUND_STATUS_SHEET_VALUE: Record<RoundStatus, string> = {
  ready: 'READY',
  pass: 'TRUE',
  fail: 'FALSE',
  absent: 'Non',
};

export type Contestant = {
  id: string;
  number: string;
  name1: string;
  name2: string;
  // 역할 — '리더' or '팔로워' (or empty for solo / unspecified).
  role?: string;
  // 사진 — public image URL when present in sheet. Empty string treated as
  // missing → UI shows a number-based placeholder.
  photoUrl?: string;
  // Optional prefill: current sheet value parsed for this round.
  // null = empty cell (treated as ready).
  outcome?: RoundStatus | null;
};

export type PassFailEntry = {
  contestantId: string;
  status: 'pass' | 'fail' | 'absent';
};

export type FinalEntry = {
  contestantId: string;
  basics: number; // 0..FINAL_SCORE_MAX
  connection: number;
  musicality: number;
};

// Design Ref: §12 Q2 — final score range is assumed 0..10. Adjust here if the
// operator's sheet uses a different scale; UI inputs read this constant.
export const FINAL_SCORE_MIN = 0;
export const FINAL_SCORE_MAX = 10;

export type RoundEntry<R extends Round> = R extends 'final'
  ? FinalEntry
  : PassFailEntry;

export type SubmitPayload<R extends Round = Round> = {
  judgeId: string;
  round: R;
  entries: Array<RoundEntry<R>>;
};

export type ApiOk<T> = { ok: true; data: T };
export type ApiErr = { ok: false; error: string };
export type ApiResponse<T> = ApiOk<T> | ApiErr;

export function isFinalEntry(
  entry: PassFailEntry | FinalEntry,
): entry is FinalEntry {
  return 'basics' in entry;
}

export function totalFinalScore(e: FinalEntry): number {
  return e.basics + e.connection + e.musicality;
}
