/**
 * 개별 등장 장소 상세 페이지 렌더링
 * URL: location.html?id=<장소id>
 * data.js가 먼저 로드되어 LOCATIONS / escapeHtml / findSession 을 사용합니다.
 */
(function () {
  const detailEl = document.getElementById("locationDetail");

  // URL에서 id 추출
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    detailEl.innerHTML = '<p class="empty">장소가 지정되지 않았습니다.</p>';
    return;
  }

  const loc = findLocation(id);

  if (!loc) {
    detailEl.innerHTML = `<p class="empty">id "${escapeHtml(id)}"에 해당하는 장소를 찾을 수 없습니다.</p>`;
    return;
  }

  // 문서 제목 업데이트
  document.title = `${loc.name} · TRPG 로그 아카이브`;

  // ===== 캠페인 바 (?c=<campaignId> 있을 때 표시) =====
  const campId = params.get("c");
  const campaignBar = document.getElementById("detailCampaignBar");
  if (campId && CAMPAIGNS[campId]) {
    const cmp = CAMPAIGNS[campId];
    campaignBar.innerHTML = `
      <div class="detail-campaign-bar" style="--book-color:${cmp.color}">
        <a href="campaign.html?id=${encodeURIComponent(campId)}#locations" class="detail-campaign-back">← ${escapeHtml(cmp.name)} 목차로</a>
        <span class="detail-campaign-label">장소 상세</span>
      </div>
    `;
  }

  // 배경 이미지 (상단 큰 이미지)
  const imageHtml = loc.image
    ? `<div class="loc-detail-hero"><img src="${escapeHtml(loc.image)}" alt="${escapeHtml(loc.name)}" onerror="this.parentElement.style.display='none'"></div>`
    : "";

  // 관련 세션 링크 생성 — 캠페인 색상 태그 + summary 미리보기 (캐릭터 상세와 동일 형식)
  const relatedHtml = (loc.relatedSessions && loc.relatedSessions.length > 0)
    ? `<div class="char-detail-section">
         <h3>관련 세션</h3>
         <div class="related-sessions">
           ${loc.relatedSessions.map(item => {
             let campaignId, num;
             if (Array.isArray(item)) {
               [campaignId, num] = item;
             } else {
               const s0 = SESSIONS.find(x => x.num === Number(item));
               if (!s0) return `<span class="related-session">Session ${item}</span>`;
               campaignId = s0.campaign;
               num = item;
             }
             const s = findSession(campaignId, num);
             const camp = CAMPAIGNS[campaignId];
             if (s) {
               const tagColor = camp ? camp.color : "var(--accent)";
               const campName = camp ? escapeHtml(camp.name) : "";
               return `<a class="related-session-card" href="log.html?c=${encodeURIComponent(campaignId)}&s=${num}" style="--tag-color:${tagColor}">
                 <div class="related-session-head">
                   <span class="related-session-num">Session ${num}</span>
                   ${campName ? `<span class="related-session-tag">${campName}</span>` : ""}
                 </div>
                 <div class="related-session-title">${escapeHtml(s.title)}</div>
                 <div class="related-session-meta">
                   <span class="related-session-date">📅 ${s.date}</span>
                 </div>
                 <div class="related-session-summary">${escapeHtml(s.summary || "")}</div>
               </a>`;
             }
             return `<span class="related-session">Session ${num}</span>`;
           }).join("")}
         </div>
       </div>`
    : "";

  detailEl.innerHTML = `
    <article class="location-detail-card">
      ${imageHtml}

      <div class="loc-detail-header">
        <h2 class="loc-detail-name">${escapeHtml(loc.name)}</h2>
        <span class="loc-detail-type">${escapeHtml(loc.type || "기타")}</span>
      </div>

      <div class="char-detail-section">
        <h3>개요</h3>
        <p>${escapeHtml(loc.summary)}</p>
      </div>

      ${loc.description ? `
      <div class="char-detail-section">
        <h3>상세 설명</h3>
        <p>${escapeHtml(loc.description)}</p>
      </div>` : ""}

      ${relatedHtml}
    </article>
  `;
})();