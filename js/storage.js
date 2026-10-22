// 遊戲紀錄的 localStorage 存取層。
// 之後要換後端時，只需替換本檔的實作。

const RECORDS_KEY = "christmas_quiz_records";
const NICKNAME_KEY = "christmas_quiz_nickname";
const REDEEMED_KEY = "christmas_quiz_redeemed";
const CLAIMED_KEY = "christmas_quiz_sticker_claimed";
const STORAGE_PREFIX = "christmas_quiz_";

// 開發用：清掉所有本遊戲的 localStorage 資料，讓每次重整都回到 default 狀態。
export function resetAll() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(STORAGE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    /* ignore */
  }
}

// 是否已成功兌換過（兌換過一次就永久藏起入口）。
export function hasRedeemed() {
  try {
    return !!localStorage.getItem(REDEEMED_KEY);
  } catch (e) {
    return false;
  }
}

// 標記已兌換，存入使用的序號方便除錯。
export function setRedeemed(code) {
  try {
    localStorage.setItem(REDEEMED_KEY, code);
  } catch (e) {
    /* ignore */
  }
}

// 是否已領取過貼圖（每個帳號限領一次；正式版由後端回 reward.type = "already_claimed" 判斷）。
export function hasClaimedSticker() {
  try {
    return !!localStorage.getItem(CLAIMED_KEY);
  } catch (e) {
    return false;
  }
}

export function setClaimedSticker() {
  try {
    localStorage.setItem(CLAIMED_KEY, "1");
  } catch (e) {
    /* ignore */
  }
}

// 讀取所有遊戲紀錄（陣列，最後一筆為最新）。
export function getRecords() {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn("讀取紀錄失敗", e);
    return [];
  }
}

// 取得最新一筆紀錄，沒有則回傳 null。
export function getLastRecord() {
  const records = getRecords();
  return records.length ? records[records.length - 1] : null;
}

// 新增一筆遊戲紀錄，回傳剛存入的紀錄。
export function addRecord(record) {
  const records = getRecords();
  records.push(record);
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  } catch (e) {
    console.warn("寫入紀錄失敗", e);
  }
  return record;
}

// 暱稱（非 app 用戶）持久化，方便重開後沿用。
export function getSavedNickname() {
  try {
    return localStorage.getItem(NICKNAME_KEY) || "";
  } catch (e) {
    return "";
  }
}

export function saveNickname(name) {
  try {
    localStorage.setItem(NICKNAME_KEY, name);
  } catch (e) {
    /* ignore */
  }
}
