// 語系（之後三語系共用）：繁中 tch / 簡中 sch / 英文 en，預設繁中。
//
// 取得順序：網址 ?lang= → localStorage → 預設 tch。
// 之後全站文字要做 i18n 時，也集中在這裡擴充。

const LANG_KEY = "christmas_quiz_lang";
export const SUPPORTED_LANGS = ["tch", "sch", "en"];
export const DEFAULT_LANG = "tch";

export function getLang() {
  // 網址參數優先（方便測試：?lang=en）
  try {
    const q = new URLSearchParams(location.search).get("lang");
    if (q && SUPPORTED_LANGS.includes(q)) {
      localStorage.setItem(LANG_KEY, q);
      return q;
    }
  } catch (e) {
    /* ignore */
  }
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && SUPPORTED_LANGS.includes(saved)) return saved;
  } catch (e) {
    /* ignore */
  }
  return DEFAULT_LANG;
}

export function setLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return;
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch (e) {
    /* ignore */
  }
}
