// 進入點：screen 路由與導頁 API。

import { getMockMode, toggleMockMode, getDisplayName } from "./user.js";
import { addRecord } from "./storage.js";
import { state, startRound } from "./state.js";
import { pickQuestions, pickBackgrounds, buildRecord } from "./quiz.js";
import { renderWelcome } from "./screens/welcome.js";
import { renderPlay } from "./screens/play.js";
import { renderHistory } from "./screens/history.js";
import { openResultModal, closeResultModal } from "./screens/result.js";

const SCREENS = ["screen-welcome", "screen-play", "screen-history"];

function showScreen(id) {
  SCREENS.forEach((s) =>
    document.getElementById(s).classList.toggle("hidden", s !== id)
  );
  // 首頁（大廳）用藍色背景，其餘頁維持米白
  document.body.classList.toggle("on-welcome", id === "screen-welcome");
  document.body.classList.toggle("on-play", id === "screen-play");
  // 離開答題頁時清掉滿版背景圖
  if (id !== "screen-play") document.body.style.backgroundImage = "";
  window.scrollTo(0, 0);
}

// 導頁 API：傳給各畫面使用。
const nav = {
  welcome() {
    closeResultModal();
    renderWelcome(nav);
    showScreen("screen-welcome");
  },

  async play() {
    try {
      const questions = await pickQuestions();
      if (!questions.length) {
        alert("題庫是空的，請先在 data/questions/questions.json 加題目。");
        return;
      }
      startRound(questions, pickBackgrounds(questions.length));
      renderPlay(nav);
      showScreen("screen-play");
    } catch (e) {
      alert(e.message || "載入題目失敗");
    }
  },

  // 答完 10 題：計分、存檔、開成績 modal。
  finishRound(score) {
    const record = buildRecord({
      name: getDisplayName(),
      score,
      answers: state.answers,
      questions: state.questions,
    });
    addRecord(record);
    state.viewingRecord = record;
    openResultModal(record, nav);
  },

  // 開啟某一輪的成績 modal（歡迎頁點「上次成績」用）
  result(record) {
    state.viewingRecord = record;
    openResultModal(record, nav);
  },

  history(record) {
    renderHistory(record, nav);
    showScreen("screen-history");
  },

  // 導回 app（wireframe 佔位）
  backToApp() {
    alert("（示意）導回 Letstalk app 聊天室領取貼圖。\n之後接 deep link / app bridge。");
  },
};

// mock 身份切換鈕
const mockBtn = document.getElementById("mock-toggle");
function refreshMockLabel() {
  mockBtn.textContent = `身份: ${getMockMode() === "app" ? "app" : "guest"}`;
}
mockBtn.addEventListener("click", () => {
  toggleMockMode();
  refreshMockLabel();
  nav.welcome(); // 切換後重繪歡迎頁
});

// 啟動
refreshMockLabel();
nav.welcome();
