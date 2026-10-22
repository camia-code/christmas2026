// 進入點：screen 路由與導頁 API。

import { getMockMode, toggleMockMode, getDisplayName, isAppUser } from "./user.js";
import { addRecord, resetAll, hasClaimedSticker, setClaimedSticker } from "./storage.js";
import { state, startRound } from "./state.js";
import {
  pickQuestions,
  pickBackgrounds,
  buildRecord,
  localizeQuestions,
  localizeRecord,
} from "./quiz.js";
import { t, getLang, setLang, applyLangToDocument } from "./i18n.js";
import { renderWelcome } from "./screens/welcome.js";
import { renderPlay } from "./screens/play.js";
import { renderHistory } from "./screens/history.js";
import { openRedeemModal, closeRedeemModal } from "./screens/redeem.js";
import { renderRules } from "./screens/rules.js";
import { openResultModal, closeResultModal } from "./screens/result.js";

const SCREENS = ["screen-welcome", "screen-play", "screen-rules", "screen-history"];

function showScreen(id) {
  SCREENS.forEach((s) =>
    document.getElementById(s).classList.toggle("hidden", s !== id)
  );
  // 首頁（大廳）用藍色背景，其餘頁維持米白
  document.body.classList.toggle("on-welcome", id === "screen-welcome");
  document.body.classList.toggle("on-play", id === "screen-play");
  document.body.classList.toggle("on-history", id === "screen-history");
  document.body.classList.toggle("on-rules", id === "screen-rules");
  // 離開答題頁時清掉滿版背景圖
  if (id !== "screen-play") document.body.style.backgroundImage = "";
  window.scrollTo(0, 0);
}

// 目前在看的答題紀錄（切換語系時要重繪）
let historyRecord = null;

// ---------- 展示用：跳過答題（交給工程師時連同 index.html 的 #demo-bar 一起移除）----------
const skipToggle = document.getElementById("skip-toggle");
const skipScore = document.getElementById("skip-score");
if (skipToggle && skipScore) {
  skipToggle.addEventListener("change", () => {
    skipScore.hidden = !skipToggle.checked;
  });
}

// 用本輪抽到的題目捏出作答結果（前 N 題答對、其餘答錯，位置隨機），直接進成績 dialog。
// 走一般的 finishRound，所以會存紀錄、累計第幾次挑戰，也能接著看答題紀錄、分享。
function demoSkipToResult() {
  const qs = state.questions;
  const pick = skipScore ? skipScore.value : "random";
  const score = pick === "random" ? Math.floor(Math.random() * (qs.length + 1)) : Math.min(Number(pick), qs.length);
  const correctIdx = new Set(
    qs.map((_, i) => i).sort(() => Math.random() - 0.5).slice(0, score)
  );
  state.answers = qs.map((q, i) => {
    const right = correctIdx.has(i);
    return {
      questionId: q.id,
      selectedIndex: right ? q.answerIndex : (q.answerIndex + 1) % q.options.length,
      isCorrect: right,
    };
  });
  nav.finishRound(score);
}

// 導頁 API：傳給各畫面使用。
const nav = {
  welcome() {
    closeResultModal();
    closeRedeemModal();
    renderWelcome(nav);
    showScreen("screen-welcome");
  },

  async play() {
    try {
      const questions = await pickQuestions();
      if (!questions.length) {
        alert(t("main.emptyBank"));
        return;
      }
      startRound(questions, pickBackgrounds(questions.length));
      // 展示用：「跳過答題」開著時，不進答題頁，直接用假作答結果開成績 dialog
      if (skipToggle && skipToggle.checked) {
        demoSkipToResult();
        return;
      }
      renderPlay(nav);
      showScreen("screen-play");
    } catch (e) {
      alert(e.message || t("main.loadFail"));
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
    // app 用戶：第一輪派送貼圖，之後的輪次標記為已領取過（結果頁顯示不同文案）
    if (isAppUser()) {
      record.alreadyClaimed = hasClaimedSticker();
      setClaimedSticker();
    }
    addRecord(record);
    state.viewingRecord = record;
    openResultModal(record, nav);
  },

  // 開啟某一輪的成績 modal（歡迎頁點「上次成績」用）
  result(record) {
    state.viewingRecord = record;
    openResultModal(record, nav);
  },

  async history(record) {
    historyRecord = record;
    renderHistory(await localizeRecord(record), nav);
    showScreen("screen-history");
  },

  // 兌換序號：在當頁以 popup 開啟，不切換頁面
  redeem() {
    openRedeemModal(nav);
  },

  rules() {
    renderRules(nav);
    showScreen("screen-rules");
  },

  // 導回 app（wireframe 佔位）
  backToApp() {
    alert(t("main.backToApp"));
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

// ---------- 展示用：語系下拉（交給工程師時連同 index.html 的 #demo-bar 一起移除；
// 語系切換的重繪邏輯 rerenderForLang() 可留著給正式的語言切換用）----------
const langSelect = document.getElementById("lang-select");

// 切換語系後，把目前畫面、開著的 popup 都重繪成新語系。
async function rerenderForLang() {
  applyLangToDocument();
  document.getElementById("share-modal").classList.add("hidden");
  document.getElementById("share-modal").innerHTML = "";

  const visible = SCREENS.find(
    (s) => !document.getElementById(s).classList.contains("hidden")
  );
  const resultOpen = !document.getElementById("result-modal").classList.contains("hidden");
  const redeemOpen = !document.getElementById("redeem-modal").classList.contains("hidden");

  if (visible === "screen-welcome") {
    renderWelcome(nav);
  } else if (visible === "screen-rules") {
    renderRules(nav);
  } else if (visible === "screen-history" && historyRecord) {
    renderHistory(await localizeRecord(historyRecord), nav);
  } else if (visible === "screen-play" && state.questions.length) {
    state.questions = await localizeQuestions(state.questions);
    // 目前這題若已作答，重繪後會回到未作答狀態：先捨棄這題的答案，避免重複計分
    state.answers.length = Math.min(state.answers.length, state.current);
    renderPlay(nav);
  }
  if (resultOpen && state.viewingRecord) openResultModal(state.viewingRecord, nav);
  if (redeemOpen) openRedeemModal(nav);
}

if (langSelect) {
  langSelect.value = getLang();
  langSelect.addEventListener("change", () => {
    setLang(langSelect.value);
    rerenderForLang();
  });
}

// 背景音樂：播放清單（bg_music → bg_music_2 → 循環），低音量；
// 瀏覽器擋自動播放 → 第一次互動時啟動；可靜音切換
const bgm = document.getElementById("bgm");
const BGM_TRACKS = [
  "assets/audio/bg_music.m4a",
  "assets/audio/bg_music_2.m4a",
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
window.__soundOn = true; // 全域聲音開關（背景音樂 + 音效共用）
// 音樂鈕可能有多顆（全域固定那顆＋首頁／活動辦法頁放在 header 前面那顆），一起更新
function refreshBgmIcon() {
  document.querySelectorAll(".bgm-toggle").forEach((b) => {
    b.textContent = bgmOn ? "🔊" : "🔇";
  });
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
// 事件代理：header 每次重繪都會重建音樂鈕，所以掛在 document 上
document.addEventListener("click", (e) => {
  if (!e.target.closest(".bgm-toggle")) return;
  bgmOn = !bgmOn;
  window.__soundOn = bgmOn; // 音效跟著一起開關
  if (bgmOn) playBgm();
  else bgm.pause();
  refreshBgmIcon();
});
refreshBgmIcon();

// 按鈕點擊音效（答題選項除外，因為它已有答對/答錯音效）
const clickSfx = new Audio("assets/audio/click.mp3");
clickSfx.volume = 0.5;
document.addEventListener("click", (e) => {
  if (!window.__soundOn) return; // 靜音時不播點擊音效
  const btn = e.target.closest("button");
  if (!btn || btn.classList.contains("option") || btn.classList.contains("bgm-toggle")) return;
  const a = clickSfx.cloneNode();
  // 「下一題」音效比一般大一倍（0.5 → 1.0）
  a.volume =
    btn.id === "next-btn"
      ? Math.min(1, clickSfx.volume * 2)
      : clickSfx.volume;
  a.play().catch(() => {});
});

// 啟動：每次重整都清掉本機紀錄，回到 default 狀態
resetAll();
refreshMockLabel();
applyLangToDocument();
nav.welcome();
