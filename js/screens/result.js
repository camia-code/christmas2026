// 步驟3 成績 modal

import { resultCardHTML, resultCardClass, openShareModal } from "../share.js";

// 【開發用】各稱號分級的代表分數，供左右切換預覽（正式發佈前整段移除）
const PREVIEW_SCORES = [0, 3, 5, 7, 9, 10];

// 開啟成績 modal。
// record：要顯示的那一輪結果。
// nav：導頁 API。
export function openResultModal(record, nav) {
  const overlay = document.getElementById("result-modal");
  overlay.classList.remove("hidden");
  overlay.innerHTML = `
    <div class="modal">
      <button class="modal-close" id="result-close" type="button">×</button>

      <div id="result-card-slot" class="${resultCardClass(record)}">${resultCardHTML(record)}</div>

      <!-- 【開發用】稱號預覽切換，正式發佈前移除 -->
      <div class="dev-tier-nav">
        <button id="dev-prev" type="button">‹</button>
        <span>稱號預覽（開發用）</span>
        <button id="dev-next" type="button">›</button>
      </div>

      <button id="btn-app" class="btn btn-secondary">快去聊天室查看貼圖</button>
      <button id="btn-share" class="btn btn-primary">分享結果</button>
      <button id="btn-history" class="btn">查看答題紀錄</button>
    </div>
  `;

  // 【開發用】以指定分數重繪成績卡片
  const slot = overlay.querySelector("#result-card-slot");
  let previewIdx = PREVIEW_SCORES.indexOf(record.score);
  if (previewIdx < 0) previewIdx = 0;
  const renderPreview = () => {
    const mock = {
      ...record,
      score: PREVIEW_SCORES[previewIdx],
      total: record.total || 10,
    };
    slot.className = resultCardClass(mock);
    slot.innerHTML = resultCardHTML(mock);
  };
  overlay.querySelector("#dev-prev").addEventListener("click", () => {
    previewIdx = (previewIdx - 1 + PREVIEW_SCORES.length) % PREVIEW_SCORES.length;
    renderPreview();
  });
  overlay.querySelector("#dev-next").addEventListener("click", () => {
    previewIdx = (previewIdx + 1) % PREVIEW_SCORES.length;
    renderPreview();
  });

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
