/**
 * 테마 토글 + 스크롤 탑 버튼
 * 모든 페이지에서 공통으로 사용됩니다.
 */
(function () {
  // ===== 테마 토글 =====
  const STORAGE_KEY = "trpg-theme";
  const root = document.documentElement;

  // 저장된 테마 불러오기 (기본: dark)
  const saved = localStorage.getItem(STORAGE_KEY) || "dark";
  applyTheme(saved);

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    // 모든 .theme-icon 요소 업데이트 (log.html 등 동적 생성 버튼 포함)
    document.querySelectorAll(".theme-icon").forEach(icon => {
      icon.textContent = theme === "dark" ? "🌙" : "☀️";
    });
  }

  // 토글 버튼 이벤트 (페이지 로드 후 바인딩)
  document.addEventListener("DOMContentLoaded", () => {
    // 동적 생성된 토글 버튼의 아이콘을 위해 재적용
    applyTheme(saved);

    const toggle = document.getElementById("themeToggle");
    if (toggle) {
      toggle.addEventListener("click", () => {
        const current = root.getAttribute("data-theme") || "dark";
        const next = current === "dark" ? "light" : "dark";
        applyTheme(next);
        localStorage.setItem(STORAGE_KEY, next);
      });
    }

    // ===== 스크롤 탑 버튼 (페이지 스크롤용, log.html 제외 로드됨) =====
    // log.html의 #scrollTop은 iframe 스크롤용이므로, body에 .has-log-viewer가
    // 있으면 theme.js의 페이지 스크롤 바인딩을 건너뛴다.
    const scrollTop = document.getElementById("scrollTop");
    if (scrollTop && !document.body.classList.contains("log-body")) {
      window.addEventListener("scroll", () => {
        scrollTop.classList.toggle("visible", window.scrollY > 400);
      });
      scrollTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  });
})();