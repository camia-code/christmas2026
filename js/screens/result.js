// 步驟3 成績 modal

import { resultCardHTML, resultCardClass, openShareModal } from "../share.js";
import { isAppUser } from "../user.js";
import { getRecords } from "../storage.js";
import { openCopiedModal } from "./redeem.js";
import { t } from "../i18n.js";

// 開啟成績 modal。
// record：要顯示的那一輪結果。
// nav：導頁 API。
export function openResultModal(record, nav) {
  const overlay = document.getElementById("result-modal");
  overlay.classList.remove("hidden");

  // 訪客（非 app 用戶）顯示貼圖領取序號；001 為第幾位玩的人
  // （目前為本機計數的 demo，正式版需由後端配發全域唯一序號）
  const guest = !isAppUser();
  const playerNo = getRecords().length || 1;
  const stickerCode = `merrychristmas${String(playerNo).padStart(3, "0")}`;

  overlay.innerHTML = `
    <div class="modal">
      <button class="modal-close" id="result-close" type="button">×</button>

      <div class="result-card-wrap">
        <div id="result-card-slot" class="${resultCardClass(record)}">${resultCardHTML(record)}</div>
        <!-- 蓋章：只顯示在畫面上，不會進分享/下載的 PNG（PNG 由 share.js 另外產生，不含此章） -->
        <img class="result-stamp" src="assets/result/stamp.png" alt="" />
      </div>

      ${
        guest
          ? `<p class="sticker-code">${t("result.codeLabel")} <b>${stickerCode}</b></p>
             <button id="btn-app" class="btn btn-secondary">
               <span class="claim-line1">
                 <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                   <rect x="9" y="9" width="11" height="11" rx="2" />
                   <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                 </svg>
                 ${t("result.copyBtn")}
               </span>
             </button>`
          : `<p class="sticker-got">${t(record.alreadyClaimed ? "result.alreadyClaimed" : "result.gotStickers")}</p>`
      }
      <button id="btn-share" class="btn btn-primary">${t("result.share")}</button>
      <button id="btn-history" class="btn">${t("result.history")}</button>
    </div>
  `;

  // 訪客：畫面上顯示貼圖序號。按「複製序號」時：
  //   成功 → 不在按鈕上給回饋，直接跳「已複製序號」dialog（兌換步驟＋「前往下載」）
  //   失敗 → 按鈕顯示「複製失敗」(紅色)，不跳 dialog，2.5 秒後恢復
  async function copyStickerCode() {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(stickerCode);
        return true;
      }
      const ta = document.createElement("textarea");
      ta.value = stickerCode;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (e) {
      return false;
    }
  }

  // ✕：關閉並回到步驟1（歡迎頁會顯示本次紀錄）
  overlay.querySelector("#result-close").addEventListener("click", () => {
    closeResultModal();
    nav.welcome();
  });

  // app 用戶沒有這顆按鈕（貼圖已直接派送），只有訪客有
  const claimBtn = overlay.querySelector("#btn-app");
  if (claimBtn) {
    const idleHTML = claimBtn.innerHTML;
    let busy = false;
    claimBtn.addEventListener("click", async () => {
      if (busy) return; // 回饋顯示期間不重複觸發
      busy = true;
      const ok = await copyStickerCode();
      if (ok) {
        openCopiedModal(nav);
        busy = false;
        return;
      }
      claimBtn.classList.add("is-copy-failed");
      claimBtn.textContent = t("result.copyFailed");
      setTimeout(() => {
        claimBtn.classList.remove("is-copy-failed");
        claimBtn.innerHTML = idleHTML;
        busy = false;
      }, 2500);
    });
  }

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
