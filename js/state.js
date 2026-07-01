// 當前這一輪遊戲的暫存狀態（記憶體，不持久化）。

export const state = {
  questions: [], // 本輪抽到的 10 題
  backgrounds: [], // 每題對應的滿版背景路徑
  current: 0, // 目前題號索引
  answers: [], // 作答結果 [{ questionId, selectedIndex, isCorrect }]
  // 「查看答題紀錄／分享」時要顯示的那一輪結果（成績 modal 與紀錄頁共用）
  viewingRecord: null,
};

// 開新一輪遊戲。
export function startRound(questions, backgrounds = []) {
  state.questions = questions;
  state.backgrounds = backgrounds;
  state.current = 0;
  state.answers = [];
}

// 記錄一題作答。
export function recordAnswer(question, selectedIndex) {
  state.answers.push({
    questionId: question.id,
    selectedIndex,
    isCorrect: selectedIndex === question.answerIndex,
  });
}

// 本輪答對題數。
export function getScore() {
  return state.answers.filter((a) => a.isCorrect).length;
}

// 是否為最後一題。
export function isLastQuestion() {
  return state.current >= state.questions.length - 1;
}

export function getCurrentQuestion() {
  return state.questions[state.current];
}
