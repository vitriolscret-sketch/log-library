/**
 * 로그 열람 페이지: 캠페인 정보 상단 바 + 사이드바(같은 캠페인의 세션 목록) + 로그 본문(iframe)
 * URL: log.html?c=<campaignId>&s=<sessionNum>
 * data.js가 먼저 로드되어야 함. (theme.js는 이 페이지에서 사용하지 않음 - 자체 토글 사용)
 */
(function () {
  // ===== 초기 테마 적용 (theme.js 대신) =====
  const savedTheme = localStorage.getItem("trpg-theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);

  const sidebar = document.getElementById("logSidebar");
  const headerBar = document.getElementById("logHeader");
  const frameWrap = document.getElementById("logFrameWrap");

  const params = new URLSearchParams(window.location.search);
  const cId = params.get("c");
  const sNum = params.get("s");

  // 유효성 검사
  if (!cId || !sNum) {
    sidebar.innerHTML = "";
    headerBar.innerHTML = `
      <div class="log-empty-bar">
        <span class="back-link">←</span>
        <span class="log-empty-text">로그가 지정되지 않았습니다</span>
      </div>`;
    frameWrap.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📄</div>
        <p class="empty-title">로그가 지정되지 않았습니다</p>
        <p class="empty-desc">캠페인 북에서 세션을 선택해 주세요.</p>
      </div>`;
    return;
  }

  const campaign = CAMPAIGNS[cId];
  const session = findSession(cId, sNum);

  if (!campaign || !session) {
    sidebar.innerHTML = "";
    headerBar.innerHTML = `
      <div class="log-empty-bar">
        <span class="back-link">←</span>
        <span class="log-empty-text">로그를 찾을 수 없습니다</span>
      </div>`;
    frameWrap.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">❓</div>
        <p class="empty-title">로그를 찾을 수 없습니다</p>
        <p class="empty-desc">캠페인 또는 세션 정보가 올바르지 않습니다.</p>
      </div>`;
    return;
  }

  document.title = `${session.title} · ${campaign.name}`;

  // ===== 상단 바 (캠페인 정보 + 제목 + 이전/날짜/다음) =====
  const sessions = getSessionsByCampaign(cId);
  const curIdx = sessions.findIndex(s => s.num === session.num);

  const prevLink = curIdx > 0
    ? `<a class="log-nav-btn" href="log.html?c=${encodeURIComponent(cId)}&s=${sessions[curIdx - 1].num}">← 이전</a>`
    : `<span class="log-nav-btn disabled">← 이전</span>`;
  const nextLink = curIdx < sessions.length - 1
    ? `<a class="log-nav-btn" href="log.html?c=${encodeURIComponent(cId)}&s=${sessions[curIdx + 1].num}">다음 →</a>`
    : `<span class="log-nav-btn disabled">다음 →</span>`;

  headerBar.innerHTML = `
    <div class="log-bar-top" style="--book-color:${campaign.color}">
      <a href="campaign.html?id=${encodeURIComponent(cId)}" class="log-back">← 목차로</a>
      <span class="log-crumb">${escapeHtml(campaign.name)} · Session ${session.num}</span>
      <button id="themeToggle" class="theme-toggle log-theme-toggle" aria-label="테마 전환" title="다크/라이트 전환">
        <span class="theme-icon">🌙</span>
      </button>
    </div>
    <div class="log-bar-main">
      <h1 class="log-title-top">${escapeHtml(session.title)}</h1>
      <div class="log-nav-row">
        ${prevLink}
        <span class="log-date-pill">📅 ${session.date}</span>
        ${nextLink}
      </div>
    </div>
  `;

  // 동적으로 추가된 토글 버튼에 테마 바인딩
  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    const root = document.documentElement;
    const icon = toggle.querySelector(".theme-icon");
    icon.textContent = savedTheme === "dark" ? "🌙" : "☀️";
    toggle.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      icon.textContent = next === "dark" ? "🌙" : "☀️";
      localStorage.setItem("trpg-theme", next);
    });
  }

  // ===== 사이드바 =====
  sidebar.innerHTML = `
    <div class="sidebar-head" style="--book-color:${campaign.color}">
      <a href="campaign.html?id=${encodeURIComponent(cId)}" class="sidebar-back">← 목차로</a>
      <div class="sidebar-book-title">${escapeHtml(campaign.name)}</div>
    </div>
    <nav class="sidebar-nav">
      ${sessions.map(s => {
        const isActive = s.num === session.num;
        return `
          <a class="sidebar-item ${isActive ? "active" : ""}" href="log.html?c=${encodeURIComponent(cId)}&s=${s.num}">
            <span class="sidebar-num">${String(s.num).padStart(2, "0")}</span>
            <span class="sidebar-text">
              <span class="sidebar-title">${escapeHtml(s.title)}</span>
              <span class="sidebar-date">${s.date}</span>
            </span>
          </a>
        `;
      }).join("")}
    </nav>
    <div class="sidebar-foot">
      <a href="index.html" class="sidebar-foot-link">서가로</a>
    </div>
  `;

  // ===== 로그 본문 (iframe) =====
  // iframe은 같은 origin(file://)이므로 contentWindow에 접근 가능.
  // 버튼은 iframe 내부 콘텐츠를 스크롤.
  function getIframeDoc() {
    const iframe = frameWrap.querySelector("iframe");
    return iframe ? iframe.contentWindow : null;
  }

  frameWrap.innerHTML = `<iframe src="logs/${session.file}" title="${escapeHtml(session.title)}" loading="lazy"></iframe>`;

  // ===== 위로가기 / 아래로가기 버튼 (iframe 내부 스크롤) =====
  const scrollTopBtn = document.getElementById("scrollTop");
  const scrollBottomBtn = document.getElementById("scrollBottom");

  function updateScrollBtns() {
    const win = getIframeDoc();
    if (!win) return;
    const y = win.scrollY;
    const max = win.document.documentElement.scrollHeight - win.innerHeight;
    // 위로: iframe 내부에서 조금이라도 아래에 있을 때
    scrollTopBtn.classList.toggle("visible", y > 50);
    // 아래로: iframe 내부가 맨 아래가 아닐 때
    scrollBottomBtn.classList.toggle("visible", y < max - 50);
  }

  // iframe 로드 완료 시 초기 상태 업데이트 + 스크롤 리스너 바인딩
  const iframe = frameWrap.querySelector("iframe");
  iframe.addEventListener("load", () => {
    const win = getIframeDoc();
    if (!win) return;
    try {
      const doc = win.document;
      // iframe viewport가 html에 고정되고, body가 콘텐츠만큼 늘어나면
      // html에서 스크롤이 발생하도록 설정.
      // html: height 100% (iframe 크기 고정), overflow-y auto
      // body: margin 0 (기본 여백 제거), height auto (콘텐츠 크기)
      doc.documentElement.style.height = "100%";
      doc.documentElement.style.overflowY = "auto";
      doc.body.style.margin = "0";
      // body는 자연스럽게 콘텐츠 높이를 유지하도록 height/overflow 건드리지 않음

      win.addEventListener("scroll", updateScrollBtns, { passive: true });
      updateScrollBtns();
    } catch (e) {
      // cross-origin인 경우 폴백: 부모 페이지 스크롤 사용
      console.warn("iframe 스크롤 접근 불가, 부모 스크롤로 폴백:", e);
      window.addEventListener("scroll", updateScrollBtns, { passive: true });
    }
  });

  scrollTopBtn.addEventListener("click", () => {
    const win = getIframeDoc();
    if (win) {
      win.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  scrollBottomBtn.addEventListener("click", () => {
    const win = getIframeDoc();
    if (win) {
      const max = win.document.documentElement.scrollHeight;
      win.scrollTo({ top: max, behavior: "smooth" });
    } else {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
    }
  });
})();