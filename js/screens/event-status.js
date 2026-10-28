// 活動尚未開始／已結束畫面（取代整個遊戲入口）

import { getLang } from "../lang.js";
import { isAppUser } from "../user.js";
import { hasRedeemed } from "../storage.js";
import { t } from "../i18n.js";

// status："upcoming"（尚未開始）| "ended"（已結束）
// 已結束時，app 用戶若還沒兌換過，仍保留「序號兌換」入口（給活動結束前已複製序號的訪客兌換貼圖；
// 序號兌換期間比活動期間長，到 2027.01.31）
export function renderEventStatus(status, nav) {
  const el = document.getElementById("screen-event");
  const lang = getLang();
  const showRedeem = status === "ended" && isAppUser() && !hasRedeemed();
  el.innerHTML = `
    <div class="event-status">
      <img class="event-status-kv" src="assets/2026mainpage_kv_${lang}.svg" alt="${t("welcome.kvAlt")}"
        onerror="this.onerror=null;this.src='assets/2026mainpage_kv.png'" />
      <p class="event-status-msg">${t(status === "ended" ? "event.ended" : "event.upcoming")}</p>
      ${
        showRedeem
          ? `<button id="redeem-entry" class="redeem-entry" type="button" aria-label="${t("welcome.redeemAria")}">
               <img src="assets/changesticker.svg" alt="" />
               <span class="redeem-entry-text"><span>${t("welcome.redeemLine1")}</span><span>${t("welcome.redeemLine2")}</span></span>
             </button>`
          : ""
      }
    </div>
  `;
  el.querySelector("#redeem-entry")?.addEventListener("click", () => nav.redeem());
}
