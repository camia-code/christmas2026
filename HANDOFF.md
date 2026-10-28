# 聖誕知識王 — 專案交接說明

在 Letstalk app 內以 webview 開啟的答題小遊戲（也可用一般瀏覽器以訪客身份遊玩）。純 HTML/CSS/JS（ES Modules，無建置工具）。

> 最後更新：vr38（2026-10-28）。後端 API 規格另見 [`API_SPEC.md`](API_SPEC.md)，逐版更新紀錄見 [`CHANGELOG.md`](CHANGELOG.md)。

## 如何跑起來
需用本機 http server（因 ES Modules / fetch JSON 不能用 file://）：
```
cd christmas2026
python3 .devserver.py 8000      # 推薦：回應加 no-store，不會快取到舊的 JS/CSS
# 或 python3 -m http.server 8000
# 用「外部瀏覽器」開 http://localhost:8000（VS Code 內嵌預覽不會出聲音）
# 首次要點一下畫面，背景音樂才會啟動（瀏覽器自動播放限制）
```
- `.devserver.py` 是本機用的無快取伺服器，已列入 `.gitignore`，不進版控。
- 手機實機測試：同網段用 `http://<電腦 IP>:8000` 開。
- 線上展示：GitHub Pages `https://camia-code.github.io/christmas2026/`（push 到 `origin` 的 `main` 後自動部署；Pages 有 10 分鐘快取，剛部署完可能要等一下或開無痕）。
- 網址可加 `?lang=tch|sch|en` 指定語系（方便測試）。

## 檔案結構
```
CHANGELOG.md          逐版更新紀錄（vr01～，日期＋一句說明）
API_SPEC.md           後端 API 規格草案（給工程師；含錯誤碼與待確認事項）
index.html            單頁殼；展示用切換列 #demo-bar、bgm audio、各 screen/modal 容器
css/styles.css        全站樣式
js/
  main.js             screen 路由與導頁 API（nav）、展示列邏輯、語系切換重繪、背景音樂、點擊音效
  state.js            當前一輪遊戲狀態（題目、背景、作答、正在看的紀錄）
  storage.js          localStorage：遊戲紀錄、暱稱、是否已兌換、是否已領取貼圖
  user.js             mock 使用者身份（app 用戶 / 訪客），之後接真身份只改這支
  quiz.js             依語系載入題庫、隨機抽 10 題、每題滿版背景、組紀錄、紀錄換語系
  share.js            成績卡片 HTML（含「前 X%」彩帶 SVG）、分享 PNG（html-to-image）、下載/系統分享
  header.js           header bar（首頁／活動辦法／開始挑戰；桌機展開、≤690px 漢堡選單）
  lang.js / i18n.js   語系判定（網址 ?lang= → localStorage → 預設 tch）、t() 取字串、英文序數
  i18n/tch.js sch.js en.js   三語系字串（新增文案三支都要補）
  vendor/html-to-image.js    本地版（非 CDN）
  screens/
    welcome.js        首頁（header、KV、貼圖輪播、上次紀錄、暱稱、第 N 次挑戰、序號兌換入口）
    play.js           答題頁（進度條蘋果、選項、貓咪標記、音效、震動、答對慶祝）
    result.js         成績 modal（卡片、蓋章、訪客複製序號按鈕 / app 用戶貼圖說明、分享、答題紀錄）
    redeem.js         序號兌換 popup（app 用戶匯入訪客時期的成績）
    rules.js          活動辦法頁
    event-status.js   活動尚未開始／已結束畫面（取代整個遊戲入口，無導覽列；已結束時 app 用戶仍顯示「序號兌換」圓章，讓活動結束前已複製序號的訪客可兌換貼圖，序號兌換期間到 2027.01.31）
    history.js        答題紀錄（折疊式）
data/
  questions/questions.json      題庫繁中（109 題；來源 assets/2026_quiz.html）
  questions/questions.sch.json  簡中、questions.en.json 英文（題目 id 對應同一題）
  questions/README.md           題目格式說明
  titles.js           6 級稱號 + 對應圖片編號 idx（顯示名稱在 i18n 的 title.t1～t6）
assets/
  logo.svg、2026mainpage_kv_{tch,sch,en}.svg（首頁 KV，三語）、pattern-tile-even.svg（首頁背景圖案）
  changesticker.svg   序號兌換圓章
  jf-openhuninn-2.1.ttf  粉圓字型（只用在成績卡片 .result-card）
  stickers/           首頁禮包貼圖 sticker-1～8（動態 APNG）
  activity-method/    活動辦法頁圖片（標題 main_title_kv_{tch,sch,en}.svg、各區塊背景、裝飾）
  quiz-bg/            答題滿版背景 quiz_bg_1~3、答對慶祝 quiz_bg_right
  quiz-deco/          進度條蘋果、winwin 幀動畫、答題貓咪、icon_*
  result/             成績頁 result_cat_1~6、result_bg_1~6、stamp.png（蓋章）
  audio/              bg_music.m4a、bg_music_2.m4a、click.mp3、correct.wav、correct2.wav、wrong.wav
                      （bg_music.wav / bg_music_2.mp3 為原檔，程式未使用）
```

## 使用者身份與流程
- **app 用戶**：名字由 App 帶入。答完題貼圖直接派送，結果頁顯示「🎉 你已獲得貼圖！下載路徑：聊天室 ➔ 貼圖商城 ➔ 貓王的日常語錄」；第 2 輪起（或兌換過序號）顯示「貼圖已領取過囉！查看路徑：聊天室 ➔ 貼圖商城 ➔ 貓王的日常語錄」（路徑只在箭頭處換行；英文版第一句與路徑各自獨立一行）。每個帳號限領一次。
- **訪客**：需輸入暱稱。暱稱規則：最多 12 個字，只能是文字／數字／空白（不含特殊符號、表情符號）；輸入中即時檢查，不合法就顯示紅框＋「暱稱最多 12 個字，且不能含特殊符號」，按開始時若為空顯示「請輸入暱稱」（三語言，key：`welcome.nicknameEmpty` / `welcome.nicknameInvalid`）。結果頁顯示「你的貼圖序號 merrychristmasNNN」＋「複製序號」按鈕：複製成功不在按鈕上給回饋，直接跳「已複製序號」dialog（樣式同兌換貼圖 popup，說明貼圖兌換 3 步驟，按「前往下載」導向 App 下載頁；dialog 在 redeem.js 的 `openCopiedModal`）；失敗顯示「複製失敗，請稍後再試」（紅），2.5 秒後恢復、不跳 dialog。
- **序號兌換**（首頁右下圓章，只要是 app 用戶就一直顯示，兌換過也不消失；已兌換過的帳號再輸入序號，輸入框回饋「你的帳號已兌換過，每個帳號限兌換一次」）：以 popup 開啟。空白 →「請輸入序號」、格式錯（4～20 字，英數與 `-`）→「序號格式不正確，請再確認」，輸入框紅框 + 紅字。後端錯誤（不存在 / 已使用 / 已過期 / 帳號已兌換 / 嘗試過多）也以同樣方式顯示，展示時輸入測試序號 `TEST-NOTFOUND`、`TEST-USED`、`TEST-EXPIRED`、`TEST-REDEEMED`、`TEST-TOOMANY` 即可看到；其他格式正確的序號一律成功。成功 → popup 標題「兌換完成」，內容「🎉 你已獲得貼圖！／下載路徑：聊天室 ➔ 貼圖商城 ➔ 貓王的日常語錄」＋確定。

## 重要設定 / 現況
- **稱號**（data/titles.js，依答對題數）：0-2 腦袋開開｜3-4 知識蘋困｜5-6 小試伸手｜7-8 如魚得水｜9 融會貫喵｜10 知識貓王。各級對應 result_cat_{idx}/result_bg_{idx}。
- **音量**：bg_music 0.14、bg_music_2 0.40（播放清單循環）；點擊音效 0.5（「下一題」加倍）；答對 0.34、答錯 0.72（Web Audio gain，play.js `SFX_GAIN`）。音樂與音效共用一個開關（header 左側 🔊）。
- **答題音效**：答錯永遠用 wrong；答對第 1–5 題 correct、第 6 題起 correct2。
- **進度條蘋果**：隨題數換圖，最後一題 apple_2；答對時（最後一題除外）播 winwin 幀動畫。
- **答對特效**：大框換 quiz_bg_right 背景 + 黃色太陽環繞發光動畫；答對貓釘右上（正解選項 ≥2 行改右下）；答錯貓釘左下 + 畫面震動。
- **成績卡片**：左上「前 X%」彩帶（內嵌 SVG，分享圖也會帶入）、右下蓋章（只在畫面上，不進分享圖）。
- **三語系**：繁中 / 簡中 / 英文，含題庫、稱號、KV、活動辦法標題圖；英文「第 N 次挑戰」用序數（1st/2nd/3rd Challenge）。切換語系會重繪目前畫面與開著的 popup。

## 展示用（正式上線前移除）
- 上方 `#demo-bar` 展示切換列：跳過答題開關 + 答對題數（直接開成績 dialog）、語言下拉、活動狀態下拉（進行中／尚未開始／已結束，後兩者整頁換成「活動尚未開始，敬請期待！」「活動已結束，感謝參與！」，文案 key：`event.upcoming` / `event.ended`；正式版應依活動時間 2026.11.29 ~ 2027.01.02 或後端判斷，邏輯在 main.js 的 `eventStatus`）、身份 app/guest 切換。移除時連同 css 的 `.demo-bar` / `.mock-toggle` 與 main.js 對應段落。
- **每次重新整理都會清空本機資料**（main.js 最後的 `resetAll()`），方便反覆展示「第一次」的狀態。正式版要拿掉。

## 目前是假資料 / 待接後端（詳見 API_SPEC.md）
- 使用者身份（user.js mock）。
- 「前 X%」百分位：目前用分數換算（share.js `getTopPercent`）。
- 訪客序號：`merrychristmas` + 本機計數（result.js）。
- 序號兌換：格式檢查 + 測試序號模擬錯誤，成績寫死 7/10（redeem.js）；接後端時把 `DEMO_ERROR_CODES` 換成 API 回傳的錯誤碼。
- 是否已領取貼圖：本機記錄（正式版看後端 `reward.type = "already_claimed"`）。
- 回 App / 下載 App：`nav.backToApp()` 只是 alert 佔位，App Store / Google Play 連結待確認。

## 尚未完成 / 待辦
- 上述後端串接；活動期間外的文案（三語言）待確認。
- 分享圖尺寸目前依畫面，未固定 1080×1080（若需標準尺寸再調 share.js）。
- 上線前移除展示用元件（見上）。

## 版本
- commit 訊息以 `vrXX: 說明` 命名，目前到 vr38。每版改了什麼見 [`CHANGELOG.md`](CHANGELOG.md)，新增版本時請一併補上一列。
- git tag 只打到 `vr06_result_ribbon_stamp_0709`，之後的里程碑只有 commit。
- 遠端：只有 `origin`（camia-code/christmas2026，含 GitHub Pages）。
