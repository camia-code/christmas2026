// 使用者身份模組（wireframe 用 mock 切換）。
//
// 兩種情境：
//   - app 用戶：已帶入 Letstalk 名字，不需輸入暱稱。
//   - 非 app 用戶：需自行輸入暱稱。
//
// 之後真實接 Letstalk app 時，只要改寫 getUser()（例如改讀 URL query
// 或 app bridge），其餘畫面邏輯不需更動。

import { getSavedNickname, saveNickname } from "./storage.js";

const MODE_KEY = "christmas_quiz_mockmode"; // "app" | "guest"

// 取得目前 mock 模式。
export function getMockMode() {
  try {
    return localStorage.getItem(MODE_KEY) || "app";
  } catch (e) {
    return "app";
  }
}

// 切換 mock 模式並回傳新模式。
export function toggleMockMode() {
  const next = getMockMode() === "app" ? "guest" : "app";
  try {
    localStorage.setItem(MODE_KEY, next);
  } catch (e) {
    /* ignore */
  }
  return next;
}

// 是否為 app 用戶。
export function isAppUser() {
  return getMockMode() === "app";
}

// 取得使用者資訊。
// app 用戶 → 帶入假的 Letstalk 名字；guest → 帶入已存暱稱（可能為空）。
export function getUser() {
  if (isAppUser()) {
    return { isAppUser: true, name: "小明（Letstalk）" };
  }
  return { isAppUser: false, name: getSavedNickname() };
}

// guest 設定暱稱。
export function setNickname(name) {
  saveNickname((name || "").trim());
}

// 取得顯示名稱，沒有則給預設。
export function getDisplayName() {
  const user = getUser();
  return user.name && user.name.trim() ? user.name.trim() : "神秘挑戰者";
}
