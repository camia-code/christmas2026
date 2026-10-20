// 步驟4 答題紀錄頁

import { openShareModal } from "../share.js";
import { t } from "../i18n.js";

const LETTERS = ["A", "B", "C", "D"];

// 顯示某一輪的答題紀錄。
// record：含 questions 快照與 answers。
export function renderHistory(record, nav) {
  const el = document.getElementById("screen-history");

  const items = record.questions
    .map((q, qi) => {
      const ans = record.answers.find((a) => a.questionId === q.id) || {};
      const selected = ans.selectedIndex;
      const isCorrect = ans.isCorrect;
      const opts = q.options
        .map((opt, i) => {
          let cls = "hist-opt";
          if (i === q.answerIndex) cls += " correct";
          else if (i === selected) cls += " your-wrong";
          const mark =
            i === selected ? t("history.yourPick") : i === q.answerIndex ? t("history.correctMark") : "";
          const markHtml = mark ? `<span class="hist-opt-mark">${mark}</span>` : "";
          return `<div class="${cls}">${LETTERS[i]}. ${opt}${markHtml}</div>`;
        })
        .join("");
      const mark = isCorrect ? "anwser_right" : "anwser_wrong02";
      return `
        <div class="hist-item ${isCorrect ? "correct" : "wrong"}">
          <button class="hist-head" type="button" aria-expanded="false">
            <span class="hist-q"><span class="idx">${qi + 1}.</span> ${q.question}</span>
            <span class="hist-right">
              <img class="hist-mark" src="assets/quiz-deco/${mark}.png" alt="${isCorrect ? t("play.altRight") : t("play.altWrong")}" />
              <svg class="hist-chevron" viewBox="0 0 24 24" width="18" height="18" fill="none"
                stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </button>
          <div class="hist-body" hidden>
            ${opts}
            <div class="hist-exp">💡 ${q.explanation}</div>
          </div>
        </div>
      `;
    })
    .join("");

  el.innerHTML = `
    <div class="history-head">
      <strong>${t("history.title", { s: record.score, t: record.total })}</strong>
      <button class="link-btn" id="hist-share">${t("history.share")}</button>
    </div>
    ${items}
    <button id="hist-back" class="btn btn-primary">${t("history.back")}</button>
  `;

  // 折疊/展開
  el.querySelectorAll(".hist-head").forEach((head) => {
    head.addEventListener("click", () => {
      const item = head.closest(".hist-item");
      const body = item.querySelector(".hist-body");
      const open = item.classList.toggle("open");
      body.hidden = !open;
      head.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  el.querySelector("#hist-back").addEventListener("click", () => {
    nav.welcome();
  });
  el.querySelector("#hist-share").addEventListener("click", () => {
    openShareModal(record);
  });
}
