// 分享卡片：產生成績卡片 DOM、轉成 PNG 預覽 / 下載。
// 使用 CDN 的 html-to-image（index.html 引入，全域 window.htmlToImage）。

// 成績卡片內容（result modal 與分享圖共用）。
export function resultCardHTML(record) {
  return `
    <div class="rc-name">${record.name}</div>
    <div class="rc-title">${record.title}</div>
    <div class="rc-score">本輪答對 <b>${record.score}</b> / ${record.total} 題</div>
    <div class="rc-brand">聖誕知識王 · Letstalk</div>
  `;
}

// 開啟分享預覽 modal：把成績卡片轉成 PNG 顯示，提供下載。
export async function openShareModal(record, onClose) {
  const overlay = document.getElementById("share-modal");
  overlay.classList.remove("hidden");
  overlay.innerHTML = `
    <div class="modal">
      <button class="modal-close" id="share-close" type="button">×</button>
      <p class="section-title">分享結果</p>
      <div id="share-preview-box">
        <p style="color:var(--muted);font-size:14px;">產生圖片中…</p>
      </div>
      <button id="share-download" class="btn btn-primary hidden">下載 PNG</button>
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
  node.className = "result-card";
  node.style.width = "360px";
  node.innerHTML = resultCardHTML(record);
  node.style.position = "fixed";
  node.style.left = "-9999px";
  node.style.top = "0";
  document.body.appendChild(node);

  const previewBox = overlay.querySelector("#share-preview-box");
  const downloadBtn = overlay.querySelector("#share-download");

  try {
    if (!window.htmlToImage) throw new Error("html-to-image 未載入");
    const dataUrl = await window.htmlToImage.toPng(node, {
      pixelRatio: 2,
      backgroundColor: "#ffffff",
    });
    previewBox.innerHTML = `<img class="share-preview" src="${dataUrl}" alt="分享結果" />`;
    downloadBtn.classList.remove("hidden");
    downloadBtn.addEventListener("click", () => {
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "聖誕知識王-成績.png";
      a.click();
    });
  } catch (err) {
    console.warn(err);
    previewBox.innerHTML = `<p style="color:var(--wrong);font-size:14px;">圖片產生失敗，請確認網路後重試。</p>`;
  } finally {
    document.body.removeChild(node);
  }
}
