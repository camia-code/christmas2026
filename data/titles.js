// 稱號設定（依「答對題數」分級）
//
// 之後請直接修改下方 name 與分數區間。min/max 皆為「含」，
// 五段需涵蓋 0～10，且不可重疊。getTitle() 會回傳第一個符合的稱號。
//
// 目前為佔位稱號，請替換成正式名稱。

export const TITLES = [
  { id: "t1", min: 0, max: 2, name: "稱號一（待定）", desc: "" },
  { id: "t2", min: 3, max: 4, name: "稱號二（待定）", desc: "" },
  { id: "t3", min: 5, max: 6, name: "稱號三（待定）", desc: "" },
  { id: "t4", min: 7, max: 8, name: "稱號四（待定）", desc: "" },
  { id: "t5", min: 9, max: 10, name: "稱號五（待定）", desc: "" },
];

// 依答對題數取得稱號物件。
export function getTitle(score) {
  return (
    TITLES.find((t) => score >= t.min && score <= t.max) ||
    TITLES[TITLES.length - 1]
  );
}
