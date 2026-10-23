// 活動尚未開始／已結束畫面（取代整個遊戲入口）

import { getLang } from "../lang.js";
import { t } from "../i18n.js";

// status："upcoming"（尚未開始）| "ended"（已結束）
export function renderEventStatus(status) {
  const el = document.getElementById("screen-event");
  const lang = getLang();
  el.innerHTML = `
    <div class="event-status">
      <img class="event-status-kv" src="assets/2026mainpage_kv_${lang}.svg" alt="${t("welcome.kvAlt")}"
        onerror="this.onerror=null;this.src='assets/2026mainpage_kv.png'" />
      <p class="event-status-msg">${t(status === "ended" ? "event.ended" : "event.upcoming")}</p>
    </div>
  `;
}
