// 語系（之後三語系共用）：繁中 tch / 簡中 sch / 英文 en，預設繁中。
//
// 取得順序：網址 ?lang= → localStorage → 預設 tch（只在開頁時決定一次，之後以 setLang 為準）。
// 之後全站文字要做 i18n 時，也集中在這裡擴充。

const LANG_KEY = "christmas_quiz_lang";
export const SUPPORTED_LANGS = ["tch", "sch", "en"];
export const DEFAULT_LANG = "tch";

// 目前語系（記憶體）：第一次取用時才決定，之後以 setLang 為準。
// （網址 ?lang= 只在開頁時採用一次，不然切換語系後又被網址蓋回去）
let current = null;

export function getLang() {
  if (current) return current;
  // 網址參數優先（方便測試：?lang=en）
  try {
    const q = new URLSearchParams(location.search).get("lang");
    if (q && SUPPORTED_LANGS.includes(q)) {
      current = q;
      return current;
    }
  } catch (e) {
    /* ignore */
  }
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && SUPPORTED_LANGS.includes(saved)) {
      current = saved;
      return current;
    }
  } catch (e) {
    /* ignore */
  }
  current = DEFAULT_LANG;
  return current;
}

export function setLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return;
  current = lang;
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch (e) {
    /* ignore */
  }
}
