import { NextResponse } from 'next/server';
import type { Event, Round } from '../../../../lib/sheet-schema';
import { fetchSheetTab, parseCsvLine } from '../../../../lib/sheet-fetch';

// 대회 001 원본시트 — dev fallback. 운영에서는 클라이언트가 ?sheetId= 로
// 선택된 대회의 masterFileId 를 전달한다.
const DEFAULT_SHEET_ID = '1gzX4kidjg4J6Qj5g1ANX9ibdeGaK_KkLTgU6xoQVn80';
const TAB_NAME = '1.대회정보';
const TAB_GID = '1379922472'; // legacy fallback

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const reqUrl = new URL(req.url);
  const sheetId = reqUrl.searchParams.get('sheetId') || DEFAULT_SHEET_ID;
  const result = await fetchSheetTab({
    sheetId,
    tabName: TAB_NAME,
    publicGid: TAB_GID,
  });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 502 });
  }
  const event = parseEvent(result.csv ?? '', result.values);
  if (!event) {
    return NextResponse.json(
      { ok: false, error: '대회 정보를 파싱하지 못했습니다.' },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true, data: event, via: result.via });
}

function parseEvent(csv: string, values?: unknown[][]): Event | null {
  const map = new Map<string, string>();
  if (values) {
    for (const row of values) {
      const k = String(row?.[0] ?? '').trim();
      const v = String(row?.[1] ?? '').trim();
      if (k && v) map.set(k, v);
    }
  } else {
    for (const line of csv.split(/\r?\n/)) {
      const cols = parseCsvLine(line);
      const key = cols[0]?.trim();
      const value = cols[1]?.trim();
      if (key && value) map.set(key, value);
    }
  }
  const name = map.get('대회명');
  const venue = map.get('대회 장소');
  const dateRaw = map.get('대회 일시') ?? '';
  if (!name || !venue) return null;
  const date = extractIsoDate(dateRaw);
  const currentRound = parseRound(map.get('현재 라운드')) ?? 'prelim';
  return { name, date, venue, currentRound };
}

function extractIsoDate(text: string): string {
  // Accept "2026-06-20", "2026-06-20(토) 13:00 ~ 21:00", "2026/06/20", etc.
  const m = text.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (!m) return '';
  const [, y, mo, d] = m;
  return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

function parseRound(text: string | undefined): Round | null {
  if (!text) return null;
  const t = text.trim().toLowerCase();
  if (t === 'prelim' || t.includes('예선')) return 'prelim';
  if (t === 'semi' || t.includes('본선') || t.includes('준결승')) return 'semi';
  if (t === 'final' || t.includes('결승')) return 'final';
  return null;
}

