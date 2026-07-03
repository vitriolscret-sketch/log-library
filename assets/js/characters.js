/**
 * 등장인물 목록 페이지 렌더링 (characters.html)
 * 데이터는 data.js에서 정의된 CHARACTERS / escapeHtml을 사용합니다.
 * PC / NPC 섹션으로 분리하며, 각 섹션 내에서 이름 가나다순 정렬합니다.
 */
(function () {
  const characterList = document.getElementById("characterList");

  // role에서 분류 추출: "PC · 전사" → "PC", "NPC · 여관 주인" → "NPC"
  function classify(c) {
    const tag = (c.role || "").split("·")[0].trim().toUpperCase();
    if (tag === "PC") return "PC";
    if (tag === "NPC") return "NPC";
    // 기타: role 그대로 분류명 사용 (예: "빌런")
    return tag || "기타";
  }

  // 이름 가나다 정렬
  function byName(a, b) {
    return a.name.localeCompare(b.name, "ko");
  }

  // 캐릭터 카드 HTML 생성
  function cardHtml(c, i) {
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
  }

  function renderCharacters() {
    if (CHARACTERS.length === 0) {
      characterList.innerHTML = '<p class="empty">등록된 등장인물이 없습니다.</p>';
      return;
    }

    // 분류별로 그룹화
    const groups = {};
    CHARACTERS.forEach(c => {
      const cls = classify(c);
      if (!groups[cls]) groups[cls] = [];
      groups[cls].push(c);
    });

    // 섹션 순서: PC → NPC → 기타(등장 순)
    const order = ["PC", "NPC"];
    const others = Object.keys(groups).filter(k => !order.includes(k));
    const sectionOrder = [...order.filter(k => groups[k]), ...others];

    let cardIndex = 0;
    characterList.innerHTML = sectionOrder.map(cls => {
      const items = groups[cls].sort(byName);
      const label = cls === "PC" ? "플레이어 캐릭터 (PC)"
                  : cls === "NPC" ? "논플레이어 캐릭터 (NPC)"
                  : cls;
      const cards = items.map(c => cardHtml(c, cardIndex++)).join("");
      return `
        <h3 class="char-section-heading">${escapeHtml(label)} <span class="char-section-count">${items.length}</span></h3>
        <div class="character-grid">
          ${cards}
        </div>
      `;
    }).join("");
  }

  renderCharacters();
})();