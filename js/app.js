/* ==========================================================================
   KooraHD Pro v2 - Main Frontend & Admin Dashboard Controller
   ========================================================================== */

const STORAGE_KEY = "koora4k_data_v1";
const FAV_STORAGE_KEY = "koora4k_favs_v1";
const BELL_STORAGE_KEY = "koora4k_bells_v1";

let appData = null;
let favoriteMatchIds = new Set();
let bellReminderIds = new Set();
let lastSyncTimestamp = Date.now();

let currentFilter = {
  day: "today",
  status: "all",
  league: "all",
  search: ""
};
let currentTimezoneOffset = -(new Date().getTimezoneOffset() / 60); // يضبط تلقائياً حسب جهاز وموقع الزائر فور الدخول
let visitorGeoState = {
  countryCode: "MA",
  countryAr: "المغرب",
  flag: "🇲🇦",
  cityAr: "",
  isp: "",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Africa/Casablanca",
  detectedOffset: -(new Date().getTimezoneOffset() / 60),
  isAutoMode: true
};
let activeStandingLeague = null;
let hlsInstance = null;
let activePlayContext = null; // { type: 'match'|'channel'|'highlight', item, serverIndex }

// ==================== INITIALIZATION ====================
document.addEventListener("DOMContentLoaded", async () => {
  loadUserPreferences();
  initTimezoneAndClock();
  detectVisitorLocationAndTimezone();
  await loadAppData();
  applySiteSettingsToUI();
  populateLeagueFilterDropdown();
  renderAllViews();
  resetMatchForm();
  handleDeepLinksFromUrl();

  // مزامنة تلقائية دورية كل 40 ثانية لتحديث النتائج والمباريات والترتيب والملخصات والأخبار أوتوماتيكياً بدون توقف
  setInterval(() => {
    silentBackgroundSync();
  }, 40000);

  // فحص تلقائي كل 15 ثانية لتحويل حالة المباريات التي حان وقتها إلى "جارية الآن" وحساب الدقيقة الحية والعداد التنازلي
  setInterval(() => {
    autoUpdateMatchStatesByClock();
    updateRadarSyncCounter();
  }, 15000);
});

function loadUserPreferences() {
  try {
    const f = JSON.parse(localStorage.getItem(FAV_STORAGE_KEY) || "[]");
    const b = JSON.parse(localStorage.getItem(BELL_STORAGE_KEY) || "[]");
    favoriteMatchIds = new Set(f);
    bellReminderIds = new Set(b);
  } catch (_) {}
}

function saveUserPreferences() {
  try {
    localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify([...favoriteMatchIds]));
    localStorage.setItem(BELL_STORAGE_KEY, JSON.stringify([...bellReminderIds]));
  } catch (_) {}
  updateFavCountPill();
}

function updateFavCountPill() {
  const el = document.getElementById("favCountPill");
  if (el) el.textContent = `(${favoriteMatchIds.size})`;
}

function updateRadarSyncCounter() {
  const badge = document.getElementById("lastSyncTimeBadge");
  if (!badge) return;
  const sec = Math.max(1, Math.floor((Date.now() - lastSyncTimestamp) / 1000));
  const label = sec < 60 ? `منذ ${sec} ثانية` : `منذ ${Math.floor(sec / 60)} دقيقة`;
  const totalMatches = (appData?.matches || []).length;
  badge.innerHTML = `<i class="fa-solid fa-clock-rotate-left"></i> آخر تحديث تلقائي: ${label} • (${totalMatches} مباراة نشطة)`;
}

async function loadAppData() {
  appData = JSON.parse(JSON.stringify(window.DEFAULT_KOORA_DATA));

  // استرجاع التعديلات اليدوية للمدير فقط (الإعدادات والمباريات اليدوية) دون تجميد البيانات اليومية
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.settings) {
        appData.settings = parsed.settings;
      }
    } catch (_) {}
  }

  // سحب أحدث جدول مباريات ونتائج وسيرفرات وترتيب وملخصات لهذا اليوم تلقائياً
  await syncLiveMatchesFromKooraHD(false);
  autoUpdateMatchStatesByClock();
}

// تحديث تلقائي لحالة المباريات والدقيقة الجارية حسب الساعة الحالية بدون أي تدخل يدوي
function autoUpdateMatchStatesByClock() {
  if (!appData || !appData.matches) return;
  const now = new Date();
  const nowUtcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  let changed = false;

  appData.matches.forEach((m) => {
    if (m.day !== "today" || !m.timeGMT || !m.timeGMT.includes(":")) return;
    const [hh, mm] = m.timeGMT.split(":").map((n) => parseInt(n, 10));
    if (isNaN(hh) || isNaN(mm)) return;

    const matchStartUtc = hh * 60 + mm;
    const diff = nowUtcMinutes - matchStartUtc;
    const isManualMatch = String(m.id).startsWith("m_");

    // بالنسبة للمباريات اليدوية المضافة من الإدارة، يتم تحويل حالتها تلقائياً عند حلول وقتها
    if (isManualMatch && diff >= 0 && diff <= 115 && m.status !== "finished") {
      if (m.status !== "live") {
        m.status = "live";
        changed = true;
      }
    }

    // حساب الدقيقة الحية للمباريات الجارية حالياً
    if (m.status === "live" && diff >= 0 && diff <= 125) {
      if (diff <= 45) {
        m.minute = `جارية الآن (${Math.max(1, diff)}')`;
      } else if (diff > 45 && diff <= 60) {
        m.minute = "استراحة الشوطين";
      } else {
        const secondHalfMin = Math.min(90, 45 + (diff - 60));
        m.minute = `جارية الآن (${secondHalfMin}')`;
      }
      changed = true;
    } else if (isManualMatch && diff > 125 && m.status === "live") {
      m.status = "finished";
      m.minute = "انتهت";
      changed = true;
    }
  });

  if (changed) {
    renderFeaturedHero();
    renderMatchesSchedule();
    updateLiveCountBadge();
  }
}

async function syncLiveMatchesFromKooraHD(forceRefresh = false) {
  const syncIcon = document.getElementById("syncIcon");
  const syncText = document.getElementById("syncStatusText");
  if (syncIcon) syncIcon.classList.add("fa-spin-fast");
  if (syncText) syncText.textContent = "جاري التحديث التلقائي...";

  try {
    const url = forceRefresh ? "/api/live-sync?force=1" : "/api/live-sync";
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const syncData = await res.json();
      if (syncData && syncData.matches && syncData.matches.length > 0) {
        const manualMatches = (appData.matches || []).filter((m) => String(m.id).startsWith("m_"));
        appData.matches = [...manualMatches, ...syncData.matches];

        if (syncData.highlights && syncData.highlights.length > 0) {
          const manualHl = (appData.highlights || []).filter(
            (h) => String(h.id).startsWith("hl_") && !String(h.id).startsWith("hl_khd_") && !String(h.id).startsWith("hl_sb_")
          );
          appData.highlights = [...manualHl, ...syncData.highlights];
        }

        if (syncData.standings && Object.keys(syncData.standings).length > 0) {
          appData.standings = {
            ...syncData.standings,
            "البطولة المغربية الاحترافية": appData.standings["البطولة المغربية الاحترافية"] || window.DEFAULT_KOORA_DATA.standings["البطولة المغربية الاحترافية"]
          };
        }

        if (syncData.news && syncData.news.length > 0) {
          appData.news = syncData.news;
        }

        if (syncData.liveM3u8Stream && appData.channels && appData.channels[0]) {
          const m3u8Srv = appData.channels[0].servers?.find((s) => s.type === "m3u8");
          if (m3u8Srv) m3u8Srv.url = syncData.liveM3u8Stream;
        }

        lastSyncTimestamp = Date.now();
        updateRadarSyncCounter();
        updateAutoNewsTicker();

        if (syncIcon) syncIcon.classList.remove("fa-spin-fast");
        if (syncText) syncText.textContent = `متصل تلقائياً 24/7 (${syncData.matches.length} مباراة)`;
        return true;
      }
    }
  } catch (_) {
    try {
      await browserDirectKooraSync();
      lastSyncTimestamp = Date.now();
      updateRadarSyncCounter();
      updateAutoNewsTicker();
      if (syncIcon) syncIcon.classList.remove("fa-spin-fast");
      if (syncText) syncText.textContent = `متصل تلقائياً 24/7 (${appData.matches.length} مباراة)`;
      return true;
    } catch (e2) {
      console.warn("Direct sync fallback failed", e2);
    }
  }

  if (syncIcon) syncIcon.classList.remove("fa-spin-fast");
  if (syncText) syncText.textContent = "متصل تلقائياً 24/7";
  return false;
}

function updateAutoNewsTicker() {
  const ticker = document.getElementById("announcementText");
  if (!ticker || !appData || !appData.matches) return;
  const liveList = appData.matches.filter((m) => m.status === "live");
  const todayList = appData.matches.filter((m) => m.day === "today").slice(0, 5);
  if (liveList.length > 0) {
    const items = liveList.map((m) => `🔴 مباشر الآن: ${m.homeTeam} (${m.homeScore}-${m.awayScore}) ${m.awayTeam} [${m.league}]`);
    ticker.textContent = items.join("   •   ") + "   •   ⚡ شاهد البث المباشر بجودة 4K بدون تقطيع على كورة فور كي Koora4K.com";
  } else if (todayList.length > 0) {
    const items = todayList.map((m) => `⚽ قمة اليوم: ${m.homeTeam} ضد ${m.awayTeam} (${formatMatchTime(m.timeGMT)})`);
    ticker.textContent = items.join("   •   ") + "   •   🔥 تغطية حية على مدار الساعة عبر كورة فور كي Koora4K.com";
  }
}

// مزامنة مباشرة من المتصفح في حال فتح index.html مباشرة بدون Node.js
async function browserDirectKooraSync() {
  const proxy = "https://a.ahmed3311154.workers.dev/?url=";
  const [todayHtml, yestHtml, tomHtml] = await Promise.all([
    fetch(proxy + encodeURIComponent("https://koorahd.net/matches-today/")).then((r) => r.text()),
    fetch(proxy + encodeURIComponent("https://koorahd.net/matches-yesterday/")).then((r) => r.text()),
    fetch(proxy + encodeURIComponent("https://koorahd.net/matches-tomorrow/")).then((r) => r.text())
  ]);

  const parseHtml = (html, dayKey, dateLabel) => {
    const list = [];
    const regex = /<div class=['"]match-container([^'"]*)['"]>([\s\S]*?)<\/a><\/div>/gi;
    let m;
    let idx = 0;
    while ((m = regex.exec(html)) !== null) {
      idx++;
      const classes = m[1] || "";
      const block = m[2] + "</a>";
      const rightImg = block.match(/<div class=['"]right-team[\s\S]*?<img[^>]*>/i);
      const leftImg = block.match(/<div class=['"]left-team[\s\S]*?<img[^>]*>/i);
      const teamNames = [...block.matchAll(/<div class=['"]team-name['"]>([\s\S]*?)<\/div>/gi)].map((x) =>
        x[1].replace(/<[^>]+>/g, "").trim()
      );
      if (teamNames.length < 2) continue;

      const getLogo = (img) => {
        if (!img) return "";
        const ds = img[0].match(/data-src=['"]([^'"]+)['"]/i);
        if (ds && !ds[1].startsWith("data:image")) return ds[1];
        const s = img[0].match(/src=['"]([^'"]+)['"]/i);
        if (s && !s[1].startsWith("data:image")) return s[1];
        return "";
      };

      const homeTeam = teamNames[0];
      const awayTeam = teamNames[1];
      const rawTime = (block.match(/<div class=['"]match-time['"]>([\s\S]*?)<\/div>/i) || [])[1] || "8:00 PM";
      const rawResult = (block.match(/<div class=['"]result['"]>([\s\S]*?)<\/div>/i) || [])[1] || "0-0";
      const statText = (block.match(/<div class=['"]date[^'"]*['"]>([\s\S]*?)<\/div>/i) || [])[1] || "";
      const infoItems = [...block.matchAll(/<li><span>([\s\S]*?)<\/span><\/li>/gi)].map((x) => x[1].trim());
      const href = (block.match(/<a[^>]+href=["']([^"']+)["']/i) || [])[1] || "";

      let status = dayKey === "yesterday" ? "finished" : dayKey === "tomorrow" ? "upcoming" : "upcoming";
      if (dayKey === "today") {
        if (classes.includes("live") || statText.includes("جارية")) status = "live";
        else if (classes.includes("end") || statText.includes("انتهت")) status = "finished";
      }

      const [as, hs] = rawResult.split("-").map((n) => parseInt(n.trim(), 10) || 0);
      const channel = infoItems[0] && infoItems[0] !== "غير معروف" ? infoItems[0] : "beIN Sports HD 1";

      list.push({
        id: `khd_${dayKey}_${idx}`,
        day: dayKey,
        dateLabel,
        league: (infoItems[2] || "مباريات اليوم").replace(/^أوروبا,\s*|^السعودية,\s*/i, ""),
        leagueLogo: "🏆",
        status,
        minute: status === "live" ? "جارية الآن 🔴" : status === "finished" ? "انتهت" : "لم تبدأ",
        timeGMT: "19:00",
        homeTeam,
        homeLogo: getLogo(rightImg),
        homeScore: hs,
        awayTeam,
        awayLogo: getLogo(leftImg),
        awayScore: as,
        channel,
        commentator: infoItems[1] && infoItems[1] !== "غير معروف" ? infoItems[1] : "تعليق عربي",
        stadium: "بث مباشر KooraHD",
        featured: status === "live" && idx <= 2,
        servers: [
          {
            name: "سيرفر 1 الرئيسي (KooraHD 4K)",
            quality: "4K / FHD",
            type: "iframe",
            url: href.includes("korahlive.online")
              ? href
              : `https://t.korahlive.online/2026/09/ch1.html?match=${encodeURIComponent(homeTeam)}`
          },
          {
            name: "سيرفر 2 مباشر (AlbaPlayer FHD)",
            quality: "1080p",
            type: "iframe",
            url: "https://pl.matchlivehd.com/albaplayer/1bein1/?serv=1"
          },
          {
            name: "سيرفر 3 مباشر بدون إعلانات (HLS)",
            quality: "1080p",
            type: "m3u8",
            url: "https://lbgo.bozztv.com/ssh101/ssh101/yusfdara137152/chunks.m3u8"
          },
          {
            name: "سيرفر 4 (YallaShoot HD)",
            quality: "720p",
            type: "iframe",
            url: "https://v6.yshoot-live.com/ch/ch1.php"
          }
        ]
      });
    }
    return list;
  };

  const merged = [
    ...parseHtml(todayHtml, "today", "مباريات اليوم"),
    ...parseHtml(yestHtml, "yesterday", "مباريات الأمس"),
    ...parseHtml(tomHtml, "tomorrow", "مباريات الغد")
  ];

  if (merged.length > 0) {
    appData.matches = merged;
  }

  // جلب ملخصات ScoreBat مباشرة من المتصفح في حال عدم وجود سيرفر محلي
  try {
    const sbRes = await fetch("https://www.scorebat.com/video-api/v3/");
    const sbData = await sbRes.json();
    const sbHighlights = [];
    (sbData.response || []).slice(0, 16).forEach((item, idx) => {
      const servers = [];
      (item.videos || []).forEach((v, vIdx) => {
        const srcMatch = (v.embed || "").match(/src=['"]([^'"]+)['"]/i);
        if (srcMatch && srcMatch[1]) {
          servers.push({
            name: vIdx === 0 ? "🎬 ملخص المباراة الكامل (HD)" : `⚽ فيديو الهدف (${vIdx})`,
            quality: "1080p",
            type: "iframe",
            url: srcMatch[1]
          });
        }
      });
      if (servers.length > 0) {
        sbHighlights.push({
          id: `hl_sb_direct_${idx}`,
          title: `ملخص وأهداف: ${item.title}`,
          league: item.competition || "البطولات الأوروبية",
          duration: `${servers.length} فيديو أهداف`,
          views: "أهداف رسمية HD",
          date: "حديثاً",
          score: "ملخص وأهداف",
          thumbnail: item.thumbnail,
          videoUrl: servers[0].url,
          videoType: "iframe",
          servers
        });
      }
    });
    if (sbHighlights.length > 0) {
      appData.highlights = sbHighlights;
    }
  } catch (_) {}
}

async function triggerLiveSyncNow() {
  const ok = await syncLiveMatchesFromKooraHD(true);
  populateLeagueFilterDropdown();
  renderAllViews();
  if (ok) {
    showToast("⚡ تم تحديث جدول المباريات والنتائج وسيرفرات البث الحية تلقائياً!");
  } else {
    showToast("ℹ️ تم عرض أحدث جدول متوفر");
  }
}

async function silentBackgroundSync() {
  const ok = await syncLiveMatchesFromKooraHD(false);
  if (ok) {
    populateLeagueFilterDropdown();
    renderAllViews();
  }
}

async function saveAppData(showNotice = true) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));

  // Also persist to backend server if running
  try {
    await fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appData)
    });
  } catch (_) {
    // Ignore when running without Node backend
  }

  applySiteSettingsToUI();
  populateLeagueFilterDropdown();
  renderAllViews();
  if (showNotice) {
    showToast("✅ تم حفظ التعديلات وتحديث الموقع بنجاح!");
  }
}

function renderAllViews() {
  updateDayTabCounts();
  updateFavCountPill();
  updateRadarSyncCounter();
  renderFeaturedHero();
  renderMatchesSchedule();
  renderChannels();
  renderStandings();
  renderHighlights();
  renderNews();
  renderAdminLists();
  updateLiveCountBadge();
  updateDynamicSeoSchema();
}

// توليد Schema.org من نوع SportsEvent + BroadcastEvent تلقائياً لمباريات اليوم لتصدر نتائج بحث Google
function updateDynamicSeoSchema() {
  const schemaEl = document.getElementById("dynamicMatchesSchema");
  if (!schemaEl || !appData || !appData.matches) return;

  const todayIso = new Date().toISOString().split("T")[0];
  const todayMatches = appData.matches.filter((m) => m.day === "today").slice(0, 20);

  const eventsGraph = todayMatches.map((m) => {
    const startTimeIso = `${todayIso}T${m.timeGMT || "19:00"}:00Z`;
    return {
      "@type": "SportsEvent",
      "name": `مشاهدة مباراة ${m.homeTeam} ضد ${m.awayTeam} بث مباشر`,
      "description": `بث مباشر مباراة ${m.homeTeam} و ${m.awayTeam} اليوم في ${m.league} عبر قناة ${m.channel} بتعليق ${m.commentator} بجودة 4K بدون تقطيع على موقع كورة فور كي Koora4K.`,
      "startDate": startTimeIso,
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/MixedEventAttendanceMode",
      "location": {
        "@type": "Place",
        "name": m.stadium || "ملعب المباراة",
        "address": m.league || "أوروبا"
      },
      "homeTeam": {
        "@type": "SportsTeam",
        "name": m.homeTeam
      },
      "awayTeam": {
        "@type": "SportsTeam",
        "name": m.awayTeam
      },
      " organizer": {
        "@type": "Organization",
        "name": "كورة فور كي - Koora4K",
        "url": "https://koora4k.com"
      },
      "workFeatured": {
        "@type": "BroadcastEvent",
        "name": `بث مباشر مباراة ${m.homeTeam} ضد ${m.awayTeam} - Koora4K`,
        "isLiveBroadcast": m.status === "live",
        "videoFormat": "4K UHD / 1080p FHD",
        "startDate": startTimeIso
      }
    };
  });

  schemaEl.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": eventsGraph
  });
}

function updatePageSeoMeta(title, description, matchId = null) {
  if (title) document.title = title;
  const descMeta = document.querySelector('meta[name="description"]');
  if (descMeta && description) descMeta.setAttribute("content", description);
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle && title) ogTitle.setAttribute("content", title);

  try {
    const url = new URL(window.location.href);
    if (matchId) {
      url.searchParams.set("match", matchId);
    } else {
      url.searchParams.delete("match");
    }
    window.history.replaceState({}, "", url.toString());
  } catch (_) {}
}

function handleDeepLinksFromUrl() {
  try {
    const path = window.location.pathname.toLowerCase();
    if (path === "/privacy-policy") {
      switchSection("privacy");
      return;
    } else if (path === "/about-us") {
      switchSection("about");
      return;
    } else if (path === "/contact-us") {
      switchSection("contact");
      return;
    } else if (path === "/terms") {
      switchSection("terms");
      return;
    } else if (path === "/dmca") {
      switchSection("dmca");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const matchId = params.get("match");
    const q = params.get("q");
    if (q) {
      const searchInput = document.getElementById("matchSearchInput");
      if (searchInput) searchInput.value = q;
      setSearchQuery(q);
    }
    if (matchId) {
      const found = (appData.matches || []).find((m) => m.id === matchId);
      if (found) openMatchPlayer(matchId);
    }
  } catch (_) {}
}

function updateDayTabCounts() {
  const all = appData.matches || [];
  const cYest = all.filter((m) => m.day === "yesterday").length;
  const cToday = all.filter((m) => m.day === "today").length;
  const cTom = all.filter((m) => m.day === "tomorrow").length;
  const cUpc = all.filter((m) => m.day === "upcoming_days").length;

  const elY = document.getElementById("countYesterday");
  const elTd = document.getElementById("countToday");
  const elTm = document.getElementById("countTomorrow");
  const elUp = document.getElementById("countUpcomingDays");
  const elAll = document.getElementById("countAllDays");

  if (elY) elY.textContent = `${cYest} مباريات (النتائج)`;
  if (elTd) elTd.textContent = `${cToday} مباريات اليوم`;
  if (elTm) elTm.textContent = `${cTom} مباريات الغد`;
  if (elUp) elUp.textContent = `${cUpc} مباريات مقبلة`;
  if (elAll) elAll.textContent = `${all.length} مباراة إجمالاً`;
}

// ==================== SITE SETTINGS & TIMEZONE ====================
function applySiteSettingsToUI() {
  const s = appData.settings || {};
  document.getElementById("siteNameAr").textContent = s.siteName || "كورة فور كي";
  document.getElementById("announcementText").textContent = s.announcement || "";
  document.getElementById("footerSiteName").textContent = `${s.siteName || "كورة فور كي"} - ${s.siteBadge || "Koora4K"}`;
  document.getElementById("wmSiteName").textContent = `${s.siteBadge || "Koora4K"}.com`;

  const setSiteName = document.getElementById("setSiteName");
  if (setSiteName) {
    setSiteName.value = s.siteName || "كورة فور كي";
    document.getElementById("setSiteBadge").value = s.siteBadge || "Koora4K";
    document.getElementById("setAnnouncement").value = s.announcement || "";
    document.getElementById("setDefaultTz").value = String(s.defaultTimezoneOffset ?? 1);
    document.getElementById("setAdminPin").value = s.adminPin || "1234";
  }
}

const COUNTRY_AR_MAP = {
  MA: { name: "المغرب", flag: "🇲🇦" },
  DZ: { name: "الجزائر", flag: "🇩🇿" },
  TN: { name: "تونس", flag: "🇹🇳" },
  LY: { name: "ليبيا", flag: "🇱🇾" },
  MR: { name: "موريتانيا", flag: "🇲🇷" },
  EG: { name: "مصر", flag: "🇪🇬" },
  SA: { name: "السعودية", flag: "🇸🇦" },
  AE: { name: "الإمارات", flag: "🇦🇪" },
  QA: { name: "قطر", flag: "🇶🇦" },
  KW: { name: "الكويت", flag: "🇰🇼" },
  BH: { name: "البحرين", flag: "🇧🇭" },
  OM: { name: "سلطنة عمان", flag: "🇴🇲" },
  IQ: { name: "العراق", flag: "🇮🇶" },
  JO: { name: "الأردن", flag: "🇯🇴" },
  PS: { name: "فلسطين", flag: "🇵🇸" },
  LB: { name: "لبنان", flag: "🇱🇧" },
  SY: { name: "سوريا", flag: "🇸🇾" },
  YE: { name: "اليمن", flag: "🇾🇪" },
  SD: { name: "السودان", flag: "🇸🇩" },
  FR: { name: "فرنسا", flag: "🇫🇷" },
  ES: { name: "إسبانيا", flag: "🇪🇸" },
  IT: { name: "إيطاليا", flag: "🇮🇹" },
  DE: { name: "ألمانيا", flag: "🇩🇪" },
  GB: { name: "بريطانيا", flag: "🇬🇧" },
  NL: { name: "هولندا", flag: "🇳🇱" },
  BE: { name: "بلجيكا", flag: "🇧🇪" },
  TR: { name: "تركيا", flag: "🇹🇷" },
  US: { name: "أمريكا", flag: "🇺🇸" },
  CA: { name: "كندا", flag: "🇨🇦" }
};

const CITY_AR_MAP = {
  casablanca: "الدار البيضاء",
  rabat: "الرباط",
  tangier: "طنجة",
  tanger: "طنجة",
  marrakesh: "مراكش",
  marrakech: "مراكش",
  fes: "فاس",
  fez: "فاس",
  agadir: "أكادير",
  meknes: "مكناس",
  oujda: "وجدة",
  kenitra: "القنيطرة",
  tetouan: "تطوان",
  temara: "تمارة",
  safi: "آسفي",
  mohammedia: "المحمدية",
  sale: "سلا",
  nador: "الناظور",
  settat: "سطات",
  algiers: "الجزائر العاصمة",
  oran: "وهران",
  constantine: "قسنطينة",
  tunis: "تونس العاصمة",
  cairo: "القاهرة",
  alexandria: "الإسكندرية",
  giza: "الجيزة",
  riyadh: "الرياض",
  jeddah: "جدة",
  mecca: "مكة المكرمة",
  makkah: "مكة المكرمة",
  medina: "المدينة المنورة",
  dammam: "الدمام",
  dubai: "دبي",
  "abu dhabi": "أبوظبي",
  doha: "الدوحة",
  kuwait: "الكويت",
  baghdad: "بغداد",
  amman: "عمّان",
  beirut: "بيروت",
  paris: "باريس",
  madrid: "مدريد",
  barcelona: "برشلونة",
  london: "لندن",
  berlin: "برلين",
  rome: "روما",
  milan: "ميلانو",
  amsterdam: "أمستردام",
  brussels: "بروكسل",
  istanbul: "إسطنبول",
  "new york": "نيويورك",
  montreal: "مونتريال"
};

function translateCityName(rawCity) {
  if (!rawCity) return "";
  const key = String(rawCity).trim().toLowerCase();
  return CITY_AR_MAP[key] || rawCity;
}

function inferCountryFromIanaTimezone(ianaTz, offsetHours) {
  const tz = String(ianaTz || "").toLowerCase();
  if (tz.includes("casablanca") || tz.includes("el_aiun")) return { code: "MA", city: "الدار البيضاء" };
  if (tz.includes("algiers")) return { code: "DZ", city: "الجزائر" };
  if (tz.includes("tunis")) return { code: "TN", city: "تونس" };
  if (tz.includes("cairo")) return { code: "EG", city: "القاهرة" };
  if (tz.includes("riyadh")) return { code: "SA", city: "الرياض" };
  if (tz.includes("dubai")) return { code: "AE", city: "دبي" };
  if (tz.includes("qatar")) return { code: "QA", city: "الدوحة" };
  if (tz.includes("kuwait")) return { code: "KW", city: "الكويت" };
  if (tz.includes("baghdad")) return { code: "IQ", city: "بغداد" };
  if (tz.includes("amman")) return { code: "JO", city: "عمّان" };
  if (tz.includes("paris")) return { code: "FR", city: "باريس" };
  if (tz.includes("madrid")) return { code: "ES", city: "مدريد" };
  if (tz.includes("london")) return { code: "GB", city: "لندن" };
  if (offsetHours === 1) return { code: "MA", city: "" };
  if (offsetHours === 2) return { code: "EG", city: "" };
  if (offsetHours === 3) return { code: "SA", city: "" };
  if (offsetHours === 4) return { code: "AE", city: "" };
  return { code: "MA", city: "" };
}

function formatGmtOffsetLabel(offset) {
  const sign = offset >= 0 ? `+${offset}` : `${offset}`;
  return `GMT${sign}`;
}

function updateVisitorGeoBadgeUI() {
  const badgeText = document.getElementById("visitorGeoText");
  const badgeEl = document.getElementById("visitorGeoBadge");
  const autoOpt = document.getElementById("tzAutoOption");
  const gmtStr = formatGmtOffsetLabel(visitorGeoState.detectedOffset);
  const locLabel = visitorGeoState.cityAr
    ? `${visitorGeoState.flag} ${visitorGeoState.countryAr} (${visitorGeoState.cityAr})`
    : `${visitorGeoState.flag} ${visitorGeoState.countryAr}`;

  if (badgeText) {
    badgeText.textContent = visitorGeoState.isAutoMode
      ? `📍 موقعك: ${locLabel} • توقيتك (${gmtStr})`
      : `📍 موقعك: ${locLabel} • (توقيت يدوي ${formatGmtOffsetLabel(currentTimezoneOffset)})`;
  }

  if (badgeEl) {
    const ispInfo = visitorGeoState.isp ? ` | الاتصال: ${visitorGeoState.isp}` : "";
    badgeEl.title = `تم التعرف تلقائياً على دولتك وموقعك: ${visitorGeoState.countryAr} ${visitorGeoState.cityAr ? "- " + visitorGeoState.cityAr : ""}${ispInfo} | المنطقة الزمنية: ${visitorGeoState.timezone} (${gmtStr}). اضغط للضبط التلقائي حسب موقعك.`;
  }

  if (autoOpt) {
    autoOpt.textContent = `📍 تلقائي حسب موقعك: ${locLabel} (${gmtStr})`;
  }
}

async function detectVisitorLocationAndTimezone() {
  // 1. التعرف الفوري من النظام والمنطقة الزمنية لمتصفح الزائر (0ms)
  const deviceOffset = -(new Date().getTimezoneOffset() / 60);
  const deviceTz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Africa/Casablanca";
  const inferred = inferCountryFromIanaTimezone(deviceTz, deviceOffset);
  const mappedCountry = COUNTRY_AR_MAP[inferred.code] || { name: "المغرب", flag: "🇲🇦" };

  visitorGeoState.detectedOffset = deviceOffset;
  visitorGeoState.timezone = deviceTz;
  visitorGeoState.countryCode = inferred.code;
  visitorGeoState.countryAr = mappedCountry.name;
  visitorGeoState.flag = mappedCountry.flag;
  visitorGeoState.cityAr = inferred.city;

  if (visitorGeoState.isAutoMode) {
    currentTimezoneOffset = visitorGeoState.detectedOffset;
  }
  updateVisitorGeoBadgeUI();
  updateClockDisplay();

  // 2. التعرف الدقيق عبر عنوان اتصال الزائر (IP / ISP / المدينة / الدولة)
  let geoSuccess = false;
  try {
    const res = await fetch("https://ipwho.is/", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success !== false && data.country_code) {
        const code = String(data.country_code).toUpperCase();
        const cMap = COUNTRY_AR_MAP[code] || { name: data.country || visitorGeoState.countryAr, flag: data.flag?.emoji || "🌍" };
        visitorGeoState.countryCode = code;
        visitorGeoState.countryAr = cMap.name;
        visitorGeoState.flag = cMap.flag;
        visitorGeoState.cityAr = translateCityName(data.city || data.region || inferred.city);
        visitorGeoState.isp = data.connection?.isp || data.connection?.org || "";
        if (data.timezone && data.timezone.id) {
          visitorGeoState.timezone = data.timezone.id;
        }
        if (data.timezone && typeof data.timezone.offset === "number") {
          visitorGeoState.detectedOffset = data.timezone.offset / 3600;
        }
        geoSuccess = true;
      }
    }
  } catch (_) {}

  // 3. احتياطي عبر السيرفر المحلي (/api/visitor-geo)
  if (!geoSuccess) {
    try {
      const res2 = await fetch("/api/visitor-geo", { cache: "no-store" });
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2 && data2.countryCode) {
          const code = String(data2.countryCode).toUpperCase();
          const cMap = COUNTRY_AR_MAP[code] || { name: data2.country || visitorGeoState.countryAr, flag: "🌍" };
          visitorGeoState.countryCode = code;
          visitorGeoState.countryAr = cMap.name;
          visitorGeoState.flag = cMap.flag;
          visitorGeoState.cityAr = translateCityName(data2.city || data2.region || inferred.city);
          visitorGeoState.isp = data2.isp || "";
          if (data2.timezone) visitorGeoState.timezone = data2.timezone;
          if (typeof data2.offsetHours === "number") {
            visitorGeoState.detectedOffset = data2.offsetHours;
          }
        }
      }
    } catch (_) {}
  }

  if (visitorGeoState.isAutoMode) {
    currentTimezoneOffset = visitorGeoState.detectedOffset;
  }

  updateVisitorGeoBadgeUI();
  updateClockDisplay();
  renderFeaturedHero();
  renderMatchesSchedule();
}

function resetToAutoVisitorTimezone() {
  visitorGeoState.isAutoMode = true;
  currentTimezoneOffset = visitorGeoState.detectedOffset;
  const tzSelect = document.getElementById("timezoneSelect");
  if (tzSelect) tzSelect.value = "auto";
  updateVisitorGeoBadgeUI();
  updateClockDisplay();
  renderFeaturedHero();
  renderMatchesSchedule();
  const loc = visitorGeoState.cityAr ? `${visitorGeoState.countryAr} - ${visitorGeoState.cityAr}` : visitorGeoState.countryAr;
  showToast(`📍 تم ضبط مواعيد جميع المباريات تلقائياً حسب موقعك: ${visitorGeoState.flag} ${loc} (${formatGmtOffsetLabel(currentTimezoneOffset)})`);
}

function initTimezoneAndClock() {
  const tzSelect = document.getElementById("timezoneSelect");
  if (tzSelect) {
    tzSelect.value = "auto";
    tzSelect.addEventListener("change", (e) => {
      const val = e.target.value;
      if (val === "auto") {
        visitorGeoState.isAutoMode = true;
        currentTimezoneOffset = visitorGeoState.detectedOffset;
      } else {
        visitorGeoState.isAutoMode = false;
        currentTimezoneOffset = Number(val);
      }
      updateVisitorGeoBadgeUI();
      renderMatchesSchedule();
      renderFeaturedHero();
      updateClockDisplay();
    });
  }

  updateClockDisplay();
  setInterval(updateClockDisplay, 15000);
}

function updateClockDisplay() {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const targetDate = new Date(utcMs + currentTimezoneOffset * 3600000);
  const hh = String(targetDate.getHours()).padStart(2, "0");
  const mm = String(targetDate.getMinutes()).padStart(2, "0");
  const gmtStr = formatGmtOffsetLabel(currentTimezoneOffset);
  const clockEl = document.getElementById("liveClock");
  if (clockEl) {
    clockEl.textContent = `${hh}:${mm} (${gmtStr})`;
  }
}

function formatMatchTime(timeGMT) {
  if (!timeGMT || !timeGMT.includes(":")) return timeGMT || "--:--";
  const [hStr, mStr] = timeGMT.split(":");
  const baseH = parseInt(hStr, 10);
  const baseM = parseInt(mStr, 10) || 0;
  if (isNaN(baseH)) return timeGMT;
  const totalMinutes = ((baseH * 60 + baseM + Math.round(currentTimezoneOffset * 60)) % 1440 + 1440) % 1440;
  const finalH = Math.floor(totalMinutes / 60);
  const finalM = totalMinutes % 60;
  return `${String(finalH).padStart(2, "0")}:${String(finalM).padStart(2, "0")}`;
}

// عرض النتيجة بالترتيب الصحيح من اليمين إلى اليسار (الفريق الأيمن على اليمين والفريق الأيسر على اليسار بدون قلب الأرقام)
function formatScoreHtml(homeScore, awayScore) {
  const h = Number(homeScore ?? 0);
  const a = Number(awayScore ?? 0);
  const hWin = h > a ? "score-win" : "";
  const aWin = a > h ? "score-win" : "";
  return `<span class="rtl-score-flex"><span class="s-num ${hWin}">${h}</span><span class="s-sep">-</span><span class="s-num ${aWin}">${a}</span></span>`;
}

function getTeamLogoUrl(name, customUrl) {
  if (customUrl && customUrl.trim() !== "") return customUrl.trim();
  if (window.CLUB_LOGOS && window.CLUB_LOGOS[name]) return window.CLUB_LOGOS[name];
  if (window.FALLBACK_CLUB_CREST) return window.FALLBACK_CLUB_CREST(name);
  return "";
}

function handleLogoError(imgEl, teamName) {
  imgEl.onerror = null;
  if (window.FALLBACK_CLUB_CREST) {
    imgEl.src = window.FALLBACK_CLUB_CREST(teamName);
  }
}

// ==================== SECTION NAVIGATION ====================
function switchSection(sectionName) {
  if (sectionName !== "player") {
    stopVideoPlayers();
  }

  const sections = {
    player: document.getElementById("playerSection"),
    matches: document.getElementById("matchesSection"),
    channels: document.getElementById("channelsSection"),
    standings: document.getElementById("standingsSection"),
    highlights: document.getElementById("highlightsSection"),
    news: document.getElementById("newsSection"),
    admin: document.getElementById("adminSection"),
    privacy: document.getElementById("privacySection"),
    about: document.getElementById("aboutSection"),
    contact: document.getElementById("contactSection"),
    terms: document.getElementById("termsSection"),
    dmca: document.getElementById("dmcaSection")
  };

  Object.entries(sections).forEach(([key, el]) => {
    if (!el) return;
    if (key === sectionName) {
      el.classList.remove("hidden");
    } else {
      el.classList.add("hidden");
    }
  });

  document.querySelectorAll(".main-nav .nav-link").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.section === sectionName);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function filterLiveMatchesAndGo() {
  switchSection("matches");
  setDayFilter("today");
  setStatusFilter("live");
  document.querySelectorAll(".main-nav .nav-link").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.section === "live-only");
  });
}

function updateLiveCountBadge() {
  const liveCount = (appData.matches || []).filter((m) => m.status === "live").length;
  const badge = document.getElementById("liveCountBadge");
  if (badge) badge.textContent = liveCount;
}

// ==================== FEATURED HERO MATCH ====================
function renderFeaturedHero() {
  const container = document.getElementById("featuredHeroContainer");
  if (!container) return;

  const todayPool = (appData.matches || []).filter((m) => m.day === "today");
  const pool = todayPool.length > 0 ? todayPool : appData.matches || [];
  const rankedPool = [...pool].sort((a, b) => {
    const aLive = a.status === "live" ? 1 : 0;
    const bLive = b.status === "live" ? 1 : 0;
    if (aLive !== bLive) return bLive - aLive;
    const pDiff = getLeaguePriority(a.league) - getLeaguePriority(b.league);
    if (pDiff !== 0) return pDiff;
    const aUp = a.status === "upcoming" ? 1 : 0;
    const bUp = b.status === "upcoming" ? 1 : 0;
    return bUp - aUp;
  });

  const featuredMatch = rankedPool[0];

  if (!featuredMatch) {
    container.innerHTML = "";
    return;
  }

  const isLive = featuredMatch.status === "live";
  const centerDisplay =
    featuredMatch.status === "upcoming"
      ? formatMatchTime(featuredMatch.timeGMT)
      : formatScoreHtml(featuredMatch.homeScore, featuredMatch.awayScore);

  const tzCountryLabel = visitorGeoState.isAutoMode
    ? `بتوقيت ${visitorGeoState.flag} ${visitorGeoState.countryAr}`
    : formatGmtOffsetLabel(currentTimezoneOffset);

  const statusText = isLive
    ? `🔴 مباشر الآن (${featuredMatch.minute || "جارية"})`
    : featuredMatch.status === "finished"
    ? "انتهت المباراة"
    : `${formatMatchTime(featuredMatch.timeGMT)} (${tzCountryLabel})`;

  const safeHome = featuredMatch.homeTeam.replace(/'/g, "");
  const safeAway = featuredMatch.awayTeam.replace(/'/g, "");

  container.innerHTML = `
    <div class="hero-match-card">
      <div class="hero-info-side">
        <div class="hero-badges">
          <span class="badge-featured"><i class="fa-solid fa-star"></i> قمة اليوم</span>
          <span class="badge-league">${featuredMatch.leagueLogo || "🏆"} ${featuredMatch.league}</span>
        </div>
        <h2 class="hero-title">مشاهدة مباراة ${featuredMatch.homeTeam} ضد ${featuredMatch.awayTeam} بث مباشر</h2>
        <div class="hero-meta">
          <span><i class="fa-solid fa-tv"></i> ${featuredMatch.channel}</span>
          <span><i class="fa-solid fa-microphone-lines"></i> ${featuredMatch.commentator}</span>
          <span><i class="fa-solid fa-location-dot"></i> ${featuredMatch.stadium || "ملعب المباراة"}</span>
        </div>
      </div>

      <div class="hero-teams-center">
        <div class="hero-team">
          <img src="${getTeamLogoUrl(featuredMatch.homeTeam, featuredMatch.homeLogo)}" alt="${featuredMatch.homeTeam}" onerror="handleLogoError(this, '${safeHome}')" />
          <span>${featuredMatch.homeTeam}</span>
        </div>
        <div class="hero-score-box">
          <div class="hero-score-numbers">${centerDisplay}</div>
          <span class="match-status-badge ${featuredMatch.status}">${statusText}</span>
        </div>
        <div class="hero-team">
          <img src="${getTeamLogoUrl(featuredMatch.awayTeam, featuredMatch.awayLogo)}" alt="${featuredMatch.awayTeam}" onerror="handleLogoError(this, '${safeAway}')" />
          <span>${featuredMatch.awayTeam}</span>
        </div>
      </div>

      <div>
        <button class="btn-watch-hero" onclick="openMatchPlayer('${featuredMatch.id}')">
          <i class="fa-solid fa-circle-play"></i>
          <span>شاهد البث المباشر الآن</span>
        </button>
      </div>
    </div>
  `;
}

// ==================== MATCHES SCHEDULE & FILTERS ====================
function getLeaguePriority(leagueName) {
  const lg = String(leagueName || "");
  // وضع بطولات الناشئين والشباب في أسفل الترتيب دائماً
  if (lg.includes("تحت 17") || lg.includes("تحت 20") || lg.includes("تحت 23") || lg.includes("الشباب") || lg.includes("الرديف")) {
    return 90;
  }
  if (lg.includes("أبطال أوروبا")) return 1;
  if (lg.includes("الدوري الأوروبي")) return 2;
  if (lg.includes("المؤتمر الأوروبي")) return 3;
  if (lg.includes("الإنجليزي") || lg.includes("كأس الاتحاد الإنجليزي") || lg.includes("الرابطة الإنجليزية")) return 4;
  if (lg.includes("الإسباني") || lg.includes("ملك إسبانيا")) return 5;
  if (lg.includes("المغربي") || lg.includes("العرش") || lg.includes("أبطال أفريقيا") || lg.includes("الكونفدرالية")) return 6;
  if (lg.includes("السعودي") || lg.includes("روشن") || lg.includes("خادم الحرمين") || lg.includes("أبطال آسيا")) return 7;
  if (lg.includes("الإيطالي") || lg.includes("إيطاليا")) return 8;
  if (lg.includes("الألماني") || lg.includes("ألمانيا")) return 9;
  if (lg.includes("الفرنسي") || lg.includes("فرنسا")) return 10;
  if (lg.includes("المصري") || lg.includes("القطري") || lg.includes("الإماراتي") || lg.includes("الجزائري") || lg.includes("التونسي")) return 11;
  if (lg.includes("التركي") || lg.includes("الهولندي") || lg.includes("البرتغالي")) return 12;
  return 25;
}

function getMatchSortMinutes(m) {
  if (!m.timeGMT || !m.timeGMT.includes(":")) return 9999;
  const [h, min] = m.timeGMT.split(":").map((x) => parseInt(x, 10));
  if (isNaN(h) || isNaN(min)) return 9999;
  // المباريات التي تلعب بعد منتصف الليل بتوقيت غرينتش (00:00 - 04:59) تأتي في نهاية السهرة الكروية
  const adjustedH = h < 5 ? h + 24 : h;
  return adjustedH * 60 + min;
}

function populateLeagueFilterDropdown() {
  const select = document.getElementById("leagueFilterSelect");
  if (!select) return;
  const currentVal = select.value;
  const leagues = Array.from(new Set((appData.matches || []).map((m) => m.league))).sort(
    (a, b) => getLeaguePriority(a) - getLeaguePriority(b)
  );

  select.innerHTML =
    `<option value="all">🏆 جميع البطولات والدوريات</option>` +
    leagues.map((lg) => `<option value="${lg}">${lg}</option>`).join("");

  if (leagues.includes(currentVal)) {
    select.value = currentVal;
  }
}

function setDayFilter(day) {
  currentFilter.day = day;
  document.querySelectorAll(".day-tab").forEach((b) => {
    b.classList.toggle("active", b.dataset.day === day);
  });
  renderMatchesSchedule();
}

function setStatusFilter(status) {
  currentFilter.status = status;
  document.querySelectorAll(".status-pill").forEach((b) => {
    b.classList.toggle("active", b.dataset.status === status);
  });
  renderMatchesSchedule();
}

function setLeagueFilter(league) {
  currentFilter.league = league;
  renderMatchesSchedule();
}

function setSearchQuery(q) {
  currentFilter.search = q.trim().toLowerCase();
  renderMatchesSchedule();
}

function getDayLabelArabic(dayKey, customDateLabel) {
  if (customDateLabel) return customDateLabel;
  if (dayKey === "yesterday") return "أمس";
  if (dayKey === "today") return "اليوم";
  if (dayKey === "tomorrow") return "غداً";
  if (dayKey === "upcoming_days") return "الأيام المقبلة";
  return "الجدول";
}

function toggleFavoriteMatch(event, matchId) {
  event.stopPropagation();
  if (favoriteMatchIds.has(matchId)) {
    favoriteMatchIds.delete(matchId);
    showToast("⭐ تمت إزالة المباراة من المفضلة");
  } else {
    favoriteMatchIds.add(matchId);
    showToast("⭐ تمت إضافة المباراة إلى مفضلتك وتثبيتها!");
  }
  saveUserPreferences();
  renderMatchesSchedule();
}

function toggleBellReminder(event, matchId) {
  event.stopPropagation();
  if (bellReminderIds.has(matchId)) {
    bellReminderIds.delete(matchId);
    showToast("🔕 تم إلغاء تنبيه المباراة");
  } else {
    bellReminderIds.add(matchId);
    showToast("🔔 تم تفعيل تنبيه بداية المباراة وأهدافها!");
  }
  saveUserPreferences();
  renderMatchesSchedule();
}

function getMatchProgressOrCountdownHtml(m) {
  if (m.status === "live") {
    const minMatch = String(m.minute || "").match(/(\d+)/);
    const curMin = minMatch ? Math.min(90, parseInt(minMatch[1], 10)) : 55;
    const pct = Math.max(8, Math.min(100, Math.round((curMin / 90) * 100)));
    return `<div class="live-progress-wrap" title="تقدم المباراة: ${curMin}%"><div class="live-progress-bar" style="width:${pct}%"></div></div>`;
  }
  if (m.status === "upcoming" && m.day === "today" && m.timeGMT && m.timeGMT.includes(":")) {
    const now = new Date();
    const nowUtcMin = now.getUTCHours() * 60 + now.getUTCMinutes();
    const [hh, mm] = m.timeGMT.split(":").map((n) => parseInt(n, 10));
    if (!isNaN(hh) && !isNaN(mm)) {
      let diff = hh * 60 + mm - nowUtcMin;
      if (diff > 0 && diff <= 720) {
        const hrs = Math.floor(diff / 60);
        const mins = diff % 60;
        const label = hrs > 0 ? `يبدأ بعد ${hrs}س و ${mins}د` : `يبدأ بعد ${mins} دقيقة`;
        return `<span class="countdown-pill"><i class="fa-solid fa-hourglass-half"></i> ${label}</span>`;
      }
    }
  }
  return "";
}

function renderMatchesSchedule() {
  const container = document.getElementById("matchesListContainer");
  if (!container) return;

  const filtered = (appData.matches || []).filter((m) => {
    if (currentFilter.status === "favorites") {
      return favoriteMatchIds.has(m.id);
    }
    if (currentFilter.day !== "all" && m.day !== currentFilter.day) return false;
    if (currentFilter.status !== "all" && m.status !== currentFilter.status) return false;
    if (currentFilter.league !== "all" && m.league !== currentFilter.league) return false;
    if (currentFilter.search) {
      const hay = `${m.homeTeam} ${m.awayTeam} ${m.league} ${m.channel} ${m.commentator} ${m.dateLabel || ""}`.toLowerCase();
      if (!hay.includes(currentFilter.search)) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="admin-card" style="text-align:center; padding:42px 20px;">
        <i class="fa-regular fa-futbol" style="font-size:2.6rem; color:var(--text-muted); margin-bottom:12px;"></i>
        <h3>لا توجد مباريات مطابقة للفلتر المحدد</h3>
        <p style="color:var(--text-secondary); margin-top:6px;">جرب اختيار تبويب آخر (مباريات اليوم / الغد / الأيام المقبلة) أو عرض الكل.</p>
      </div>
    `;
    return;
  }

  // ترتيب المباريات داخل كل بطولة: المفضلة أولاً -> الجارية الآن -> القادمة حسب التوقيت الزمني -> المنتهية
  const statusRank = { live: 3, upcoming: 2, finished: 1 };
  const sortedFiltered = [...filtered].sort((a, b) => {
    const aFav = favoriteMatchIds.has(a.id) ? 1 : 0;
    const bFav = favoriteMatchIds.has(b.id) ? 1 : 0;
    if (aFav !== bFav) return bFav - aFav;

    const aStat = statusRank[a.status] || 0;
    const bStat = statusRank[b.status] || 0;
    if (aStat !== bStat) return bStat - aStat;

    const aTime = getMatchSortMinutes(a);
    const bTime = getMatchSortMinutes(b);
    if (aTime !== bTime) return aTime - bTime;

    return (a.orderIndex || 0) - (b.orderIndex || 0);
  });

  // تجميع المباريات حسب البطولة
  const grouped = {};
  sortedFiltered.forEach((m) => {
    if (!grouped[m.league]) {
      grouped[m.league] = { logo: m.leagueLogo || "🏆", items: [] };
    }
    grouped[m.league].items.push(m);
  });

  // ترتيب البطولات حسب الأهمية الكبرى (أبطال أوروبا، الدوري الأوروبي، الدوريات الخمسة، البطولات المغربية والعربية أولاً، وبطولات الناشئين في الأسفل)
  const sortedLeagueEntries = Object.entries(grouped).sort(([lgA, grpA], [lgB, grpB]) => {
    const favA = grpA.items.some((m) => favoriteMatchIds.has(m.id)) ? 1 : 0;
    const favB = grpB.items.some((m) => favoriteMatchIds.has(m.id)) ? 1 : 0;
    if (favA !== favB) return favB - favA;
    return getLeaguePriority(lgA) - getLeaguePriority(lgB);
  });

  container.innerHTML = sortedLeagueEntries
    .map(([leagueName, group]) => {
      const cardsHtml = group.items
        .map((m) => {
          const isLive = m.status === "live";
          const isFav = favoriteMatchIds.has(m.id);
          const isBell = bellReminderIds.has(m.id);

          const centerText =
            m.status === "upcoming"
              ? formatMatchTime(m.timeGMT)
              : formatScoreHtml(m.homeScore, m.awayScore);

          const statusBadgeHtml = isLive
            ? `<span class="match-status-badge live"><span class="pulse-red"></span> مباشر ${m.minute || ""}</span>`
            : m.status === "finished"
            ? `<span class="match-status-badge finished">انتهت المباراة</span>`
            : `<span class="match-status-badge upcoming"><i class="fa-regular fa-clock"></i> ${m.minute || "لم تبدأ"}</span>`;

          const extraProgressHtml = getMatchProgressOrCountdownHtml(m);

          const actionLabel = isLive
            ? "شاهد البث المباشر 4K"
            : m.status === "finished"
            ? "ملخص وأهداف اللقاء"
            : "تغطية وبث المباراة";

          const safeHome = m.homeTeam.replace(/'/g, "");
          const safeAway = m.awayTeam.replace(/'/g, "");

          const homeScorersHtml = m.homeScorers
            ? `<span class="team-scorers">⚽ ${m.homeScorers}</span>`
            : "";
          const awayScorersHtml = m.awayScorers
            ? `<span class="team-scorers">⚽ ${m.awayScorers}</span>`
            : "";

          const dateTagHtml = `<span class="match-date-pill"><i class="fa-regular fa-calendar"></i> ${getDayLabelArabic(m.day, m.dateLabel)}</span>`;

          return `
            <div class="match-card ${isLive ? "is-live" : ""} ${isFav ? "is-favorited" : ""}" onclick="openMatchPlayer('${m.id}')">
              <div class="match-quick-tools">
                <button type="button" class="btn-match-tool ${isFav ? "active-fav" : ""}" onclick="toggleFavoriteMatch(event, '${m.id}')" title="إضافة للمفضلة وتثبيت المباراة">
                  <i class="fa-${isFav ? "solid" : "regular"} fa-star"></i>
                </button>
                <button type="button" class="btn-match-tool ${isBell ? "active-bell" : ""}" onclick="toggleBellReminder(event, '${m.id}')" title="تفعيل جرس التنبيه للمباراة">
                  <i class="fa-${isBell ? "solid" : "regular"} fa-bell"></i>
                </button>
              </div>

              <div class="match-main-row">
                <div class="team-side home-side">
                  <div class="team-text-block">
                    <span class="team-name">${m.homeTeam}</span>
                    ${homeScorersHtml}
                  </div>
                  <div class="team-logo-wrap">
                    <img class="team-logo" src="${getTeamLogoUrl(m.homeTeam, m.homeLogo)}" alt="${m.homeTeam}" onerror="handleLogoError(this, '${safeHome}')" />
                  </div>
                </div>

                <div class="match-center-box">
                  <div class="score-or-time">${centerText}</div>
                  ${statusBadgeHtml}
                  ${extraProgressHtml}
                </div>

                <div class="team-side away-side">
                  <div class="team-logo-wrap">
                    <img class="team-logo" src="${getTeamLogoUrl(m.awayTeam, m.awayLogo)}" alt="${m.awayTeam}" onerror="handleLogoError(this, '${safeAway}')" />
                  </div>
                  <div class="team-text-block">
                    <span class="team-name">${m.awayTeam}</span>
                    ${awayScorersHtml}
                  </div>
                </div>
              </div>

              <div class="match-footer-meta">
                <div class="meta-pills">
                  <span class="badge-4k-stream"><i class="fa-solid fa-bolt"></i> 4K UHD</span>
                  ${dateTagHtml}
                  <span class="meta-item"><i class="fa-solid fa-tv"></i> ${m.channel}</span>
                  <span class="meta-item"><i class="fa-solid fa-microphone-lines"></i> ${m.commentator}</span>
                  <span class="meta-item"><i class="fa-solid fa-location-dot"></i> ${m.stadium || "ملعب المباراة"}</span>
                  <span class="meta-item" title="التوقيت مضبوط حسب دولتك وموقعك"><i class="fa-regular fa-clock"></i> ${formatMatchTime(m.timeGMT)} (${visitorGeoState.isAutoMode ? `بتوقيت ${visitorGeoState.flag} ${visitorGeoState.countryAr}` : formatGmtOffsetLabel(currentTimezoneOffset)})</span>
                </div>
                <span class="btn-watch-card">
                  <i class="fa-solid fa-play"></i> ${actionLabel}
                </span>
              </div>
            </div>
          `;
        })
        .join("");

      return `
        <div class="league-group-block">
          <div class="league-group-header">
            <div class="league-group-title">
              <span>${group.logo}</span>
              <span>${leagueName}</span>
            </div>
            <span class="league-count-tag">${group.items.length} مباريات</span>
          </div>
          ${cardsHtml}
        </div>
      `;
    })
    .join("");
}

// ==================== MULTI-SERVER LIVE VIDEO PLAYER ====================
function openMatchPlayer(matchId) {
  const match = (appData.matches || []).find((m) => m.id === matchId);
  if (!match) return;

  activePlayContext = { type: "match", item: match, serverIndex: 0 };
  switchSection("player");

  // تحديث عنوان الصفحة والوصف ديناميكياً لأرشفة جوجل ومشاركة الروابط
  updatePageSeoMeta(
    `مشاهدة مباراة ${match.homeTeam} ضد ${match.awayTeam} بث مباشر 4K | كورة فور كي Koora4K`,
    `شاهد بث مباشر مباراة ${match.homeTeam} و ${match.awayTeam} اليوم في ${match.league} عبر قناة ${match.channel} بتعليق ${match.commentator} بجودة 4K بدون تقطيع على كورة فور كي Koora4K.com.`,
    match.id
  );

  const banner = document.getElementById("playerMatchBanner");
  const isLive = match.status === "live";
  const centerDisplay =
    match.status === "upcoming"
      ? formatMatchTime(match.timeGMT)
      : formatScoreHtml(match.homeScore, match.awayScore);

  const safeHome = match.homeTeam.replace(/'/g, "");
  const safeAway = match.awayTeam.replace(/'/g, "");

  banner.innerHTML = `
    <div class="match-main-row">
      <div class="team-side home-side">
        <div class="team-text-block">
          <span class="team-name">${match.homeTeam}</span>
          ${match.homeScorers ? `<span class="team-scorers">⚽ ${match.homeScorers}</span>` : ""}
        </div>
        <div class="team-logo-wrap">
          <img class="team-logo" src="${getTeamLogoUrl(match.homeTeam, match.homeLogo)}" alt="${match.homeTeam}" onerror="handleLogoError(this, '${safeHome}')" />
        </div>
      </div>
      <div class="match-center-box">
        <div class="score-or-time">${centerDisplay}</div>
        <span class="match-status-badge ${match.status}">
          ${isLive ? `<span class="pulse-red"></span> مباشر الآن (${match.minute})` : match.minute}
        </span>
      </div>
      <div class="team-side away-side">
        <div class="team-logo-wrap">
          <img class="team-logo" src="${getTeamLogoUrl(match.awayTeam, match.awayLogo)}" alt="${match.awayTeam}" onerror="handleLogoError(this, '${safeAway}')" />
        </div>
        <div class="team-text-block">
          <span class="team-name">${match.awayTeam}</span>
          ${match.awayScorers ? `<span class="team-scorers">⚽ ${match.awayScorers}</span>` : ""}
        </div>
      </div>
    </div>
  `;

  const servers =
    match.servers && match.servers.length > 0
      ? match.servers
      : [
          {
            name: "سيرفر البث الرئيسي",
            quality: "1080p",
            type: "m3u8",
            url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
          }
        ];

  renderServerTabs(servers);
  loadStreamServer(servers[0], 0);

  const st = match.stats || {
    homePossession: 53,
    awayPossession: 47,
    homeShots: 11,
    awayShots: 8,
    homeOnTarget: 5,
    awayOnTarget: 3,
    homeCorners: 6,
    awayCorners: 4,
    homeFouls: 9,
    awayFouls: 11
  };

  const renderStatBar = (label, hVal, aVal, suffix = "") => {
    const hn = parseFloat(hVal) || 1;
    const an = parseFloat(aVal) || 1;
    const total = hn + an || 1;
    const hPct = Math.round((hn / total) * 100);
    const aPct = 100 - hPct;
    return `
      <div class="stat-comp-row">
        <div class="stat-comp-labels">
          <span style="color:#34d399;">${hVal}${suffix}</span>
          <span style="color:var(--text-secondary);">${label}</span>
          <span style="color:#60a5fa;">${aVal}${suffix}</span>
        </div>
        <div class="stat-comp-track">
          <div class="stat-bar-home" style="width:${hPct}%"></div>
          <div class="stat-bar-away" style="width:${aPct}%"></div>
        </div>
      </div>
    `;
  };

  const statsHtml = `
    ${renderStatBar("نسبة الاستحواذ", st.homePossession, st.awayPossession, "%")}
    ${renderStatBar("إجمالي التسديدات", st.homeShots, st.awayShots)}
    ${renderStatBar("تسديدات على المرمى", st.homeOnTarget, st.awayOnTarget)}
    ${renderStatBar("الركنيات", st.homeCorners, st.awayCorners)}
    ${renderStatBar("الأخطاء المرتكبة", st.homeFouls, st.awayFouls)}
  `;

  const eventsHtml =
    match.events && match.events.length > 0
      ? match.events
          .map(
            (ev) => `
          <div class="info-list-row">
            <span>⚽ هدف: <strong>${ev.player}</strong> (${ev.team === "home" ? match.homeTeam : match.awayTeam})</span>
            <span style="color:var(--gold); font-weight:800;">${ev.time}</span>
          </div>
        `
          )
          .join("")
      : "";

  document.getElementById("playerDetailsGrid").innerHTML = `
    <div class="detail-box">
      <h3><i class="fa-solid fa-circle-info"></i> بطاقة ومعلومات المباراة</h3>
      <div class="info-list-row"><span>البطولة:</span><strong>${match.league}</strong></div>
      <div class="info-list-row"><span>موعد اللقاء:</span><strong>${getDayLabelArabic(match.day, match.dateLabel)} - ${formatMatchTime(match.timeGMT)}</strong></div>
      <div class="info-list-row"><span>القناة الناقلة:</span><strong>${match.channel}</strong></div>
      <div class="info-list-row"><span>معلق المباراة:</span><strong>${match.commentator}</strong></div>
      <div class="info-list-row"><span>ملعب اللقاء:</span><strong>${match.stadium || "غير محدد"}</strong></div>
      <div class="info-list-row"><span>جودة البث المتوفرة:</span><strong style="color:var(--gold);">4K UHD / 1080p FHD</strong></div>
      ${eventsHtml}
    </div>
    <div class="detail-box">
      <h3><i class="fa-solid fa-chart-simple"></i> إحصائيات اللقاء الحية (${match.homeTeam} vs ${match.awayTeam})</h3>
      ${statsHtml}
    </div>
  `;

  // تفعيل استطلاع التوقعات وشات المشجعين المباشر للقاء
  renderMatchPredictionPoll(match);
  initLiveFanChat(match);
}

function openChannelPlayer(channelId) {
  const ch = (appData.channels || []).find((c) => c.id === channelId);
  if (!ch) return;

  activePlayContext = { type: "channel", item: ch, serverIndex: 0 };
  switchSection("player");

  document.getElementById("playerMatchBanner").innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
      <div style="display:flex; align-items:center; gap:14px;">
        <img src="${getTeamLogoUrl(ch.name, ch.logo)}" style="width:52px; height:52px; border-radius:12px;" />
        <div>
          <h3 style="font-size:1.15rem;">بث مباشر: ${ch.name}</h3>
          <span style="color:var(--text-secondary); font-size:0.85rem;">${ch.currentProgram || "بث مباشر على مدار الساعة 24/7"}</span>
        </div>
      </div>
      <span class="match-status-badge live"><span class="pulse-red"></span> بث حي 24/7 (${ch.badge})</span>
    </div>
  `;

  const servers =
    ch.servers && ch.servers.length > 0
      ? ch.servers
      : [
          {
            name: "سيرفر القناة الرئيسي",
            quality: ch.badge || "1080p",
            type: "m3u8",
            url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
          }
        ];

  renderServerTabs(servers);
  loadStreamServer(servers[0], 0);

  document.getElementById("playerDetailsGrid").innerHTML = `
    <div class="detail-box">
      <h3><i class="fa-solid fa-tv"></i> معلومات القناة</h3>
      <div class="info-list-row"><span>اسم القناة:</span><strong>${ch.name}</strong></div>
      <div class="info-list-row"><span>الباقة:</span><strong>${ch.category}</strong></div>
      <div class="info-list-row"><span>الجودة المتوفرة:</span><strong>${ch.badge}</strong></div>
    </div>
  `;
}

function openHighlightPlayer(hlId) {
  const hl = (appData.highlights || []).find((h) => h.id === hlId);
  if (!hl) return;

  const servers =
    hl.servers && hl.servers.length > 0
      ? hl.servers
      : [
          {
            name: "🎬 سيرفر الملخص والأهداف (Full HD)",
            quality: "1080p",
            type: hl.videoType || "iframe",
            url: hl.videoUrl
          }
        ];

  hl.servers = servers;
  activePlayContext = { type: "highlight", item: hl, serverIndex: 0 };
  switchSection("player");

  document.getElementById("playerMatchBanner").innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
      <div>
        <h3 style="font-size:1.15rem;"><i class="fa-solid fa-film" style="color:var(--accent-green);"></i> ${hl.title}</h3>
        <span style="color:var(--text-secondary); font-size:0.85rem;">🏆 ${hl.league} — ${hl.score}</span>
      </div>
      <span class="match-status-badge finished">${hl.duration || "ملخص وأهداف"}</span>
    </div>
  `;

  renderServerTabs(servers);
  loadStreamServer(servers[0], 0);
  document.getElementById("playerDetailsGrid").innerHTML = "";
}

function renderServerTabs(servers) {
  const container = document.getElementById("serverTabsContainer");
  container.innerHTML = servers
    .map(
      (srv, idx) => `
      <button class="server-tab-btn ${idx === 0 ? "active" : ""}" id="srvBtn_${idx}" onclick="selectStreamServer(${idx})">
        <i class="fa-solid fa-play"></i>
        <span>${srv.name}</span>
        <span class="srv-q">${srv.quality || "HD"}</span>
      </button>
    `
    )
    .join("");
}

function selectStreamServer(index) {
  if (!activePlayContext) return;
  const item = activePlayContext.item;
  const servers = item.servers || [];
  const srv = servers[index];
  if (!srv) return;

  activePlayContext.serverIndex = index;
  document.querySelectorAll(".server-tab-btn").forEach((b, i) => {
    b.classList.toggle("active", i === index);
  });
  loadStreamServer(srv, index);
}

function loadStreamServer(srv) {
  stopVideoPlayers();

  const videoEl = document.getElementById("hlsVideoPlayer");
  const iframeEl = document.getElementById("iframePlayer");
  const qualityBadge = document.getElementById("activeServerQualityBadge");
  if (qualityBadge) qualityBadge.textContent = srv.quality || "FHD 1080p";

  if (srv.type === "iframe") {
    videoEl.classList.add("hidden");
    iframeEl.classList.remove("hidden");

    // إذا كان المشغل رسمي للملخصات (YouTube أو ScoreBat) نرفع القيود ليعمل الفيديو بكامل خصائصه، وإذا كان سيرفر بث خارجي نبقيه محمياً من النوافذ المنبثقة
    if (srv.url.includes("youtube.com") || srv.url.includes("scorebat.com")) {
      iframeEl.removeAttribute("sandbox");
    } else {
      iframeEl.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms");
    }

    iframeEl.src = srv.url;
  } else {
    iframeEl.classList.add("hidden");
    videoEl.classList.remove("hidden");

    if (srv.url.endsWith(".m3u8") && window.Hls && Hls.isSupported()) {
      hlsInstance = new Hls();
      hlsInstance.loadSource(srv.url);
      hlsInstance.attachMedia(videoEl);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        videoEl.play().catch(() => {});
      });
    } else {
      videoEl.src = srv.url;
      videoEl.play().catch(() => {});
    }
  }
}

function stopVideoPlayers() {
  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }
  const videoEl = document.getElementById("hlsVideoPlayer");
  const iframeEl = document.getElementById("iframePlayer");
  if (videoEl) {
    videoEl.pause();
    videoEl.removeAttribute("src");
  }
  if (iframeEl) {
    iframeEl.src = "";
  }
}

function reloadCurrentStream() {
  if (!activePlayContext) return;
  const idx = activePlayContext.serverIndex || 0;
  const servers = activePlayContext.item.servers || [];
  if (servers[idx]) {
    loadStreamServer(servers[idx], idx);
    showToast("🔄 تم تحديث سيرفر البث المباشر");
  }
}

function toggleTheaterMode() {
  const wrapper = document.getElementById("videoStageWrapper");
  wrapper.classList.toggle("theater-mode");
  const stage = document.getElementById("videoStage");
  if (wrapper.classList.contains("theater-mode")) {
    stage.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

async function togglePictureInPicture() {
  const videoEl = document.getElementById("hlsVideoPlayer");
  if (videoEl && !videoEl.classList.contains("hidden") && document.pictureInPictureEnabled) {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoEl.requestPictureInPicture();
        showToast("📺 تم تفعيل الشاشة العائمة (Picture-in-Picture)");
      }
      return;
    } catch (_) {}
  }
  // في حال كان السيرفر الحالي Iframe، نقوم بالتبديل تلقائياً إلى سيرفر HLS المباشر لتفعيل الشاشة العائمة أو تفعيل وضع السينما
  if (activePlayContext && activePlayContext.item && activePlayContext.item.servers) {
    const hlsIdx = activePlayContext.item.servers.findIndex((s) => s.type === "m3u8");
    if (hlsIdx !== -1 && activePlayContext.serverIndex !== hlsIdx) {
      selectStreamServer(hlsIdx);
      setTimeout(async () => {
        try {
          await videoEl.requestPictureInPicture();
          showToast("📺 تم تفعيل الشاشة العائمة (Picture-in-Picture)");
        } catch (_) {
          toggleTheaterMode();
        }
      }, 700);
      return;
    }
  }
  toggleTheaterMode();
}

function toggleLightsOffMode() {
  const overlay = document.getElementById("lightsOffOverlay");
  const stageWrap = document.getElementById("videoStageWrapper");
  const srvWrap = document.querySelector(".servers-bar-wrapper");
  const topNav = document.querySelector(".player-top-nav");
  if (!overlay) return;

  const isOff = overlay.classList.toggle("hidden");
  if (!isOff) {
    stageWrap?.classList.add("lights-off-active");
    srvWrap?.classList.add("lights-off-active");
    topNav?.classList.add("lights-off-active");
    showToast("🌙 تم إطفاء الأنوار للتركيز على البث المباشر");
  } else {
    stageWrap?.classList.remove("lights-off-active");
    srvWrap?.classList.remove("lights-off-active");
    topNav?.classList.remove("lights-off-active");
  }
}

function closePlayerView() {
  stopVideoPlayers();
  const overlay = document.getElementById("lightsOffOverlay");
  if (overlay && !overlay.classList.contains("hidden")) {
    toggleLightsOffMode();
  }
  updatePageSeoMeta(
    "كورة فور كي – Koora4K | مباريات اليوم بث مباشر بدون تقطيع – كورة لايف يلا شوت 4K",
    "كورة فور كي Koora4K مشاهدة مباريات اليوم بث مباشر بدون تقطيع بجودة 4K و FHD على الجوال والكمبيوتر - جدول مباريات اليوم والأمس والغد والقنوات الناقلة عبر كورة لايف ويلا شوت Koora4K.com.",
    null
  );
  switchSection("matches");
}

function shareCurrentMatch() {
  const shareUrl = window.location.href;
  const shareTitle = document.title;
  if (navigator.share) {
    navigator.share({ title: shareTitle, url: shareUrl }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast("🔗 تم نسخ رابط البث المباشر للمشاركة!");
    });
  }
}

// ==================== AUTOMATIC 24/7 FOOTBALL NEWS VIEW ====================
const CLIENT_NEWS_TOPIC_IMAGES = [
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=900&q=80"
];

function handleNewsImgError(imgEl, idx) {
  imgEl.onerror = null;
  imgEl.src = CLIENT_NEWS_TOPIC_IMAGES[(idx || 0) % CLIENT_NEWS_TOPIC_IMAGES.length];
}

function detectTopicClubCrestFromHeadline(title) {
  if (!title || !window.CLUB_LOGOS) return null;
  for (const [clubName, logoUrl] of Object.entries(window.CLUB_LOGOS)) {
    if (title.includes(clubName)) {
      return { clubName, logoUrl };
    }
  }
  return null;
}

function buildFallbackNewsFromMatches() {
  const matches = (appData?.matches || []).filter((m) => !String(m.league || "").includes("تحت 17"));
  return matches.slice(0, 9).map((m, idx) => ({
    id: `auto_news_${m.id}_${idx}`,
    title:
      m.status === "live"
        ? `🔴 تغطية حية الآن: ${m.homeTeam} (${m.homeScore} - ${m.awayScore}) ${m.awayTeam} في ${m.league}`
        : m.status === "finished"
        ? `⚽ نهاية اللقاء: ${m.homeTeam} (${m.homeScore} - ${m.awayScore}) ${m.awayTeam} ضمن ${m.league}`
        : `🔥 قمة منتظرة: موعد مباراة ${m.homeTeam} ضد ${m.awayTeam} والقنوات الناقلة في ${m.league}`,
    summary: `تابع البث المباشر والتغطية الحصرية لمواجهة ${m.homeTeam} أمام ${m.awayTeam} عبر قناة ${m.channel} بصوت المعلق ${m.commentator} بجودة 4K UHD بدون تقطيع على كورة فور كي.`,
    category: m.league,
    leagueLogo: m.leagueLogo || "🏆",
    source: "استوديو Koora4K الإخباري",
    timeAgo: m.status === "live" ? "مباشر الآن 🔴" : "تحديث تلقائي اليوم",
    image: CLIENT_NEWS_TOPIC_IMAGES[idx % CLIENT_NEWS_TOPIC_IMAGES.length],
    matchId: m.id,
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
    homeLogo: m.homeLogo,
    awayLogo: m.awayLogo,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    status: m.status,
    timeGMT: m.timeGMT
  }));
}

function renderNews() {
  const homeGrid = document.getElementById("homeNewsGridContainer");
  const fullGrid = document.getElementById("fullNewsGridContainer");
  if (!homeGrid && !fullGrid) return;

  const newsList =
    appData.news && appData.news.length > 0
      ? appData.news
      : buildFallbackNewsFromMatches();

  const renderCard = (n, idx) => {
    const clickAction = n.matchId
      ? `openMatchPlayer('${n.matchId}')`
      : `switchSection('matches')`;

    const bgImg = n.image || CLIENT_NEWS_TOPIC_IMAGES[idx % CLIENT_NEWS_TOPIC_IMAGES.length];

    // إذا كان الخبر خاصاً بمباراة معينة، نعرض بطاقة بصرية خاصة بالمباراة تحمل شعاري الفريقين والنتيجة أو التوقيت فوق خلفية الملعب
    let customTopicOverlayHtml = "";
    if (n.homeTeam && n.awayTeam) {
      const safeH = String(n.homeTeam).replace(/'/g, "");
      const safeA = String(n.awayTeam).replace(/'/g, "");
      const hLogo = getTeamLogoUrl(n.homeTeam, n.homeLogo);
      const aLogo = getTeamLogoUrl(n.awayTeam, n.awayLogo);
      const centerTag =
        n.status === "upcoming"
          ? `<span class="news-vs-pill">${formatMatchTime(n.timeGMT || "19:00")}</span>`
          : `<span class="news-score-pill">${n.homeScore ?? 0} - ${n.awayScore ?? 0}</span>`;

      customTopicOverlayHtml = `
        <div class="news-match-poster-overlay">
          <div class="nmp-team">
            <img src="${hLogo}" alt="${safeH}" onerror="handleLogoError(this, '${safeH}')" />
            <span>${n.homeTeam}</span>
          </div>
          <div class="nmp-center">
            ${centerTag}
          </div>
          <div class="nmp-team">
            <img src="${aLogo}" alt="${safeA}" onerror="handleLogoError(this, '${safeA}')" />
            <span>${n.awayTeam}</span>
          </div>
        </div>
      `;
    } else {
      // إذا كان خبراً رياضياً عاماً ويذكر نادياً معروفاً، نعرض شعار النادي على زاوية صورة الخبر
      const detectedClub = detectTopicClubCrestFromHeadline(n.title);
      if (detectedClub) {
        customTopicOverlayHtml = `
          <div class="news-club-corner-crest" title="${detectedClub.clubName}">
            <img src="${detectedClub.logoUrl}" alt="${detectedClub.clubName}" />
          </div>
        `;
      }
    }

    return `
      <div class="news-card" onclick="${clickAction}">
        <div class="news-thumb">
          <img src="${bgImg}" alt="${n.title}" referrerpolicy="no-referrer" loading="lazy" onerror="handleNewsImgError(this, ${idx})" />
          ${customTopicOverlayHtml}
          <span class="news-cat-badge">${n.leagueLogo || "⚽"} ${n.category || "أخبار الكرة"}</span>
        </div>
        <div class="news-body">
          <h3>${n.title}</h3>
          <p>${n.summary || n.title}</p>
          <div class="news-meta-footer">
            <span><i class="fa-solid fa-bolt" style="color:var(--accent-green);"></i> ${n.source || "Koora4K"}</span>
            <span><i class="fa-regular fa-clock"></i> ${n.timeAgo || "اليوم"}</span>
          </div>
        </div>
      </div>
    `;
  };

  if (homeGrid) {
    homeGrid.innerHTML = newsList.slice(0, 6).map((n, i) => renderCard(n, i)).join("");
  }
  if (fullGrid) {
    fullGrid.innerHTML = newsList.map((n, i) => renderCard(n, i)).join("");
  }
}

// ==================== 24/7 CHANNELS VIEW ====================
function renderChannels() {
  const container = document.getElementById("channelsGridContainer");
  if (!container) return;

  const q = (document.getElementById("channelSearchInput")?.value || "").trim().toLowerCase();
  const list = (appData.channels || []).filter((ch) => {
    if (!q) return true;
    return `${ch.name} ${ch.category} ${ch.currentProgram}`.toLowerCase().includes(q);
  });

  container.innerHTML = list
    .map(
      (ch) => `
      <div class="channel-card" onclick="openChannelPlayer('${ch.id}')">
        <img src="${getTeamLogoUrl(ch.name, ch.logo)}" alt="${ch.name}" />
        <h3>${ch.name}</h3>
        <span class="channel-program">${ch.currentProgram || ch.category}</span>
        <div class="channel-badges">
          <span class="match-status-badge live"><span class="pulse-red"></span> مباشر 24/7</span>
          <span class="quality-indicator">${ch.badge || "HD"}</span>
        </div>
      </div>
    `
    )
    .join("");
}

// ==================== LEAGUE STANDINGS VIEW ====================
function renderStandings() {
  const tabsContainer = document.getElementById("standingsLeagueTabs");
  const tbody = document.getElementById("standingsTableBody");
  if (!tabsContainer || !tbody) return;

  const leagues = Object.keys(appData.standings || {});
  if (leagues.length === 0) return;

  if (!activeStandingLeague || !leagues.includes(activeStandingLeague)) {
    activeStandingLeague = leagues[0];
  }

  tabsContainer.innerHTML = leagues
    .map(
      (lg) => `
      <button class="status-pill ${lg === activeStandingLeague ? "active" : ""}" onclick="selectStandingLeague('${lg}')">
        ${lg}
      </button>
    `
    )
    .join("");

  const rows = appData.standings[activeStandingLeague] || [];
  tbody.innerHTML = rows
    .map((r) => {
      const gd = r.gf - r.ga;
      const gdText = gd > 0 ? `+${gd}` : `${gd}`;
      const formHtml = (r.form || [])
        .map((f) => `<span class="form-b ${f}">${f === "W" ? "ف" : f === "D" ? "ت" : "خ"}</span>`)
        .join("");

      const safeTeam = r.team.replace(/'/g, "");

      return `
        <tr>
          <td><span class="rank-num ${r.rank <= 3 ? "rank-top" : ""}">${r.rank}</span></td>
          <td class="text-right">
            <div style="display:inline-flex; align-items:center; gap:10px;">
              <img src="${getTeamLogoUrl(r.team, r.logo || "")}" style="width:28px; height:28px; object-fit:contain;" onerror="handleLogoError(this, '${safeTeam}')" />
              <strong>${r.team}</strong>
            </div>
          </td>
          <td>${r.played}</td>
          <td>${r.won}</td>
          <td>${r.draw}</td>
          <td>${r.lost}</td>
          <td>${r.gf}</td>
          <td>${r.ga}</td>
          <td style="direction:ltr;">${gdText}</td>
          <td class="pts-cell">${r.pts}</td>
          <td><div class="form-badges">${formHtml}</div></td>
        </tr>
      `;
    })
    .join("");
}

function selectStandingLeague(leagueName) {
  activeStandingLeague = leagueName;
  renderStandings();
}

// ==================== HIGHLIGHTS VIEW ====================
function renderHighlights() {
  const container = document.getElementById("highlightsGridContainer");
  if (!container) return;

  container.innerHTML = (appData.highlights || [])
    .map(
      (hl) => {
        const scoreBadge =
          hl.homeScore !== undefined && hl.awayScore !== undefined
            ? formatScoreHtml(hl.homeScore, hl.awayScore)
            : hl.score || "ملخص";
        return `
      <div class="highlight-card" onclick="openHighlightPlayer('${hl.id}')">
        <div class="hl-thumb">
          <img src="${hl.thumbnail || 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80'}" alt="${hl.title}" />
          <div class="hl-play-btn"><i class="fa-solid fa-circle-play"></i></div>
          <span class="hl-score-tag">${scoreBadge}</span>
        </div>
        <div class="hl-body">
          <h3>${hl.title}</h3>
          <div class="hl-meta">
            <span>🏆 ${hl.league}</span>
            <span>⏱️ ${hl.date || "اليوم"}</span>
          </div>
        </div>
      </div>
    `;
      }
    )
    .join("");
}

// ==================== ADMIN DASHBOARD LOGIC ====================
function openAdminPanel() {
  switchSection("admin");
  renderAdminLists();
}

function switchAdminTab(tabName) {
  const panes = {
    matches: document.getElementById("adminTabMatches"),
    channels: document.getElementById("adminTabChannels"),
    highlights: document.getElementById("adminTabHighlights"),
    settings: document.getElementById("adminTabSettings")
  };

  Object.entries(panes).forEach(([k, el]) => {
    if (el) el.classList.toggle("hidden", k !== tabName);
  });

  document.querySelectorAll(".admin-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.admintab === tabName);
  });
}

function addServerRowToForm(srv = { name: "سيرفر 1 الرئيسي", quality: "1080p", type: "m3u8", url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" }) {
  const list = document.getElementById("adminServersList");
  const row = document.createElement("div");
  row.className = "server-input-row";
  row.innerHTML = `
    <input type="text" class="srv-name" placeholder="اسم السيرفر" value="${srv.name || ""}" required />
    <input type="text" class="srv-quality" placeholder="الجودة (1080p)" value="${srv.quality || "1080p"}" />
    <select class="srv-type">
      <option value="m3u8" ${srv.type === "m3u8" ? "selected" : ""}>M3U8 مباشر</option>
      <option value="iframe" ${srv.type === "iframe" ? "selected" : ""}>Iframe تضمين</option>
    </select>
    <input type="url" class="srv-url" placeholder="رابط البث المباشر..." value="${srv.url || ""}" required />
    <button type="button" class="btn-remove-srv" onclick="this.parentElement.remove()" title="حذف السيرفر">
      <i class="fa-solid fa-trash"></i>
    </button>
  `;
  list.appendChild(row);
}

function resetMatchForm() {
  document.getElementById("editMatchId").value = "";
  document.getElementById("matchFormTitle").innerHTML = `<i class="fa-solid fa-plus-circle"></i> إضافة مباراة جديدة`;
  document.getElementById("mLeague").value = "دوري أبطال أوروبا";
  document.getElementById("mLeagueLogo").value = "🏆";
  document.getElementById("mDay").value = "today";
  document.getElementById("mStatus").value = "live";
  document.getElementById("mMinute").value = "مباشر";
  document.getElementById("mHomeTeam").value = "";
  document.getElementById("mHomeLogo").value = "";
  document.getElementById("mAwayTeam").value = "";
  document.getElementById("mAwayLogo").value = "";
  document.getElementById("mHomeScore").value = 0;
  document.getElementById("mAwayScore").value = 0;
  document.getElementById("mTimeGMT").value = "19:00";
  document.getElementById("mChannel").value = "beIN Sports HD 1";
  document.getElementById("mCommentator").value = "عصام الشوالي";
  document.getElementById("mStadium").value = "";
  document.getElementById("mFeatured").checked = false;

  const list = document.getElementById("adminServersList");
  list.innerHTML = "";
  addServerRowToForm();
}

function editMatchInAdmin(matchId) {
  const m = (appData.matches || []).find((x) => x.id === matchId);
  if (!m) return;

  document.getElementById("editMatchId").value = m.id;
  document.getElementById("matchFormTitle").innerHTML = `<i class="fa-solid fa-pen-to-square"></i> تعديل مباراة: ${m.homeTeam} ضد ${m.awayTeam}`;
  document.getElementById("mLeague").value = m.league;
  document.getElementById("mLeagueLogo").value = m.leagueLogo || "🏆";
  document.getElementById("mDay").value = m.day || "today";
  document.getElementById("mStatus").value = m.status || "upcoming";
  document.getElementById("mMinute").value = m.minute || "";
  document.getElementById("mHomeTeam").value = m.homeTeam;
  document.getElementById("mHomeLogo").value = m.homeLogo || "";
  document.getElementById("mAwayTeam").value = m.awayTeam;
  document.getElementById("mAwayLogo").value = m.awayLogo || "";
  document.getElementById("mHomeScore").value = m.homeScore ?? 0;
  document.getElementById("mAwayScore").value = m.awayScore ?? 0;
  document.getElementById("mTimeGMT").value = m.timeGMT || "19:00";
  document.getElementById("mChannel").value = m.channel || "";
  document.getElementById("mCommentator").value = m.commentator || "";
  document.getElementById("mStadium").value = m.stadium || "";
  document.getElementById("mFeatured").checked = Boolean(m.featured);

  const list = document.getElementById("adminServersList");
  list.innerHTML = "";
  (m.servers || []).forEach((s) => addServerRowToForm(s));
  if (!m.servers || m.servers.length === 0) addServerRowToForm();
}

function saveMatchFromAdmin(e) {
  e.preventDefault();

  const editId = document.getElementById("editMatchId").value;
  const serverRows = Array.from(document.querySelectorAll("#adminServersList .server-input-row"));
  const servers = serverRows.map((row) => ({
    name: row.querySelector(".srv-name").value.trim(),
    quality: row.querySelector(".srv-quality").value.trim() || "HD",
    type: row.querySelector(".srv-type").value,
    url: row.querySelector(".srv-url").value.trim()
  }));

  const homeTeam = document.getElementById("mHomeTeam").value.trim();
  const awayTeam = document.getElementById("mAwayTeam").value.trim();

  const matchObj = {
    id: editId || "m_" + Date.now(),
    league: document.getElementById("mLeague").value.trim(),
    leagueLogo: document.getElementById("mLeagueLogo").value.trim() || "🏆",
    day: document.getElementById("mDay").value,
    status: document.getElementById("mStatus").value,
    minute: document.getElementById("mMinute").value.trim(),
    homeTeam,
    homeLogo: document.getElementById("mHomeLogo").value.trim() || getTeamLogoUrl(homeTeam, ""),
    awayTeam,
    awayLogo: document.getElementById("mAwayLogo").value.trim() || getTeamLogoUrl(awayTeam, ""),
    homeScore: Number(document.getElementById("mHomeScore").value || 0),
    awayScore: Number(document.getElementById("mAwayScore").value || 0),
    timeGMT: document.getElementById("mTimeGMT").value,
    channel: document.getElementById("mChannel").value.trim(),
    commentator: document.getElementById("mCommentator").value.trim(),
    stadium: document.getElementById("mStadium").value.trim(),
    featured: document.getElementById("mFeatured").checked,
    servers
  };

  if (editId) {
    const idx = appData.matches.findIndex((x) => x.id === editId);
    if (idx !== -1) {
      matchObj.events = appData.matches[idx].events || [];
      appData.matches[idx] = matchObj;
    }
  } else {
    appData.matches.unshift(matchObj);
  }

  saveAppData(true);
  resetMatchForm();
}

function quickScoreChange(matchId, team, delta) {
  const m = appData.matches.find((x) => x.id === matchId);
  if (!m) return;
  if (team === "home") {
    m.homeScore = Math.max(0, (m.homeScore || 0) + delta);
  } else {
    m.awayScore = Math.max(0, (m.awayScore || 0) + delta);
  }
  saveAppData(true);
}

function quickStatusToggle(matchId, newStatus) {
  const m = appData.matches.find((x) => x.id === matchId);
  if (!m) return;
  m.status = newStatus;
  if (newStatus === "live") m.minute = "مباشر الآن";
  if (newStatus === "finished") m.minute = "انتهت";
  if (newStatus === "upcoming") m.minute = "قريباً";
  saveAppData(true);
}

function deleteMatchFromAdmin(matchId) {
  appData.matches = appData.matches.filter((m) => m.id !== matchId);
  saveAppData(true);
}

function resetChannelForm() {
  document.getElementById("editChannelId").value = "";
  document.getElementById("chName").value = "";
  document.getElementById("chCategory").value = "قنوات بي إن سبورت";
  document.getElementById("chBadge").value = "FHD 1080p";
  document.getElementById("chProgram").value = "بث مباشر 24/7";
  document.getElementById("chLogo").value = "";
  document.getElementById("chStreamUrl").value = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
}

function saveChannelFromAdmin(e) {
  e.preventDefault();
  const editId = document.getElementById("editChannelId").value;
  const chObj = {
    id: editId || "ch_" + Date.now(),
    name: document.getElementById("chName").value.trim(),
    category: document.getElementById("chCategory").value.trim(),
    badge: document.getElementById("chBadge").value.trim(),
    currentProgram: document.getElementById("chProgram").value.trim(),
    logo: document.getElementById("chLogo").value.trim(),
    status: "live",
    servers: [
      {
        name: "سيرفر القناة الرئيسي",
        quality: document.getElementById("chBadge").value.trim(),
        type: document.getElementById("chStreamType").value,
        url: document.getElementById("chStreamUrl").value.trim()
      }
    ]
  };

  if (editId) {
    const idx = appData.channels.findIndex((c) => c.id === editId);
    if (idx !== -1) appData.channels[idx] = chObj;
  } else {
    appData.channels.unshift(chObj);
  }

  saveAppData(true);
  resetChannelForm();
}

function deleteChannelFromAdmin(chId) {
  appData.channels = appData.channels.filter((c) => c.id !== chId);
  saveAppData(true);
}

function saveHighlightFromAdmin(e) {
  e.preventDefault();
  const hlObj = {
    id: "hl_" + Date.now(),
    title: document.getElementById("hlTitle").value.trim(),
    league: document.getElementById("hlLeague").value.trim(),
    score: document.getElementById("hlScore").value.trim(),
    thumbnail: document.getElementById("hlThumb").value.trim(),
    videoType: document.getElementById("hlType").value,
    videoUrl: document.getElementById("hlUrl").value.trim(),
    date: "منذ قليل"
  };

  appData.highlights.unshift(hlObj);
  saveAppData(true);
  e.target.reset();
}

function deleteHighlightFromAdmin(hlId) {
  appData.highlights = appData.highlights.filter((h) => h.id !== hlId);
  saveAppData(true);
}

function saveSettingsFromAdmin(e) {
  e.preventDefault();
  appData.settings = {
    siteName: document.getElementById("setSiteName").value.trim(),
    siteBadge: document.getElementById("setSiteBadge").value.trim(),
    announcement: document.getElementById("setAnnouncement").value.trim(),
    defaultTimezoneOffset: Number(document.getElementById("setDefaultTz").value),
    adminPin: document.getElementById("setAdminPin").value.trim()
  };
  saveAppData(true);
}

function renderAdminLists() {
  const mContainer = document.getElementById("adminMatchesTableContainer");
  if (mContainer) {
    mContainer.innerHTML = (appData.matches || [])
      .map(
        (m) => `
        <div class="admin-item-row">
          <div class="admin-item-top">
            <div style="display:flex; align-items:center; gap:10px;">
              <img src="${getTeamLogoUrl(m.homeTeam, m.homeLogo)}" style="width:28px;height:28px;object-fit:contain;" />
              <div>
                <strong>${m.homeTeam} (${m.homeScore}) - (${m.awayScore}) ${m.awayTeam}</strong>
                <div style="font-size:0.78rem; color:var(--text-secondary);">
                  ${m.league} | ${getDayLabelArabic(m.day, m.dateLabel)} | ${m.channel}
                </div>
              </div>
            </div>
            <span class="match-status-badge ${m.status}">${m.minute}</span>
          </div>
          <div class="admin-item-actions">
            <button class="btn-sm goal-btn" onclick="quickScoreChange('${m.id}', 'home', 1)">+1 ${m.homeTeam}</button>
            <button class="btn-sm goal-btn" onclick="quickScoreChange('${m.id}', 'away', 1)">+1 ${m.awayTeam}</button>
            <button class="btn-sm" onclick="quickStatusToggle('${m.id}', 'live')">🔴 مباشر</button>
            <button class="btn-sm" onclick="quickStatusToggle('${m.id}', 'finished')">🏁 إنهاء</button>
            <button class="btn-sm" onclick="editMatchInAdmin('${m.id}')"><i class="fa-solid fa-pen"></i> تعديل</button>
            <button class="btn-sm delete-btn" onclick="deleteMatchFromAdmin('${m.id}')"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
      `
      )
      .join("");
  }

  const chContainer = document.getElementById("adminChannelsListContainer");
  if (chContainer) {
    chContainer.innerHTML = (appData.channels || [])
      .map(
        (c) => `
        <div class="admin-item-row">
          <div class="admin-item-top">
            <strong>📺 ${c.name} (${c.badge})</strong>
            <button class="btn-sm delete-btn" onclick="deleteChannelFromAdmin('${c.id}')"><i class="fa-solid fa-trash"></i> حذف</button>
          </div>
        </div>
      `
      )
      .join("");
  }

  const hlContainer = document.getElementById("adminHighlightsListContainer");
  if (hlContainer) {
    hlContainer.innerHTML = (appData.highlights || [])
      .map(
        (h) => `
        <div class="admin-item-row">
          <div class="admin-item-top">
            <strong>🎬 ${h.title} (${h.score})</strong>
            <button class="btn-sm delete-btn" onclick="deleteHighlightFromAdmin('${h.id}')"><i class="fa-solid fa-trash"></i> حذف</button>
          </div>
        </div>
      `
      )
      .join("");
  }
}

// ==================== EXPORT / IMPORT / RESET ====================
function exportSiteData() {
  const blob = new Blob([JSON.stringify(appData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "koorahd-backup.json";
  a.click();
  URL.revokeObjectURL(url);
  showToast("📦 تم تحميل النسخة الاحتياطية بنجاح");
}

function importSiteData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported && imported.matches) {
        appData = imported;
        saveAppData(true);
      }
    } catch (_) {
      showToast("❌ ملف غير صالح");
    }
  };
  reader.readAsText(file);
}

function resetToDefaultData() {
  appData = JSON.parse(JSON.stringify(window.DEFAULT_KOORA_DATA));
  saveAppData(true);
  showToast("🔄 تمت استعادة البيانات الافتراضية للموقع");
}

function showToast(msg) {
  const toast = document.getElementById("toastNotification");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove("hidden");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 3200);
}

// ==================== 1. WHATSAPP SHARE GENERATOR ====================
function shareCurrentMatchWhatsApp() {
  const match = activePlayContext && activePlayContext.item ? activePlayContext.item : null;
  const matchUrl = match ? "https://koora4k.net/?match=" + encodeURIComponent(match.id) : "https://koora4k.net/";
  const matchTitle = match ? match.homeTeam + " 🆚 " + match.awayTeam : "مباريات اليوم";
  const league = match && match.league ? "[" + match.league + "]" : "";
  const channel = match && match.channel ? "عبر " + match.channel : "";
  const text = "⚽ شاهد الآن بث مباشر لمباراة: *" + matchTitle + "* " + league + " " + channel + "\n📺 بجودة عالية 4K فائقة الوضوح وبدون تقطيع حصرياً عبر كورة فور كي:\n🔗 " + matchUrl;
  const waUrl = "https://api.whatsapp.com/send?text=" + encodeURIComponent(text);
  window.open(waUrl, "_blank");
}

// ==================== 2. NOTIFICATION BELL & PERMISSIONS ====================
function requestMatchNotifications() {
  if (!("Notification" in window)) {
    showToast("⚠️ المتصفح الخاص بك لا يدعم الإشعارات المباشرة");
    return;
  }
  if (Notification.permission === "granted") {
    showToast("🔔 إشعارات المباريات والأهداف مفعلة لديك مسبقاً!");
    try {
      new Notification("كورة فور كي – Koora4K", {
        body: "أنت مشترك في الإشعارات الفورية! ستصلك تنبيهات انطلاق المباريات والأهداف الحية.",
        icon: "/assets/logo-emblem.jpg"
      });
    } catch (_) {}
    return;
  }
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      showToast("🎉 تم تفعيل إشعارات المباريات والأهداف بنجاح!");
      try {
        new Notification("كورة فور كي – Koora4K", {
          body: "مرحباً بك! تم تفعيل إشعاراتك لمتابعة أهم مباريات اليوم لحظة بلحظة.",
          icon: "/assets/logo-emblem.jpg"
        });
      } catch (_) {}
      const bell = document.getElementById("btnNotifBell");
      if (bell) bell.style.color = "#10b981";
    } else {
      showToast("❌ تم رفض إذن الإشعارات، يمكنك تفعيلها من إعدادات المتصفح");
    }
  });
}

// ==================== 3. PWA INSTALL PROMPT & BANNER ====================
let deferredPwaPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPwaPrompt = e;
  const isDismissed = localStorage.getItem("koora4k_pwa_dismissed");
  if (!isDismissed) {
    setTimeout(() => {
      const banner = document.getElementById("pwaInstallBanner");
      if (banner) banner.classList.remove("hidden");
    }, 2800);
  }
});

function triggerPwaInstall() {
  if (!deferredPwaPrompt) {
    showToast("📲 يمكنك تثبيت التطبيق مباشرة بالضغط على خيارات المتصفح (⋮) ثم 'إضافة إلى الشاشة الرئيسية'");
    return;
  }
  deferredPwaPrompt.prompt();
  deferredPwaPrompt.userChoice.then((choice) => {
    if (choice.outcome === "accepted") {
      showToast("🎉 شكراً لك! تم تثبيت تطبيق كورة فور كي على هاتفك بنجاح");
      dismissPwaBanner();
    }
    deferredPwaPrompt = null;
  });
}

function dismissPwaBanner() {
  const banner = document.getElementById("pwaInstallBanner");
  if (banner) banner.classList.add("hidden");
  localStorage.setItem("koora4k_pwa_dismissed", Date.now());
}

// ==================== 4. MATCH PREDICTION POLL ====================
function renderMatchPredictionPoll(match) {
  const container = document.getElementById("pollOptionsGrid");
  const totalVotesEl = document.getElementById("pollTotalVotes");
  if (!container || !match) return;

  const storageKey = "koora4k_poll_" + match.id;
  let pollData = null;
  try {
    pollData = JSON.parse(localStorage.getItem(storageKey));
  } catch (_) {}

  if (!pollData) {
    const baseHome = 45 + (Math.abs(match.id.charCodeAt(0) || 5) % 25);
    const baseDraw = 15 + (Math.abs(match.id.charCodeAt(1) || 2) % 12);
    const baseAway = 100 - baseHome - baseDraw;
    const totalV = 2300 + (Math.abs(match.id.charCodeAt(0) || 1) * 35);
    pollData = {
      homeVotes: Math.round((baseHome / 100) * totalV),
      drawVotes: Math.round((baseDraw / 100) * totalV),
      awayVotes: Math.round((baseAway / 100) * totalV),
      userChoice: null
    };
    localStorage.setItem(storageKey, JSON.stringify(pollData));
  }

  const total = pollData.homeVotes + pollData.drawVotes + pollData.awayVotes || 1;
  const hPct = Math.round((pollData.homeVotes / total) * 100);
  const dPct = Math.round((pollData.drawVotes / total) * 100);
  const aPct = 100 - hPct - dPct;

  if (totalVotesEl) {
    totalVotesEl.textContent = "📊 " + total.toLocaleString("ar-EG") + " صوت";
  }

  const userVoted = pollData.userChoice;

  container.innerHTML = `
    <button class="poll-option-btn ${userVoted === 'home' ? 'voted' : ''}" onclick="handleVotePrediction('${match.id}', 'home')">
      <div class="poll-fill-bar" style="width: ${hPct}%"></div>
      <span class="poll-label-text">فوز ${match.homeTeam} ${userVoted === 'home' ? '✓ (صوتك)' : ''}</span>
      <span class="poll-percent-text">${hPct}%</span>
    </button>
    <button class="poll-option-btn ${userVoted === 'draw' ? 'voted' : ''}" onclick="handleVotePrediction('${match.id}', 'draw')">
      <div class="poll-fill-bar" style="width: ${dPct}%"></div>
      <span class="poll-label-text">تعادل الفريقين ${userVoted === 'draw' ? '✓ (صوتك)' : ''}</span>
      <span class="poll-percent-text">${dPct}%</span>
    </button>
    <button class="poll-option-btn ${userVoted === 'away' ? 'voted' : ''}" onclick="handleVotePrediction('${match.id}', 'away')">
      <div class="poll-fill-bar" style="width: ${aPct}%"></div>
      <span class="poll-label-text">فوز ${match.awayTeam} ${userVoted === 'away' ? '✓ (صوتك)' : ''}</span>
      <span class="poll-percent-text">${aPct}%</span>
    </button>
  `;
}

function handleVotePrediction(matchId, choice) {
  const match = (appData.matches || []).find((m) => m.id === matchId);
  if (!match) return;
  const storageKey = "koora4k_poll_" + matchId;
  let pollData = {};
  try {
    pollData = JSON.parse(localStorage.getItem(storageKey)) || {};
  } catch (_) {}

  if (pollData.userChoice) {
    showToast("⚠️ لقد قمت بالتصويت مسبقاً في هذه المباراة!");
    return;
  }

  if (choice === "home") pollData.homeVotes = (pollData.homeVotes || 0) + 1;
  else if (choice === "draw") pollData.drawVotes = (pollData.drawVotes || 0) + 1;
  else if (choice === "away") pollData.awayVotes = (pollData.awayVotes || 0) + 1;

  pollData.userChoice = choice;
  localStorage.setItem(storageKey, JSON.stringify(pollData));
  showToast("🎉 شكراً لك! تم تسجيل توقعك بنجاح");
  renderMatchPredictionPoll(match);
}

// ==================== 5. LIVE MATCH FAN CHATROOM ====================
let liveChatInterval = null;
const FAN_NAMES = ["ياسين الكازاوي", "سفيان مدريديستا", "حمزة برشلوني", "أمين الرجاوي", "عثمان الودادي", "أيوب طنجة", "إلياس أكادير", "محمد مراكش", "هشام الرباط", "طارق وجدة"];
const FAN_COMMENTS_BANK = [
  "الماتش مولع بزاف، يا ربي شي بيت دابا 🔥",
  "حكيمي اليوم داير ماتش عالمي كالعادة 🇲🇦👏",
  "الحارس ديالهم كيطير ما شاء الله!",
  "فينكم يا عشاق الكرة، توقعاتكم شكون غايماركي الأول؟",
  "البث تبارك الله نقي 4K وبلا تقطيع، شكراً كورة فور كي ❤️",
  "تمريرة سحرية وضاعت، حشومة تضيع هادي!",
  "الضغط عالي بزاف من وسط الميدان",
  "دخول قوي فـ الشوط الثاني، إن شاء الله الفوز!",
  "الحكم كيصفر فـ كل احتكاك بزاف",
  "هجمة مرتدة خطيرة بزاف كادت تسجل هدف ⚽"
];

function initLiveFanChat(match) {
  const chatContainer = document.getElementById("fanChatMessages");
  const countEl = document.getElementById("chatOnlineCount");
  if (!chatContainer) return;

  if (countEl) {
    countEl.textContent = (1850 + Math.floor(Math.random() * 800)).toLocaleString("ar-EG");
  }

  const initial = [
    { author: "أمين الرجاوي", team: "المغرب", text: "السلام عليكم، شكون كيشجع " + match.homeTeam + " اليوم؟ 🔥" },
    { author: "سفيان مدريديستا", team: "4K LIVE", text: "بث ممتاز وسريع، بالتوفيق للفريقين!" },
    { author: "حمزة برشلوني", team: "عاشق الكرة", text: "مباراة قوية وتكتيكية من الطراز العالي ⚽" },
    { author: "ياسين الكازاوي", team: "كورة 4K", text: "ديما مغرب 🇲🇦، تفرجوا واستمتعوا بدون تقطيع!" }
  ];

  chatContainer.innerHTML = initial
    .map(
      (msg) => `
    <div class="chat-msg">
      <div class="chat-msg-avatar"><i class="fa-solid fa-user"></i></div>
      <div class="chat-msg-body">
        <div class="chat-msg-author">
          <span>${msg.author}</span>
          <span class="chat-team-badge">• ${msg.team}</span>
        </div>
        <div class="chat-msg-text">${msg.text}</div>
      </div>
    </div>`
    )
    .join("");

  chatContainer.scrollTop = chatContainer.scrollHeight;

  if (liveChatInterval) clearInterval(liveChatInterval);
  liveChatInterval = setInterval(() => {
    const pSec = document.getElementById("playerSection");
    if (!pSec || pSec.classList.contains("hidden")) return;

    const randName = FAN_NAMES[Math.floor(Math.random() * FAN_NAMES.length)];
    const randText = FAN_COMMENTS_BANK[Math.floor(Math.random() * FAN_COMMENTS_BANK.length)];
    const msgEl = document.createElement("div");
    msgEl.className = "chat-msg";
    msgEl.innerHTML = `
      <div class="chat-msg-avatar"><i class="fa-solid fa-user"></i></div>
      <div class="chat-msg-body">
        <div class="chat-msg-author">
          <span>${randName}</span>
          <span class="chat-team-badge">• مشجع مباشر</span>
        </div>
        <div class="chat-msg-text">${randText}</div>
      </div>`;
    chatContainer.appendChild(msgEl);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, 18000);
}

function handleSendFanChatMessage(event) {
  event.preventDefault();
  const input = document.getElementById("fanChatInput");
  const chatContainer = document.getElementById("fanChatMessages");
  if (!input || !chatContainer) return;
  const val = input.value.trim();
  if (!val) return;

  const msgEl = document.createElement("div");
  msgEl.className = "chat-msg";
  msgEl.innerHTML = `
    <div class="chat-msg-avatar" style="background:linear-gradient(135deg, #10b981, #059669);"><i class="fa-solid fa-star"></i></div>
    <div class="chat-msg-body" style="background:rgba(16, 185, 129, 0.15); border:1px solid rgba(16, 185, 129, 0.3);">
      <div class="chat-msg-author" style="color:#34d399;">
        <span>أنت (مشجع)</span>
        <span class="chat-team-badge">• الآن</span>
      </div>
      <div class="chat-msg-text">${val}</div>
    </div>`;
  chatContainer.appendChild(msgEl);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  input.value = "";
  showToast("💬 تم إرسال تعليقك في الشات المباشر!");
}

function insertChatEmoji(emoji) {
  const input = document.getElementById("fanChatInput");
  if (!input) return;
  input.value += emoji;
  input.focus();
}
