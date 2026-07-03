/**
 * 개별 등장인물 상세 페이지 렌더링
 * URL: character.html?id=<캐릭터id>
 * data.js가 먼저 로드되어 CHARACTERS / escapeHtml / findSession 을 사용합니다.
 */
(function () {
  const detailEl = document.getElementById("characterDetail");

  // URL에서 id 추출
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    detailEl.innerHTML = '<p class="empty">등장인물이 지정되지 않았습니다.</p>';
    return;
  }

  const c = findCharacter(id);

  if (!c) {
    detailEl.innerHTML = `<p class="empty">id "${escapeHtml(id)}"에 해당하는 등장인물을 찾을 수 없습니다.</p>`;
    return;
  }

  // 문서 제목 업데이트
  document.title = `${c.name} · TRPG 로그 아카이브`;

  // 아바타 이니셜 + 색상
  const initial = c.name.charAt(0);
  const hue = [...c.name].reduce((a, ch) => a + ch.charCodeAt(0), 0) % 360;
  const avatarColor = `hsl(${hue}, 55%, 45%)`;

  // 관련 세션 링크 생성
  // relatedSessions 항목은 [campaignId, num] 튜플 또는 번호만 지원
  const relatedHtml = (c.relatedSessions && c.relatedSessions.length > 0)
    ? `<div class="char-detail-section">
         <h3>관련 세션</h3>
         <div class="related-sessions">
           ${c.relatedSessions.map(item => {
             let campaignId, num;
             if (Array.isArray(item)) {
               [campaignId, num] = item;
             } else {
               // 번호만 있는 경우, 캐릭터와 연결된 첫 캠페인 찾기
               const s = SESSIONS.find(x => x.num === Number(item));
               if (!s) return `<span class="related-session">Session ${item}</span>`;
               campaignId = s.campaign;
               num = item;
             }
             const s = findSession(campaignId, num);
             const camp = CAMPAIGNS[campaignId];
             if (s) {
               return `<a class="related-session" href="log.html?c=${encodeURIComponent(campaignId)}&s=${num}">Session ${num} · ${escapeHtml(s.title)}${camp ? ' (' + escapeHtml(camp.name) + ')' : ''}</a>`;
             }
             return `<span class="related-session">Session ${num}</span>`;
           }).join("")}
         </div>
       </div>`
    : "";

  detailEl.innerHTML = `
    <article class="character-detail-card">
      <header class="char-detail-header">
        <div class="char-detail-avatar" style="--avatar-color:${avatarColor}">${escapeHtml(initial)}</div>
        <div>
          <h2 class="char-detail-name">${escapeHtml(c.name)}</h2>
          <span class="char-detail-role">${escapeHtml(c.role)}</span>
        </div>
      </header>

      <div class="char-detail-section">
        <h3>배경</h3>
        <p>${escapeHtml(c.background)}</p>
      </div>

      <div class="char-detail-section">
        <h3>현재 상황</h3>
        <p>${escapeHtml(c.current)}</p>
      </div>

      ${c.description ? `
      <div class="char-detail-section">
        <h3>상세 소개</h3>
        <p>${escapeHtml(c.description)}</p>
      </div>` : ""}

      ${relatedHtml}
    </article>
  `;
})();