// 兌換序號 popup：app 用戶輸入序號，匯入曾以訪客身份玩過的紀錄。

import { addRecord, setRedeemed } from "../storage.js";
import { getTitleName } from "../../data/titles.js";
import { t } from "../i18n.js";

// 以訪客序號換出的模擬紀錄（正式接後端時改為 fetch API）。
function buildRedeemedRecord(code) {
  const mockScore = 7; // 後端實際回傳分數時替換
  return {
    playedAt: new Date().toISOString(),
    name: t("redeem.guestName"),
    score: mockScore,
    total: 10,
    title: getTitleName(mockScore),
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

// 兌換成功後 popup 改顯示完成訊息；切換語言重繪時也要維持在這個狀態
let showingSuccess = false;

// 兌換序號以「當頁 popup」呈現（開在首頁上，不切換頁面）。
export function openRedeemModal(nav) {
  const overlay = document.getElementById("redeem-modal");
  overlay.classList.remove("hidden");
  bindCloseHandlers(overlay);

  if (showingSuccess) {
    renderSuccess(overlay);
    return;
  }

  overlay.innerHTML = `
    <div class="modal redeem-modal" role="dialog" aria-modal="true" aria-labelledby="redeem-title">
      <button class="modal-close" id="redeem-close" type="button" aria-label="${t("redeem.close")}">×</button>

      <h2 class="redeem-title" id="redeem-title">${t("redeem.title")}</h2>

      <p class="redeem-desc">
        ${t("redeem.desc")}
      </p>

      <div class="redeem-field">
        <input
          id="redeem-input"
          class="redeem-input"
          type="text"
          maxlength="20"
          placeholder="${t("redeem.placeholder")}"
          autocomplete="off"
          autocapitalize="characters"
        />
        <p class="redeem-error-msg" id="redeem-error-msg"></p>
      </div>

      <button id="redeem-btn" class="btn btn-primary redeem-btn" type="button">
        ${t("redeem.btn")}
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
      setInputState("error", t("redeem.errEmpty"));
      return;
    }
    if (!validateCode(code)) {
      setInputState("error", t("redeem.errFormat"));
      return;
    }

    // 兌換成功：存紀錄 → 重繪首頁（兌換入口會依 hasRedeemed 自動隱藏）→ popup 改顯示完成訊息
    addRecord(buildRedeemedRecord(code));
    setRedeemed(code);
    nav.welcome(); // 會一併關閉 popup，下面再以完成狀態重新打開
    showingSuccess = true;
    openRedeemModal(nav);
  });

  overlay.querySelector("#redeem-close").addEventListener("click", closeRedeemModal);

  input.focus();
}

// 兌換完成訊息：× 或「確定」關閉
function renderSuccess(overlay) {
  overlay.innerHTML = `
    <div class="modal redeem-modal" role="dialog" aria-modal="true" aria-labelledby="redeem-title">
      <button class="modal-close" id="redeem-close" type="button" aria-label="${t("redeem.close")}">×</button>

      <h2 class="redeem-title" id="redeem-title">${t("redeem.successTitle")}</h2>

      <p class="redeem-desc">
        ${t("redeem.successDesc")}
      </p>

      <button id="redeem-done" class="btn btn-primary redeem-btn" type="button">
        ${t("redeem.successBtn")}
      </button>
    </div>
  `;
  overlay.querySelector("#redeem-close").addEventListener("click", closeRedeemModal);
  overlay.querySelector("#redeem-done").addEventListener("click", closeRedeemModal);
  overlay.querySelector("#redeem-done").focus();
}

// 點擊遮罩（popup 以外）或按 Esc 也可關閉。overlay 元素會重複使用，只綁一次。
function bindCloseHandlers(overlay) {
  if (!overlay.dataset.closeBound) {
    overlay.dataset.closeBound = "1";
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeRedeemModal();
    });
  }
  document.removeEventListener("keydown", onEscClose);
  document.addEventListener("keydown", onEscClose);
}

function onEscClose(e) {
  if (e.key === "Escape") closeRedeemModal();
}

export function closeRedeemModal() {
  const overlay = document.getElementById("redeem-modal");
  overlay.classList.add("hidden");
  overlay.innerHTML = "";
  showingSuccess = false;
  document.removeEventListener("keydown", onEscClose);
}
