# 聖誕知識王 — 專案交接說明

在 Letstalk app 內以 webview 開啟的答題小遊戲。純 HTML/CSS/JS（ES Modules，無建置工具）。

## 如何跑起來
需用本機 http server（因 ES Modules / fetch JSON 不能用 file://）：
```
cd christmas2026
python3 -m http.server 8000
# 用「外部瀏覽器」開 http://localhost:8000（VS Code 內嵌預覽不會出聲音）
# 首次要點一下畫面，背景音樂才會啟動（瀏覽器自動播放限制）
```
VS Code 已裝 Live Preview 擴充（右鍵 index.html → Show Preview），但**測聲音請用外部瀏覽器**。

## 檔案結構
```
index.html            單頁殼；引入 js/vendor/html-to-image.js（本地，非 CDN）、bgm audio、字型
css/styles.css        全站樣式
js/
  main.js             screen 路由、背景音樂播放清單、按鈕點擊音效
  state.js            當前一輪遊戲狀態（題目、背景、作答）
  storage.js          localStorage：遊戲紀錄、暱稱
  user.js             mock 使用者身份（app 用戶 / 訪客），之後接真身份只改這支
  quiz.js             載入題庫、隨機抽 10 題、每題滿版背景挑選、稱號判定
  share.js            成績卡片 HTML/class、分享 PNG（html-to-image）、下載/系統分享
  screens/
    welcome.js        大廳（logo、KV、貼圖輪播、上次紀錄、暱稱、挑戰開始）
    play.js           答題頁（進度條蘋果、選項、貓咪標記、音效、震動、答對慶祝）
    result.js         成績 modal（含開發用『稱號預覽』左右切換）
    history.js        答題紀錄（折疊式）
data/
  questions/questions.json  題庫（109 題，正式版每輪隨機抽 10 題；來源 assets/2026_quiz.html）
  questions/README.md       題目格式說明
  titles.js           6 級稱號 + 對應圖片編號 idx
assets/
  logo.png, 2026mainpage_kv.png（大廳 KV）
  jf-openhuninn-2.1.ttf  粉圓字型（只用在成績卡片 .result-card）
  quiz-bg/            答題滿版背景 quiz_bg_1~3、答對慶祝 quiz_bg_right
  quiz-deco/          進度條蘋果 apple/apple_2~5、winwin/2/3、答題貓咪 anwser_right/anwser_wrong(02)、correct、icon_*
  result/            成績頁 result_cat_1~6、result_bg_1~6
  audio/             bg_music.wav、bg_music_2.mp3、click.mp3、correct(.wav/2)、wrong(.wav/2)
```

## 重要設定 / 現況
- **稱號**（data/titles.js，依答對題數）：0-2 知識蘋困｜3-4 腦袋開開｜5-6 小試伸手｜7-8 如魚得水｜9 融會貫喵｜10 知識貓王。各級對應 result_cat_{idx}/result_bg_{idx}。
- **音量**（多次微調後現值）：bg_music 0.14、bg_music_2 0.40；答對音效 0.28、答錯 0.60（Web Audio gain）。
- **答題音效**：答錯永遠用 wrong；答對第 1–5 題 correct、第 6 題起 correct2。
- **進度條蘋果**：隨題數 apple→apple_3→apple_4→apple_5，最後一題 apple_2；答對時（最後一題除外）在 winwin/2/3 幀動畫。
- **答對特效**：大框換 quiz_bg_right 背景 + 黃色太陽環繞發光動畫（2.2s）；答對貓釘右上，若正解選項 ≥2 行改釘右下；答錯貓釘左下 + 畫面震動。
- **開發用（正式上線前移除）**：右上「身份」mock 切換、左上 🔊 音樂開關、成績 modal 的「稱號預覽 ‹ ›」。

## 尚未完成 / 待辦
- 回 app 的真實 deep link / app bridge（目前 result.js `nav.backToApp()` 只是 alert 佔位）。
- 真實使用者身份（user.js 目前 mock）。
- bg_music 建議轉成 mp3（wav 檔大、載入慢）。
- 上線前移除開發用元件（見上）。
- 分享圖尺寸目前依畫面，未固定 1080×1080（若需標準尺寸再調 share.js）。

## 版本
- git tag `vr01_bg_color_0701`（早期配色版）
- 之後每個里程碑可再 commit + tag。
