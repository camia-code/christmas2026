// 步驟3 成績 modal

import { resultCardHTML, resultCardClass, openShareModal } from "../share.js";
import { isAppUser } from "../user.js";
import { getRecords } from "../storage.js";
import { getTitle } from "../../data/titles.js";
import { t } from "../i18n.js";

// 彩帶底色 + 同色系深色文字（依稱號分級輪流）
const RIBBON_COLORS = [
  { bg: "#75d3ff", text: "#10567a" }, // 藍
  { bg: "#5ec272", text: "#1f6b39" }, // 綠
  { bg: "#fff07b", text: "#7a6a12" }, // 黃
];

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

  // 左上角彩帶：答對題數在所有人中的百分位（前 X%）
  // （目前為分數換算的 demo，正式版需由後端統計所有玩家答對數）
  const total = record.total || 10;
  const topPercent = Math.max(
    1,
    Math.min(99, Math.round(((total - record.score) / total) * 40) + 1)
  );
  const ribbon =
    RIBBON_COLORS[(getTitle(record.score).idx - 1) % RIBBON_COLORS.length];

  overlay.innerHTML = `
    <div class="modal">
      <button class="modal-close" id="result-close" type="button">×</button>

      <div class="result-card-wrap">
        <div id="result-card-slot" class="${resultCardClass(record)}">${resultCardHTML(record)}</div>
        <!-- 左上角彩帶：答對數的百分位 -->
        <div class="result-ribbon">
          <div class="ribbon-inner" style="background:${ribbon.bg};color:${ribbon.text}">
            <span class="r2">${t("result.top", { p: topPercent })}</span>
          </div>
        </div>
        <!-- 蓋章：只顯示在畫面上，不會進分享/下載的 PNG（PNG 由 share.js 另外產生，不含此章） -->
        <img class="result-stamp" src="assets/result/stamp.png" alt="" />
      </div>

      ${
        guest
          ? `<div class="sticker-code">${t("result.codeLabel")}
               <span class="sticker-code-row">
                 <b>${stickerCode}</b>
                 <button class="copy-btn" id="sticker-copy" type="button" aria-label="${t("result.copyAria")}">
                   <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                     <rect x="9" y="9" width="11" height="11" rx="2" />
                     <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                   </svg>
                 </button>
               </span>
             </div>`
          : ""
      }

      <button id="btn-app" class="btn btn-secondary">${t("result.claim")}</button>
      <button id="btn-share" class="btn btn-primary">${t("result.share")}</button>
      <button id="btn-history" class="btn">${t("result.history")}</button>
    </div>
  `;

  // 複製貼圖序號
  const copyBtn = overlay.querySelector("#sticker-copy");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(stickerCode);
        } else {
          const ta = document.createElement("textarea");
          ta.value = stickerCode;
          ta.style.position = "fixed";
          ta.style.left = "-9999px";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
        }
        copyBtn.classList.add("copied");
        setTimeout(() => copyBtn.classList.remove("copied"), 1200);
      } catch (e) {
        /* ignore */
      }
    });
  }

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
