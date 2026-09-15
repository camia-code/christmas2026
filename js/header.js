// 共用首頁上方 header bar（首頁／活動辦法／開始挑戰），各畫面共用。

import { isAppUser } from "./user.js";

export function renderHeaderNav() {
  return `
    <nav class="lobby-nav">
      <a href="#" class="lobby-nav-link" data-nav="home">首頁</a>
      <a href="#" class="lobby-nav-link" data-nav="rules">活動辦法</a>
      <button type="button" class="lobby-nav-cta" data-nav="start">開始挑戰 GO！</button>
    </nav>
  `;
}

// 掛上 header 的點擊行為；el 為包含 .lobby-nav 的容器。
// options.onStart 可覆寫「開始挑戰」按鈕行為（例如歡迎頁要沿用暱稱驗證邏輯）。
export function bindHeaderNav(el, nav, options = {}) {
  el.querySelector('[data-nav="home"]').addEventListener("click", (e) => {
    e.preventDefault();
    nav.welcome();
  });
  el.querySelector('[data-nav="rules"]').addEventListener("click", (e) => {
    e.preventDefault();
    nav.rules();
  });
  el.querySelector('[data-nav="start"]').addEventListener("click", () => {
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
