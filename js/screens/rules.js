// 活動辦法頁

import { renderHeaderNav, bindHeaderNav } from "../header.js";

// 視差捲動：蘋果、蟲蟲用 fixed 定位釘在畫面上，但跟著捲動以較慢的速度位移，
// 而不是完全靜止（避免跟卡片內容的捲動速度差太多、看起來像另一個頁面）。
const PARALLAX_SPEED = 0.3; // 裝飾移動速度＝內容的 30%
// 捲動漸現：活動期間、遊玩辦法卡片一開始不顯示，捲動到才淡入浮現
// （參考 https://etoha-lab.co.jp/ 的捲動效果）
function bindScrollReveal(el) {
  const targets = el.querySelectorAll(".rules-reveal");
  if (!targets.length) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
  );
  targets.forEach((t) => observer.observe(t));
}

let parallaxBound = false;
function bindParallax() {
  if (parallaxBound) return;
  parallaxBound = true;
  window.addEventListener(
    "scroll",
    () => {
      const apple = document.querySelector(".rules-deco--apple");
      const worm = document.querySelector(".rules-deco--worm");
      if (!apple && !worm) return;
      const offset = -window.scrollY * PARALLAX_SPEED;
      if (apple) apple.style.transform = `translateY(${offset}px)`;
      if (worm) worm.style.transform = `translateY(${offset}px)`;
    },
    { passive: true }
  );
}

export function renderRules(nav) {
  const el = document.getElementById("screen-rules");

  el.innerHTML = `
    ${renderHeaderNav({ logo: true })}

    <div class="redeem-page">
      <div class="rules-content">
        <div class="rules-deco rules-deco--apple"><img src="assets/activity-method/e-apple.svg" alt="" /></div>
        <div class="rules-deco rules-deco--worm"><img src="assets/activity-method/e-worm.svg" alt="" /></div>

        <img class="rules-img" src="assets/activity-method/main_title.png" alt="好誕哩就來，聖你最會，還是剩你不會" />

        <div class="rules-card2 rules-card2--content rules-reveal">
          <div class="rules-card2-body">
            <p>
              叮叮噹～叮叮噹～<br />
              今年聖誕節<br />
              喵皇準備很多冷知識挑戰<br />
              不管你是博學多聞的「知識貓王」<br />
              還是全靠直覺的「知識蘋困貓」<br />
              來解鎖你的專屬知識貓<br />
              今年聖誕<br />
              你能超越我的貓貓嗎？
            </p>
          </div>
        </div>

        <div class="rules-card2 rules-card2--event rules-reveal">
          <span class="rules-card2-badge">活動期間</span>
          <div class="rules-card2-body">
            <p><span class="rules-card2-subhead">活動時間</span><br /><strong>2026.11.29 ~ 2027.01.02</strong></p>
            <p><span class="rules-card2-subhead">序號兌換時間</span><br /><strong>2026.11.29 ~ 2027.01.31</strong></p>
          </div>
        </div>

        <div class="rules-card2 rules-card2--rules rules-reveal">
          <span class="rules-card2-badge">遊玩辦法</span>
          <div class="rules-card2-body">
            <p><span class="rules-card2-subhead">Letstalk用戶</span><br />答題後貼圖將會立即派送給用戶<br />用戶可以於任一聊天室中查看</p>
            <p><span class="rules-card2-subhead">訪客</span><br />答題後將獲得一組「兌換序號」，下載 Letstalk App 後，至「貼圖商店」輸入序號完成兌換</p>
            <p><span class="rules-card2-subhead">使用 桌機 挑戰的用戶</span><br />請使用行動裝置安裝並註冊 Letstalk 帳號後，進行兌換</p>
          </div>
        </div>
      </div>
    </div>

    <div class="rules-footer">
      <div class="rules-footer-art"></div>
      <div class="rules-footer-fill">
        <div class="rules-terms">
          <p>注意事項：</p>
          <p>1. 每個 Letstalk 帳號限領取一次獎勵。</p>
          <p>2. 訪客獲得之「兌換序號」請於 2027 年 01 月 31 日前至 Letstalk App 內完成兌換，逾期視同放棄，恕不補發。</p>
          <p>3. 活動結果及獎勵發放以 App 內系統顯示為準，恕不另行通知。</p>
          <p>4. 本活動由 Letstalk 主辦，活動內容、獎項及規則如有異動，將以官方公告為準。Letstalk 保留隨時修改、變更、終止本活動及最終解釋權。</p>
        </div>
      </div>
    </div>
  `;

  bindHeaderNav(el, nav);
  bindParallax();
  bindScrollReveal(el);
}
