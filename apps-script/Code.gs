/**
 * JNJ Score — Google Apps Script Web App.
 *
 * Deploy this script BOUND to the spreadsheet (Extensions → Apps Script).
 * Then deploy as Web App with execute-as=Me, access=Anyone-with-link.
 *
 * Endpoints
 *   POST  body { action:"submit"|"submit_to", token, [sheetId,] judgeId, round, entries }
 *     - prelim/semi: writes 'O' (pass / VOTE ON) or 'X' (fail / VOTE OFF) to
 *       the LOGGED-IN judge's per-judge column in "3.참가자".
 *       The "☑ 예선통과 (자동)" / "☑ 본선통과 (자동)" columns are auto-computed
 *       by the sheet from these per-judge votes — we never write them.
 *     - final     : writes per-judge 기본기/연결성/음악성 to "3.참가자"
 */

var SHEET_NAME = '3.참가자';
var EXPECTED_TOKEN = 'CHANGE_ME_TOKEN'; // <-- set this AND match in .env.local
// Empty string → SpreadsheetApp.getActive() = the bound spreadsheet.
// Bind this script to your competition's master file:
//   open the master sheet → Extensions → Apps Script → paste this file.
// For multi-competition support, leave this empty and use action='submit_to'
// with sheetId in the body (requires elevated scope — see appsscript.json).
var SPREADSHEET_ID = '';

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.token !== EXPECTED_TOKEN) {
      return jsonError('Invalid token');
    }
    if (body.action === 'rename_remarks_status') {
      return jsonOk({ result: renameRemarksToStatus() });
    }
    if (body.action === 'read') {
      return jsonOk(handleRead(body));
    }
    if (body.action === 'submit_to') {
      return jsonOk({ written: handleSubmitTo(body) });
    }
    if (body.action !== 'submit') {
      return jsonError('Unknown action');
    }
    var written = handleSubmit(body);
    return jsonOk({ written: written });
  } catch (err) {
    return jsonError(String(err && err.message ? err.message : err));
  }
}

function doGet() {
  return jsonOk({ ping: 'ok', sheet: SHEET_NAME });
}

function handleSubmit(body) {
  var round = body.round;
  var judgeId = String(body.judgeId || '');
  var entries = body.entries || [];
  if (!judgeId) throw new Error('Missing judgeId');
  if (!entries.length) return 0;

  var ss = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) throw new Error('Sheet not found: ' + SHEET_NAME);

  var data = sh.getDataRange().getValues();
  var headerRow = findParticipantHeader(data);
  if (headerRow < 0) throw new Error('Cannot locate header row');

  var headers = data[headerRow].map(function (h) {
    return String(h || '').replace(/^☑\s*/, '').trim();
  });
  var subHeaders = headerRow + 1 < data.length
    ? data[headerRow + 1].map(function (h) { return String(h || '').trim(); })
    : [];

  var numIdx = headers.indexOf('참가번호');
  if (numIdx < 0) throw new Error('Missing 참가번호 column');

  if (round === 'prelim' || round === 'semi') {
    var col = findJudgeVoteColumn(headers, round, judgeId);
    if (col < 0) throw new Error('Judge VOTE column not found for ' + judgeId + ' in ' + round);
    var written = 0;
    entries.forEach(function (entry) {
      var rowIdx = findContestantRow(data, headerRow + 2, numIdx, entry.contestantId);
      if (rowIdx < 0) return;
      sh.getRange(rowIdx + 1, col + 1).setValue(mapStatusToVoteCell(entry));
      written++;
    });
    return written;
  }

  if (round === 'final') {
    var judgeCols = findFinalJudgeCols(headers, subHeaders, judgeId);
    if (!judgeCols) throw new Error('Judge columns not found for ' + judgeId);
    var written = 0;
    entries.forEach(function (entry) {
      var rowIdx = findContestantRow(data, headerRow + 2, numIdx, entry.contestantId);
      if (rowIdx < 0) return;
      sh.getRange(rowIdx + 1, judgeCols.basics + 1).setValue(entry.basics);
      sh.getRange(rowIdx + 1, judgeCols.connection + 1).setValue(entry.connection);
      sh.getRange(rowIdx + 1, judgeCols.musicality + 1).setValue(entry.musicality);
      written++;
    });
    return written;
  }

  throw new Error('Unknown round: ' + round);
}

// VOTE cell value for prelim/semi per-judge columns: ON → 'O', else → 'X'.
function mapStatusToVoteCell(entry) {
  var s = entry.status;
  if (!s && typeof entry.pass === 'boolean') s = entry.pass ? 'pass' : 'fail';
  return s === 'pass' ? 'O' : 'X';
}

// Locate the per-judge VOTE column for a given round.
//   prelim group = (col after 비고) ... (col before 예선 등수)
//   semi   group = (col after 예선통과...) ... (col before 본선 등수)
// Within each group, judge rank N (1-based) = groupStart + (N - 1).
function findJudgeVoteColumn(headers, round, judgeId) {
  var rank = parseInt(String(judgeId).replace(/^J/, ''), 10);
  if (!rank) return -1;

  if (round === 'prelim') {
    var startAfter = headers.indexOf('비고');
    var endBefore = headers.indexOf('예선 등수');
    if (endBefore < 0) endBefore = findHeaderStartingWith(headers, '예선통과');
    if (startAfter < 0 || endBefore < 0) return -1;
    var groupStart = startAfter + 1;
    var groupSize = endBefore - groupStart;
    if (rank > groupSize) return -1;
    return groupStart + rank - 1;
  }

  if (round === 'semi') {
    var startAfter = findHeaderStartingWith(headers, '예선통과');
    var endBefore = headers.indexOf('본선 등수');
    if (endBefore < 0) endBefore = findHeaderStartingWith(headers, '본선통과');
    if (startAfter < 0 || endBefore < 0) return -1;
    var groupStart = startAfter + 1;
    var groupSize = endBefore - groupStart;
    if (rank > groupSize) return -1;
    return groupStart + rank - 1;
  }

  return -1;
}

// Find first header whose stripped value starts with `prefix`.
// Tolerates "예선통과", "예선통과 (자동)", "☑ 예선통과 (자동)" (☑ already stripped upstream).
function findHeaderStartingWith(headers, prefix) {
  for (var i = 0; i < headers.length; i++) {
    var h = String(headers[i] || '').trim();
    if (h.indexOf(prefix) === 0) return i;
  }
  return -1;
}

function findParticipantHeader(data) {
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][0] || '').trim() === '참가번호') return i;
  }
  return -1;
}

function findContestantRow(data, startRow, numIdx, contestantId) {
  // contestantId is "C001" — strip leading C and compare numerically.
  var target = String(contestantId).replace(/^C/, '').replace(/^0+/, '');
  for (var i = startRow; i < data.length; i++) {
    var raw = String(data[i][numIdx] || '').trim();
    if (!raw) continue;
    var normalized = raw.replace(/^0+/, '');
    if (normalized === target) return i;
  }
  return -1;
}

function findFinalJudgeCols(headers, subHeaders, judgeId) {
  // Header has "① 김도윤", "② 이서연", ... judge columns span 3 sub-columns.
  // judgeId format: "J01" -> rank 1.
  var rank = parseInt(String(judgeId).replace(/^J/, ''), 10);
  if (!rank) return null;
  // Find the n-th judge column header (anything containing 김/이/박/etc names is too lax;
  // safer: find headers whose subheader is "기본기" — every 3 cols starts a new judge).
  var basicsCols = [];
  for (var i = 0; i < subHeaders.length; i++) {
    if (subHeaders[i] === '기본기') basicsCols.push(i);
  }
  if (basicsCols.length < rank) return null;
  var b = basicsCols[rank - 1];
  return { basics: b, connection: b + 1, musicality: b + 2 };
}

function jsonOk(data) {
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true, data: data }),
  ).setMimeType(ContentService.MimeType.JSON);
}

function jsonError(message) {
  return ContentService.createTextOutput(
    JSON.stringify({ ok: false, error: message }),
  ).setMimeType(ContentService.MimeType.JSON);
}

// Generic read of a sheet tab as 2D array. Used to fetch private master files.
// body: { action:"read", token, sheetId?, sheetName, range? }
//   sheetId   — defaults to SPREADSHEET_ID
//   sheetName — required (e.g. "2.심사위원")
//   range     — optional A1 range (e.g. "A1:Z200"); else full data range
function handleRead(body) {
  var sheetId = body.sheetId || SPREADSHEET_ID;
  if (!sheetId) throw new Error('Missing sheetId');
  var ss = SpreadsheetApp.openById(sheetId);
  var sh = ss.getSheetByName(body.sheetName);
  if (!sh) throw new Error('Sheet tab not found: ' + body.sheetName);
  var values = body.range
    ? sh.getRange(body.range).getValues()
    : sh.getDataRange().getValues();
  return { values: values };
}

// Submit to a specific master sheet (different from the bound one).
// body: { action:"submit_to", token, sheetId, judgeId, round, entries }
function handleSubmitTo(body) {
  if (!body.sheetId) throw new Error('Missing sheetId');
  var ss = SpreadsheetApp.openById(body.sheetId);
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) throw new Error('Sheet not found: ' + SHEET_NAME);
  return writeRound(sh, body);
}

// Shared write logic extracted from handleSubmit so both endpoints reuse it.
function writeRound(sh, body) {
  var round = body.round;
  var judgeId = String(body.judgeId || '');
  var entries = body.entries || [];
  if (!judgeId) throw new Error('Missing judgeId');
  if (!entries.length) return 0;

  var data = sh.getDataRange().getValues();
  var headerRow = findParticipantHeader(data);
  if (headerRow < 0) throw new Error('Cannot locate header row');

  var headers = data[headerRow].map(function (h) {
    return String(h || '').replace(/^☑\s*/, '').trim();
  });
  var subHeaders = headerRow + 1 < data.length
    ? data[headerRow + 1].map(function (h) { return String(h || '').trim(); })
    : [];
  var numIdx = headers.indexOf('참가번호');
  if (numIdx < 0) throw new Error('Missing 참가번호 column');

  if (round === 'prelim' || round === 'semi') {
    var col = findJudgeVoteColumn(headers, round, judgeId);
    if (col < 0) throw new Error('Judge VOTE column not found for ' + judgeId + ' in ' + round);
    var written = 0;
    entries.forEach(function (entry) {
      var rowIdx = findContestantRow(data, headerRow + 2, numIdx, entry.contestantId);
      if (rowIdx < 0) return;
      sh.getRange(rowIdx + 1, col + 1).setValue(mapStatusToVoteCell(entry));
      written++;
    });
    return written;
  }

  if (round === 'final') {
    var rank = parseInt(String(judgeId).replace(/^J/, ''), 10);
    var basicsCols = [];
    for (var i = 0; i < subHeaders.length; i++) {
      if (subHeaders[i] === '기본기') basicsCols.push(i);
    }
    if (!rank || basicsCols.length < rank) throw new Error('Judge cols not found: ' + judgeId);
    var b = basicsCols[rank - 1];
    var written = 0;
    entries.forEach(function (entry) {
      var rowIdx = findContestantRow(data, headerRow + 2, numIdx, entry.contestantId);
      if (rowIdx < 0) return;
      sh.getRange(rowIdx + 1, b + 1).setValue(entry.basics);
      sh.getRange(rowIdx + 1, b + 2).setValue(entry.connection);
      sh.getRange(rowIdx + 1, b + 3).setValue(entry.musicality);
      written++;
    });
    return written;
  }

  throw new Error('Unknown round: ' + round);
}

// One-shot maintenance helper. Run once from the Apps Script editor:
// Editor → select function "renameRemarksToStatus" → click Run.
// Renames the "비고" header on "3.참가자" to "상태". Idempotent — safe to re-run.
function renameRemarksToStatus() {
  var ss = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) throw new Error('Sheet not found: ' + SHEET_NAME);
  var data = sh.getDataRange().getValues();
  var headerRow = -1;
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][0] || '').trim() === '참가번호') { headerRow = i; break; }
  }
  if (headerRow < 0) throw new Error('header row not found');
  var row = data[headerRow];
  for (var c = 0; c < row.length; c++) {
    if (String(row[c] || '').trim() === '비고') {
      sh.getRange(headerRow + 1, c + 1).setValue('상태');
      Logger.log('Renamed 비고 → 상태 at column ' + (c + 1));
      return 'renamed at column ' + (c + 1);
    }
  }
  Logger.log('No "비고" column found (already renamed?)');
  return 'no-op';
}
