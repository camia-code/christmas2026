// 步驟3 成績 modal

import { resultCardHTML, openShareModal } from "../share.js";

// 開啟成績 modal。
// record：要顯示的那一輪結果。
// nav：導頁 API。
export function openResultModal(record, nav) {
  const overlay = document.getElementById("result-modal");
  overlay.classList.remove("hidden");
  overlay.innerHTML = `
    <div class="modal">
      <button class="modal-close" id="result-close" type="button">×</button>

      <div class="result-card">${resultCardHTML(record)}</div>

      <button id="btn-app" class="btn btn-secondary">快去聊天室查看貼圖</button>
      <button id="btn-share" class="btn btn-primary">分享結果</button>
      <button id="btn-history" class="btn">查看答題紀錄</button>
    </div>
  `;

  // ✕：關閉並回到步驟1（歡迎頁會顯示本次紀錄）
  overlay.querySelector("#result-close").addEventListener("click", () => {
    closeResultModal();
    nav.welcome();
  });

  overlay.querySelector("#btn-app").addEventListener("click", () => {
    nav.backToApp();
  });

  overlay.querySelector("#btn-share").addEventListener("click", () => {
    openShareModal(record);
  });

  overlay.querySelector("#btn-history").addEventListener("click", () => {
    closeResultModal();
    nav.history(record);
  });
}

export function closeResultModal() {
  const overlay = document.getElementById("result-modal");
  overlay.classList.add("hidden");
  overlay.innerHTML = "";
}
