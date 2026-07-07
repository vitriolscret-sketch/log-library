/**
 * 캠페인 북 페이지: 3-탭 구조 (목차 / 인물 / 장소)
 * URL: campaign.html?id=<campaignId>
 * 탭 전환: URL hash (#chapters / #characters / #locations), 기본 #chapters
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
  const characters = getCharactersByCampaign(id);
  const locations = getLocationsByCampaign(id);

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

  // ===== 목차 탭 내용 =====
  const chapters = sessions.length
    ? sessions.map((s, i) => {
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

  const chaptersTab = `
    <h3 class="chapter-list-heading">목차</h3>
    <div class="chapter-list">
      ${chapters}
    </div>
  `;

  // ===== 인물 탭 내용 (PC / NPC 하위 섹션) =====
  // role에서 분류 추출: "PC · 전사" → "PC", "NPC · 여관 주인" → "NPC"
  function classifyRole(c) {
    const tag = (c.role || "").split("·")[0].trim().toUpperCase();
    return tag === "PC" || tag === "NPC" ? tag : (tag || "기타");
  }

  function charCardHtml(c, i) {
    const initial = c.name.charAt(0);
    const hue = [...c.name].reduce((a, ch) => a + ch.charCodeAt(0), 0) % 360;
    const avatarColor = `hsl(${hue}, 55%, 45%)`;
    const avatarHtml = c.portrait
      ? `<span class="char-avatar-initial">${escapeHtml(initial)}</span><img class="char-avatar-img" src="${escapeHtml(c.portrait)}" alt="${escapeHtml(c.name)}" loading="lazy" onerror="this.style.display='none'">`
      : escapeHtml(initial);
    return `
      <a class="character-card" href="character.html?id=${encodeURIComponent(c.id)}&c=${encodeURIComponent(id)}" style="animation-delay:${i * 0.05}s">
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

  const charactersTab = (() => {
    if (!characters.length) {
      return `<div class="empty-state">
        <div class="empty-icon">👤</div>
        <p class="empty-title">이 캠페인에 등록된 인물이 없습니다</p>
        <p class="empty-desc">data.js에서 이 캠페인의 인물 campaigns 필드를 추가해 보세요.</p>
      </div>`;
    }
    // 분류별 그룹화 + 가나다 정렬
    const groups = {};
    characters.forEach(c => {
      const cls = classifyRole(c);
      if (!groups[cls]) groups[cls] = [];
      groups[cls].push(c);
    });
    const sectionOrder = ["PC", "NPC"].filter(k => groups[k]);
    const others = Object.keys(groups).filter(k => !["PC", "NPC"].includes(k));
    const allSections = [...sectionOrder, ...others];

    let idx = 0;
    return allSections.map(cls => {
      const label = cls === "PC" ? "플레이어 캐릭터 (PC)"
                  : cls === "NPC" ? "논플레이어 캐릭터 (NPC)"
                  : cls;
      const cards = groups[cls].sort((a, b) => a.name.localeCompare(b.name, "ko"))
        .map(c => charCardHtml(c, idx++)).join("");
      return `
        <h3 class="char-section-heading">${escapeHtml(label)} <span class="char-section-count">${groups[cls].length}</span></h3>
        <div class="character-grid">${cards}</div>
      `;
    }).join("");
  })();

  // ===== 장소 탭 내용 =====
  const locationsTab = locations.length
    ? `<div class="location-grid">
         ${locations.map((l, i) => {
           const imageHtml = l.image
             ? `<div class="location-card-image"><img src="${escapeHtml(l.image)}" alt="${escapeHtml(l.name)}" loading="lazy" onerror="this.parentElement.style.display='none'"></div>`
             : "";
           return `
           <a class="location-card" href="location.html?id=${encodeURIComponent(l.id)}&c=${encodeURIComponent(id)}" style="animation-delay:${i * 0.05}s">
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
         }).join("")}
       </div>`
    : `<div class="empty-state">
         <div class="empty-icon">📍</div>
         <p class="empty-title">이 캠페인에 등록된 장소가 없습니다</p>
         <p class="empty-desc">data.js에서 이 캠페인의 장소 campaigns 필드를 추가해 보세요.</p>
       </div>`;

  // ===== 설정 탭 내용 =====
  const settings = getSettingsByCampaign(id);
  const settingsTab = settings.length
    ? settings.map((s, i) => `
        <article class="setting-entry" style="animation-delay:${i * 0.05}s">
          <h3 class="setting-entry-title">${escapeHtml(s.title)}</h3>
          <span class="setting-entry-category">${escapeHtml(s.category || "기타")}</span>
          <div class="setting-entry-body">${s.body}</div>
        </article>
      `).join("")
    : `<div class="empty-state">
         <div class="empty-icon">⚙️</div>
         <p class="empty-title">이 캠페인에 등록된 설정이 없습니다</p>
         <p class="empty-desc">data.js에서 이 캠페인의 SETTINGS 항목을 추가해 보세요.</p>
       </div>`;

  // ===== 탭 정의 =====
  const tabs = [
    { id: "chapters", label: "목차", count: sessions.length, content: chaptersTab },
    { id: "characters", label: "인물", count: characters.length, content: charactersTab },
    { id: "locations", label: "장소", count: locations.length, content: locationsTab },
    { id: "settings", label: "설정", count: settings.length, content: settingsTab }
  ];

  // ===== 현재 활성 탭 결정 (hash 기반) =====
  const activeTabId = (() => {
    const hash = window.location.hash.replace("#", "");
    return tabs.some(t => t.id === hash) ? hash : "chapters";
  })();

  // ===== 전체 렌더링 =====
  view.innerHTML = `
    <header class="campaign-header" style="--book-color:${campaign.color}">
      <div class="campaign-header-label">캠페인 북</div>
      <h2 class="campaign-header-title">${escapeHtml(campaign.name)}</h2>
      <p class="campaign-header-desc">${escapeHtml(campaign.desc || "")}</p>
      <div class="campaign-header-stats">
        <span>📚 ${sessions.length}화</span>
        <span>👤 ${characters.length}명</span>
        <span>📍 ${locations.length}곳</span>
        <span>⚙️ ${settings.length}설정</span>
        <span>📅 ${sessions.length ? sessions.reduce((a, b) => (a.date > b.date ? a : b)).date : "-"}</span>
      </div>
    </header>

    <nav class="campaign-tabs">
      ${tabs.map(t => `
        <a class="campaign-tab ${t.id === activeTabId ? "active" : ""}" href="#${t.id}" data-tab="${t.id}">
          ${escapeHtml(t.label)} <span class="campaign-tab-count">${t.count}</span>
        </a>
      `).join("")}
    </nav>
    <div id="tabContent" class="campaign-tab-content">
      ${tabs.find(t => t.id === activeTabId).content}
    </div>
  `;

  // ===== 탭 전환 (hashchange 또는 클릭) =====
  const tabContent = document.getElementById("tabContent");
  const tabLinks = view.querySelectorAll(".campaign-tab");

  function activateTab(tabId) {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;
    tabContent.innerHTML = tab.content;
    tabLinks.forEach(link => {
      link.classList.toggle("active", link.dataset.tab === tabId);
    });
  }

  tabLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      // hash 변경으로 hashchange 이벤트가 발생하므로, 여기서는 중복 처리 방지.
      // hashchange에서 activateTab이 호출됨.
    });
  });

  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.replace("#", "");
    activateTab(tabs.some(t => t.id === hash) ? hash : "chapters");
  });
})();