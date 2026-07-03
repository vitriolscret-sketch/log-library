/**
 * 등장인물 목록 페이지 렌더링 (characters.html)
 * 데이터는 data.js에서 정의된 CHARACTERS / escapeHtml을 사용합니다.
 */
(function () {
  const characterList = document.getElementById("characterList");

  function renderCharacters() {
    if (CHARACTERS.length === 0) {
      characterList.innerHTML = '<p class="empty">등록된 등장인물이 없습니다.</p>';
      return;
    }

    characterList.innerHTML = CHARACTERS.map((c, i) => {
      const initial = c.name.charAt(0);
      // 이름 기반 해시 색상
      const hue = [...c.name].reduce((a, ch) => a + ch.charCodeAt(0), 0) % 360;
      const avatarColor = `hsl(${hue}, 55%, 45%)`;
      // portrait이 있으면 이미지를 이니셜 위에 덮어 씌움 (로드 실패 시 이니셜 폴백)
      const avatarHtml = c.portrait
        ? `<span class="char-avatar-initial">${escapeHtml(initial)}</span><img class="char-avatar-img" src="${escapeHtml(c.portrait)}" alt="${escapeHtml(c.name)}" loading="lazy" onerror="this.style.display='none'">`
        : escapeHtml(initial);
      return `
      <a class="character-card" href="character.html?id=${encodeURIComponent(c.id)}" style="animation-delay:${i * 0.05}s">
        <div class="char-card-head">
          <div class="char-avatar" style="--avatar-color:${avatarColor}">${avatarHtml}</div>
          <div class="char-card-info">
            <div class="char-name">${escapeHtml(c.name)}</div>
            <div class="char-role">${escapeHtml(c.role)}</div>
          </div>
        </div>
        <div class="char-section">
          <h4>배경</h4>
          <p>${escapeHtml(c.background)}</p>
        </div>
        <div class="char-section">
          <h4>현재 상황</h4>
          <p>${escapeHtml(c.current)}</p>
        </div>
        <div class="char-more">자세히 보기 →</div>
      </a>
    `;
    }).join("");
  }

  renderCharacters();
})();