// Server-only helper. Tries:
//   1) gviz/tq?tqx=out:csv&sheet={tabName} — works with tab NAME (resilient to
//      sheets that were copied from a template and got new gids).
//   2) export?format=csv&gid={gid} — legacy path when the caller knows the gid.
//   3) Apps Script `read` action — for private sheets the script owner can read.

const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL ?? '';
const APPS_SCRIPT_TOKEN = process.env.NEXT_PUBLIC_APPS_SCRIPT_TOKEN ?? '';

export type FetchResult =
  | {
      ok: true;
      via: 'gviz' | 'csv' | 'apps-script';
      csv?: string;
      values?: unknown[][];
    }
  | { ok: false; error: string };

function looksLikeHtmlError(text: string): boolean {
  const head = text.trimStart().slice(0, 200).toLowerCase();
  return (
    head.startsWith('<!doctype') ||
    head.startsWith('<html') ||
    head.includes('<head>')
  );
}

export async function fetchSheetTab({
  sheetId,
  tabName,
  publicGid,
}: {
  sheetId: string;
  tabName: string;
  publicGid?: string;
}): Promise<FetchResult> {
  // 1) gviz CSV by tab name — preferred (gid-independent).
  //    headers=0 disables gviz's auto-header inference, which otherwise merges
  //    visually-styled rows (banners, merged cells) into a single header row.
  const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&headers=0&sheet=${encodeURIComponent(tabName)}`;
  try {
    const res = await fetch(gvizUrl, { cache: 'no-store', redirect: 'follow' });
    if (res.ok) {
      const text = await res.text();
      if (text && !looksLikeHtmlError(text)) {
        return { ok: true, via: 'gviz', csv: text };
      }
    }
  } catch {
    // fall through
  }

  // 2) Legacy gid path.
  if (publicGid) {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${publicGid}`;
    try {
      const res = await fetch(url, { cache: 'no-store', redirect: 'follow' });
      if (res.ok) {
        const text = await res.text();
        if (text && !looksLikeHtmlError(text)) {
          return { ok: true, via: 'csv', csv: text };
        }
      }
    } catch {
      // fall through to Apps Script
    }
  }

  // 3) Apps Script fallback (works on private sheets the script's owner can read).
  if (
    !APPS_SCRIPT_URL ||
    APPS_SCRIPT_URL.includes('REPLACE_ME') ||
    !APPS_SCRIPT_TOKEN
  ) {
    return {
      ok: false,
      error: '시트가 비공개이고 Apps Script도 설정되지 않아 읽을 수 없습니다.',
    };
  }
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'read',
        token: APPS_SCRIPT_TOKEN,
        sheetId,
        sheetName: tabName,
      }),
      redirect: 'follow',
      cache: 'no-store',
    });
    if (!res.ok) {
      return { ok: false, error: `Apps Script HTTP ${res.status}` };
    }
    const body = (await res.json()) as
      | { ok: true; data: { values: unknown[][] } }
      | { ok: false; error: string };
    if (!body.ok) return { ok: false, error: body.error };
    return { ok: true, via: 'apps-script', values: body.data.values };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Apps Script fetch failed',
    };
  }
}

// RFC 4180 CSV line parser (handles quoted fields with commas).
export function parseCsvLine(line: string): string[] {
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
