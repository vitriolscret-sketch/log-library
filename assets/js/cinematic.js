/*
 * 시네마틱 홈 (구조 B)
 * data.js의 CAMPAIGNS / SESSIONS / CHARACTERS / LOCATIONS를 사용.
 * - 히어로: 대표 캠페인(최근 세션의 캠페인). 포스터에 마우스를 올리면 미리보기로 전환.
 * - 캠페인 포스터 가로 스크롤 / 최근 기록 스트립 / 인물·장소 퀵 타일.
 */
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 세션이 있는 캠페인만
  const usedIds = [...new Set(SESSIONS.map(s => s.campaign).filter(Boolean))]
    .filter(id => CAMPAIGNS[id]);

  function latestDateOf(id) {
    const ss = getSessionsByCampaign(id);
    return ss.length ? ss.reduce((a, b) => (a.date > b.date ? a : b)).date : "";
  }
  function firstLetter(name) {
    const m = (name || "").trim().match(/[A-Za-z가-힣]/);
    return m ? m[0] : "◆";
  }

  // 대표 캠페인 = 가장 최근 세션이 속한 캠페인
  const featuredId = usedIds.length
    ? usedIds.slice().sort((a, b) => (latestDateOf(b) > latestDateOf(a) ? 1 : -1))[0]
    : null;

  // ===== 히어로 =====
  const heroBg = document.getElementById("heroBg");
  const heroMono = document.getElementById("heroMonogram");
  const elEyebrow = document.getElementById("heroEyebrow");
  const elTitle = document.getElementById("heroTitle");
  const elDesc = document.getElementById("heroDesc");
  const elMeta = document.getElementById("heroMeta");
  const elCta = document.getElementById("heroCta");
  const hero = document.getElementById("hero");

  function paintHero(id, isPreview) {
    const c = CAMPAIGNS[id];
    if (!c) return;
    const count = getSessionsByCampaign(id).length;
    const date = latestDateOf(id) || "-";
    hero.style.setProperty("--hc", c.color);
    // 캠페인 히어로 이미지 (hero 우선, 없으면 cover)
    const photoSrc = c.hero || c.cover;
    let photo = heroBg.querySelector(".hero-photo");
    if (photoSrc) {
      if (!photo) {
        photo = document.createElement("img");
        photo.className = "hero-photo";
        photo.alt = "";
        heroBg.appendChild(photo);
      }
      photo.src = photoSrc;
      hero.classList.add("has-photo");
    } else {
      if (photo) photo.remove();
      hero.classList.remove("has-photo");
    }
    heroMono.textContent = firstLetter(c.name);
    elEyebrow.textContent = isPreview
      ? "미리보기 · Preview"
      : (id === featuredId
        ? "대표 캠페인 · Featured"
        : `캠페인 서가 · ${usedIds.indexOf(id) + 1} / ${usedIds.length}`);
    elTitle.textContent = c.name;
    elDesc.textContent = c.desc || "";
    elMeta.innerHTML = `
      <span class="m"><b>${count}</b> 세션</span>
      <span class="m"><b>${date}</b> 최근 진행</span>`;
    elCta.innerHTML = `
      <a class="btn btn-primary" href="campaign.html?id=${encodeURIComponent(id)}">이 책 펼쳐보기 →</a>
      <a class="btn btn-ghost" href="#shelf">전체 서가 보기</a>`;
  }

  if (featuredId) paintHero(featuredId, false);

  // ===== 히어로 좌우 화살표 — 캠페인 넘겨보기 =====
  let currentId = featuredId;
  function stepHero(dir) {
    if (!usedIds.length) return;
    const i = usedIds.indexOf(currentId);
    currentId = usedIds[(i + dir + usedIds.length) % usedIds.length];
    if (reduce) { paintHero(currentId, false); return; }
    heroBg.style.opacity = "0";
    setTimeout(() => { paintHero(currentId, false); heroBg.style.opacity = "1"; }, 180);
  }
  const prevBtn = document.getElementById("heroPrev");
  const nextBtn = document.getElementById("heroNext");
  if (prevBtn) prevBtn.addEventListener("click", () => stepHero(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => stepHero(1));

  // ===== 캠페인 포스터 =====
  const track = document.getElementById("posterTrack");
  if (track && usedIds.length) {
    track.innerHTML = usedIds.map(id => {
      const c = CAMPAIGNS[id];
      const count = getSessionsByCampaign(id).length;
      return `
        <a class="poster" href="campaign.html?id=${encodeURIComponent(id)}" data-id="${id}"
           style="--pc:${c.color}" aria-label="${escapeHtml(c.name)}">
          <div class="poster-cover${c.cover ? " has-photo" : ""}">
            ${c.cover ? `<img class="poster-photo" src="${c.cover}" alt="" loading="lazy">` : ""}
            <span class="poster-monogram">${firstLetter(c.name)}</span>
            <span class="poster-kicker">${count}화 · Chronicle</span>
            <span class="poster-title">${escapeHtml(c.name)}</span>
            <span class="poster-info"><span>📚 ${count}화</span><span>📅 ${latestDateOf(id) || "-"}</span></span>
          </div>
        </a>`;
    }).join("");

    // hover / focus 시 히어로 미리보기 (모바일·터치는 스킵)
    if (!reduce && window.matchMedia("(hover: hover)").matches) {
      let restoreTimer;
      track.querySelectorAll(".poster").forEach(p => {
        const id = p.dataset.id;
        p.addEventListener("mouseenter", () => { clearTimeout(restoreTimer); heroBg.style.opacity = "0"; setTimeout(() => { paintHero(id, id !== currentId); heroBg.style.opacity = "1"; }, 180); });
        p.addEventListener("focus", () => { clearTimeout(restoreTimer); paintHero(id, id !== currentId); });
      });
      track.addEventListener("mouseleave", () => {
        restoreTimer = setTimeout(() => { heroBg.style.opacity = "0"; setTimeout(() => { paintHero(currentId, false); heroBg.style.opacity = "1"; }, 180); }, 220);
      });
    }
  }

  // ===== 최근 기록 =====
  const latest = document.getElementById("latestTrack");
  if (latest) {
    const recent = SESSIONS.slice().sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 6);
    latest.innerHTML = recent.map(s => {
      const c = CAMPAIGNS[s.campaign] || {};
      return `
        <a class="log-card" href="log.html?c=${encodeURIComponent(s.campaign)}&s=${s.num}" style="--tc:${c.color || "#888"}">
          <div class="lc-top">
            <span class="lc-tag">${escapeHtml(c.name || s.campaign)}</span>
            <span class="lc-num">Ep. ${s.num}</span>
          </div>
          <div class="lc-title">${escapeHtml(s.title)}</div>
          <div class="lc-sum">${escapeHtml(s.summary || "")}</div>
          <div class="lc-foot"><span class="lc-date">${s.date || ""}</span><span class="lc-go">읽기 →</span></div>
        </a>`;
    }).join("");
  }

  // ===== 인물 / 장소 퀵 타일 =====
  const quick = document.getElementById("quickGrid");
  if (quick) {
    quick.innerHTML = `
      <a class="quick-tile" href="characters.html">
        <span class="qt-icon">👤</span>
        <span class="qt-count">${CHARACTERS.length}</span>
        <span class="qt-label">등장인물</span>
        <span class="qt-go">도감 열기 →</span>
      </a>
      <a class="quick-tile" href="locations.html">
        <span class="qt-icon">🗺️</span>
        <span class="qt-count">${LOCATIONS.length}</span>
        <span class="qt-label">등장 장소</span>
        <span class="qt-go">도감 열기 →</span>
      </a>`;
  }

  // ===== 네비 스크롤 상태 =====
  const nav = document.getElementById("cineNav");
  const onScroll = () => { if (nav) nav.classList.toggle("scrolled", window.scrollY > 40); };
  window.addEventListener("scroll", onScroll); onScroll();
})();
