// 步驟2 答題頁

import {
  state,
  recordAnswer,
  getScore,
  isLastQuestion,
  getCurrentQuestion,
} from "../state.js";

const LETTERS = ["A", "B", "C", "D"];

export function renderPlay(nav) {
  const el = document.getElementById("screen-play");
  const q = getCurrentQuestion();
  const total = state.questions.length;
  const num = state.current + 1;
  let answered = false;

  // 套用本題的滿版背景
  const bg = state.backgrounds[state.current];
  document.body.style.backgroundImage = bg ? `url("${bg}")` : "";

  el.innerHTML = `
    <div class="progress">第 ${num} / ${total} 題 · 答對 <span id="correct-count">${getScore()}</span> 題</div>
    <div class="progress-wrap">
      <div class="progress-bar"><span style="width:${(num / total) * 100}%"></span></div>
      <img class="progress-apple" src="assets/quiz-deco/${num >= total ? "apple_2" : "apple"}.png" alt=""
        style="left:${(num / total) * 100}%" />
    </div>

    <div class="card">
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
    </div>

    <div id="next-bar" class="next-bar hidden">
      <div id="feedback" class="explain-box"></div>
      <button id="next-btn" class="btn btn-primary">下一題</button>
    </div>
  `;
  el.style.paddingBottom = ""; // 重置底部留白

  const optionEls = Array.from(el.querySelectorAll(".option"));
  const feedbackEl = el.querySelector("#feedback");
  const nextBtn = el.querySelector("#next-btn");
  const nextBar = el.querySelector("#next-bar");
  const correctCountEl = el.querySelector("#correct-count");

  optionEls.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (answered) return;
      answered = true;
      const selected = Number(btn.dataset.i);
      const correct = q.answerIndex;
      recordAnswer(q, selected);

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
              : `<span class="tag-text">正解</span>`;
        }
        if (i === selected && selected !== correct) {
          b.classList.add("wrong");
          tag.innerHTML = `<img class="cat-mark cat-wrong" src="assets/quiz-deco/anwser_wrong.png" alt="答錯" />`;
        }
      });

      // 更新「答對幾題」
      correctCountEl.textContent = getScore();

      const isOk = selected === correct;
      feedbackEl.className = `explain-box ${isOk ? "ok" : "no"}`;
      feedbackEl.innerHTML = `
        <div class="explain-head">${isOk ? "✅ 答對了！" : "❌ 答錯了"}</div>
        <div class="explain-text">${q.explanation}</div>
      `;

      nextBtn.textContent = isLastQuestion() ? "看成績" : "下一題";
      nextBar.classList.remove("hidden");
      // 依底部框高度留白，讓內容可捲到框上方
      el.style.paddingBottom = nextBar.offsetHeight + 40 + "px";
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
