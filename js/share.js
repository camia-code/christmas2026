// 分享卡片：產生成績卡片 DOM、轉成 PNG 預覽 / 下載。
// 使用 CDN 的 html-to-image（index.html 引入，全域 window.htmlToImage）。

import { getTitle, getTitleName } from "../data/titles.js";
import { t, localizeName } from "./i18n.js";

// 彩帶底色 + 同色系深色文字（依稱號分級輪流）
const RIBBON_COLORS = [
  { bg: "#75d3ff", text: "#10567a" }, // 藍
  { bg: "#5ec272", text: "#1f6b39" }, // 綠
  { bg: "#fff07b", text: "#7a6a12" }, // 黃
];

// 左上角彩帶：答對題數在所有人中的百分位（前 X%）
// （目前為分數換算的 demo，正式版需由後端統計所有玩家答對數）
function getTopPercent(record) {
  const total = record.total || 10;
  return Math.max(
    1,
    Math.min(99, Math.round(((total - record.score) / total) * 40) + 1)
  );
}

// 成績卡片的 class（含依稱號分級的背景）。
export function resultCardClass(record) {
  const title = getTitle(record.score);
  return `result-card rc-tier-${title.idx}`;
}

// 成績卡片內容（result modal 與分享圖共用）。
export function resultCardHTML(record) {
  const title = getTitle(record.score);
  const line =
    record.score === 0
      ? t("result.zero")
      : t("result.score", { s: record.score, t: record.total });
  const ribbon =
    RIBBON_COLORS[(title.idx - 1) % RIBBON_COLORS.length];
  return `
    <!-- 左上角彩帶（前 X%）：放在卡片內，畫面與分享圖共用 -->
    <div class="result-ribbon">
      <div class="ribbon-inner" style="background:${ribbon.bg};color:${ribbon.text}">
        <span class="r2">${t("result.top", { p: getTopPercent(record) })}</span>
      </div>
    </div>
    <div class="rc-username">${localizeName(record.name) || t("user.anon")}</div>
    <div class="rc-mid">
      <img class="rc-cat" src="assets/result/result_cat_${title.idx}.png" alt=""
        onerror="this.classList.add('rc-cat-missing')" />
      <div class="rc-title-pill">${getTitleName(record.score)}</div>
      <div class="rc-sub">${t("result.subline")}</div>
      <div class="rc-result">${line}</div>
    </div>
    <img class="rc-logo" src="assets/logo.svg" alt="Letstalk" />
  `;
}

// 開啟分享預覽 modal：把成績卡片轉成 PNG 顯示，提供下載。
export async function openShareModal(record, onClose) {
  const overlay = document.getElementById("share-modal");
  overlay.classList.remove("hidden");
  overlay.innerHTML = `
    <div class="modal">
      <button class="modal-close" id="share-close" type="button">×</button>
      <p class="section-title">${t("share.title")}</p>
      <div id="share-preview-box">
        <p style="color:var(--muted);font-size:14px;">${t("share.generating")}</p>
      </div>
      <div id="share-actions" class="share-actions hidden">
        <button id="share-download" class="icon-btn" type="button" aria-label="${t("share.downloadAria")}">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3v12" /><path d="M7 11l5 5 5-5" /><path d="M5 21h14" />
          </svg>
        </button>
        <button id="share-send" class="icon-btn" type="button" aria-label="${t("share.sendAria")}">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
    </div>
  `;

  const close = () => {
    overlay.classList.add("hidden");
    overlay.innerHTML = "";
    if (onClose) onClose();
  };
  overlay.querySelector("#share-close").addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  // 離屏渲染要截圖的卡片
  const node = document.createElement("div");
  node.className = resultCardClass(record);
  node.style.width = "360px";
  node.innerHTML = resultCardHTML(record);
  node.style.position = "fixed";
  node.style.left = "-9999px";
  node.style.top = "0";
  document.body.appendChild(node);

  const previewBox = overlay.querySelector("#share-preview-box");
  const actions = overlay.querySelector("#share-actions");
  const downloadBtn = overlay.querySelector("#share-download");
  const sendBtn = overlay.querySelector("#share-send");
  const FILE_NAME = t("share.fileName");

  try {
    if (!window.htmlToImage) throw new Error("html-to-image 未載入");
    const dataUrl = await window.htmlToImage.toPng(node, {
      pixelRatio: 2,
      backgroundColor: "#ffffff",
      cacheBust: true,
      skipFonts: true, // 略過嵌入 4.9MB 粉圓字型，避免產圖卡住/失敗
    });
    previewBox.innerHTML = `<img class="share-preview" src="${dataUrl}" alt="${t("share.imgAlt")}" />`;
    actions.classList.remove("hidden");

    // 下載
    downloadBtn.addEventListener("click", () => {
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = FILE_NAME;
      a.click();
    });

    // 分享（叫起系統分享面板；不支援時退回下載）
    sendBtn.addEventListener("click", async () => {
      try {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], FILE_NAME, { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: t("share.appTitle") });
        } else {
          const a = document.createElement("a");
          a.href = dataUrl;
          a.download = FILE_NAME;
          a.click();
        }
      } catch (e) {
        /* 使用者取消分享等，忽略 */
      }
    });
  } catch (err) {
    console.warn(err);
    previewBox.innerHTML = `<p style="color:var(--wrong);font-size:14px;">${t("share.fail")}</p>`;
  } finally {
    document.body.removeChild(node);
  }
}
