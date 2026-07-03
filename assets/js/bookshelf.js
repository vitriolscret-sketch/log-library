/**
 * 메인 페이지: 캠페인 북 선반 렌더링
 * data.js가 먼저 로드되어 CAMPAIGNS / SESSIONS / CHARACTERS가 정의되어 있어야 함.
 */
(function () {
  const statsBar = document.getElementById("statsBar");
  const bookshelf = document.getElementById("bookshelf");

  // ===== 통계 대시보드 =====
  function renderStats() {
    const sessionCount = SESSIONS.length;
    const campaignCount = Object.keys(CAMPAIGNS).length;
    const charCount = CHARACTERS.length;
    const latestDate = SESSIONS.length
      ? SESSIONS.reduce((a, b) => (a.date > b.date ? a : b)).date
      : "-";

    statsBar.innerHTML = `
      <div class="stat-item">
        <span class="stat-value">${campaignCount}</span>
        <span class="stat-label">캠페인</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">${sessionCount}</span>
        <span class="stat-label">세션</span>
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

  // ===== 북 선반 =====
  function renderBookshelf() {
    // 세션이 존재하는 캠페인만 사용
    const usedIds = [...new Set(SESSIONS.map(s => s.campaign).filter(Boolean))];

    if (usedIds.length === 0) {
      bookshelf.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📖</div>
          <p class="empty-title">아직 캠페인이 없습니다</p>
          <p class="empty-desc">data.js에 캠페인과 세션을 추가해 보세요.</p>
        </div>`;
      return;
    }

    bookshelf.innerHTML = usedIds.map((id, i) => {
      const c = CAMPAIGNS[id];
      if (!c) return "";
      const sessions = getSessionsByCampaign(id);
      const count = sessions.length;
      const latest = sessions.length
        ? sessions.reduce((a, b) => (a.date > b.date ? a : b)).date
        : "-";
      return `
        <a class="book" href="campaign.html?id=${encodeURIComponent(id)}" style="--book-color:${c.color}; animation-delay:${i * 0.08}s">
          <div class="book-cover">
            <span class="book-spine"></span>
            <div class="book-label">
              <div class="book-title">${escapeHtml(c.name)}</div>
            </div>
          </div>
          <div class="book-meta">
            <div class="book-desc">${escapeHtml(c.desc || "")}</div>
            <div class="book-info">
              <span>📚 ${count}화</span>
              <span>📅 ${latest}</span>
            </div>
          </div>
        </a>
      `;
    }).join("");
  }

  renderStats();
  renderBookshelf();
})();