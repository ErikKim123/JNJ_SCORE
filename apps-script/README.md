# Apps Script 배포 가이드

`반영` 버튼이 실제로 시트에 데이터를 쓰려면 이 Apps Script를 **시트에 바인딩하여 Web App으로 배포**해야 합니다 (브라우저 측 OAuth 없이 시트 소유자 권한으로 실행).

## 1. 시트에 Apps Script 바인딩

1. https://docs.google.com/spreadsheets/d/1jLboWRedqNiTa2QYBzbzkYNKfcqehTKLR1dSvB-6DMw/edit 열기
2. 메뉴 **Extensions → Apps Script** 클릭
3. 기본 `Code.gs`의 내용을 모두 지우고, 이 폴더의 [`Code.gs`](./Code.gs) 내용을 그대로 붙여넣기
4. 파일 상단 `EXPECTED_TOKEN` 상수를 임의의 비밀 문자열로 변경 (예: `jnj-2026-secret-xxx`)
5. **저장** (Ctrl+S)

## 2. Web App 배포

1. Apps Script 편집기에서 우상단 **Deploy → New deployment** 클릭
2. **Select type → Web app**
3. 설정:
   - Description: `JNJ Score API`
   - Execute as: **Me (시트 소유자)**
   - Who has access: **Anyone with the link**
4. **Deploy** 클릭 → 권한 승인 (Google 계정 인증)
5. 발급된 **Web app URL** 복사 (`https://script.google.com/macros/s/AKfycb.../exec` 형식)

## 3. .env.local 설정

```env
NEXT_PUBLIC_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycb.../exec
NEXT_PUBLIC_APPS_SCRIPT_TOKEN=jnj-2026-secret-xxx   # Code.gs의 EXPECTED_TOKEN과 동일
NEXT_PUBLIC_USE_MOCK=1
```

> `NEXT_PUBLIC_USE_MOCK=1`이어도 URL이 placeholder가 아니면 **submit만은 실제 Apps Script로 전송**합니다 (읽기는 계속 CSV 라이브로).

## 4. dev server 재시작

`.env.local` 변경은 dev server 재시작이 필요합니다.

## 코드 업데이트 후 재배포

`Code.gs` 수정 후 즉시 반영하려면:
- Apps Script 편집기 → **Deploy → Manage deployments**
- 기존 배포의 연필 아이콘 → **Version: New version** → **Deploy**
- URL은 동일하게 유지됨

## 동작 요약

| Round | 시트 영향 |
|---|---|
| `prelim` | `3.참가자`의 `예선통과` 컬럼에 `TRUE`/`FALSE` 기록 (last-writer-wins) |
| `semi` | `3.참가자`의 `본선통과` 컬럼에 `TRUE`/`FALSE` 기록 |
| `final` | `3.참가자`의 해당 심사위원 column 묶음(`기본기`/`연결성`/`음악성`)에 점수 기록 |

심사위원 매핑은 `judgeId = J{nn}`이 시트의 `n번째` 심사위원 column에 대응하도록 동작합니다 (`J01` → ① 김도윤).

## 트러블슈팅

- **`Invalid token`**: `Code.gs`의 `EXPECTED_TOKEN`과 `.env.local`의 `NEXT_PUBLIC_APPS_SCRIPT_TOKEN`이 일치하지 않음
- **`Sheet not found`**: 시트 탭 이름이 `3.참가자`가 맞는지 확인
- **`Cannot locate header row`**: `참가번호`로 시작하는 행이 있어야 함
- **권한 오류**: 배포 시 "Anyone with the link" 선택했는지 확인
