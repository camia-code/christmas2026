// 介面多語系：繁中 tch（預設）／簡中 sch／英文 en。
//
// 用法：t("welcome.start")、t("welcome.attempt", { n: 2 })。
// 字串放在 js/i18n/{tch,sch,en}.js，缺字時退回繁中。
// 語系的讀寫在 lang.js（網址 ?lang= → localStorage → 預設 tch）。

import tch from "./i18n/tch.js";
import sch from "./i18n/sch.js";
import en from "./i18n/en.js";
import { getLang, setLang, SUPPORTED_LANGS, DEFAULT_LANG } from "./lang.js";

export { getLang, setLang, SUPPORTED_LANGS, DEFAULT_LANG };

const DICTS = { tch, sch, en };

// <html lang> 用的標籤
const HTML_LANG = { tch: "zh-Hant", sch: "zh-Hans", en: "en" };

export function t(key, vars) {
  const dict = DICTS[getLang()] || tch;
  let s = dict[key];
  if (s === undefined) s = tch[key];
  if (s === undefined) return key;
  if (vars) {
    s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
  }
  return s;
}

// 英文序數：1st、2nd、3rd、4th…11th、12th、13th、21st…（用在「第 N 次挑戰」→ "1st Challenge"）
export function ordinal(n) {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  return `${n}${{ 1: "st", 2: "nd", 3: "rd" }[n % 10] || "th"}`;
}

// 紀錄裡存的是「當時語系」的預設名稱（神秘挑戰者／訪客玩家／示範用 app 名字），
// 顯示時換成目前語系；使用者自己輸入的暱稱不動。
const DEFAULT_NAME_KEYS = ["user.anon", "user.appName", "redeem.guestName"];
export function localizeName(name) {
  for (const key of DEFAULT_NAME_KEYS) {
    if (Object.values(DICTS).some((d) => d[key] === name)) return t(key);
  }
  return name;
}

// 依語系更新 <html lang>、body class、網頁標題（切換語系與啟動時呼叫）。
export function applyLangToDocument() {
  const lang = getLang();
  document.documentElement.lang = HTML_LANG[lang] || "zh-Hant";
  SUPPORTED_LANGS.forEach((l) =>
    document.body.classList.toggle(`lang-${l}`, l === lang)
  );
  document.title = t("app.title");
}
