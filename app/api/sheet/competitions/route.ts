import { NextResponse } from 'next/server';
import type { Competition } from '../../../../lib/sheet-schema';

// "대회목록시트" — 모든 대회의 마스터 인덱스.
const SHEET_ID = '1bRclkuN8fuSfhoSrRUEtBjPPx6TePofxojE72qHV6iU';
const GID = '2102151233';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;
  let csv: string;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `Sheet HTTP ${res.status}` },
        { status: 502 },
      );
    }
    csv = await res.text();
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'fetch failed' },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true, data: parseCompetitions(csv) });
}

function parseCompetitions(csv: string): Competition[] {
  const lines = csv.split(/\r?\n/);
  const headerIdx = lines.findIndex((l) => /^고유번호\s*,/.test(l));
  if (headerIdx < 0) return [];
  const headers = parseCsvLine(lines[headerIdx]).map((h) => h.trim());
  const colId = headers.indexOf('고유번호');
  const colName = headers.indexOf('대회명');
  const colDate = findCol(headers, ['대회 일시', '대회일시']);
  const colOrg = headers.indexOf('주최');
  const colContactName = findCol(headers, ['담당자 이름', '담당자']);
  const colContactPhone = findCol(headers, ['담당자 연락처', '연락처']);
  const colContactEmail = headers.indexOf('담당자 이메일');
  const colMasterUrl = findCol(headers, ['마스터 파일', '마스터파일']);
  const colMasterName = findCol(headers, ['파일명']);

  const out: Competition[] = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const id = cols[colId]?.trim();
    const name = cols[colName]?.trim();
    if (!id || !name) continue;
    const masterFileUrl = cols[colMasterUrl]?.trim() || undefined;
    out.push({
      id,
      name,
      date: cols[colDate]?.trim() ?? '',
      organizer: cols[colOrg]?.trim() || undefined,
      contactName: cols[colContactName]?.trim() || undefined,
      contactPhone: cols[colContactPhone]?.trim() || undefined,
      contactEmail: cols[colContactEmail]?.trim() || undefined,
      masterFileUrl,
      masterFileId: masterFileUrl ? extractSheetId(masterFileUrl) : undefined,
      masterFileName: cols[colMasterName]?.trim() || undefined,
    });
  }
  return out;
}

function extractSheetId(url: string): string | undefined {
  const m = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : undefined;
}

function findCol(headers: string[], candidates: string[]): number {
  for (const c of candidates) {
    const i = headers.indexOf(c);
    if (i >= 0) return i;
  }
  return -1;
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        cur += c;
      }
    } else if (c === ',') {
      out.push(cur);
      cur = '';
    } else if (c === '"') {
      inQuotes = true;
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
}
