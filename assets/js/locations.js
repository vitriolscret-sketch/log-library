/**
 * 등장 장소 목록 페이지 렌더링 (locations.html)
 * 데이터는 data.js에서 정의된 LOCATIONS / escapeHtml을 사용합니다.
 * type별 섹션으로 분리하며, 각 섹션 내에서 이름 가나다순 정렬합니다.
 */
(function () {
  const locationList = document.getElementById("locationList");

  // 장소 카드 HTML 생성 — 배경 이미지를 카드 상단에 표시
  function cardHtml(l, i) {
    const imageHtml = l.image
      ? `<div class="location-card-image"><img src="${escapeHtml(l.image)}" alt="${escapeHtml(l.name)}" loading="lazy" onerror="this.parentElement.style.display='none'"></div>`
      : "";
    return `
    <a class="location-card" href="location.html?id=${encodeURIComponent(l.id)}" style="animation-delay:${i * 0.05}s">
      ${imageHtml}
      <div class="location-card-body">
        <div class="location-card-head">
          <span class="location-type">${escapeHtml(l.type || "기타")}</span>
        </div>
        <div class="location-card-name">${escapeHtml(l.name)}</div>
        <div class="location-card-desc">${escapeHtml(l.summary || "")}</div>
      </div>
    </a>
  `;
  }

  function renderLocations() {
    if (LOCATIONS.length === 0) {
      locationList.innerHTML = '<p class="empty">등록된 장소가 없습니다.</p>';
      return;
    }

    // type별로 그룹화 (이미 getLocationsByType에서 가나다 정렬됨)
    const groups = getLocationsByType();

    // 섹션 순서: 사전식 정렬 (type 이름 가나다순)
    const sectionOrder = Object.keys(groups).sort((a, b) => a.localeCompare(b, "ko"));

    let cardIndex = 0;
    locationList.innerHTML = sectionOrder.map(type => {
      const items = groups[type];
      const cards = items.map(l => cardHtml(l, cardIndex++)).join("");
      return `
        <h3 class="loc-section-heading">${escapeHtml(type)} <span class="loc-section-count">${items.length}</span></h3>
        <div class="location-grid">
          ${cards}
        </div>
      `;
    }).join("");
  }

  renderLocations();
})();