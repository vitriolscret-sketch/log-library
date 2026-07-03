/**
 * 캠페인 정의
 * 새 캠페인을 추가할 때 이 객체에 항목을 추가하세요.
 * - id: 세션 데이터의 campaign과 일치해야 함 (영문 소문자 권장)
 * - name: 표시 이름
 * - color: 태그 색상 (CSS 색상값)
 */
const CAMPAIGNS = {
  "main":      { name: "메인 캠페인",   color: "#7aa2f7" },
  "side":      { name: "사이드 스토리", color: "#bb9af7" },
  "oneshot":   { name: "원샷",         color: "#e0af68" },
  // 새 캠페인은 여기에 추가
};

/**
 * 세션 메타데이터
 * 새 세션을 추가할 때 이 배열에 항목을 추가하세요.
 * - file: logs 폴더 안의 HTML 파일명
 * - num: 세션 번호
 * - title: 세션 제목
 * - date: 진행 날짜
 * - summary: 한 줄 요약 (검색에 사용됨)
 * - campaign: CAMPAIGNS의 id (위 참조)
 */
const SESSIONS = [
  {
    file: "session01.html",
    num: 1,
    title: "첫 번째 세션 - 모험의 시작",
    date: "2026-01-15",
    summary: "모험자들이 처음 만나 여관에서 의뢰를 받는 도입부 세션.",
    campaign: "main"
  },
  {
    file: "session02.html",
    num: 2,
    title: "두 번째 세션 - 숲의 비밀",
    date: "2026-01-22",
    summary: "의뢰를 받고 숲으로 향하는 탐험 파트. 첫 번째 전투 발생.",
    campaign: "main"
  }
  // 새 세션은 여기에 추가
];

// ===== 렌더링 =====
const sessionList = document.getElementById("sessionList");
const searchInput = document.getElementById("searchInput");
const searchClear = document.getElementById("searchClear");
const campaignFilters = document.getElementById("campaignFilters");
const statsBar = document.getElementById("statsBar");
const resultCount = document.getElementById("resultCount");

// 현재 선택된 캠페인 필터 (null = 전체)
let activeCampaign = null;

// ===== 통계 대시보드 렌더링 =====
function renderStats() {
  const sessionCount = SESSIONS.length;
  const campaignCount = new Set(SESSIONS.map(s => s.campaign).filter(Boolean)).size;
  const charCount = (typeof CHARACTERS !== "undefined") ? CHARACTERS.length : 0;
  const latestDate = SESSIONS.length
    ? SESSIONS.reduce((a, b) => (a.date > b.date ? a : b)).date
    : "-";

  statsBar.innerHTML = `
    <div class="stat-item">
      <span class="stat-value">${sessionCount}</span>
      <span class="stat-label">세션</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">${campaignCount}</span>
      <span class="stat-label">캠페인</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">${charCount}</span>
      <span class="stat-label">등장인물</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">${latestDate}</span>
      <span class="stat-label">최근 진행</span>
    </div>
  `;
}

// ===== 캠페인 필터 버튼 생성 =====
function renderCampaignFilters() {
  // 실제 사용 중인 캠페인만 수집
  const usedCampaigns = [...new Set(SESSIONS.map(s => s.campaign).filter(Boolean))];

  const buttons = [
    `<button class="campaign-tag ${activeCampaign === null ? "active" : ""}" data-campaign="">전체</button>`,
    ...usedCampaigns.map(id => {
      const c = CAMPAIGNS[id];
      if (!c) return "";
      const isActive = activeCampaign === id;
      return `<button class="campaign-tag ${isActive ? "active" : ""}" data-campaign="${id}" style="--tag-color:${c.color}">${escapeHtml(c.name)}</button>`;
    })
  ];

  campaignFilters.innerHTML = buttons.join("");
}

// ===== 캠페인 필터 클릭 처리 =====
campaignFilters.addEventListener("click", (e) => {
  const btn = e.target.closest(".campaign-tag");
  if (!btn) return;
  activeCampaign = btn.dataset.campaign || null;
  renderCampaignFilters();
  renderSessions(searchInput.value);
});

function renderSessions(filter = "") {
  const q = filter.trim().toLowerCase();
  let filtered = SESSIONS;

  // 캠페인 필터 적용
  if (activeCampaign) {
    filtered = filtered.filter(s => s.campaign === activeCampaign);
  }

  // 검색어 필터 적용
  if (q) {
    filtered = filtered.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.summary.toLowerCase().includes(q) ||
      String(s.num).includes(q)
    );
  }

  if (filtered.length === 0) {
    sessionList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <p class="empty-title">검색 결과가 없습니다</p>
        <p class="empty-desc">다른 키워드나 캠페인 필터를 시도해 보세요.</p>
      </div>`;
    resultCount.textContent = "";
    return;
  }

  // 번호 역순(최신 먼저) 정렬
  const sorted = [...filtered].sort((a, b) => b.num - a.num);

  // 결과 카운트 표시
  const total = SESSIONS.length;
  if (filtered.length < total) {
    resultCount.textContent = `${filtered.length} / ${total}개 세션`;
  } else {
    resultCount.textContent = `총 ${total}개의 세션`;
  }

  sessionList.innerHTML = sorted.map((s, i) => {
    const camp = s.campaign ? CAMPAIGNS[s.campaign] : null;
    const tag = camp
      ? `<span class="session-campaign" style="--tag-color:${camp.color}">${escapeHtml(camp.name)}</span>`
      : "";
    return `
      <a class="session-card" href="logs/${s.file}" style="animation-delay:${i * 0.05}s">
        <div class="session-card-head">
          <span class="session-num">Session ${s.num}</span>
          ${tag}
        </div>
        <span class="session-title">${escapeHtml(s.title)}</span>
        <span class="session-summary">${escapeHtml(s.summary)}</span>
        <div class="session-card-foot">
          <span class="session-date">📅 ${s.date}</span>
          <span class="session-go">열람 →</span>
        </div>
      </a>
    `;
  }).join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ===== 검색 =====
searchInput.addEventListener("input", (e) => {
  const val = e.target.value;
  searchClear.classList.toggle("visible", val.length > 0);
  renderSessions(val);
});

searchClear.addEventListener("click", () => {
  searchInput.value = "";
  searchClear.classList.remove("visible");
  renderSessions();
  searchInput.focus();
});

// ===== 초기 렌더링 =====
renderStats();
renderCampaignFilters();
renderSessions();