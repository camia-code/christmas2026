// 活動辦法頁

import { renderHeaderNav, bindHeaderNav } from "../header.js";
import { t } from "../i18n.js";
import { getLang } from "../lang.js";

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

// 標題圖（含「好誕哩就來」標題字）依語系取 main_title.png（繁中）/ main_title_sch.png / main_title_en.png。
// 簡中、英文的標題圖還沒有時，圖片載入失敗會自動換成文字版標題（見 css .rules-title-text）。
function renderTitle() {
  const lang = getLang();
  const src =
    lang === "tch"
      ? "assets/activity-method/main_title.png"
      : `assets/activity-method/main_title_${lang}.png`;
  return `<img class="rules-img" src="${src}" alt="${t("rules.titleAlt")}" data-title-img />`;
}

function titleFallbackHTML() {
  return `
    <div class="rules-img rules-title-text" role="img" aria-label="${t("rules.titleAlt")}">
      <div class="rules-title-main">${t("rules.titleMain")}</div>
      <div class="rules-title-sub">${t("rules.titleSub")}</div>
    </div>`;
}

export function renderRules(nav) {
  const el = document.getElementById("screen-rules");

  el.innerHTML = `
    ${renderHeaderNav({ logo: true })}

    <div class="redeem-page">
      <div class="rules-content">
        <div class="rules-deco rules-deco--apple"><img src="assets/activity-method/e-apple.svg" alt="" /></div>
        <div class="rules-deco rules-deco--worm"><img src="assets/activity-method/e-worm.svg" alt="" /></div>

        ${renderTitle()}

        <div class="rules-card2 rules-card2--content rules-reveal">
          <div class="rules-card2-body">
            <p>
              ${t("rules.intro")}
            </p>
          </div>
        </div>

        <div class="rules-card2 rules-card2--event rules-reveal">
          <span class="rules-card2-badge">${t("rules.badgeEvent")}</span>
          <div class="rules-card2-body">
            <p><span class="rules-card2-subhead">${t("rules.eventTime")}</span><br /><strong>2026.11.29 ~ 2027.01.02</strong></p>
            <p><span class="rules-card2-subhead">${t("rules.redeemTime")}</span><br /><strong>2026.11.29 ~ 2027.01.31</strong></p>
          </div>
        </div>

        <div class="rules-card2 rules-card2--rules rules-reveal">
          <span class="rules-card2-badge">${t("rules.badgePlay")}</span>
          <div class="rules-card2-body">
            <p><span class="rules-card2-subhead">${t("rules.appUser")}</span><br />${t("rules.appUserDesc")}</p>
            <p><span class="rules-card2-subhead">${t("rules.guest")}</span><br />${t("rules.guestDesc")}</p>
            <p><span class="rules-card2-subhead">${t("rules.desktop")}</span><br />${t("rules.desktopDesc")}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="rules-footer">
      <div class="rules-footer-art"></div>
      <div class="rules-footer-fill">
        <div class="rules-terms">
          <p>${t("rules.notesTitle")}</p>
          <p>${t("rules.note1")}</p>
          <p>${t("rules.note2")}</p>
          <p>${t("rules.note3")}</p>
          <p>${t("rules.note4")}</p>
        </div>
      </div>
    </div>
  `;

  // 這個語系的標題圖不存在 → 換成文字版標題
  const titleImg = el.querySelector("[data-title-img]");
  if (titleImg) {
    titleImg.addEventListener("error", () => {
      titleImg.outerHTML = titleFallbackHTML();
    });
  }

  bindHeaderNav(el, nav);
  bindParallax();
  bindScrollReveal(el);
}
