// Design Ref: §4 API Contract (revised in Analysis iter-1) —
//   Reads (judges/event/round) go through the Next.js proxy /api/sheet/* which
//   server-side fetches CSV (or falls back to Apps Script `read` action via
//   lib/sheet-fetch.ts). Writes (submit) go directly to the Apps Script
//   doPost endpoint with SHARED_TOKEN. See Design §10 ADR.
// Plan SC-04: P95 ≤ 3s. Plan SC-07: network-failure resilience via retry.

import type {
  ApiResponse,
  Contestant,
  Event,
  Judge,
  Round,
  SubmitPayload,
} from './sheet-schema';
import * as mock from './apps-script-mock';

const URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL ?? '';
const TOKEN = process.env.NEXT_PUBLIC_APPS_SCRIPT_TOKEN ?? '';
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === '1';

const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_RETRIES = 1;

class AppsScriptError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'NOT_CONFIGURED'
      | 'NETWORK'
      | 'TIMEOUT'
      | 'HTTP'
      | 'API'
      | 'PARSE',
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'AppsScriptError';
  }
}

export { AppsScriptError };

function assertConfigured(): void {
  if (!URL || URL.includes('REPLACE_ME')) {
    throw new AppsScriptError(
      'NEXT_PUBLIC_APPS_SCRIPT_URL is not configured. See .env.example.',
      'NOT_CONFIGURED',
    );
  }
}

async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function call<T>(
  input: string,
  init: RequestInit,
  retries: number = DEFAULT_RETRIES,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetchWithTimeout(input, init, timeoutMs);
      if (!res.ok) {
        throw new AppsScriptError(`HTTP ${res.status}`, 'HTTP');
      }
      let body: ApiResponse<T>;
      try {
        body = (await res.json()) as ApiResponse<T>;
      } catch (e) {
        throw new AppsScriptError('Malformed JSON response', 'PARSE', e);
      }
      if (!body.ok) {
        throw new AppsScriptError(body.error, 'API');
      }
      return body.data;
    } catch (err) {
      lastError = err;
      if (err instanceof AppsScriptError && err.code === 'API') {
        // API-level errors should not be retried (validation, auth, etc.)
        throw err;
      }
      if (attempt < retries) {
        // exponential backoff: 300ms, 900ms, ...
        await new Promise((r) => setTimeout(r, 300 * Math.pow(3, attempt)));
        continue;
      }
    }
  }
  if (lastError instanceof AppsScriptError) throw lastError;
  if (lastError instanceof DOMException && lastError.name === 'AbortError') {
    throw new AppsScriptError('Request timed out', 'TIMEOUT', lastError);
  }
  throw new AppsScriptError('Network error', 'NETWORK', lastError);
}

function buildUrl(params: Record<string, string>): string {
  assertConfigured();
  const u = new global.URL(URL);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  return u.toString();
}

// Reads route through the Next.js proxy. The proxy handles the public-CSV vs
// private-Apps-Script-`read` fallback (see lib/sheet-fetch.ts). The Apps Script
// `doGet` itself is intentionally a stub — only `doPost submit` is contract.
//
// All read functions accept an optional `sheetId` (the selected competition's
// masterFileId). When omitted, the proxy falls back to its DEFAULT_SHEET_ID
// (대회 001) for dev convenience.
function withSheetId(path: string, sheetId?: string): string {
  if (!sheetId) return path;
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}sheetId=${encodeURIComponent(sheetId)}`;
}

export async function getJudges(sheetId?: string): Promise<Judge[]> {
  if (USE_MOCK) return mock.getJudges();
  return call<Judge[]>(withSheetId('/api/sheet/judges', sheetId), {
    method: 'GET',
  });
}

export async function getEvent(sheetId?: string): Promise<Event> {
  if (USE_MOCK) return mock.getEvent();
  return call<Event>(withSheetId('/api/sheet/event', sheetId), {
    method: 'GET',
  });
}

export async function getRound(
  round: Round,
  sheetId?: string,
  judgeId?: string,
): Promise<Contestant[]> {
  if (USE_MOCK) return mock.getRound(round);
  // judgeId lets the proxy seed each contestant's outcome from the LOGGED-IN
  // judge's per-judge O/X column (so VOTE state restores on refresh).
  let path = `/api/sheet/round?round=${encodeURIComponent(round)}`;
  if (judgeId) path += `&judgeId=${encodeURIComponent(judgeId)}`;
  return call<Contestant[]>(withSheetId(path, sheetId), { method: 'GET' });
}

// In mock mode, reads come from CSV but writes still need a real backend.
// If the Apps Script URL is configured (not the placeholder), use it for
// submit even when USE_MOCK is set — gives a "live read + live write" mix
// during development without flipping flags.
const HAS_REAL_URL = Boolean(URL) && !URL.includes('REPLACE_ME');

export async function submitRound<R extends Round>(
  payload: SubmitPayload<R>,
  sheetId?: string,
): Promise<{ written: number }> {
  if (USE_MOCK && !HAS_REAL_URL) return mock.submitRound(payload);
  assertConfigured();
  // When sheetId is provided, use the multi-tenant `submit_to` action which
  // routes to the selected competition's master sheet. Falls back to `submit`
  // (writes to the bound spreadsheet) when no sheetId is given.
  const action = sheetId ? 'submit_to' : 'submit';
  const body = sheetId
    ? { action, token: TOKEN, sheetId, ...payload }
    : { action, token: TOKEN, ...payload };
  return call<{ written: number }>(
    URL,
    {
      method: 'POST',
      // Apps Script doPost reads e.postData.contents — text/plain avoids the
      // CORS preflight that application/json would trigger.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
    },
    DEFAULT_RETRIES,
    DEFAULT_TIMEOUT_MS,
  );
}
