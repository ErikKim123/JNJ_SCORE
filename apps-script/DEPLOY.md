# Apps Script 배포 — 한 번에 끝내기

## 5분 안에 끝내는 절차 (방법 B — 새 시트 직접 bound)

### 1. 새 시트에서 Apps Script 열기
브라우저로 대회 마스터 시트 열기:
https://docs.google.com/spreadsheets/d/1gzX4kidjg4J6Qj5g1ANX9ibdeGaK_KkLTgU6xoQVn80/edit

상단 메뉴 **Extensions → Apps Script** 클릭. 새 탭에서 Apps Script 편집기 열림.

### 2. Code.gs 붙여넣기
편집기 좌측 `Code.gs` 클릭 → 기존 내용 모두 선택(Ctrl+A) 삭제 → 이 프로젝트의 `apps-script/Code.gs` 내용 복사해 붙여넣기.

### 3. 매니페스트 표시 + 붙여넣기 (다중 대회 지원용 — 선택)
좌측 ⚙ **Project Settings** → `Show "appsscript.json" manifest file in editor` 체크 ✅ → 좌측 파일 트리에 `appsscript.json` 표시 → 클릭 → 내용을 `apps-script/appsscript.json` 와 동일하게 교체.

> 단일 대회만 운영한다면 이 단계는 건너뛰어도 됩니다. Code.gs 의 `SPREADSHEET_ID = ''` 가 빈 문자열이므로 bound 시트가 자동 사용됩니다.

### 4. 저장
`Ctrl+S` → 좌상단 노란점 사라짐 확인.

### 5. 배포
우상단 파란 **Deploy → New deployment** 클릭.

| 입력 항목 | 값 |
|---|---|
| Description | `JNJ Score v1` (자유) |
| Type | **Web app** (선택 안 되면 우측 ⚙ 톱니바퀴 → Web app 체크) |
| Execute as | **Me (your-email@gmail.com)** |
| **Who has access** | **Anyone** ← 이게 중요! "Only myself"나 "Anyone with Google account"가 아닙니다 |

→ **Deploy** 클릭 → 권한 승인창 → 모두 **Allow**.

### 6. URL 복사
"Deployment successfully updated" 화면에서 Web app URL 옆 📋 복사 아이콘 클릭.

URL 형태: `https://script.google.com/macros/s/AKfycb_____/exec`

### 7. URL 알려주세요
복사한 URL을 채팅창에 붙여넣기만 하시면 제가 `.env.local` 갱신 + curl 검증 + dev 서버 재시작 가이드까지 처리합니다.

---

## 만약 "Anyone" 옵션이 안 보인다면

Google Workspace(회사/학교) 계정에서 외부 공개를 막아둔 상태입니다. 두 가지 선택:

- **개인 Gmail 계정**으로 시트 사본 만들고 거기서 Apps Script 배포
- 관리자에게 외부 Web App 게시 허용 요청

---

## 요약 — 사용자가 클릭해야 하는 곳 7개

1. 시트 열기
2. Extensions → Apps Script
3. Code.gs 붙여넣기
4. (선택) appsscript.json 붙여넣기
5. Ctrl+S 저장
6. Deploy → New deployment → "Anyone" 선택 → Deploy → Allow
7. URL 복사해서 채팅에 붙여넣기

이게 끝입니다.
