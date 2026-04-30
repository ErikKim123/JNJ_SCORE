import { NextResponse } from 'next/server';
import type { Contestant, Round } from '../../../../lib/sheet-schema';
import { fetchSheetTab, parseCsvLine } from '../../../../lib/sheet-fetch';

// 대회 001 원본시트 — dev fallback. 운영에서는 클라이언트가 ?sheetId= 로
// 선택된 대회의 masterFileId 를 전달한다.
const DEFAULT_SHEET_ID = '1gzX4kidjg4J6Qj5g1ANX9ibdeGaK_KkLTgU6xoQVn80';

// Source tabs (gid is legacy fallback only — gviz uses tabName which is gid-independent):
const TAB_BY_ROUND: Record<Round, { name: string; gid: string }> = {
  prelim: { name: '3.참가자', gid: '732295429' },
  semi: { name: '4.예선통과', gid: '1359767117' },
  final: { name: '5.본선통과', gid: '815348560' },
};

// Column whose value is the round's pass/fail/absent record.
const OUTCOME_COL_BY_ROUND: Record<Round, string> = {
  prelim: '예선통과',
  semi: '본선통과',
  final: '결승진출',
};

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const round = url.searchParams.get('round') as Round | null;
  if (!round || !(round in TAB_BY_ROUND)) {
    return NextResponse.json(
      { ok: false, error: 'Invalid round (prelim|semi|final)' },
      { status: 400 },
    );
  }
  const sheetId = url.searchParams.get('sheetId') || DEFAULT_SHEET_ID;
  const judgeId = url.searchParams.get('judgeId') || undefined;
  const tab = TAB_BY_ROUND[round];
  const result = await fetchSheetTab({
    sheetId,
    tabName: tab.name,
    publicGid: tab.gid,
  });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 502 });
  }
  return NextResponse.json({
    ok: true,
    data: parseContestants(
      result.csv ?? '',
      OUTCOME_COL_BY_ROUND[round],
      round,
      judgeId,
    ),
    via: result.via,
  });
}

function parseContestants(
  csv: string,
  outcomeCol: string,
  round: Round,
  judgeId?: string,
): Contestant[] {
  const lines = csv.split(/\r?\n/);
  // Find any row starting with 참가번호 (cell may be quoted with checkbox prefix).
  const headerIdx = lines.findIndex((l) => {
    const first = parseCsvLine(l)[0]?.replace(/^☑\s*/, '').trim() ?? '';
    return first === '참가번호';
  });
  if (headerIdx < 0) return [];
  const headers = parseCsvLine(lines[headerIdx]).map((h) =>
    h.replace(/^☑\s*/, '').trim(),
  );
  const numIdx = headers.indexOf('참가번호');
  const teamIdx = findCol(headers, ['팀명/참가자명', '팀명', '참가자명']);
  const leaderIdx = findCol(headers, ['대표자명', '대표자', '리더']);
  // Sheet uses "역활" (intentional typo of 역할 in source) — accept both.
  const roleIdx = findCol(headers, ['역활', '역할']);
  const photoIdx = findCol(headers, ['사진', '사진 URL', 'photo']);
  // Auto-computed outcome column (final pass/fail by sheet formulas).
  const outcomeIdx = headers.findIndex((h) => h.startsWith(outcomeCol));
  // Per-judge VOTE column for prelim/semi (mirrors Apps Script logic).
  const judgeVoteIdx =
    judgeId && (round === 'prelim' || round === 'semi')
      ? findJudgeVoteColumn(headers, round, judgeId)
      : -1;
  const out: Contestant[] = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const number = cols[numIdx]?.trim() ?? '';
    if (!/^\d+/.test(number)) continue;
    const name1 = (teamIdx >= 0 ? cols[teamIdx] : '')?.trim() ?? '';
    const name2 = (leaderIdx >= 0 ? cols[leaderIdx] : '')?.trim() ?? '';
    const role =
      roleIdx >= 0 ? cols[roleIdx]?.trim() || undefined : undefined;
    const rawPhoto =
      photoIdx >= 0 ? cols[photoIdx]?.trim() || '' : '';
    // Accept full URLs or =IMAGE("url") formula leftovers; ignore otherwise.
    const photoUrl = /^https?:\/\//i.test(rawPhoto) ? rawPhoto : undefined;
    // Per-judge VOTE column policy (strict): ONLY 'O' → 'pass' (VOTE ON).
    // Everything else ('X', empty, 'READY', anything) → 'fail' (VOTE OFF).
    // 'absent' (Non) on the auto-outcome column still wins to lock the row.
    let outcome: ReturnType<typeof parseOutcome> = 'fail';
    if (judgeVoteIdx >= 0) {
      const v = (cols[judgeVoteIdx] ?? '').trim().toUpperCase();
      outcome = v === 'O' ? 'pass' : 'fail';
    } else if (outcomeIdx >= 0) {
      // No judgeId provided — fall back to auto column for read-only display.
      outcome = parseOutcome(cols[outcomeIdx]);
    }
    if (outcomeIdx >= 0) {
      const auto = parseOutcome(cols[outcomeIdx]);
      if (auto === 'absent') outcome = 'absent';
    }
    out.push({ id: `C${number}`, number, name1, name2, role, photoUrl, outcome });
  }
  return out;
}

function parseOutcome(
  raw: string | undefined,
): 'ready' | 'pass' | 'fail' | 'absent' | null {
  const v = (raw ?? '').trim();
  if (!v) return 'ready'; // empty cell treated as ready
  const u = v.toUpperCase();
  // Per-judge VOTE columns store 'O' / 'X'; auto columns store TRUE/FALSE.
  if (u === 'O' || u === 'TRUE') return 'pass';
  if (u === 'X' || u === 'FALSE') return 'fail';
  if (u === 'NON' || v === 'Non') return 'absent';
  if (u === 'READY') return 'ready';
  return null;
}

// Mirrors Apps Script findJudgeVoteColumn: locate the per-judge VOTE column
// for a given round and judgeId (e.g. 'J01' = rank 1 = 1st column in group).
//   prelim group = (col after 비고) ... (col before 예선 등수)
//   semi   group = (col after 예선통과...) ... (col before 본선 등수)
function findJudgeVoteColumn(
  headers: string[],
  round: 'prelim' | 'semi',
  judgeId: string,
): number {
  const rank = parseInt(judgeId.replace(/^J/, ''), 10);
  if (!Number.isFinite(rank) || rank < 1) return -1;
  const findStarting = (prefix: string): number =>
    headers.findIndex((h) => h.startsWith(prefix));
  if (round === 'prelim') {
    const startAfter = headers.indexOf('비고');
    let endBefore = headers.indexOf('예선 등수');
    if (endBefore < 0) endBefore = findStarting('예선통과');
    if (startAfter < 0 || endBefore < 0) return -1;
    const groupStart = startAfter + 1;
    const groupSize = endBefore - groupStart;
    if (rank > groupSize) return -1;
    return groupStart + rank - 1;
  }
  // semi
  const startAfter = findStarting('예선통과');
  let endBefore = headers.indexOf('본선 등수');
  if (endBefore < 0) endBefore = findStarting('본선통과');
  if (startAfter < 0 || endBefore < 0) return -1;
  const groupStart = startAfter + 1;
  const groupSize = endBefore - groupStart;
  if (rank > groupSize) return -1;
  return groupStart + rank - 1;
}

function findCol(headers: string[], candidates: string[]): number {
  for (const c of candidates) {
    const i = headers.indexOf(c);
    if (i >= 0) return i;
  }
  return -1;
}

