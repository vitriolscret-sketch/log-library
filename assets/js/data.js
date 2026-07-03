/**
 * 공통 데이터 파일 (data.js)
 * 캠페인·세션·등장인물 데이터를 한 곳에서 관리합니다.
 * 모든 페이지에서 공유하여 사용합니다.
 */

// ===== 캠페인 정의 =====
// - id: 세션 데이터의 campaign과 일치 (영문 소문자 권장)
// - name: 표시 이름
// - color: 태그/북 커버 색상 (CSS 색상값)
// - desc: 캠페인 소개 (북 선반에 표시)
const CAMPAIGNS = {
  "main": {
    name: "메인 캠페인",
    color: "#7aa2f7",
    desc: "모험자들이 동쪽 숲의 미스터리를 파헤치는 본편 스토리."
  },
  "side": {
    name: "사이드 스토리",
    color: "#bb9af7",
    desc: "본편과 평행하는 짧은 외전 이야기들."
  },
  "oneshot": {
    name: "원샷",
    color: "#e0af68",
    desc: "단발성으로 진행된 짧은 시나리오 모음."
  },
  "test": {
    name: "테스트 캠페인",
    color: "#949494",
    desc: "테스트 용도."
  },
  "frost": {
    name: "서리의 추적자",
    color: "#7dcfff",
    desc: "영원한 겨울의 북부 도시에서 펼쳐지는 연쇄 실종 미스터리."
  }
  // 새 캠페인은 여기에 추가
};

// ===== 세션 메타데이터 =====
// - file: logs 폴더 안의 HTML 파일명
// - num: 캠페인 내 세션 번호
// - title: 세션 제목
// - date: 진행 날짜
// - summary: 한 줄 요약 (검색에 사용됨)
// - campaign: CAMPAIGNS의 id
const SESSIONS = [
  {
    file: "session01.html",
    num: 1,
    title: "모험의 시작",
    date: "2026-01-15",
    summary: "모험자들이 처음 만나 여관에서 의뢰를 받는 도입부 세션.",
    campaign: "main"
  },
  {
    file: "session02.html",
    num: 2,
    title: "숲의 비밀",
    date: "2026-01-22",
    summary: "의뢰를 받고 숲으로 향하는 탐험 파트. 첫 번째 전투 발생.",
    campaign: "main"
  },
  {
    file: "session03.html",
    num: 3,
    title: "폐허의 그림자",
    date: "2026-01-29",
    summary: "숲 깊은 곳의 고대 폐허에서 봉인을 발견하고, 미라가 이를 해독한다.",
    campaign: "main"
  },
  {
    file: "side01.html",
    num: 1,
    title: "여관의 밤",
    date: "2026-01-18",
    summary: "본편 1화와 2화 사이, 여관에서 보낫 하룻밤의 에피소드.",
    campaign: "side"
  },
  {
    file: "oneshot01.html",
    num: 1,
    title: "고래의 노래",
    date: "2026-02-05",
    summary: "항구 마을에서 벌어진 단발성 미스터리 시나리오.",
    campaign: "oneshot"
  },
  {
    file: "testlog.html",
    num: 1,
    title: "테스트",
    date: "2026-05-15",
    summary: "이것은 테스트입니다.",
    campaign: "test"
  },
  {
    file: "frost01.html",
    num: 1,
    title: "도시의 첫인상",
    date: "2026-06-28",
    summary: "북부 도시 '미드파스트'에 도착한 조사단, 도착 직후 의문의 실종 사건 보고를 접한다.",
    campaign: "frost"
  },
  // 새 세션은 여기에 추가
];

// ===== 등장인물 데이터 =====
// - id: 고유 식별자 (영문 소문자, URL에 사용)
// - name: 이름
// - role: 역할 (PC / NPC / 빌런 등)
// - background: 배경 이야기
// - current: 현재 상황 / 최근 동향
// - description: 상세 페이지용 긴 설명 (선택)
// - relatedSessions: 관련 세션 번호 배열 (선택, [campaignId, num] 튜플 또는 번호만)
const CHARACTERS = [
  {
    id: "arin",
    name: "아린",
    role: "PC · 전사",
    background: "소도시 출신의 검사. 가족을 잃은 후 모험자 길드에 가입했다.",
    current: "현재 숲의 비밀을 조사 중. 동료들과 신뢰를 쌓고 있다.",
    description: "아린은 북부 소도시 출신의 젊은 검사로, 어린 시절 도적 습격으로 가족을 잃었다. 이후 모험자 길드에 가입하여 검술을 갈고닦았다. 감정을 잘 드러내지 않지만, 동료에 대한 의리는 매우 강한 편이다. 현재 미라와 함께 동쪽 숲의 실종 사건을 조사하고 있으며, 점차 리더 역할을 맡고 있다.",
    relatedSessions: [["main", 1], ["main", 2]]
  },
  {
    id: "mira",
    name: "미라",
    role: "PC · 마법사",
    background: "왕립 아카데미 출신. 고대 마법 유적을 연구하는 학자이다.",
    current: "숲에서 발견된 룬 문자를 해독하고 있다.",
    description: "미라는 왕립 마법 아카데미를 최우수로 졸업한 천재 마법사. 고대 문명의 마법 유적을 연구하는 것이 주 관심사이며, 학자적 호기심이 매우 강하다. 아카데미 시절부터 현장 답사를 중시해 왔고, 실전 경험도 꽤 쌓았다. 동쪽 숲에서 발견된 룬 문자가 자신의 연구 주제와 연관이 있다고 판단하여 아린과 함께 의뢰에 참여했다.",
    relatedSessions: [["main", 1], ["main", 2]]
  }
  // 새 인물은 여기에 추가
];

// ===== 공용 헬퍼 =====
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

// 캠페인 id로 세션 목록 반환 (번호 오름차순)
function getSessionsByCampaign(campaignId) {
  return SESSIONS
    .filter(s => s.campaign === campaignId)
    .sort((a, b) => a.num - b.num);
}

// 캠페인 id와 세션 번호로 세션 찾기
function findSession(campaignId, num) {
  return SESSIONS.find(s => s.campaign === campaignId && s.num === Number(num));
}

// 캐릭터 id로 캐릭터 찾기
function findCharacter(id) {
  return CHARACTERS.find(c => c.id === id);
}