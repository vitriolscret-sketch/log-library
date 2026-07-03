/**
 * 캠페인 북 페이지: 해당 캠페인의 세션 목록을 표시
 * URL: campaign.html?id=<campaignId>
 * data.js가 먼저 로드되어야 함.
 */
(function () {
  const view = document.getElementById("campaignView");

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    view.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📚</div>
        <p class="empty-title">캠페인이 선택되지 않았습니다</p>
        <p class="empty-desc">서가에서 캠페인 책을 골라주세요.</p>
      </div>`;
    return;
  }

  const campaign = CAMPAIGNS[id];
  const sessions = getSessionsByCampaign(id);

  if (!campaign) {
    view.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">❓</div>
        <p class="empty-title">알 수 없는 캠페인</p>
        <p class="empty-desc">id "${escapeHtml(id)}"에 해당하는 캠페인을 찾을 수 없습니다.</p>
      </div>`;
    return;
  }

  document.title = `${campaign.name} · TRPG 로그 아카이브`;

  const chapters = sessions.length
    ? sessions.map((s, i) => {
        const active = false;
        return `
          <a class="chapter-item" href="log.html?c=${encodeURIComponent(id)}&s=${s.num}" style="--book-color:${campaign.color}; animation-delay:${i * 0.05}s">
            <div class="chapter-left">
              <span class="chapter-num">${String(s.num).padStart(2, "0")}</span>
            </div>
            <div class="chapter-body">
              <span class="chapter-title">${escapeHtml(s.title)}</span>
              <span class="chapter-summary">${escapeHtml(s.summary)}</span>
            </div>
            <div class="chapter-right">
              <span class="chapter-date">${s.date}</span>
              <span class="chapter-go">→</span>
            </div>
          </a>
        `;
      }).join("")
    : `<div class="empty-state">
         <div class="empty-icon">📄</div>
         <p class="empty-title">아직 세션이 없습니다</p>
         <p class="empty-desc">이 캠페인에 세션을 추가해 보세요.</p>
       </div>`;

  view.innerHTML = `
    <header class="campaign-header" style="--book-color:${campaign.color}">
      <div class="campaign-header-label">캠페인 북</div>
      <h2 class="campaign-header-title">${escapeHtml(campaign.name)}</h2>
      <p class="campaign-header-desc">${escapeHtml(campaign.desc || "")}</p>
      <div class="campaign-header-stats">
        <span>📚 ${sessions.length}화</span>
        <span>📅 ${sessions.length ? sessions.reduce((a, b) => (a.date > b.date ? a : b)).date : "-"}</span>
      </div>
    </header>

    <h3 class="chapter-list-heading">목차</h3>
    <div class="chapter-list">
      ${chapters}
    </div>
  `;
})();