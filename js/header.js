// 共用首頁上方 header bar（首頁／活動辦法／開始挑戰），各畫面共用。

import { isAppUser } from "./user.js";
import { t } from "./i18n.js";

// options.logo：是否在選單最左側顯示 Letstalk logo + 分隔線（目前只有首頁需要）
// 桌機：膠囊背景跟著內容寬度自動撐開，不受 .app 欄寬限制。
// 手機斷點以下：選單項目收進漢堡選單，點擊展開同樣玻璃效果的下拉面板。
export function renderHeaderNav(options = {}) {
  return `
    <div class="lobby-nav-wrap">
      <nav class="lobby-nav">
        <!-- 背景音樂鈕：絕對定位在膠囊左側 16px，不影響膠囊位置 -->
        <button type="button" class="bgm-toggle" aria-label="${t("bgm.aria")}">${window.__soundOn === false ? "🔇" : "🔊"}</button>
        ${
          options.logo
            ? `<img class="lobby-nav-logo" src="assets/logo.svg" alt="Letstalk" />
               <span class="lobby-nav-divider"></span>`
            : ""
        }
        <div class="lobby-nav-links">
          <a href="#" class="lobby-nav-link" data-nav="home">${t("nav.home")}</a>
          <a href="#" class="lobby-nav-link" data-nav="rules">${t("nav.rules")}</a>
          <button type="button" class="lobby-nav-cta" data-nav="start">${t("nav.start")}</button>
        </div>
        <button type="button" class="lobby-nav-burger" aria-label="${t("nav.menu")}" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </nav>
    </div>
  `;
}

// 手機展開的選單：點選選單以外的空白處（或按 Esc）收合。
// bindHeaderNav 每次畫面重繪都會呼叫，所以全域監聽只掛一次。
let outsideCloseBound = false;
function bindOutsideClose() {
  if (outsideCloseBound) return;
  outsideCloseBound = true;
  const closeAll = (except) => {
    document.querySelectorAll(".lobby-nav.is-open").forEach((n) => {
      if (except && n.contains(except)) return;
      n.classList.remove("is-open");
      n.querySelector(".lobby-nav-burger")?.setAttribute("aria-expanded", "false");
    });
  };
  document.addEventListener("click", (e) => closeAll(e.target));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll(null);
  });
}

// 掛上 header 的點擊行為；el 為包含 .lobby-nav 的容器。
// options.onStart 可覆寫「開始挑戰」按鈕行為（例如歡迎頁要沿用暱稱驗證邏輯）。
export function bindHeaderNav(el, nav, options = {}) {
  bindOutsideClose();
  const navEl = el.querySelector(".lobby-nav");
  const burger = el.querySelector(".lobby-nav-burger");

  const closeMenu = () => {
    navEl.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  };

  burger.addEventListener("click", () => {
    const open = navEl.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
  });

  el.querySelector('[data-nav="home"]').addEventListener("click", (e) => {
    e.preventDefault();
    closeMenu();
    nav.welcome();
  });
  el.querySelector('[data-nav="rules"]').addEventListener("click", (e) => {
    e.preventDefault();
    closeMenu();
    nav.rules();
  });
  el.querySelector('[data-nav="start"]').addEventListener("click", () => {
    closeMenu();
    if (options.onStart) {
      options.onStart();
      return;
    }
    // 訪客尚未輸入暱稱：先回首頁讓他填寫，app 用戶直接進入答題。
    if (!isAppUser()) {
      nav.welcome();
      return;
    }
    nav.play();
  });
}
