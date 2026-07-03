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
    const icon = document.querySelector(".theme-icon");
    if (icon) icon.textContent = theme === "dark" ? "🌙" : "☀️";
  }

  // 토글 버튼 이벤트 (페이지 로드 후 바인딩)
  document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("themeToggle");
    if (toggle) {
      toggle.addEventListener("click", () => {
        const current = root.getAttribute("data-theme") || "dark";
        const next = current === "dark" ? "light" : "dark";
        applyTheme(next);
        localStorage.setItem(STORAGE_KEY, next);
      });
    }

    // ===== 스크롤 탑 버튼 =====
    const scrollTop = document.getElementById("scrollTop");
    if (scrollTop) {
      window.addEventListener("scroll", () => {
        scrollTop.classList.toggle("visible", window.scrollY > 400);
      });
      scrollTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  });
})();