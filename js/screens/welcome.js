// 步驟1 歡迎頁

import { getUser, isAppUser, setNickname } from "../user.js";
import { getLastRecord, getRecords, hasRedeemed } from "../storage.js";
import { getLang } from "../lang.js";
import { renderHeaderNav, bindHeaderNav } from "../header.js";
import { t, ordinal } from "../i18n.js";
import { getTitleName } from "../../data/titles.js";

// 首頁禮包輪播的貼圖（assets/stickers/）
const STICKERS = [
  "assets/stickers/sticker-1.png", // 你真棒
  "assets/stickers/sticker-2.png", // 收到
  "assets/stickers/sticker-3.png", // 原來如此
  "assets/stickers/sticker-4.png", // 我沒了
  "assets/stickers/sticker-5.png", // 加油
  "assets/stickers/sticker-6.png", // 蛋雕
  "assets/stickers/sticker-7.png", // 貓咪問號
  "assets/stickers/sticker-8.png", // 探頭
];

// 暱稱規則：最多 12 個字，只能是文字／數字／空白（不含特殊符號、表情符號）
const NICKNAME_MAX = 12;
const NICKNAME_RE = /^[\p{L}\p{N} ]+$/u;
function isValidNickname(name) {
  return [...name].length <= NICKNAME_MAX && NICKNAME_RE.test(name);
}

export function renderWelcome(nav) {
  const el = document.getElementById("screen-welcome");
  const user = getUser();
  const last = getLastRecord();
  const hasPlayed = !!last;
  const attemptNo = getRecords().length + 1; // 第幾次挑戰
  const lang = getLang(); // 依語系載入 KV 主視覺（tch/sch/en）
  const showRedeem = isAppUser() && !hasRedeemed(); // 兌換入口：只有 app 用戶且未兌換過才顯示

  el.innerHTML = `
    <div class="lobby">
      ${renderHeaderNav({ logo: true })}

      <div class="lobby-kv-wrap">
        <img class="lobby-kv" src="assets/2026mainpage_kv_${lang}.svg" alt="${t("welcome.kvAlt")}"
          onerror="this.onerror=null;this.src='assets/2026mainpage_kv.png'" />
      </div>

      ${
        user.isAppUser
          ? ""
          : `<div class="nickname-field">
               <input id="nickname" class="nickname-input" type="text"
                 placeholder="${t("welcome.nicknamePh")}" value="${user.name || ""}" />
               <p class="nickname-error-msg" id="nickname-error-msg" role="alert"></p>
             </div>`
      }

      <div class="start-wrap">
        <span class="attempt-count">${t("welcome.attempt", { n: attemptNo, ord: ordinal(attemptNo) })}</span>
        <button id="start-btn" class="btn btn-primary lobby-start">
          ${t("welcome.start")}
        </button>
      </div>

      <div class="gift-card-wrap">
        <div class="gift-card">
          ${
            showRedeem
              ? `<button id="redeem-entry" class="redeem-entry" type="button" aria-label="${t("welcome.redeemAria")}">
                   <img src="assets/changesticker.svg" alt="" />
                   <span class="redeem-entry-text"><span>${t("welcome.redeemLine1")}</span><span>${t("welcome.redeemLine2")}</span></span>
                 </button>`
              : ""
          }
          <div class="gift-carousel" id="gift-carousel">
            ${STICKERS.map(
              (src, i) =>
                `<div class="gift-item"><img src="${src}" alt="${t("welcome.stickerAlt", { n: i + 1 })}" draggable="false"${i >= 3 ? ' loading="lazy"' : ""} /></div>`
            ).join("")}
          </div>
          <p class="gift-hint">${t("welcome.hint")}</p>
          <p class="gift-desc">${t("welcome.desc")}</p>
        </div>
      </div>

      ${
        hasPlayed
          ? `<div class="last-record" id="last-record" role="button" tabindex="0">
               <div class="lr-left">
                 <span class="lr-label">${t("welcome.lastRecord")}</span>
                 <span class="lr-title">${getTitleName(last.score)}</span>
               </div>
               <span class="lr-score">${t("welcome.lastScore", { s: last.score, t: last.total })}</span>
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

  // 兌換入口按鈕點擊
  const redeemEntry = el.querySelector("#redeem-entry");
  if (redeemEntry) {
    redeemEntry.addEventListener("click", () => nav.redeem());
  }

  // header 導覽：開始挑戰沿用下方主按鈕的暱稱驗證邏輯
  bindHeaderNav(el, nav, {
    onStart: () => el.querySelector("#start-btn").click(),
  });

  const nicknameInput = el.querySelector("#nickname");
  const nicknameError = el.querySelector("#nickname-error-msg");
  const showNicknameError = (key) => {
    nicknameInput.classList.add("is-error");
    nicknameError.textContent = t(key);
  };
  const clearNicknameError = () => {
    nicknameInput.classList.remove("is-error");
    nicknameError.textContent = "";
  };
  // 輸入中即時檢查：不合法就立刻提示，合法或清空則清掉（空白提示只在按開始時出現）
  if (nicknameInput) {
    nicknameInput.addEventListener("input", () => {
      const name = nicknameInput.value.trim();
      if (name && !isValidNickname(name)) showNicknameError("welcome.nicknameInvalid");
      else clearNicknameError();
    });
  }

  el.querySelector("#start-btn").addEventListener("click", () => {
    if (!isAppUser()) {
      const name = (nicknameInput.value || "").trim();
      // 展示用：「跳過答題」開著時，訪客不輸入暱稱也能直接進成績畫面
      const skipping = document.getElementById("skip-toggle")?.checked;
      if (!name && !skipping) {
        nicknameInput.focus();
        showNicknameError("welcome.nicknameEmpty");
        return;
      }
      if (name && !isValidNickname(name)) {
        nicknameInput.focus();
        showNicknameError("welcome.nicknameInvalid");
        return;
      }
      setNickname(name);
    }
    nav.play();
  });
}
