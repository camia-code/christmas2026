// 兌換序號 popup：app 用戶輸入序號，匯入曾以訪客身份玩過的紀錄。

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

// 兌換序號以「當頁 popup」呈現（開在首頁上，不切換頁面）。
export function openRedeemModal(nav) {
  const overlay = document.getElementById("redeem-modal");
  overlay.classList.remove("hidden");

  overlay.innerHTML = `
    <div class="modal redeem-modal" role="dialog" aria-modal="true" aria-labelledby="redeem-title">
      <button class="modal-close" id="redeem-close" type="button" aria-label="關閉">×</button>

      <h2 class="redeem-title" id="redeem-title">兌換貼圖</h2>

      <p class="redeem-desc">
        曾以訪客身份完成答題？<br>
        輸入活動序號，即可將該次成績匯入你的帳號。
      </p>

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

      <button id="redeem-btn" class="btn btn-primary redeem-btn" type="button">
        立即兌換
      </button>
    </div>
  `;

  const input = overlay.querySelector("#redeem-input");
  const errorMsg = overlay.querySelector("#redeem-error-msg");
  const redeemBtn = overlay.querySelector("#redeem-btn");

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
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") redeemBtn.click();
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

    // 兌換成功：存紀錄 → 關閉 popup → 重繪首頁（兌換入口會依 hasRedeemed 自動隱藏）
    addRecord(buildRedeemedRecord(code));
    setRedeemed(code);
    closeRedeemModal();
    nav.welcome();
  });

  overlay.querySelector("#redeem-close").addEventListener("click", closeRedeemModal);
  // 點擊遮罩（popup 以外）也可關閉
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeRedeemModal();
  });
  document.addEventListener("keydown", onEscClose);

  input.focus();
}

function onEscClose(e) {
  if (e.key === "Escape") closeRedeemModal();
}

export function closeRedeemModal() {
  const overlay = document.getElementById("redeem-modal");
  overlay.classList.add("hidden");
  overlay.innerHTML = "";
  document.removeEventListener("keydown", onEscClose);
}
