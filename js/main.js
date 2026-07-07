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
  document.body.classList.toggle("on-history", id === "screen-history");
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

// 背景音樂：播放清單（bg_music → bg_music_2 → 循環），低音量；
// 瀏覽器擋自動播放 → 第一次互動時啟動；可靜音切換
const bgm = document.getElementById("bgm");
const bgmToggle = document.getElementById("bgm-toggle");
const BGM_TRACKS = [
  "assets/audio/bg_music.wav",
  "assets/audio/bg_music_2.mp3",
];
// 每首各自音量（第一首 0.14；bg_music_2 為 0.40）
const BGM_VOLUMES = [0.14, 0.4];
let bgmIndex = 0;
function setBgmTrack(i) {
  bgmIndex = i;
  bgm.src = BGM_TRACKS[i];
  bgm.volume = BGM_VOLUMES[i] ?? 0.3;
}
setBgmTrack(0);
// 一首播完接下一首（循環整個清單）
bgm.addEventListener("ended", () => {
  setBgmTrack((bgmIndex + 1) % BGM_TRACKS.length);
  playBgm();
});
// 某首載入失敗（例如 bg_music_2 尚未放入）→ 跳過，改播下一首
bgm.addEventListener("error", () => {
  const next = (bgmIndex + 1) % BGM_TRACKS.length;
  if (next === bgmIndex) return;
  setBgmTrack(next);
  playBgm();
});
let bgmOn = true;
function refreshBgmIcon() {
  bgmToggle.textContent = bgmOn ? "🔊" : "🔇";
}
function playBgm() {
  if (bgmOn) bgm.play().catch(() => {});
}
// 第一次點擊/觸控時啟動音樂（滿足瀏覽器自動播放限制）
const startBgmOnce = () => {
  playBgm();
  document.removeEventListener("pointerdown", startBgmOnce);
};
document.addEventListener("pointerdown", startBgmOnce);
bgmToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  bgmOn = !bgmOn;
  if (bgmOn) playBgm();
  else bgm.pause();
  refreshBgmIcon();
});
refreshBgmIcon();

// 按鈕點擊音效（答題選項除外，因為它已有答對/答錯音效）
const clickSfx = new Audio("assets/audio/click.mp3");
clickSfx.volume = 0.5;
document.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn || btn.classList.contains("option")) return;
  const a = clickSfx.cloneNode();
  // 「下一題」音效比一般大一倍（0.5 → 1.0）
  a.volume =
    btn.id === "next-btn"
      ? Math.min(1, clickSfx.volume * 2)
      : clickSfx.volume;
  a.play().catch(() => {});
});

// 啟動
refreshMockLabel();
nav.welcome();
