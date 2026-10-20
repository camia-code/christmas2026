// 步驟2 答題頁

import {
  state,
  recordAnswer,
  getScore,
  isLastQuestion,
  getCurrentQuestion,
} from "../state.js";

const LETTERS = ["A", "B", "C", "D"];

// 答題音效（用 Web Audio，可放大到原始音量以上）
// 全部再放大 20%（correct 0.28→0.34、wrong 0.60→0.72、correct2 0.28→0.34、wrong2 0.42→0.50）
const SFX_GAIN = { correct: 0.34, wrong: 0.72, correct2: 0.34, wrong2: 0.5 };
let sfxCtx = null;
const sfxBuffers = {};
function initSfx() {
  if (sfxCtx) return;
  try {
    sfxCtx = new (window.AudioContext || window.webkitAudioContext)();
    ["correct", "wrong", "correct2", "wrong2"].forEach(async (name) => {
      try {
        const res = await fetch(`assets/audio/${name}.wav`);
        sfxBuffers[name] = await sfxCtx.decodeAudioData(await res.arrayBuffer());
      } catch (e) {
        console.warn("音效載入失敗", name, e);
      }
    });
  } catch (e) {
    /* 不支援 Web Audio 時略過 */
  }
}
// winwin 幀動畫計時器（跨題切換時要清除）
let winwinTimer = null;

function playSfx(name) {
  if (window.__soundOn === false) return; // 靜音時不播答題音效
  if (!sfxCtx || !sfxBuffers[name]) return;
  if (sfxCtx.state === "suspended") sfxCtx.resume();
  const src = sfxCtx.createBufferSource();
  src.buffer = sfxBuffers[name];
  const gain = sfxCtx.createGain();
  gain.gain.value = SFX_GAIN[name] ?? 1;
  src.connect(gain).connect(sfxCtx.destination);
  src.start();
}

export function renderPlay(nav) {
  const el = document.getElementById("screen-play");
  const q = getCurrentQuestion();
  const total = state.questions.length;
  const num = state.current + 1;
  let answered = false;

  initSfx(); // 準備答題音效

  // 換題時清掉上一題的 winwin 動畫
  if (winwinTimer) {
    clearInterval(winwinTimer);
    winwinTimer = null;
  }

  // 進度條蘋果：隨題數推進 apple → apple_3 → apple_4 → apple_5，最後一題 apple_2
  const appleStages = ["apple", "apple_3", "apple_4", "apple_5"];
  const appleImg =
    num >= total
      ? "apple_2"
      : appleStages[
          Math.min(
            appleStages.length - 1,
            Math.floor(((num - 1) / (total - 1)) * appleStages.length)
          )
        ];

  // 套用本題的滿版背景
  const bg = state.backgrounds[state.current];
  document.body.style.backgroundImage = bg ? `url("${bg}")` : "";

  el.innerHTML = `
    <!-- 音樂鈕放在進度條左側（不再浮在畫面上遮住進度條），進度條自動吃剩下的寬度 -->
    <div class="play-top">
      <button type="button" class="bgm-toggle" aria-label="背景音樂">${window.__soundOn === false ? "🔇" : "🔊"}</button>
      <div class="play-top-main">
        <div class="progress">第 ${num} / ${total} 題 · 答對 <span id="correct-count">${getScore()}</span> 題</div>
        <div class="progress-wrap">
          <div class="progress-bar"><span style="width:${(num / total) * 100}%"></span></div>
          <img class="progress-apple" src="assets/quiz-deco/${appleImg}.png" alt=""
            style="left:${(num / total) * 100}%" />
        </div>
      </div>
    </div>

    <div class="quiz-frame">
      <div class="quiz-box${bg && bg.includes("quiz_bg_3") ? " bg3" : ""}">
        <div class="question-text">${q.question}</div>
        <div id="options">
          ${q.options
            .map(
              (opt, i) =>
                `<button class="btn option" data-i="${i}">
                   <span>${LETTERS[i]}. ${opt}</span>
                   <span class="tag"></span>
                 </button>`
            )
            .join("")}
        </div>
        <div id="feedback" class="explain-box hidden"></div>
        <button id="next-btn" class="btn btn-primary hidden">下一題</button>
      </div>
    </div>
  `;

  const optionEls = Array.from(el.querySelectorAll(".option"));
  const feedbackEl = el.querySelector("#feedback");
  const nextBtn = el.querySelector("#next-btn");
  const correctCountEl = el.querySelector("#correct-count");

  optionEls.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (answered) return;
      answered = true;
      const selected = Number(btn.dataset.i);
      const correct = q.answerIndex;
      recordAnswer(q, selected);

      const isRight = selected === correct;
      // 答題音效：答錯永遠用 wrong；答對第 1–5 題用 correct、第 6 題起用 correct2
      playSfx(isRight ? "correct" + (num >= 6 ? "2" : "") : "wrong");
      // 答對：大框換成慶祝背景 + 太陽發光環繞動畫；進度條蘋果換成 winwin
      if (isRight) {
        el.querySelector(".quiz-box")?.classList.add("is-right");
        // 最後一題維持 apple_2；其餘答對時進度條蘋果在 winwin/winwin2/winwin3 循環跳動
        const appleEl = el.querySelector(".progress-apple");
        if (appleEl && num < total) {
          const frames = ["winwin", "winwin2", "winwin3"];
          let fi = 0;
          appleEl.src = `assets/quiz-deco/${frames[0]}.png`;
          winwinTimer = setInterval(() => {
            fi = (fi + 1) % frames.length;
            appleEl.src = `assets/quiz-deco/${frames[fi]}.png`;
          }, 180);
        }
      }
      // 答錯：畫面震動一下
      if (!isRight) {
        const app = document.getElementById("app");
        app.classList.remove("shake");
        void app.offsetWidth; // 觸發重排，讓動畫可重複播放
        app.classList.add("shake");
      }

      // 標示選項：
      //  答對 → 正解選項右側放開心喵（cat_right）
      //  答錯 → 正解選項標示「正解」文字，選錯的選項左側放流汗喵（cat_wrong）
      optionEls.forEach((b, i) => {
        b.classList.add("disabled");
        const tag = b.querySelector(".tag");
        if (i === correct) {
          b.classList.add("correct");
          tag.innerHTML =
            selected === correct
              ? `<img class="cat-mark cat-right" src="assets/quiz-deco/anwser_right.png" alt="答對" />`
              : `<img class="tag-correct" src="assets/quiz-deco/correct.png" alt="正解" />`;
        }
        if (i === selected && selected !== correct) {
          b.classList.add("wrong");
          tag.innerHTML = `<img class="cat-mark cat-wrong" src="assets/quiz-deco/anwser_wrong.png" alt="答錯" />`;
        }
      });

      // 答對時，若正解選項文字超過兩行，把喵改釘右下角
      if (selected === correct) {
        const correctBtn = optionEls[correct];
        const textSpan = correctBtn.querySelector("span");
        const cs = getComputedStyle(textSpan);
        let lh = parseFloat(cs.lineHeight);
        if (isNaN(lh)) lh = parseFloat(cs.fontSize) * 1.5;
        const lines = Math.round(textSpan.offsetHeight / lh);
        if (lines >= 2) {
          correctBtn.querySelector(".cat-right")?.classList.add("cat-corner-br");
        }
      }

      // 更新「答對幾題」
      correctCountEl.textContent = getScore();

      const isOk = selected === correct;
      feedbackEl.className = `explain-box ${isOk ? "ok" : "no"}`;
      feedbackEl.innerHTML = `
        <div class="explain-head">
          <img class="explain-icon" src="assets/quiz-deco/${isOk ? "icon_right" : "icon_wrong"}.png" alt="" />
          ${isOk ? "答對了！" : "答錯了"}
        </div>
        <div class="explain-text">${q.explanation}</div>
      `;

      nextBtn.textContent = isLastQuestion() ? "看成績" : "下一題";
      nextBtn.classList.remove("hidden");
    });
  });

  nextBtn.addEventListener("click", () => {
    if (isLastQuestion()) {
      nav.finishRound(getScore());
    } else {
      state.current += 1;
      renderPlay(nav);
    }
  });
}
