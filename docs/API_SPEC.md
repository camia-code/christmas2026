# 聖誕知識王｜後端 API 規格（給工程師）

> 版本：草案 v0.1　對應前端：本專案 `js/`（目前以 localStorage + 假資料示範，正式版把標示「示範」的地方換成下列 API）
> 標記說明：**【待確認】** = 需要產品／設計／工程一起決定；**【示範】** = 前端目前的假做法。

---

## 1. 名詞與身份

| 名詞 | 說明 |
|---|---|
| **app 用戶** | 從 Letstalk App 內進入、已登入的用戶。名字由 App 帶入，答完題貼圖「直接派送」到帳號，不需要序號。 |
| **訪客（guest）** | 在 App 外（一般瀏覽器）進入。需自己輸入暱稱；答完題拿到一組**兌換序號**，之後在 App「貼圖商店」輸入序號兌換。 |
| **一輪（round）** | 一次挑戰：抽 10 題 → 作答 → 結算。 |
| **第 N 次挑戰** | 該用戶（或該訪客）目前已完成的輪數 + 1。 |

身份判斷：前端目前用 mock 開關（`js/user.js` 的 `getMockMode()`）。正式版請由 App WebView 帶入登入憑證（token / app bridge）。**【待確認】** 以什麼方式判斷身份、訪客如何識別同一人（cookie / deviceId）。

## 2. 活動設定

- 活動期間：**2026-11-29 ～ 2027-01-02**
- 序號兌換期限：**2027-01-31**（逾期視同放棄、不補發）
- 每個 Letstalk 帳號**限領取一次**獎勵
- 語系：`tch` 繁中（預設）／`sch` 簡中／`en` 英文
- 每輪題數：10；題庫目前 109 題（`data/questions/questions*.json`，三語言同 id、同 `answerIndex`）

### `GET /api/activity/config`
```json
{
  "startAt": "2026-11-29T00:00:00+08:00",
  "endAt":   "2027-01-02T23:59:59+08:00",
  "redeemDeadline": "2027-01-31T23:59:59+08:00",
  "questionsPerRound": 10,
  "titles": [
    { "id": "t1", "min": 0,  "max": 2,  "tier": 1 },
    { "id": "t2", "min": 3,  "max": 4,  "tier": 2 },
    { "id": "t3", "min": 5,  "max": 6,  "tier": 3 },
    { "id": "t4", "min": 7,  "max": 8,  "tier": 4 },
    { "id": "t5", "min": 9,  "max": 9,  "tier": 5 },
    { "id": "t6", "min": 10, "max": 10, "tier": 6 }
  ]
}
```
- 稱號的**顯示文字**由前端依語系輸出（`js/i18n/*.js` 的 `title.t1`～`t6`），後端只回 `titleId`。
- `tier`（1～6）對應結果卡的貓咪與背景圖（`assets/result/result_cat_{tier}.png`、`result_bg_{tier}.png`）以及彩帶顏色。
- 活動未開始／已結束時，開始挑戰要擋下並提示（見 §9 錯誤碼）。

## 3. 開始一輪

### `POST /api/rounds`
Request
```json
{
  "lang": "tch",
  "nickname": "Camia"          // 僅訪客需要；1～12 字，後端需過濾不當字詞
}
```
Response
```json
{
  "roundId": "r_8f3a...",
  "attemptNo": 3,              // 第幾次挑戰
  "questions": [
    {
      "id": "q021",
      "question": "【散熱迷思】…",
      "options": ["…", "…", "…", "…"]   // 固定 4 個，順序即顯示順序
    }
    // 共 10 題
  ]
}
```
- **不得回傳正確答案與解析**（目前前端把整份題庫連答案都下載到瀏覽器，**【示範】**，正式版必須改掉）。
- 由後端從題庫**隨機抽 10 題**；同一輪不重複。**【待確認】** 是否要避免同一用戶連續幾輪抽到重複題目。
- 回傳的題目語言依 `lang`；其他語系缺題時退回繁中。

## 4. 作答（逐題）

前端每答一題就要立刻顯示「答對了／答錯了」、正解、解析，所以需要逐題回應。

### `POST /api/rounds/{roundId}/answers`
Request
```json
{ "questionId": "q021", "selectedIndex": 1 }
```
Response
```json
{
  "isCorrect": true,
  "answerIndex": 1,            // 正解索引（0～3）
  "explanation": "錯誤，人體散熱主要與…",
  "correctSoFar": 4            // 目前累計答對題數（畫面上方「答對 N 題」）
}
```
- 同一題重複送出要冪等（回第一次的結果，不重複計分）。
- 計分**以後端為準**。

## 5. 結算（成績畫面的資料來源）

### `POST /api/rounds/{roundId}/finish`
Response
```json
{
  "roundId": "r_8f3a...",
  "score": 8,
  "total": 10,
  "titleId": "t4",
  "tier": 4,
  "topPercent": 9,                       // 彩帶「前 X%」
  "displayName": "Camia",               // 結果卡上方名字
  "attemptNo": 3,
  "reward": {
    "type": "sticker_delivered"        // app 用戶：貼圖已派送到帳號
    // 訪客則為：
    // "type": "redeem_code",
    // "code": "XXXX-XXXX-XXXX",
    // "expiresAt": "2027-01-31T23:59:59+08:00"
  },
  "playedAt": "2026-12-03T14:22:10+08:00"
}
```

### 結果卡片（前端畫面與分享圖共用）需要的欄位
| 畫面元素 | 欄位 | 備註 |
|---|---|---|
| 左上角彩帶「前 X%」 | `topPercent` | 見下方百分位定義 |
| 名字 | `displayName` | app 用戶 = Letstalk 暱稱；訪客 = 輸入的暱稱；都沒有時前端顯示「神秘挑戰者」 |
| 貓咪圖／背景 | `tier` | 1～6 |
| 稱號膠囊 | `titleId` | 前端依語系轉文字 |
| 「答對 N / 10 題」 | `score`、`total` | `score = 0` 時顯示「一題都沒答對」 |
| 彩帶顏色 | `tier` | 藍／綠／黃輪替（`(tier-1) % 3`） |

### 百分位 `topPercent` 定義 **【待確認】**
目前前端用假公式（`js/share.js` 的 `getTopPercent`）。正式版建議：
- 統計**全體玩家的「最佳成績」或「每輪成績」**（二擇一，**需決定**）。
- `topPercent = ceil( 分數 ≥ 該玩家分數 的人數 / 總人數 × 100 )`，範圍 1～99（不顯示 0% 或 100%）。
- 人數很少時（例如活動剛開始）要有最低人數門檻，不足就用固定值或隱藏彩帶。
- 數字是**結算當下**的值，產出後固定；分享圖也是靜態，不會隨之後的人數變動。

### 結果畫面上的按鈕行為
| 身份 | 畫面 | 說明 |
|---|---|---|
| app 用戶 | 說明文字「你已獲得貼圖，請前往貼圖商城下載」；已領過（`reward.type = "already_claimed"`）改顯示「貼圖已領取過囉！可至聊天室貼圖商城查看」 | 沒有「領取貼圖」按鈕；貼圖由後端直接派送（見 §7）。 |
| 訪客 | 按鈕「複製序號／並下載 App 進行兌換貼圖」 | 前端複製 `reward.code` 到剪貼簿，顯示「已複製」約 1 秒後導向 App 下載頁（依裝置導 App Store / Google Play）**【待確認】下載連結**。序號**不顯示在畫面上**。 |

## 6. 答題紀錄

### `GET /api/rounds/{roundId}`（查看單輪完整紀錄）
```json
{
  "roundId": "r_8f3a...",
  "score": 8, "total": 10, "titleId": "t4", "tier": 4, "topPercent": 9,
  "displayName": "Camia", "playedAt": "…",
  "items": [
    {
      "questionId": "q021",
      "question": "…",
      "options": ["…","…","…","…"],
      "answerIndex": 1,
      "selectedIndex": 1,
      "isCorrect": true,
      "explanation": "…"
    }
  ]
}
```
- 題目文字**依請求的 `lang` 回傳**（前端切換語言時會重新請求；紀錄只存 `questionId` 與作答，不存當時語系的文字）。

### `GET /api/me/rounds`（首頁「上次紀錄」與「第 N 次挑戰」）
```json
{
  "attemptCount": 2,                       // 已完成輪數；首頁顯示「第 {attemptCount+1} 次挑戰」
  "last": { "roundId": "r_…", "score": 7, "total": 10, "titleId": "t4" },
  "redeemed": false                        // app 用戶是否已兌換過（決定首頁「序號兌換」入口要不要顯示）
}
```
- 訪客以 cookie / deviceId 對應自己的輪次。

## 7. 貼圖派送與序號

### app 用戶
- `finish` 成功即由後端把本次獎勵貼圖**派送到該 Letstalk 帳號**（使用者可在任一聊天室查看）。
- **每個帳號限領一次**：已領過時，後續輪次 `reward.type = "already_claimed"`，前端結果頁顯示「貼圖已領取過囉！可至聊天室貼圖商城查看」。

### 訪客序號
- 每輪（或每位訪客）發放 1 組序號。**【待確認】** 是「每輪一組」還是「每位訪客一組」。
- 全域**不可重複**、**不可猜測**；一次性使用；綁定該次成績；到 `redeemDeadline` 失效。
- 前端輸入框規則：4～20 字元，只允許英數字與連字號（`-`）；送出前轉大寫。後端請同樣驗證。
- 示範序號格式為 `merrychristmas001`（本機計數，**【示範】**），正式版請改為隨機碼。

## 8. 序號兌換

### `POST /api/redeem`
（需 app 用戶登入；首頁「序號兌換」入口只對「app 用戶且尚未兌換」顯示，以 popup 呈現。）

Request
```json
{ "code": "XXXX-XXXX-XXXX" }
```
Success response
```json
{
  "redeemed": true,
  "record": { "roundId": "r_…", "score": 7, "total": 10, "titleId": "t4" }
}
```
- 兌換成功：把該訪客那輪成績**匯入此帳號**，並派送貼圖；之後該帳號視為已兌換（`/api/me/rounds` 回 `redeemed: true`）。
- 前端成功後重繪首頁（出現「上次紀錄」、隱藏兌換入口），popup 改顯示「兌換完成／請前往聊天室貼圖商城進行下載」與「確定」按鈕，按下關閉。

## 9. 錯誤碼（建議）

| HTTP / code | 情境 | 前端顯示 |
|---|---|---|
| 403 `ACTIVITY_NOT_STARTED` / `ACTIVITY_ENDED` | 活動期間外 | **【待確認】** 文案 |
| 400 `NICKNAME_REQUIRED` / `NICKNAME_INVALID` | 訪客暱稱空白、過長、含不當字詞 | 輸入框紅框 |
| 409 `ALREADY_ANSWERED` | 重複送出同一題 | 忽略，使用第一次結果 |
| 409 `ROUND_FINISHED` | 已結算後再作答 | 回首頁 |
| 400 `CODE_EMPTY` | 序號空白 | 「請輸入序號」 |
| 400 `CODE_FORMAT` | 序號格式不符 | 「序號格式不正確，請再確認」 |
| 404 `CODE_NOT_FOUND` | 序號不存在 | **【待確認】** 文案（建議與格式錯誤同一句，避免被探測） |
| 409 `CODE_USED` | 序號已被使用 | **【待確認】** 文案 |
| 410 `CODE_EXPIRED` | 序號已過期（> 2027-01-31） | **【待確認】** 文案 |
| 409 `ACCOUNT_ALREADY_REDEEMED` | 此帳號已兌換過 | **【待確認】** 文案 |
| 429 | 兌換序號嘗試次數過多 | 請稍後再試 |

目前前端只有「請輸入序號」「序號格式不正確，請再確認」兩種訊息（三語言都有，在 `js/i18n/`）；其餘需要補文案與翻譯。

## 10. 分享圖

- 目前由**前端**把成績卡片畫面轉成 PNG（html-to-image，2 倍解析度），提供下載／系統分享：
  - 內容 = 結果卡片（名字、貓咪、稱號、答對題數、**左上角「前 X%」彩帶**、logo）。
  - **不含**右下角 WIN STICKERS 蓋章（蓋章只在畫面上）。
  - 產圖時略過字型嵌入（避免檔案過大），圖上字體可能與畫面略有差異。
- **【待確認】** 若要「各裝置看到完全一致」或「貼到社群有預覽圖」，需要後端產圖並提供分享連結：
  - `GET /api/rounds/{roundId}/share-card.png`（後端渲染）
  - 分享頁 URL 附 Open Graph 標籤（`og:image` 指向上面圖片）。
- 分享圖尺寸目前依畫面，未固定；若要固定（例如 1080×1080）請告知。

## 11. 多語系

- 前端依 `lang` 決定介面文字（`js/i18n/{tch,sch,en}.js`）；API **只回傳代碼與數字**（`titleId`、`tier`、錯誤碼），不回傳翻譯過的介面文字。
- **題目、選項、解析**依語系回傳（同 `questionId`、同 `answerIndex`）。
- 預設語系：繁中 `tch`。**【待確認】** 語系如何決定（App 帶入的語言設定 / 瀏覽器語言 / 使用者在畫面切換）。

## 12. 安全與資料

- 正解與解析只在**作答後**才回傳；題庫不得整包下載。
- 序號用密碼學安全的隨機碼；兌換 API 要限速與記錄失敗次數。
- 暱稱輸出到畫面與分享圖前要做 HTML 跳脫（前端目前直接插入，**【示範】**）。
- 個資：暱稱屬於使用者輸入，保存期限與刪除方式**【待確認】**。
- 一律 HTTPS；API 須帶身份憑證，訪客用不可偽造的 cookie / deviceId。

## 13. 前端目前的假做法（上線前要換掉）

| 項目 | 檔案 | 現況 |
|---|---|---|
| 身份切換 | `js/user.js` | mock 開關（展示列的「身份: app/guest」） |
| 題庫與計分 | `js/quiz.js`、`js/state.js` | 整份題庫下載到瀏覽器，前端判分 |
| 前 X% | `js/share.js` `getTopPercent` | 用分數換算的假公式 |
| 貼圖序號 | `js/screens/result.js` | `merrychristmas` + 本機計數 |
| 序號兌換 | `js/screens/redeem.js` | 只檢查格式，成績是寫死的假資料 |
| 紀錄 | `js/storage.js` | localStorage，且**每次重新整理都清空**（`resetAll()`） |
| 展示用工具 | `index.html` 的 `#demo-bar`、`js/main.js` 的「展示用」段落 | 語言下拉、身份切換、跳過答題；交付時整段移除（語言切換的重繪邏輯可留） |
| 導向 App 下載頁 | `js/main.js` `nav.backToApp()` | 示意用提醒框，待接 deep link / 商店連結 |

## 14. 待確認清單（彙整）

1. 身份判斷方式、訪客識別方式
2. 百分位的統計母體（全體玩家的「每輪」或「最佳」成績）與最低人數門檻
3. 序號：每輪一組還是每位訪客一組；格式與長度
4. ~~一帳號限領一次後的後續輪次，結果頁要顯示什麼~~（已定：見 §7）
5. App 下載頁連結（iOS / Android / 桌機）
6. 活動期間外、序號相關錯誤的文案（三語言）
7. 分享圖：前端產圖是否足夠，還是要後端產圖＋分享連結；是否固定尺寸；是否附活動網址／文案
8. 語系如何決定
9. 暱稱不當字詞過濾規則與個資保存期限
