// 兌換序號頁：app 用戶輸入序號，匯入曾以訪客身份玩過的紀錄。

import { addRecord, setRedeemed } from "../storage.js";
import { getTitle } from "../../data/titles.js";

// 以訪客序號換出的模擬紀錄（正式接後端時改為 fetch API）。
function buildRedeemedRecord(code) {
  const mockScore = 7; // 後端實際回傳分數時替換
  return {
    playedAt: new Date().toISOString(),
    name: "訪客玩家",
    score: mockScore,
    total: 10,
    title: getTitle(mockScore).name,
    redeemed: true,
    redeemedCode: code,
    questions: [],
    answers: [],
  };
}

// 簡易序號格式驗證（正式接後端後改為 API 呼叫）。
// 規則：4～20 個字元，只允許英數字與連字號。
function validateCode(code) {
  return /^[A-Za-z0-9\-]{4,20}$/.test(code);
}

export function renderRedeem(nav) {
  const el = document.getElementById("screen-redeem");

  el.innerHTML = `
    <div class="redeem-page">
      <!-- 標題區塊 -->
      <div class="redeem-header">
        <button class="redeem-back" id="redeem-back" type="button" aria-label="返回">‹</button>
        <h1 class="redeem-title">兌換貼圖</h1>
      </div>

      <!-- 說明文字 -->
      <p class="redeem-desc">
        曾以訪客身份完成答題？<br>
        輸入活動序號，即可將該次成績匯入你的帳號。
      </p>

      <!-- 輸入框 -->
      <div class="redeem-field">
        <input
          id="redeem-input"
          class="redeem-input"
          type="text"
          maxlength="20"
          placeholder="請輸入兌換序號"
          autocomplete="off"
          autocapitalize="characters"
        />
        <p class="redeem-error-msg" id="redeem-error-msg"></p>
      </div>

      <!-- 兌換按鈕 -->
      <button id="redeem-btn" class="btn btn-primary redeem-btn" type="button">
        立即兌換
      </button>
    </div>
  `;

  const input = el.querySelector("#redeem-input");
  const errorMsg = el.querySelector("#redeem-error-msg");
  const redeemBtn = el.querySelector("#redeem-btn");

  function setInputState(state, msg = "") {
    input.classList.remove("is-typing", "is-error");
    if (state === "typing") input.classList.add("is-typing");
    if (state === "error") input.classList.add("is-error");
    errorMsg.textContent = msg;
  }

  input.addEventListener("focus", () => setInputState("typing"));
  input.addEventListener("input", () => setInputState("typing"));
  input.addEventListener("blur", () => {
    if (!input.value.trim()) setInputState("default");
  });

  redeemBtn.addEventListener("click", () => {
    const code = input.value.trim().toUpperCase();
    if (!code) {
      input.focus();
      setInputState("error", "請輸入序號");
      return;
    }
    if (!validateCode(code)) {
      setInputState("error", "序號格式不正確，請再確認");
      return;
    }

    // 兌換成功
    const record = buildRedeemedRecord(code);
    addRecord(record);
    setRedeemed(code);

    // 隱藏首頁入口按鈕
    const entryBtn = document.getElementById("redeem-entry");
    if (entryBtn) entryBtn.classList.add("hidden");

    nav.welcome();
  });

  el.querySelector("#redeem-back").addEventListener("click", () => nav.welcome());
}
