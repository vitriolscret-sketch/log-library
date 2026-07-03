# TRPG 로그 아카이브

TRPG 세션 로그를 "동화책 펼치듯" 열람할 수 있는 정적 웹사이트입니다. GitHub Pages로 호스팅됩니다.

## 사이트 구조 (3단계 내비게이션)

```
1. 서가 (index.html)
   └─ 캠페인 북을 책처럼 진열한 메인 화면
2. 캠페인 북 (campaign.html?id=<캠페인id>)
   └─ 해당 캠페인의 세션 로그 목차 (뒤로가기 → 서가)
3. 로그 열람 (log.html?c=<캠페인id>&s=<세션번호>)
   └─ 사이드바(같은 캠페인 세션 목록) + 로그 본문(iframe)
      └─ 이전/다음 세션 이동 + 뒤로가기 → 목차
```

등장인물은 별도 페이지로 분리됩니다:
- `characters.html` : 등장인물 목록
- `character.html?id=<캐릭터id>` : 개별 인물 상세 (관련 세션 링크 포함)

## 파일 구조

```
log library/
├── index.html              # 캠페인 서가 (메인)
├── campaign.html           # 캠페인 북(로그 목차)
├── log.html                # 로그 열람(사이드바 + 본문)
├── characters.html         # 등장인물 목록
├── character.html          # 개별 등장인물 상세 (?id=)
├── logs/                   # 세션 로그 HTML 파일들
│   ├── session01.html
│   ├── session02.html
│   ├── session03.html
│   ├── side01.html
│   ├── oneshot01.html
│   └── frost01.html
├── assets/
│   ├── css/style.css       # 공통 스타일
│   └── js/
│       ├── data.js         # ★ 공통 데이터 원천 (캠페인·세션·인물)
│       ├── bookshelf.js    # 서가 렌더링 (index)
│       ├── campaign.js     # 캠페인 북 렌더링
│       ├── log-viewer.js   # 로그 열람 렌더링
│       ├── characters.js   # 인물 목록 렌더링
│       ├── character-detail.js  # 인물 상세 렌더링
│       └── theme.js        # 다크/라이트 토글 + 스크롤 탑
└── .github/workflows/
    └── deploy.yml          # GitHub Pages 자동 배포
```

## 새 캠페인 추가 방법

`assets/js/data.js`의 `CAMPAIGNS` 객체에 항목 추가:
```js
"event": {
  name: "이벤트",
  color: "#f7768e",
  desc: "단기 이벤트 시나리오 모음."  // 북 선반에 표시될 설명
}
```

## 새 세션 추가 방법

1. `logs/` 폴더에 HTML 파일 추가 (예: `session03.html`)
2. `assets/js/data.js`의 `SESSIONS` 배열에 항목 추가:
   ```js
   {
     file: "session03.html",
     num: 3,                        // 캠페인 내 번호 (1부터)
     title: "세션 제목",
     date: "2026-02-01",
     summary: "한 줄 요약",
     campaign: "main"               // CAMPAIGNS의 id
   }
   ```

## 새 등장인물 추가 방법

`assets/js/data.js`의 `CHARACTERS` 배열에 항목 추가:
```js
{
  id: "arin",
  name: "아린",
  role: "PC · 전사",
  background: "배경 이야기",
  current: "현재 상황",
  description: "상세 페이지용 긴 설명 (선택)",
  relatedSessions: [["main", 1], ["main", 2]]  // [campaignId, num] 튜플 (선택)
}
```

## URL 형식

- 서가: `index.html`
- 캠페인 북: `campaign.html?id=main`
- 로그 열람: `log.html?c=main&s=1`
- 등장인물 상세: `character.html?id=arin`

## 로컬에서 미리보기

VS Code에서 [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) 확장을 설치하고 `index.html`을 우클릭 → "Open with Live Server"로 실행하세요.

## GitHub Pages 배포

1. 이 폴더를 GitHub 저장소에 푸시
2. 저장소 Settings → Pages → Source를 **"GitHub Actions"**로 설정
3. `main` 브랜치에 푸시하면 자동으로 배포됨

## 기술 스택

- 순수 HTML / CSS / JavaScript (빌드 없음)
- GitHub Actions로 자동 배포
- 다크/라이트 테마 토글 (선택 저장)