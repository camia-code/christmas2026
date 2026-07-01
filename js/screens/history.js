// 步驟4 答題紀錄頁

import { openShareModal } from "../share.js";

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
            i === selected ? "（你的選擇）" : i === q.answerIndex ? "（正解）" : "";
          return `<div class="${cls}">${LETTERS[i]}. ${opt} ${mark}</div>`;
        })
        .join("");
      return `
        <div class="hist-item">
          <div class="hist-q">
            <span class="idx">第 ${qi + 1} 題</span>${q.question}
            <span class="badge ${isCorrect ? "ok" : "no"}">${isCorrect ? "答對" : "答錯"}</span>
          </div>
          ${opts}
          <div class="hist-exp">💡 ${q.explanation}</div>
        </div>
      `;
    })
    .join("");

  el.innerHTML = `
    <div class="history-head">
      <strong>答題紀錄（${record.score}/${record.total}）</strong>
      <button class="link-btn" id="hist-share">分享結果</button>
    </div>
    ${items}
    <button id="hist-back" class="btn btn-primary">返回大廳</button>
  `;

  el.querySelector("#hist-back").addEventListener("click", () => {
    nav.welcome();
  });
  el.querySelector("#hist-share").addEventListener("click", () => {
    openShareModal(record);
  });
}
