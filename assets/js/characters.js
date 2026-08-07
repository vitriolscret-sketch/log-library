/**
 * 등장인물 목록 페이지 렌더링 (characters.html)
 * 데이터는 data.js에서 정의된 CHARACTERS / escapeHtml을 사용합니다.
 * PC / NPC 섹션으로 분리하며, 각 섹션 내에서 이름 가나다순 정렬합니다.
 * 분류/카드 HTML은 data.js의 공용 헬퍼(classifyRole / charCardHtml) 사용.
 */
(function () {
  const characterList = document.getElementById("characterList");

  // 이름 가나다 정렬
  function byName(a, b) {
    return a.name.localeCompare(b.name, "ko");
  }

  function renderCharacters() {
    if (CHARACTERS.length === 0) {
      characterList.innerHTML = '<p class="empty">등록된 등장인물이 없습니다.</p>';
      return;
    }

    // 분류별로 그룹화
    const groups = {};
    CHARACTERS.forEach(c => {
      const cls = classifyRole(c.role);
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
      const cards = items.map(c => charCardHtml(c, { delay: cardIndex++ * 0.05 })).join("");
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