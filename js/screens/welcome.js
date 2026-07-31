// 步驟1 歡迎頁

import { getUser, isAppUser, setNickname } from "../user.js";
import { getLastRecord, getRecords, hasRedeemed } from "../storage.js";
import { getLang } from "../lang.js";

const GIFT_COUNT = 8;

export function renderWelcome(nav) {
  const el = document.getElementById("screen-welcome");
  const user = getUser();
  const last = getLastRecord();
  const hasPlayed = !!last;
  const attemptNo = getRecords().length + 1; // 第幾次挑戰
  const lang = getLang(); // 依語系載入 KV 主視覺（tch/sch/en）

  el.innerHTML = `
    <div class="lobby">
      <img class="welcome-logo" src="assets/logo.png" alt="Letstalk" />

      <img class="lobby-kv" src="assets/2026mainpage_kv_${lang}.png" alt="活動主視覺"
        onerror="this.onerror=null;this.src='assets/2026mainpage_kv.png'" />

      <div class="gift-card">
        <div class="gift-carousel" id="gift-carousel">
          ${Array.from({ length: GIFT_COUNT })
            .map(
              (_, i) => `<div class="placeholder gift-item">貼圖 ${i + 1}</div>`
            )
            .join("")}
        </div>
        <p class="gift-hint">左右滑動查看全部禮物</p>
        <p class="gift-desc">完成答題就送你超萌限定動態貼圖</p>
      </div>

      ${
        user.isAppUser
          ? ""
          : `<input id="nickname" class="nickname-input" type="text"
               maxlength="12" placeholder="輸入你的暱稱" value="${user.name || ""}" />`
      }

      <p class="attempt-count">第${attemptNo}次挑戰</p>

      <button id="start-btn" class="btn btn-primary lobby-start">
        開始挑戰
      </button>

      ${
        hasPlayed
          ? `<div class="last-record" id="last-record" role="button" tabindex="0">
               <div class="lr-left">
                 <span class="lr-label">上次紀錄</span>
                 <span class="lr-title">${last.title}</span>
               </div>
               <span class="lr-score">${last.score} / ${last.total} 題答對 ›</span>
             </div>`
          : ""
      }
    </div>
  `;

  // 點「上次成績」→ 開啟上一輪的成績結果
  const lastRecordEl = el.querySelector("#last-record");
  if (lastRecordEl) {
    const openLast = () => nav.history(last);
    lastRecordEl.addEventListener("click", openLast);
    lastRecordEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLast();
      }
    });
  }

  // 兌換入口：只有 app 用戶且未兌換過才顯示
  const redeemEntry = document.getElementById("redeem-entry");
  if (redeemEntry) {
    const showRedeem = isAppUser() && !hasRedeemed();
    redeemEntry.classList.toggle("hidden", !showRedeem);
  }

  el.querySelector("#start-btn").addEventListener("click", () => {
    if (!isAppUser()) {
      const input = el.querySelector("#nickname");
      const name = (input.value || "").trim();
      if (!name) {
        input.focus();
        input.style.borderColor = "var(--wrong)";
        return;
      }
      setNickname(name);
    }
    nav.play();
  });
}
