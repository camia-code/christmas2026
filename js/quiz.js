// 題庫載入與抽題、計分、稱號判定。

import { getTitle } from "../data/titles.js";
import { getLang } from "./lang.js";

const QUESTION_COUNT = 10;
// 題庫依語系分檔：questions.json（繁中）、questions.sch.json、questions.en.json。
// 三份用相同的 id 與 answerIndex；某語系檔案缺漏時退回繁中。
const QUESTIONS_URLS = {
  tch: "data/questions/questions.json",
  sch: "data/questions/questions.sch.json",
  en: "data/questions/questions.en.json",
};

// 題目滿版背景（放在 assets/quiz-bg/）。新增圖片時把檔名加進來即可。
const QUIZ_BG_DIR = "assets/quiz-bg/";
const QUIZ_BACKGROUNDS = ["quiz_bg_1.png", "quiz_bg_2.png", "quiz_bg_3.png"];

// 為每題挑一張背景：隨機，但相鄰兩題不重複。
export function pickBackgrounds(count) {
  const pool = QUIZ_BACKGROUNDS;
  const seq = [];
  let prev = null;
  for (let i = 0; i < count; i++) {
    let choices = pool.filter((p) => p !== prev);
    if (!choices.length) choices = pool; // 只有一張時的保底
    const pick = choices[Math.floor(Math.random() * choices.length)];
    seq.push(QUIZ_BG_DIR + pick);
    prev = pick;
  }
  return seq;
}

const cachedPools = {};

// 載入目前語系的題庫（含快取；該語系檔案載入失敗就退回繁中）。
export async function loadQuestionPool(lang = getLang()) {
  if (cachedPools[lang]) return cachedPools[lang];
  let res = await fetch(QUESTIONS_URLS[lang] || QUESTIONS_URLS.tch);
  if (!res.ok && lang !== "tch") return loadQuestionPool("tch");
  if (!res.ok) throw new Error(`載入題庫失敗：${res.status}`);
  cachedPools[lang] = await res.json();
  return cachedPools[lang];
}

// 把題目（同 id）換成目前語系的版本；找不到對應就保留原樣。切換語系時用。
export async function localizeQuestions(questions) {
  const pool = await loadQuestionPool();
  const byId = new Map(pool.map((q) => [q.id, q]));
  return questions.map((q) => byId.get(q.id) || q);
}

// 紀錄裡存的題目是當時語系的快照；顯示紀錄頁時換成目前語系。
export async function localizeRecord(record) {
  if (!record || !record.questions) return record;
  return { ...record, questions: await localizeQuestions(record.questions) };
}

// Fisher–Yates 洗牌（不改動原陣列）。
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 從題庫隨機抽 QUESTION_COUNT 題（不足則取全部）。
export async function pickQuestions() {
  const pool = await loadQuestionPool();
  if (pool.length < QUESTION_COUNT) {
    console.warn(`題庫僅 ${pool.length} 題，少於 ${QUESTION_COUNT} 題，取全部。`);
  }
  return shuffle(pool).slice(0, QUESTION_COUNT);
}

// 把本輪結果組成可存檔的紀錄物件。
export function buildRecord({ name, score, answers, questions }) {
  return {
    playedAt: new Date().toISOString(),
    name,
    score,
    total: questions.length,
    title: getTitle(score).name,
    // 連同題目快照一起存，紀錄頁才能顯示題目/正解/詳解
    questions: questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      answerIndex: q.answerIndex,
      explanation: q.explanation,
    })),
    answers,
  };
}
