// 遊戲紀錄的 localStorage 存取層。
// 之後要換後端時，只需替換本檔的實作。

const RECORDS_KEY = "christmas_quiz_records";
const NICKNAME_KEY = "christmas_quiz_nickname";

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
