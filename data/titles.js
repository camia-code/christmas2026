// 稱號設定（依「答對題數」分級）
//
// min/max 皆為「含」，六段需涵蓋 0～10 且不可重疊。
// getTitle() 會回傳第一個符合的稱號。
//
// name：結果頁黑色膠囊上的稱號。
// idx ：對應的貓咪與背景圖編號（assets/result/result_cat_{idx}.png、result_bg_{idx}.png）。

import { t } from "../js/i18n.js";

export const TITLES = [
  { id: "t1", min: 0, max: 2, idx: 1, name: "腦袋開開" },
  { id: "t2", min: 3, max: 4, idx: 2, name: "知識蘋困" },
  { id: "t3", min: 5, max: 6, idx: 3, name: "小試伸手" },
  { id: "t4", min: 7, max: 8, idx: 4, name: "如魚得水" },
  { id: "t5", min: 9, max: 9, idx: 5, name: "融會貫喵" },
  { id: "t6", min: 10, max: 10, idx: 6, name: "知識貓王" },
];

// 稱號顯示名稱（依目前語系；字串在 js/i18n/*.js 的 title.t1～t6）。
export function getTitleName(score) {
  return t(`title.${getTitle(score).id}`);
}

// 依答對題數取得稱號物件。
export function getTitle(score) {
  return (
    TITLES.find((t) => score >= t.min && score <= t.max) ||
    TITLES[TITLES.length - 1]
  );
}
