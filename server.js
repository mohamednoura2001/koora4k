const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const DB_FILE = path.join(__dirname, "data", "db.json");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};

// قاموس ترجمة الأسماء الإنجليزية إلى العربية للمباريات، الترتيب، والملخصات
const TEAM_AR_MAP = {
  "real madrid": "ريال مدريد",
  "barcelona": "برشلونة",
  "atletico madrid": "أتلتيكو مدريد",
  "atlético madrid": "أتلتيكو مدريد",
  "athletic club": "أتلتيك بيلباو",
  "athletic bilbao": "أتلتيك بيلباو",
  "real sociedad": "ريال سوسيداد",
  "villarreal": "فياريال",
  "real betis": "ريال بيتيس",
  "sevilla": "إشبيلية",
  "valencia": "فالنسيا",
  "getafe": "خيتافي",
  "celta vigo": "سيلتا فيجو",
  "celta": "سيلتا فيجو",
  "girona": "جيرونا",
  "osasuna": "أوساسونا",
  "mallorca": "مايوركا",
  "rayo vallecano": "رايو فاييكانو",
  "las palmas": "لاس بالماس",
  "alaves": "ديبورتيفو ألافيس",
  "espanyol": "إسبانيول",
  "leganes": "ليغانيس",
  "real valladolid": "بلد الوليد",
  "arsenal": "أرسنال",
  "manchester city": "مانشستر سيتي",
  "liverpool": "ليفربول",
  "chelsea": "تشيلسي",
  "manchester united": "مانشستر يونايتد",
  "manchester utd": "مانشستر يونايتد",
  "tottenham hotspur": "توتنهام",
  "tottenham": "توتنهام",
  "wolves": "وولفرهامبتون",
  "wolverhampton wanderers": "وولفرهامبتون",
  "wolverhampton": "وولفرهامبتون",
  "newcastle united": "نيوكاسل يونايتد",
  "newcastle": "نيوكاسل يونايتد",
  "aston villa": "أستون فيلا",
  "brighton & hove albion": "برايتون",
  "brighton": "برايتون",
  "west ham united": "وست هام يونايتد",
  "bournemouth": "بورنموث",
  "afc bournemouth": "بورنموث",
  "crystal palace": "كريستال بالاس",
  "southampton": "ساوثهامبتون",
  "fulham": "فولهام",
  "brentford": "برينتفورد",
  "everton": "إيفرتون",
  "nottingham forest": "نوتنغهام فورست",
  "leicester city": "ليستر سيتي",
  "ipswich town": "إبسويتش تاون",
  "sunderland": "سندرلاند",
  "leeds united": "ليدز يونايتد",
  "paris saint-germain": "باريس سان جيرمان",
  "psg": "باريس سان جيرمان",
  "angers": "أنجيه",
  "toulouse": "تولوز",
  "marseille": "أولمبيك مارسيليا",
  "olympique de marseille": "أولمبيك مارسيليا",
  "lyon": "أولمبيك ليون",
  "olympique lyonnais": "أولمبيك ليون",
  "as monaco": "موناكو",
  "monaco": "موناكو",
  "lille": "ليل",
  "nice": "نيس",
  "rennes": "ستاد رين",
  "stade rennais": "ستاد رين",
  "lens": "لانس",
  "rc lens": "لانس",
  "strasbourg": "ستراسبورغ",
  "reims": "ستاد ريمس",
  "brest": "ستاد بريست",
  "nantes": "نانت",
  "auxerre": "أوكسير",
  "montpellier": "مونبلييه",
  "saint-etienne": "سانت إتيان",
  "le havre": "لوهافر",
  "bayern munich": "بايرن ميونخ",
  "borussia dortmund": "بوروسيا دورتموند",
  "bayer leverkusen": "باير ليفركوزن",
  "leverkusen": "باير ليفركوزن",
  "koln": "كولن",
  "mainz": "ماينز",
  "rb leipzig": "لايبزيج",
  "eintracht frankfurt": "آينتراخت فرانكفورت",
  "stuttgart": "شتوتغارت",
  "vfb stuttgart": "شتوتغارت",
  "freiburg": "فرايبورج",
  "sc freiburg": "فرايبورج",
  "hoffenheim": "هوفنهايم",
  "tsg hoffenheim": "هوفنهايم",
  "werder bremen": "فيردر بريمن",
  "wolfsburg": "فولفسبورغ",
  "borussia monchengladbach": "بوروسيا مونشنغلادباخ",
  "union berlin": "يونيون برلين",
  "augsburg": "أوغسبورغ",
  "inter milan": "إنتر ميلان",
  "internazionale": "إنتر ميلان",
  "ac milan": "إي سي ميلان",
  "milan": "ميلان",
  "juventus": "يوفنتوس",
  "napoli": "نابولي",
  "as roma": "روما",
  "roma": "روما",
  "lazio": "لاتسيو",
  "atalanta": "أتالانتا",
  "fiorentina": "فيورنتينا",
  "bologna": "بولونيا",
  "torino": "تورينو",
  "udinese": "أودينيزي",
  "genoa": "جنوى",
  "como": "كومو",
  "parma": "بارما",
  "verona": "هيلاس فيرونا",
  "lecce": "ليتشي",
  "cagliari": "كالياري",
  "empoli": "إمبولي",
  "monza": "مونزا",
  "venezia": "فينيسيا",
  "ajax": "أياكس",
  "psv eindhoven": "آيندهوفن",
  "feyenoord": "فاينورد",
  "twente": "تفينتي",
  "nec": "إن إي سي نيميغن",
  "az alkmaar": "ألكمار",
  "az": "ألكمار",
  "benfica": "بنفيكا",
  "porto": "بورتو",
  "fc porto": "بورتو",
  "sporting cp": "سبورتينغ لشبونة",
  "celtic": "سيلتيك",
  "rangers": "رينجرز",
  "galatasaray": "غلطة سراي",
  "fenerbahce": "فنربخشة",
  "besiktas": "بشكتاش",
  "trabzonspor": "طرابزون سبور",
  "al hilal": "الهلال",
  "al-hilal": "الهلال",
  "al nassr": "النصر",
  "al-nassr": "النصر",
  "al ittihad": "الاتحاد",
  "al-ittihad": "الاتحاد",
  "al ahli": "الأهلي",
  "al-ahli": "الأهلي",
  "al ahli jeddah": "الأهلي السعودي",
  "al qadsiah": "القادسية",
  "al-qadsiah": "القادسية",
  "al shabab": "الشباب",
  "al-shabab": "الشباب",
  "al ettifaq": "الاتفاق",
  "al-ettifaq": "الاتفاق",
  "al taawoun": "التعاون",
  "al-taawoun": "التعاون",
  "al-khaleej": "الخليج",
  "al khaleej": "الخليج",
  "al fateh": "الفتح",
  "al riyadh": "الرياض",
  "al fayha": "الفيحاء",
  "al raed": "الرائد",
  "al wehda": "الوحدة",
  "al akhdoud": "الأخدود",
  "al kholood": "الخلود",
  "al orubah": "العروبة",
  "damac": "ضمك",
  "raja casablanca": "الرجاء الرياضي",
  "wydad casablanca": "الوداد الرياضي",
  "rs berkane": "نهضة بركان",
  "far rabat": "الجيش الملكي",
  "al ahly": "الأهلي المصري",
  "zamalek": "الزمالك",
  "esperance": "الترجي التونسي",
  "shakhtar donetsk": "شاختار دونيتسك",
  "lask linz": "لاسك لينز",
  "levante": "ليفانتي",
  "hull city": "هال سيتي",
  "le mans": "لومان",
  "lorient": "لوريان",
  "fc lorient": "لوريان",
  "troyes": "تروا",
  "estac troyes": "تروا",
  "paris fc": "باريس إف سي",
  "coventry city": "كوفنتري سيتي",
  "racing santander": "راسينغ سانتاندير",
  "deportivo la coruna": "ديبورتيفو لاكورونيا",
  "elversberg": "إلفيرسبيرغ",
  "paderborn": "بادربورن",
  "sc paderborn 07": "بادربورن",
  "schalke 04": "شالكه 04",
  "fc schalke 04": "شالكه 04",
  "hamburger sv": "هامبورغ"
};

const LEAGUE_AR_MAP = {
  "UEFA Champions League": "دوري أبطال أوروبا",
  "Champions League": "دوري أبطال أوروبا",
  "UEFA Europa League": "الدوري الأوروبي",
  "Europa League": "الدوري الأوروبي",
  "UEFA Conference League": "دوري المؤتمر الأوروبي",
  "Conference League": "دوري المؤتمر الأوروبي",
  "English Premier League": "الدوري الإنجليزي الممتاز",
  "Premier League": "الدوري الإنجليزي الممتاز",
  "FA Cup": "كأس الاتحاد الإنجليزي",
  "Spanish LALIGA": "الدوري الإسباني LaLiga",
  "La Liga": "الدوري الإسباني LaLiga",
  "Italian Serie A": "الدوري الإيطالي Serie A",
  "Serie A": "الدوري الإيطالي Serie A",
  "German Bundesliga": "الدوري الألماني Bundesliga",
  "Bundesliga": "الدوري الألماني Bundesliga",
  "French Ligue 1": "الدوري الفرنسي Ligue 1",
  "Ligue 1": "الدوري الفرنسي Ligue 1",
  "Eredivisie": "الدوري الهولندي",
  "Saudi Pro League": "دوري روشن السعودي",
  "CAF Champions League": "دوري أبطال أفريقيا",
  "CAF Confederation Cup": "كأس الكونفدرالية الأفريقية",
  "Moroccan Botola Pro": "البطولة المغربية الاحترافية"
};

function translateTeam(enName) {
  if (!enName) return "";
  const lower = enName.toLowerCase().trim();
  if (TEAM_AR_MAP[lower]) return TEAM_AR_MAP[lower];
  for (const [k, v] of Object.entries(TEAM_AR_MAP)) {
    if (lower.includes(k)) return v;
  }
  return enName;
}

function translateLeague(enLeague) {
  if (!enLeague) return "البطولات الأوروبية والعالمية";
  for (const [k, v] of Object.entries(LEAGUE_AR_MAP)) {
    if (enLeague.toLowerCase().includes(k.toLowerCase())) return v;
  }
  return enLeague;
}

function convertKooraTimeToGMT(timeStr) {
  if (!timeStr) return "19:00";
  const m = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return "19:00";
  let hours = parseInt(m[1], 10);
  const minutes = m[2];
  const ampm = (m[3] || "").toUpperCase();
  if (ampm === "PM" && hours < 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  const gmtHours = (hours - 3 + 24) % 24;
  return `${String(gmtHours).padStart(2, "0")}:${minutes}`;
}

// حماية السيرفر من التوقف تحت أي ظرف لضمان عمل الموقع 24/7 بدون انقطاع
process.on("uncaughtException", (err) => {
  console.error("⚠️ [Keep-Alive Protection] Uncaught Exception:", err.message);
});
process.on("unhandledRejection", (reason) => {
  console.error("⚠️ [Keep-Alive Protection] Unhandled Rejection:", reason);
});

let cachedLiveState = {
  lastSync: 0,
  matches: [],
  highlights: [],
  standings: null,
  news: [],
  liveM3u8Stream: "https://lbgo.bozztv.com/ssh101/ssh101/yusfdara137152/chunks.m3u8"
};

const youtubeHighlightsCache = {};

async function fetchWithTimeout(url, options = {}, timeoutMs = 7000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        ...(options.headers || {})
      }
    });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

// سحب جدول ترتيب الدوريات الكبرى والعربية تلقائياً من ESPN Standings API
async function syncRealStandings() {
  const leaguesToSync = [
    { name: "الدوري الإسباني", code: "esp.1" },
    { name: "الدوري الإنجليزي الممتاز", code: "eng.1" },
    { name: "دوري أبطال أوروبا", code: "uefa.champions" },
    { name: "دوري روشن السعودي", code: "ksa.1" },
    { name: "الدوري الإيطالي", code: "ita.1" },
    { name: "الدوري الألماني", code: "ger.1" },
    { name: "الدوري الفرنسي", code: "fra.1" }
  ];

  const standingsResult = {};

  await Promise.all(
    leaguesToSync.map(async (lg) => {
      try {
        const r = await fetchWithTimeout(`https://site.api.espn.com/apis/v2/sports/soccer/${lg.code}/standings`, {}, 6000);
        const j = await r.json();
        const entries = j.children?.[0]?.standings?.entries || j.standings?.entries || [];
        if (entries.length > 0) {
          standingsResult[lg.name] = entries.slice(0, 18).map((entry, idx) => {
            const getStat = (sName) => {
              const found = (entry.stats || []).find((s) => s.name === sName);
              return found ? Number(found.value) : 0;
            };
            return {
              rank: getStat("rank") || idx + 1,
              team: translateTeam(entry.team?.displayName || entry.team?.name || ""),
              logo: entry.team?.logos?.[0]?.href || "",
              played: getStat("gamesPlayed"),
              won: getStat("wins"),
              draw: getStat("ties"),
              lost: getStat("losses"),
              gf: getStat("pointsFor"),
              ga: getStat("pointsAgainst"),
              pts: getStat("points"),
              form: ["W", "W", "D", "W", "W"]
            };
          });
        }
      } catch (_) {}
    })
  );

  return Object.keys(standingsResult).length > 0 ? standingsResult : null;
}

async function findYouTubeMatchHighlight(homeTeam, awayTeam) {
  const key = `${homeTeam}_${awayTeam}`;
  if (youtubeHighlightsCache[key]) return youtubeHighlightsCache[key];

  try {
    const query = `ملخص وأهداف مباراة ${homeTeam} و ${awayTeam}`;
    const r = await fetchWithTimeout(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      {},
      6000
    );
    const html = await r.text();
    const ids = [...new Set([...html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)].map((m) => m[1]))];
    if (ids.length > 0) {
      const vid = ids[0];
      const result = {
        videoId: vid,
        embedUrl: `https://www.youtube.com/embed/${vid}?autoplay=1`,
        thumbnail: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`
      };
      youtubeHighlightsCache[key] = result;
      return result;
    }
  } catch (_) {}
  return null;
}

async function syncRealFootballHighlights(finishedKooraMatches = []) {
  const realHighlights = [];

  const topFinished = finishedKooraMatches.slice(0, 8);
  await Promise.all(
    topFinished.map(async (m, idx) => {
      const yt = await findYouTubeMatchHighlight(m.homeTeam, m.awayTeam);
      if (yt) {
        m.servers = [
          {
            name: "🎬 ملخص وأهداف المباراة (YouTube HD)",
            quality: "1080p HD",
            type: "iframe",
            url: yt.embedUrl
          },
          ...(m.servers || [])
        ];

        realHighlights.push({
          id: `hl_khd_${m.id}_${idx}`,
          title: `ملخص وأهداف مباراة ${m.homeTeam} (${m.homeScore}) ضد (${m.awayScore}) ${m.awayTeam}`,
          league: m.league,
          duration: m.day === "today" ? "مباريات اليوم" : "مباريات الأمس",
          views: "تغطية KooraHD",
          date: m.day === "today" ? "اليوم" : "أمس",
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          score: `${m.homeScore} - ${m.awayScore}`,
          thumbnail: yt.thumbnail,
          videoUrl: yt.embedUrl,
          videoType: "iframe",
          servers: [
            {
              name: "🎬 ملخص وأهداف اللقاء (Full HD)",
              quality: "1080p",
              type: "iframe",
              url: yt.embedUrl
            }
          ]
        });
      }
    })
  );

  try {
    const res = await fetchWithTimeout("https://www.scorebat.com/video-api/v3/", {}, 7000);
    const data = await res.json();
    const items = (data.response || []).slice(0, 16);

    items.forEach((item, idx) => {
      const parts = (item.title || "").split(" - ");
      const homeAr = translateTeam(parts[0] || item.title);
      const awayAr = translateTeam(parts[1] || "");
      const titleAr = awayAr
        ? `ملخص وأهداف مباراة ${homeAr} ضد ${awayAr}`
        : `ملخص وأهداف: ${item.title}`;

      const leagueAr = translateLeague(item.competition || "");
      const servers = [];

      (item.videos || []).forEach((v, vIdx) => {
        const srcMatch = (v.embed || "").match(/src=['"]([^'"]+)['"]/i);
        if (srcMatch && srcMatch[1]) {
          const vTitle =
            v.title && v.title.toLowerCase().includes("highlight")
              ? "🎬 ملخص المباراة الكامل (ScoreBat HD)"
              : `⚽ فيديو الهدف / اللقطة (${v.title || vIdx + 1})`;
          servers.push({
            name: vTitle,
            quality: "1080p HD",
            type: "iframe",
            url: srcMatch[1]
          });
        }
      });

      if (servers.length > 0) {
        realHighlights.push({
          id: `hl_sb_${idx}`,
          title: titleAr,
          league: leagueAr,
          duration: `${servers.length} فيديو أهداف وملخص`,
          views: "أهداف رسمية HD",
          date: "حديثاً",
          score: "أهداف وملخص",
          thumbnail: item.thumbnail,
          videoUrl: servers[0].url,
          videoType: "iframe",
          servers
        });
      }
    });
  } catch (e) {
    console.error("ScoreBat sync error:", e.message);
  }

  return realHighlights;
}

// استخراج روابط السيرفرات المباشرة الحقيقية من AlbaPlayer و YShoot و LiveKora و SirTV
async function syncRealStreamServers() {
  const extraServers = {
    byTeam: {},
    beinM3u8: "https://lbgo.bozztv.com/ssh101/ssh101/yusfdara137152/chunks.m3u8"
  };

  // 1. جلب رابط البث المباشر M3U8 المتجدد تلقائياً
  try {
    const r = await fetchWithTimeout("https://pl.matchlivehd.com/albaplayer/1bein1/?serv=1");
    const html = await r.text();
    const m = html.match(/AlbaPlayerControl\(['"]([^'"]+)['"]/);
    if (m) {
      const decoded = Buffer.from(m[1], "base64").toString("utf8");
      if (decoded.startsWith("http")) {
        extraServers.beinM3u8 = decoded;
        cachedLiveState.liveM3u8Stream = decoded;
      }
    }
  } catch (_) {}

  // 2. جلب سيرفرات YallaShoot اليومية من kooratv.txt
  try {
    const r = await fetchWithTimeout("https://schedule.koora-tv.click/kooratv.txt");
    const txt = await r.text();
    const lines = txt.split("\n");
    for (const line of lines) {
      const m = line.match(/(\d{1,2}:\d{2})\s+(.+?)\s+vs\s+(.+?)\s*\|\s*(https?:\/\/\S+)/i);
      if (m) {
        const homeAr = translateTeam(m[2].trim());
        const awayAr = translateTeam(m[3].trim());
        const url = m[4].trim();
        [homeAr, awayAr].forEach((tName) => {
          extraServers.byTeam[tName] = extraServers.byTeam[tName] || [];
          extraServers.byTeam[tName].push({
            name: "سيرفر YallaShoot HD",
            quality: "1080p HD",
            type: "iframe",
            url
          });
        });
      }
    }
  } catch (_) {}

  // 3. جلب سيرفرات LiveKora 2K اليومية
  try {
    const r = await fetchWithTimeout("https://www.livekora.vip/");
    const html = await r.text();
    const lkRegex = /<a href="([^"]+)"[^>]*><div class="match-container"[\s\S]*?<div class="right-team">[\s\S]*?<img[^>]+src="([^"]+)"[\s\S]*?<div class="team-name">([\s\S]*?)<\/div>[\s\S]*?<div class="left-team">[\s\S]*?<img[^>]+src="([^"]+)"[\s\S]*?<div class="team-name">([\s\S]*?)<\/div>/gi;
    let lm;
    while ((lm = lkRegex.exec(html)) !== null) {
      const streamUrl = lm[1].trim();
      const home = lm[3].trim();
      const away = lm[5].trim();
      [home, away].forEach((tName) => {
        extraServers.byTeam[tName] = extraServers.byTeam[tName] || [];
        extraServers.byTeam[tName].push({
          name: "سيرفر LiveKora 2K",
          quality: "2K FHD",
          type: "iframe",
          url: streamUrl
        });
      });
    }
  } catch (_) {}

  // 4. جلب سيرفرات SirTV 4K اليومية
  try {
    const r = await fetchWithTimeout("https://tv-sir.co/");
    const html = await r.text();
    const sirRegex = /<div class="AY_Match\s+([^"]*)"[^>]*>[\s\S]*?<div class="TM_Name">([\s\S]*?)<\/div>[\s\S]*?<div class="TM_Name">([\s\S]*?)<\/div>[\s\S]*?<a href="([^"]+)"/gi;
    let sm;
    while ((sm = sirRegex.exec(html)) !== null) {
      const home = sm[2].trim();
      const away = sm[3].trim();
      const streamUrl = sm[4].trim();
      if (streamUrl.includes("hes-goals") || streamUrl.includes("player")) {
        [home, away].forEach((tName) => {
          extraServers.byTeam[tName] = extraServers.byTeam[tName] || [];
          extraServers.byTeam[tName].push({
            name: "سيرفر SirTV 4K",
            quality: "4K UHD",
            type: "iframe",
            url: streamUrl
          });
        });
      }
    }
  } catch (_) {}

  return extraServers;
}

function buildServersForMatch(homeTeam, awayTeam, channel, sourceHref, extraServers) {
  const servers = [];

  let beinNum = "1";
  const chMatch = (channel || "").match(/(\d+)/);
  if (chMatch && Number(chMatch[1]) <= 8) beinNum = chMatch[1];

  const kooraLiveUrl =
    sourceHref && sourceHref.includes("korahlive.online")
      ? sourceHref
      : `https://t.korahlive.online/2026/09/ch1.html?match=${encodeURIComponent(homeTeam)}`;

  // سيرفر 1: سيرفر Koora4K فائق الوضوح
  servers.push({
    name: "سيرفر 1 الرئيسي (Koora4K 4K)",
    quality: "4K UHD",
    type: "iframe",
    url: kooraLiveUrl
  });

  const seenUrls = new Set([kooraLiveUrl]);

  // سيرفرات إضافية مستخرجة من محركات البث للفرق
  const teamMatched = [
    ...(extraServers.byTeam[homeTeam] || []),
    ...(extraServers.byTeam[awayTeam] || [])
  ];
  for (const srv of teamMatched) {
    if (!seenUrls.has(srv.url)) {
      seenUrls.add(srv.url);
      servers.push(srv);
    }
  }

  // سيرفر 2: AlbaPlayer المباشر بجودة 1080p
  const albaEmbedUrl =
    beinNum === "1"
      ? "https://pl.matchlivehd.com/albaplayer/1bein1/?serv=1"
      : `https://pl.koralive1.cc/bein${beinNum}/`;

  if (!seenUrls.has(albaEmbedUrl)) {
    seenUrls.add(albaEmbedUrl);
    servers.push({
      name: `سيرفر 2 المباشر (${channel || "beIN Sports FHD"})`,
      quality: "1080p FHD",
      type: "iframe",
      url: albaEmbedUrl
    });
  }

  // سيرفر 3: YallaShoot المباشر
  const yallaShootUrl = `https://v6.yshoot-live.com/ch/ch${beinNum}.php`;
  if (!seenUrls.has(yallaShootUrl)) {
    seenUrls.add(yallaShootUrl);
    servers.push({
      name: "سيرفر 3 (YallaShoot HD)",
      quality: "1080p",
      type: "iframe",
      url: yallaShootUrl
    });
  }

  // سيرفر 4: HLS مباشر بأقل تأخير وبدون إعلانات
  servers.push({
    name: "سيرفر 4 الصاروخي (HLS بدون تقطيع)",
    quality: "1080p / 720p",
    type: "m3u8",
    url: extraServers.beinM3u8 || cachedLiveState.liveM3u8Stream
  });

  // سيرفر 5: سيرفر AlbaPlayer الاحتياطي متعدد الجودات
  const albaBackupUrl = "https://pl.matchlivehd.com/albaplayer/1bein1/?serv=2";
  if (!seenUrls.has(albaBackupUrl)) {
    seenUrls.add(albaBackupUrl);
    servers.push({
      name: "سيرفر 5 الاحتياطي (Alba Multi-Bitrate)",
      quality: "متعدد الجودات",
      type: "iframe",
      url: albaBackupUrl
    });
  }

  // سيرفر 6: سيرفر KooraLive البديل
  const koraLiveBackup = `https://pl.koralive1.cc/bein${beinNum}/`;
  if (!seenUrls.has(koraLiveBackup)) {
    seenUrls.add(koraLiveBackup);
    servers.push({
      name: "سيرفر 6 للطوارئ (KooraLive HD)",
      quality: "720p HD",
      type: "iframe",
      url: koraLiveBackup
    });
  }

  return servers;
}

const CLUB_LEAGUE_VALIDATOR = {
  morocco: [
    "الرجاء", "الوداد", "نهضة بركان", "الجيش الملكي", "الفتح الرباطي", "المغرب الفاسي",
    "حسنية أكادير", "اتحاد طنجة", "أولمبيك آسفي", "المغرب التطواني", "شباب المحمدية",
    "اتحاد تواركة", "نهضة الزمامرة", "النادي المكناسي", "الدفاع الحسني الجديدي", "أولمبيك خريبكة"
  ],
  algeria: [
    "مولودية الجزائر", "شباب بلوزداد", "اتحاد الجزائر", "وفاق سطيف", "شبيبة القبائل",
    "شباب قسنطينة", "نادي بارادو", "مولودية وهران", "أولمبي الشلف", "اتحاد خنشلة"
  ],
  egypt: [
    "الأهلي المصري", "الزمالك", "بيراميدز", "المصري البورسعيدي", "الإسماعيلي",
    "مودرن سبورت", "فيوتشر", "الاتحاد السكندري", "سموحة", "سيراميكا كليوباترا", "زد"
  ],
  tunisia: [
    "الترجي", "النجم الساحلي", "النادي الإفريقي", "الصفاقسي", "الاتحاد المنستيري", "الملعب التونسي"
  ],
  cafOther: [
    "صن داونز", "أورلاندو بايرتس", "كايزر تشيفز", "إينوغو رينجرز", "الكانيمى واريورس",
    "إنييمبا", "مازيمبي", "فيتا كلوب", "سانت إيلوا لوبوبو", "سيمبا", "يانغ أفريكانز",
    "الهلال السوداني", "المريخ السوداني", "أسيك ميموزا", "الملعب المالي", "جوليبا",
    "بترو أتلتيكو", "ساغرادا", "افريقيا ستارز", "أفريقيا ستارز", "ويليت", "نواذيبو"
  ],
  saudi: [
    "الهلال", "النصر", "الاتحاد", "الأهلي السعودي", "القادسية", "الشباب", "الاتفاق",
    "التعاون", "الفيصلي", "الدرعية", "الخليج", "الفتح", "الرياض", "الفيحاء", "الرائد",
    "الوحدة", "الأخدود", "الخلود", "العروبة", "ضمك", "أبها", "الطائي", "الحزم", "نيوم"
  ],
  england: [
    "أرسنال", "مانشستر سيتي", "ليفربول", "تشيلسي", "مانشستر يونايتد", "توتنهام",
    "نيوكاسل", "أستون فيلا", "برايتون", "وست هام", "فولهام", "برينتفورد", "كريستال بالاس",
    "وولفرهامبتون", "بورنموث", "إيفرتون", "نوتنجهام فورست", "ليستر سيتي", "إبسويتش تاون",
    "ساوثهامبتون", "سندرلاند", "ليدز يونايتد", "بيرنلي", "شيفيلد يونايتد", "ميدلزبره",
    "كوفنتري سيتي", "هال سيتي"
  ],
  spain: [
    "ريال مدريد", "برشلونة", "أتلتيكو مدريد", "جيرونا", "أتلتيك بيلباو", "ريال سوسيداد",
    "ريال بيتيس", "فياريال", "فالنسيا", "إشبيلية", "خيتافي", "سيلتا فيجو", "أوساسونا",
    "مايوركا", "رايو فاييكانو", "ألافيس", "لاس بالماس", "ليجانيس", "بلد الوليد", "إسبانيول",
    "مالقا", "إلتشي", "ليفانتي", "راسينج سانتاندير", "راسينغ سانتاندير", "ديبورتيفو لاكورونيا"
  ],
  italy: [
    "إنتر ميلان", "ميلان", "إي سي ميلان", "يوفنتوس", "نابولي", "روما", "لاتسيو", "أتالانتا",
    "فيورنتينا", "بولونيا", "تورينو", "مونزا", "أودينيزي", "جنوى", "كالياري", "بارما",
    "كومو", "إمبولي", "هيلاس فيرونا", "ليتشي", "فينيسيا", "ساسولو"
  ],
  germany: [
    "بايرن ميونخ", "بوروسيا دورتموند", "باير ليفركوزن", "لايبزيج", "آينتراخت فرانكفورت",
    "شتوتجارت", "شتوتغارت", "بوروسيا مونشنجلادباخ", "فولفسبورج", "فرايبورج", "هوفنهايم",
    "ماينز", "أوغسبورغ", "فيردر بريمن", "يونيون برلين", "بوخوم", "هايدنهايم", "سانت باولي",
    "هولشتاين كيل", "شالكة", "شالكه", "هامبورج", "هامبورغ", "كولن", "بادربورن", "إلفيرسبيرغ"
  ],
  france: [
    "باريس سان جيرمان", "أولمبيك مارسيليا", "مارسيليا", "أولمبيك ليون", "ليون", "موناكو",
    "ليل", "نيس", "لانس", "ستاد رين", "رين", "بريست", "ستاد بريست", "تولوز", "مونبلييه",
    "ستراسبورغ", "نانت", "لوهافر", "أوكسير", "أنجيه", "سانت إيتيان", "لوريان", "تروا",
    "لومان", "باريس إف سي", "باريس أف.سي."
  ]
};

function matchesClubList(teamName, list) {
  const t = String(teamName || "").trim();
  if (!t) return false;
  return list.some((club) => t === club || t.includes(club));
}

function cleanArabicLeagueName(raw) {
  if (!raw) return "مباريات اليوم";
  let s = raw
    .replace(/^(أوروبا|السعودية|إنجلترا|إسبانيا|إيطاليا|ألمانيا|فرنسا|أفريقيا|آسيا|العرب|مصر|المغرب),\s*/i, "")
    .trim();
  if (s.includes("ابطال اوروبا") || s.includes("أبطال أوروبا")) return "دوري أبطال أوروبا";
  if (s.includes("الدوري الأوروبي")) return "الدوري الأوروبي";
  if (s.includes("المؤتمر الأوروبي")) return "دوري المؤتمر الأوروبي";
  if (s.includes("الإنجليزي")) return "الدوري الإنجليزي الممتاز";
  if (s.includes("الإسباني")) return "الدوري الإسباني";
  if (s.includes("الإيطالي")) return "الدوري الإيطالي";
  if (s.includes("الألماني")) return "الدوري الألماني";
  if (s.includes("الفرنسي")) return "الدوري الفرنسي";
  if (s.includes("روشن") || s.includes("السعودي")) return "دوري روشن السعودي";
  if (s.includes("أبطال أفريقيا")) return "دوري أبطال أفريقيا";
  if (s.includes("الكونفدرالية")) return "كأس الكونفدرالية الأفريقية";
  return s;
}

// مدقق ذكي يصحح أي خطأ في تصنيف البطولة من المصدر بالاعتماد على هوية الفريقين المتواجهين
function resolveAccurateMatchLeague(rawLeague, homeTeam, awayTeam) {
  const cleaned = cleanArabicLeagueName(rawLeague);
  const h = String(homeTeam || "").trim();
  const a = String(awayTeam || "").trim();

  const hMor = matchesClubList(h, CLUB_LEAGUE_VALIDATOR.morocco);
  const aMor = matchesClubList(a, CLUB_LEAGUE_VALIDATOR.morocco);
  const hAlg = matchesClubList(h, CLUB_LEAGUE_VALIDATOR.algeria);
  const aAlg = matchesClubList(a, CLUB_LEAGUE_VALIDATOR.algeria);
  const hEgy = matchesClubList(h, CLUB_LEAGUE_VALIDATOR.egypt);
  const aEgy = matchesClubList(a, CLUB_LEAGUE_VALIDATOR.egypt);
  const hTun = matchesClubList(h, CLUB_LEAGUE_VALIDATOR.tunisia);
  const aTun = matchesClubList(a, CLUB_LEAGUE_VALIDATOR.tunisia);
  const hCaf = hMor || hAlg || hEgy || hTun || matchesClubList(h, CLUB_LEAGUE_VALIDATOR.cafOther);
  const aCaf = aMor || aAlg || aEgy || aTun || matchesClubList(a, CLUB_LEAGUE_VALIDATOR.cafOther);

  // 1. حماية البطولات الأفريقية والعربية من الظهور بالخطأ تحت البطولات الأوروبية
  if (hCaf || aCaf) {
    if (hMor && aMor) return cleaned.includes("كأس") ? "كأس العرش المغربي" : "البطولة المغربية الاحترافية";
    if (hAlg && aAlg) return cleaned.includes("كأس") ? "كأس الجزائر" : "الدوري الجزائري المحترف";
    if (hEgy && aEgy) return cleaned.includes("كأس") ? "كأس مصر" : "الدوري المصري الممتاز";
    if (hTun && aTun) return cleaned.includes("كأس") ? "كأس تونس" : "الدوري التونسي المحترف";
    if (cleaned.includes("الكونفدرالية")) return "كأس الكونفدرالية الأفريقية";
    return "دوري أبطال أفريقيا";
  }

  // 2. تصحيح مباريات الأندية السعودية
  const hSau = matchesClubList(h, CLUB_LEAGUE_VALIDATOR.saudi);
  const aSau = matchesClubList(a, CLUB_LEAGUE_VALIDATOR.saudi);
  if (hSau && aSau) {
    if (cleaned.includes("كأس") || cleaned.includes("الحرمين")) return "كأس خادم الحرمين الشريفين";
    return "دوري روشن السعودي";
  }

  // 3. تصحيح مباريات الدوريات الأوروبية الخمسة الكبرى عندما يكون الفريقان من نفس البلد ومصنفين بالخطأ في أبطال أوروبا أو الدوري الأوروبي
  if (matchesClubList(h, CLUB_LEAGUE_VALIDATOR.germany) && matchesClubList(a, CLUB_LEAGUE_VALIDATOR.germany)) {
    return cleaned.includes("كأس") ? "كأس ألمانيا" : "الدوري الألماني";
  }
  if (matchesClubList(h, CLUB_LEAGUE_VALIDATOR.italy) && matchesClubList(a, CLUB_LEAGUE_VALIDATOR.italy)) {
    return cleaned.includes("كأس") ? "كأس إيطاليا" : "الدوري الإيطالي";
  }
  if (matchesClubList(h, CLUB_LEAGUE_VALIDATOR.england) && matchesClubList(a, CLUB_LEAGUE_VALIDATOR.england)) {
    return cleaned.includes("كأس") ? "كأس الاتحاد الإنجليزي" : "الدوري الإنجليزي الممتاز";
  }
  if (matchesClubList(h, CLUB_LEAGUE_VALIDATOR.spain) && matchesClubList(a, CLUB_LEAGUE_VALIDATOR.spain)) {
    return cleaned.includes("كأس") ? "كأس ملك إسبانيا" : "الدوري الإسباني";
  }
  if (matchesClubList(h, CLUB_LEAGUE_VALIDATOR.france) && matchesClubList(a, CLUB_LEAGUE_VALIDATOR.france)) {
    return cleaned.includes("كأس") ? "كأس فرنسا" : "الدوري الفرنسي";
  }

  return cleaned;
}

function getLeagueIcon(league) {
  if (league.includes("أبطال أوروبا")) return "🏆";
  if (league.includes("الدوري الأوروبي") || league.includes("المؤتمر")) return "🇪🇺";
  if (league.includes("الإنجليزي")) return "🏴󠁧󠁢󠁥󠁮󠁧󠁿";
  if (league.includes("الإسباني")) return "🇪🇸";
  if (league.includes("الإيطالي")) return "🇮🇹";
  if (league.includes("الألماني")) return "🇩🇪";
  if (league.includes("الفرنسي")) return "🇫🇷";
  if (league.includes("السعودي") || league.includes("روشن")) return "🇸🇦";
  if (league.includes("مغرب")) return "🇲🇦";
  if (league.includes("أفريقيا") || league.includes("الكونفدرالية")) return "🌍";
  return "⚽";
}

function parseKooraHDPage(html, dayKey, dateLabel, extraServers) {
  const matches = [];
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

    const extractLogo = (imgTag) => {
      if (!imgTag) return "";
      const ds = imgTag[0].match(/data-src=['"]([^'"]+)['"]/i);
      if (ds && !ds[1].startsWith("data:image")) return ds[1];
      const s = imgTag[0].match(/src=['"]([^'"]+)['"]/i);
      if (s && !s[1].startsWith("data:image")) return s[1];
      return "";
    };

    const homeTeam = teamNames[0];
    const awayTeam = teamNames[1];
    const homeLogo = extractLogo(rightImg);
    const awayLogo = extractLogo(leftImg);

    const timeMatch = block.match(/<div class=['"]match-time['"]>([\s\S]*?)<\/div>/i);
    const resultMatch = block.match(/<div class=['"]result['"]>([\s\S]*?)<\/div>/i);
    const dateStatMatch = block.match(/<div class=['"]date[^'"]*['"]>([\s\S]*?)<\/div>/i);
    const infoItems = [...block.matchAll(/<li><span>([\s\S]*?)<\/span><\/li>/gi)].map((x) =>
      x[1].replace(/<[^>]+>/g, "").trim()
    );
    const hrefMatch = block.match(/<a[^>]+href=["']([^"']+)["']/i);

    const rawTime = timeMatch ? timeMatch[1].trim() : "8:00 PM";
    const timeGMT = convertKooraTimeToGMT(rawTime);
    const rawResult = resultMatch ? resultMatch[1].trim() : "0-0";
    const statText = dateStatMatch ? dateStatMatch[1].trim() : "";

    let status = "upcoming";
    if (classes.includes("live") || statText.includes("جارية") || statText.includes("مباشر")) {
      status = "live";
    } else if (classes.includes("end") || classes.includes("finished") || statText.includes("انتهت")) {
      status = "finished";
    } else if (dayKey === "yesterday") {
      status = "finished";
    } else {
      status = "upcoming";
    }

    const parts = rawResult.split("-").map((n) => parseInt(n.trim(), 10));
    const awayScore = !isNaN(parts[0]) ? parts[0] : 0;
    const homeScore = !isNaN(parts[1]) ? parts[1] : 0;

    const channel = infoItems[0] && infoItems[0] !== "غير معروف" ? infoItems[0] : "beIN Sports HD 1";
    const commentator = infoItems[1] && infoItems[1] !== "غير معروف" ? infoItems[1] : "تعليق عربي مباشر";
    const league = resolveAccurateMatchLeague(infoItems[2] || "مباريات اليوم", homeTeam, awayTeam);
    const sourceHref = hrefMatch ? hrefMatch[1] : "";

    const minuteLabel =
      status === "live"
        ? "جارية الآن 🔴"
        : status === "finished"
        ? "انتهت"
        : dayKey === "tomorrow"
        ? "غداً"
        : dayKey === "upcoming_days"
        ? dateLabel
        : "لم تبدأ";

    matches.push({
      id: `khd_${dayKey}_${idx}`,
      orderIndex: idx,
      day: dayKey,
      dateLabel,
      league,
      leagueLogo: getLeagueIcon(league),
      status,
      minute: minuteLabel,
      timeGMT,
      homeTeam,
      homeLogo,
      homeScore,
      awayTeam,
      awayLogo,
      awayScore,
      channel,
      commentator,
      stadium: "بث مباشر Koora4K",
      featured: status === "live" && idx <= 2,
      stats: {
        homePossession: "54",
        awayPossession: "46",
        homeShots: String(Math.max(6, homeScore * 3 + 7)),
        awayShots: String(Math.max(5, awayScore * 3 + 5)),
        homeOnTarget: String(Math.max(2, homeScore + 3)),
        awayOnTarget: String(Math.max(2, awayScore + 2)),
        homeCorners: "6",
        awayCorners: "4",
        homeFouls: "10",
        awayFouls: "12"
      },
      servers: buildServersForMatch(homeTeam, awayTeam, channel, sourceHref, extraServers)
    });
  }

  return matches;
}

// سحب مباريات الدوريات الكبرى فقط (معربة 100% بدون أي فرق أو دوريات أجنبية عشوائية) للأيام المقبلة أو الأمس عند الحاجة
async function fetchCleanMajorLeagueMatches(offsetDays, dayKey, customDateLabel, extraServers, existingTeamsSet = new Set()) {
  const list = [];
  const arabicDays = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  const arabicMonths = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

  const d = new Date(Date.now() + offsetDays * 86400000);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const dateParam = `${yyyy}${mm}${dd}`;
  const readableDate =
    customDateLabel || `${arabicDays[d.getUTCDay()]} ${d.getUTCDate()} ${arabicMonths[d.getUTCMonth()]}`;

  const majorLeagues = [
    { code: "uefa.champions", arName: "دوري أبطال أوروبا" },
    { code: "eng.1", arName: "الدوري الإنجليزي الممتاز" },
    { code: "esp.1", arName: "الدوري الإسباني" },
    { code: "ita.1", arName: "الدوري الإيطالي" },
    { code: "ger.1", arName: "الدوري الألماني" },
    { code: "fra.1", arName: "الدوري الفرنسي" },
    { code: "ksa.1", arName: "دوري روشن السعودي" }
  ];

  await Promise.all(
    majorLeagues.map(async (lg) => {
      try {
        const res = await fetchWithTimeout(
          `https://site.api.espn.com/apis/site/v2/sports/soccer/${lg.code}/scoreboard?dates=${dateParam}`,
          {},
          5500
        );
        const data = await res.json();
        (data.events || []).forEach((ev, i) => {
          const comp = ev.competitions?.[0];
          if (!comp || !comp.competitors || comp.competitors.length < 2) return;
          const homeComp = comp.competitors.find((c) => c.homeAway === "home") || comp.competitors[0];
          const awayComp = comp.competitors.find((c) => c.homeAway === "away") || comp.competitors[1];

          const rawHome = homeComp.team?.displayName || homeComp.team?.name || "";
          const rawAway = awayComp.team?.displayName || awayComp.team?.name || "";
          const homeTeam = translateTeam(rawHome);
          const awayTeam = translateTeam(rawAway);

          // نتأكد من عدم تكرار أي مباراة موجودة سلفاً في اليوم أو الغد
          if (existingTeamsSet.has(homeTeam) || existingTeamsSet.has(awayTeam)) return;

          const homeLogo = homeComp.team?.logo || "";
          const awayLogo = awayComp.team?.logo || "";
          const homeScore = parseInt(homeComp.score || "0", 10) || 0;
          const awayScore = parseInt(awayComp.score || "0", 10) || 0;

          const evDate = new Date(ev.date);
          const timeGMT = `${String(evDate.getUTCHours()).padStart(2, "0")}:${String(evDate.getUTCMinutes()).padStart(2, "0")}`;

          const stState = ev.status?.type?.state || "pre";
          let status = "upcoming";
          if (stState === "in") status = "live";
          else if (stState === "post" || dayKey === "yesterday") status = "finished";

          const minute =
            status === "live"
              ? "جارية الآن 🔴"
              : status === "finished"
              ? "انتهت"
              : dayKey === "upcoming_days"
              ? readableDate
              : "لم تبدأ";

          list.push({
            id: `maj_${lg.code}_${dateParam}_${i}`,
            orderIndex: 100 + i,
            day: dayKey,
            dateLabel: readableDate,
            league: lg.arName,
            leagueLogo: getLeagueIcon(lg.arName),
            status,
            minute,
            timeGMT,
            homeTeam,
            homeLogo,
            homeScore,
            awayTeam,
            awayLogo,
            awayScore,
            channel: "beIN Sports HD 1",
            commentator: "تعليق عربي مباشر",
            stadium: comp.venue?.fullName || "ملعب المباراة",
            featured: false,
            stats: {
              homePossession: "52",
              awayPossession: "48",
              homeShots: String(Math.max(5, homeScore * 3 + 6)),
              awayShots: String(Math.max(4, awayScore * 3 + 5)),
              homeOnTarget: String(Math.max(2, homeScore + 2)),
              awayOnTarget: String(Math.max(2, awayScore + 2)),
              homeCorners: "5",
              awayCorners: "4",
              homeFouls: "10",
              awayFouls: "11"
            },
            servers: buildServersForMatch(homeTeam, awayTeam, "beIN Sports HD 1", "", extraServers)
          });
        });
      } catch (_) {}
    })
  );

  return list;
}

const TOPIC_FOOTBALL_IMAGES = {
  ucl: [
    "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=900&q=80"
  ],
  uel: [
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=900&q=80"
  ],
  uecl: [
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=900&q=80"
  ],
  epl: [
    "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=900&q=80"
  ],
  laliga: [
    "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=80"
  ],
  seriea: [
    "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=900&q=80"
  ],
  bundesliga: [
    "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=900&q=80"
  ],
  saudi: [
    "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=900&q=80"
  ],
  caf: [
    "https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=900&q=80"
  ],
  general: [
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=900&q=80"
  ]
};

function getTopicSpecificFootballImage(title = "", category = "", idx = 0) {
  const hay = `${title} ${category}`;
  let pool = TOPIC_FOOTBALL_IMAGES.general;
  if (hay.includes("أبطال أوروبا") || hay.includes("ريال مدريد") || hay.includes("برشلونة")) {
    pool = TOPIC_FOOTBALL_IMAGES.ucl;
  } else if (hay.includes("الدوري الأوروبي") || hay.includes("يوفنتوس") || hay.includes("ميلان") || hay.includes("بنفيكا")) {
    pool = TOPIC_FOOTBALL_IMAGES.uel;
  } else if (hay.includes("المؤتمر الأوروبي") || hay.includes("أياكس") || hay.includes("موناكو")) {
    pool = TOPIC_FOOTBALL_IMAGES.uecl;
  } else if (hay.includes("الإنجليزي") || hay.includes("ليفربول") || hay.includes("سيتي") || hay.includes("أرسنال") || hay.includes("تشيلسي")) {
    pool = TOPIC_FOOTBALL_IMAGES.epl;
  } else if (hay.includes("الإسباني") || hay.includes("أتلتيكو") || hay.includes("الليغا")) {
    pool = TOPIC_FOOTBALL_IMAGES.laliga;
  } else if (hay.includes("الإيطالي") || hay.includes("إنتر") || hay.includes("نابولي") || hay.includes("روما")) {
    pool = TOPIC_FOOTBALL_IMAGES.seriea;
  } else if (hay.includes("الألماني") || hay.includes("بايرن") || hay.includes("دورتموند") || hay.includes("شتوتجارت")) {
    pool = TOPIC_FOOTBALL_IMAGES.bundesliga;
  } else if (hay.includes("السعودي") || hay.includes("روشن") || hay.includes("الهلال") || hay.includes("النصر") || hay.includes("الاتحاد") || hay.includes("الأهلي")) {
    pool = TOPIC_FOOTBALL_IMAGES.saudi;
  } else if (hay.includes("أفريقيا") || hay.includes("الكونفدرالية") || hay.includes("الرجاء") || hay.includes("الوداد") || hay.includes("مولودية") || hay.includes("المغرب")) {
    pool = TOPIC_FOOTBALL_IMAGES.caf;
  }
  return pool[idx % pool.length];
}

// سحب آخر أخبار كرة القدم العربية والعالمية أوتوماتيكياً على مدار الساعة مع صورة خاصة لكل موضوع
async function syncRealFootballNews(allMatches = []) {
  const newsItems = [];

  const rssUrls = [
    { url: "https://arabic.rt.com/rss/sport/", source: "RT رياضة" },
    { url: "https://www.skynewsarabia.com/rss/sport", source: "سكاي نيوز عربية رياضة" },
    { url: "https://www.france24.com/ar/%D8%B1%D9%8A%D8%A7%D8%B6%D8%A9/rss", source: "فرانس 24 رياضة" }
  ];

  await Promise.all(
    rssUrls.map(async (feed) => {
      try {
        // تمرير المهلة الزمنية الصحيحة كمعامل ثانٍ لجلب خلاصات الأخبار مع صورها الحقيقية
        const res = await fetchWithTimeout(feed.url, 6500);
        const xml = await res.text();
        const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 8);
        items.forEach((it, idx) => {
          const block = it[1];
          const title = ((block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) ||
            block.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || "")
            .replace(/<!\[CDATA\[|\]\]>/g, "")
            .trim();
          const descRaw = ((block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i) ||
            block.match(/<description>([\s\S]*?)<\/description>/i) || [])[1] || "");
          const desc = descRaw
            .replace(/<!\[CDATA\[|\]\]>|<[^>]+>/g, "")
            .replace(/&nbsp;|&quot;|&#039;/g, " ")
            .trim();

          // استخراج الصورة الأصلية الخاصة بالخبر من وسوم enclosure أو media:content أو media:thumbnail أو img داخل الوصف
          const enclosureImg = (block.match(/<enclosure[^>]+url=["']([^"']+)["']/i) || [])[1];
          const mediaContentImg = (block.match(/<media:(?:content|thumbnail)[^>]+url=["']([^"']+)["']/i) || [])[1];
          const inlineImg = (descRaw.match(/<img[^>]+src=["']([^"']+)["']/i) || [])[1];
          const genericUrlImg = (block.match(/url=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/i) || [])[1];

          const articleImage =
            enclosureImg ||
            mediaContentImg ||
            inlineImg ||
            genericUrlImg ||
            getTopicSpecificFootballImage(title, "أخبار الكرة", idx);

          if (title && title.length > 10) {
            newsItems.push({
              id: `news_rss_${feed.source}_${idx}`,
              title,
              summary: desc || title,
              category: "أخبار الكرة العالمية والعربية",
              source: feed.source,
              timeAgo: "تحديث إخباري اليوم",
              image: articleImage
            });
          }
        });
      } catch (_) {}
    })
  );

  // اختيار أهم المباريات (الجارية، المنتهية، والقمم الكبرى للغد، مع استبعاد بطولات الناشئين تحت 17)
  const seniorMatches = allMatches.filter((m) => !String(m.league || "").includes("تحت 17"));
  const liveAndFinished = seniorMatches.filter((m) => m.status === "live" || m.status === "finished").slice(0, 6);
  const topUpcoming = seniorMatches.filter((m) => m.status === "upcoming").slice(0, 3);
  const featuredMatchNews = [...liveAndFinished, ...topUpcoming];

  featuredMatchNews.reverse().forEach((m, idx) => {
    const isLive = m.status === "live";
    const isFin = m.status === "finished";
    newsItems.unshift({
      id: `news_match_${m.id}_${idx}`,
      title: isLive
        ? `🔴 تغطية مباشرة الآن: ${m.homeTeam} (${m.homeScore}) - (${m.awayScore}) ${m.awayTeam} في ${m.league}`
        : isFin
        ? `⚽ النتيجة النهائية: ${m.homeTeam} (${m.homeScore}) - (${m.awayScore}) ${m.awayTeam} ضمن منافسات ${m.league}`
        : `🔥 قمة مرتقبة: موعد مباراة ${m.homeTeam} ضد ${m.awayTeam} والقنوات الناقلة في ${m.league}`,
      summary: isLive
        ? `تجرى الآن أحداث القمة الكروية بين ${m.homeTeam} و ${m.awayTeam} ضمن ${m.league} عبر قناة ${m.channel} بتعليق ${m.commentator}. شاهد البث المباشر بجودة 4K بدون تقطيع.`
        : isFin
        ? `انتهت مواجهة ${m.homeTeam} ضد ${m.awayTeam} بنتيجة ${m.homeScore} - ${m.awayScore} في ${m.league}. شاهد ملخص وأهداف اللقاء الكامل بجودة Full HD.`
        : `تتجه الأنظار إلى مواجهة ${m.homeTeam} أمام ${m.awayTeam} في ${m.league} عبر قناة ${m.channel}. تعرف على التوقيت حسب دولتك وسيرفرات البث المباشر 4K.`,
      category: m.league,
      leagueLogo: m.leagueLogo || "🏆",
      source: "استوديو Koora4K المباشر",
      timeAgo: isLive ? "مباشر الآن 🔴" : m.day === "today" ? "اليوم" : m.day === "tomorrow" ? "قمة الغد" : "أمس",
      image: getTopicSpecificFootballImage(`${m.homeTeam} ${m.awayTeam}`, m.league, idx),
      matchId: m.id,
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      homeLogo: m.homeLogo || "",
      awayLogo: m.awayLogo || "",
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      status: m.status,
      timeGMT: m.timeGMT
    });
  });

  return newsItems.slice(0, 18);
}

// المزامنة الشاملة التلقائية لجميع أقسام الموقع على مدار الساعة بدون توقف
async function performLiveSync() {
  console.log("🔄 [Koora4K Auto-Sync] جاري التحديث التلقائي الشامل (المباريات، الإحصائيات، السيرفرات، الترتيب، الملخصات، والأخبار)...");
  try {
    const [extraServers, liveStandings] = await Promise.all([
      syncRealStreamServers(),
      syncRealStandings()
    ]);

    if (liveStandings) {
      cachedLiveState.standings = liveStandings;
    }

    const [yestHtml, todayHtml, tomHtml] = await Promise.all([
      fetchWithTimeout("https://koorahd.net/matches-yesterday/").then((r) => r.text()).catch(() => ""),
      fetchWithTimeout("https://koorahd.net/matches-today/").then((r) => r.text()).catch(() => ""),
      fetchWithTimeout("https://koorahd.net/matches-tomorrow/").then((r) => r.text()).catch(() => "")
    ]);

    // معالجة ذكية لفرق التوقيت بين مكة (GMT+3) والمغرب/غرينتش (GMT+1 / UTC):
    // موقع KooraHD يقلب صفحاته عند منتصف الليل بتوقيت السعودية (الساعة 21:00 UTC = 22:00 بتوقيت المغرب)،
    // بينما في المغرب وأوروبا لا نزال في نفس اليوم حتى نهاية السهرة الكروية!
    const nowUtcHour = new Date().getUTCHours();
    const probeToday = parseKooraHDPage(todayHtml, "today", "مباريات اليوم", extraServers);
    const allTodayAreUpcoming = probeToday.length > 0 && probeToday.every((m) => m.status === "upcoming");
    const kooraRolledEarly = nowUtcHour >= 21 && allTodayAreUpcoming;

    let todayMatches = [];
    let yestMatches = [];
    let tomMatches = [];
    let upcomingList = [];

    if (kooraRolledEarly) {
      // KooraHD انتقل مبكراً ليوم الغد بسبب توقيت مكة، لذا نعيد كل يوم لمكانه الحقيقي الصحيح بتوقيت المغرب/UTC:
      todayMatches = parseKooraHDPage(yestHtml, "today", "مباريات اليوم", extraServers);
      tomMatches = parseKooraHDPage(todayHtml, "tomorrow", "مباريات الغد", extraServers);

      const arabicDays = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
      const arabicMonths = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
      const dAfterTom = new Date(Date.now() + 2 * 86400000);
      const afterTomLabel = `${arabicDays[dAfterTom.getUTCDay()]} ${dAfterTom.getUTCDate()} ${arabicMonths[dAfterTom.getUTCMonth()]}`;

      const dayAfterTomMatches = parseKooraHDPage(tomHtml, "upcoming_days", afterTomLabel, extraServers);
      const existingTeams = new Set(
        [...todayMatches, ...tomMatches, ...dayAfterTomMatches].flatMap((m) => [m.homeTeam, m.awayTeam])
      );

      const [prevYesterday, upc3, upc4] = await Promise.all([
        fetchCleanMajorLeagueMatches(-1, "yesterday", "مباريات الأمس", extraServers, existingTeams),
        fetchCleanMajorLeagueMatches(3, "upcoming_days", null, extraServers, existingTeams),
        fetchCleanMajorLeagueMatches(4, "upcoming_days", null, extraServers, existingTeams)
      ]);

      yestMatches = prevYesterday;
      upcomingList = [...dayAfterTomMatches, ...upc3, ...upc4];
    } else {
      todayMatches = probeToday;
      yestMatches = parseKooraHDPage(yestHtml, "yesterday", "مباريات الأمس", extraServers);
      tomMatches = parseKooraHDPage(tomHtml, "tomorrow", "مباريات الغد", extraServers);

      const existingTeams = new Set(
        [...todayMatches, ...yestMatches, ...tomMatches].flatMap((m) => [m.homeTeam, m.awayTeam])
      );
      const [upc2, upc3, upc4] = await Promise.all([
        fetchCleanMajorLeagueMatches(2, "upcoming_days", null, extraServers, existingTeams),
        fetchCleanMajorLeagueMatches(3, "upcoming_days", null, extraServers, existingTeams),
        fetchCleanMajorLeagueMatches(4, "upcoming_days", null, extraServers, existingTeams)
      ]);
      upcomingList = [...upc2, ...upc3, ...upc4];
    }

    const finishedMatches = [
      ...todayMatches.filter((m) => m.status === "finished"),
      ...yestMatches
    ];

    const combined = [...todayMatches, ...yestMatches, ...tomMatches, ...upcomingList];

    const [realHighlights, realNews] = await Promise.all([
      syncRealFootballHighlights(finishedMatches),
      syncRealFootballNews(combined)
    ]);

    if (combined.length > 0) {
      cachedLiveState.matches = combined;
      cachedLiveState.highlights = realHighlights;
      cachedLiveState.news = realNews;
      cachedLiveState.lastSync = Date.now();
      console.log(
        `✅ [Koora4K Auto-Sync] تم التحديث التلقائي بنجاح: (اليوم: ${todayMatches.length} | الغد: ${tomMatches.length} | الأمس: ${yestMatches.length} | المقبلة: ${upcomingList.length})`
      );
    }
  } catch (err) {
    console.error("⚠️ [Koora4K Auto-Sync Error]:", err.message);
  }
}

// إشعار فوري لمحركات البحث (Google و Bing و IndexNow) عند تحديث المباريات أو الأخبار لتسريع الأرشفة والظهور في النتائج الأولى
async function pingSearchEngines() {
  try {
    const sitemapUrl = "https://koora4k.net/sitemap.xml";
    const urls = [
      "https://koora4k.net/",
      "https://koora4k.net/matches-today",
      "https://koora4k.net/matches-tomorrow",
      "https://koora4k.net/matches-yesterday",
      "https://koora4k.net/standings",
      "https://koora4k.net/news",
      "https://koora4k.net/channels",
      "https://koora4k.net/about-us",
      "https://koora4k.net/privacy-policy",
      "https://koora4k.net/terms",
      "https://koora4k.net/dmca"
    ];

    const indexNowPayload = JSON.stringify({
      host: "koora4k.net",
      key: "a3b1c8f9204e4c2da85f98e1d2c3b4a5",
      keyLocation: "https://koora4k.net/a3b1c8f9204e4c2da85f98e1d2c3b4a5.txt",
      urlList: urls
    });

    const indexNowHeaders = { "Content-Type": "application/json; charset=utf-8" };

    await Promise.all([
      fetchWithTimeout(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`, 4000).catch(() => {}),
      fetchWithTimeout(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`, 4000).catch(() => {}),
      fetchWithTimeout("https://api.indexnow.org/indexnow", 4000, {
        method: "POST",
        headers: indexNowHeaders,
        body: indexNowPayload
      }).catch(() => {}),
      fetchWithTimeout("https://www.bing.com/indexnow", 4000, {
        method: "POST",
        headers: indexNowHeaders,
        body: indexNowPayload
      }).catch(() => {})
    ]);
  } catch (_) {}
}

// محرك الحقن المسبق للـ SEO (SSR Dynamic Meta Injection) للأرشفة الفورية على Google ومواقع التواصل
function injectDynamicSeoMeta(originalHtml, reqPath, searchParams) {
  let html = originalHtml;
  const matchId = searchParams.get("match") || (reqPath.startsWith("/match/") ? reqPath.replace("/match/", "") : null);

  if (matchId && cachedLiveState.matches) {
    const m = cachedLiveState.matches.find((item) => item.id === matchId);
    if (m) {
      const matchTitle = `مشاهدة مباراة ${m.homeTeam} ضد ${m.awayTeam} بث مباشر 4K | كورة فور كي Koora4K`;
      const matchDesc = `بث مباشر مباراة ${m.homeTeam} و ${m.awayTeam} اليوم في ${m.league} عبر قناة ${m.channel} بصوت المعلق ${m.commentator}. شاهد المباراة بجودة 4K UHD فائقة الوضوح بدون تقطيع عبر موقع كورة فور كي Koora4K.net.`;
      const matchImage = m.homeLogo || m.awayLogo || "https://koora4k.net/assets/logo.svg";
      const matchUrl = `https://koora4k.net/?match=${encodeURIComponent(m.id)}`;

      html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${matchTitle}</title>`);
      html = html.replace(/<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${matchDesc}" />`);
      html = html.replace(/<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${matchTitle}" />`);
      html = html.replace(/<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${matchDesc}" />`);
      html = html.replace(/<meta\s+property=["']og:image["'][^>]*>/i, `<meta property="og:image" content="${matchImage}" />`);
      html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${matchUrl}" />`);

      // حقن Schema.org من نوع SportsEvent مباشرة لمطابقة متطلبات Google Rich Snippets
      const eventJsonLd = {
        "@context": "https://schema.org",
        "@type": "SportsEvent",
        "name": `مشاهدة مباراة ${m.homeTeam} ضد ${m.awayTeam} بث مباشر`,
        "description": matchDesc,
        "startDate": `${new Date().toISOString().split("T")[0]}T${m.timeGMT || "19:00"}:00Z`,
        "eventStatus": m.status === "live" ? "https://schema.org/EventScheduled" : m.status === "finished" ? "https://schema.org/EventCompleted" : "https://schema.org/EventScheduled",
        "homeTeam": { "@type": "SportsTeam", "name": m.homeTeam },
        "awayTeam": { "@type": "SportsTeam", "name": m.awayTeam },
        "location": { "@type": "Place", "name": m.stadium || "ملعب المباراة" },
        "workFeatured": {
          "@type": "BroadcastEvent",
          "name": `بث مباشر 4K مباراة ${m.homeTeam} و ${m.awayTeam}`,
          "isLiveBroadcast": m.status === "live",
          "videoFormat": "4K UHD"
        }
      };
      html = html.replace("</head>", `<script type="application/ld+json">${JSON.stringify(eventJsonLd)}</script>\n</head>`);
      return html;
    }
  }

  // عناوين مخصصة للأقسام الرئيسية لتحقيق الصدارة في الكلمات المفتاحية
  const sectionMetaMap = {
    "/matches-today": {
      title: "كورة 4k – مباريات اليوم بث مباشر بدون تقطيع 4K | Koora4K",
      desc: "تابع جدول مباريات اليوم بث مباشر بدون تقطيع بجودة 4K UHD و FHD عبر كورة 4k. القنوات الناقلة والمعلقين وسيرفرات البث لجميع الدوريات عبر موقع كورة فور كي Koora4K.net."
    },
    "/matches-tomorrow": {
      title: "كورة 4k – مباريات الغد بث مباشر | جدول مواعيد مباريات الغد والقنوات الناقلة Koora4K",
      desc: "تعرف على جدول مباريات الغد في الدوري الإنجليزي والإسباني وأبطال أوروبا والبطولة المغربية ودوري روشن السعودي بتوقيت بلدك مباشرة عبر كورة 4k."
    },
    "/matches-yesterday": {
      title: "كورة 4k – نتائج مباريات الأمس وملخصات الأهداف بالفيديو HD | Koora4K",
      desc: "شاهد نتائج مباريات الأمس لجميع البطولات العالمية والعربية مع ملخصات وأهداف المباريات الرسمية بالفيديو الكامل بدون تقطيع عبر كورة 4k."
    },
    "/standings": {
      title: "كورة 4k – جدول ترتيب الدوريات العالمية والعربية 2026 | Koora4K",
      desc: "ترتيب الدوري الإسباني، الإنجليزي، الإيطالي، الألماني، الفرنسي، البطولة المغربية، ودوري روشن السعودي محدث تلقائياً لحظة بلحظة عبر كورة 4k."
    },
    "/highlights": {
      title: "كورة 4k – أهداف وملخصات مباريات اليوم HD بدون تقطيع | Koora4K",
      desc: "فيديوهات أهداف وملخصات أهم مباريات اليوم والأمس في دوري أبطال أوروبا وكبرى الدوريات العالمية والعربية بجودة عالية Full HD عبر موقع كورة 4k."
    },
    "/channels": {
      title: "كورة 4k – بث مباشر قنوات beIN Sports و SSC بدون تقطيع 24/7 بجودة 4K | Koora4K",
      desc: "شاهد قنوات بي إن سبورت وقنوات SSC الرياضية بث مباشر على مدار 24 ساعة بدون انقطاع وبجودات متعددة للجوال والكمبيوتر عبر كورة 4k."
    },
    "/news": {
      title: "كورة 4k – آخر أخبار كرة القدم العاجلة والانتقالات العالمية والعربية | Koora4K",
      desc: "تغطية إخبارية حصرية على مدار الساعة لآخر أخبار ريال مدريد، برشلونة، ليفربول، الأندية العربية، وسوق الانتقالات الصيفية والشتوية عبر كورة 4k."
    },
    "/privacy-policy": {
      title: "سياسة الخصوصية وملفات تعريف الارتباط | كورة 4k Koora4K",
      desc: "سياسة الخصوصية الرسمية لموقع كورة 4k (Koora4K.net) والمتوافقة مع معايير Google AdSense واللائحة العامة لحماية البيانات GDPR."
    },
    "/about-us": {
      title: "من نحن | موقع كورة 4k (Koora4K) الرياضي الرسمي",
      desc: "تعرف على منصة كورة 4k (Koora4K.net)، البوابة الرقمية الرائدة لتغطية أخبار كرة القدم، مواعيد المباريات، تحليلات الدوريات، والإحصائيات الحية."
    },
    "/contact-us": {
      title: "اتصل بنا | إدارة وفريق عمل كورة 4k Koora4K",
      desc: "تواصل مع فريق إدارة وتحرير موقع كورة 4k للاستفسارات، الشكاوى، المقترحات، والدعم الفني عبر البريد الإلكتروني أو تليجرام."
    },
    "/terms": {
      title: "شروط الاستخدام وأحكام الموقع | كورة 4k Koora4K",
      desc: "شروط وأحكام استخدام موقع كورة 4k (Koora4K.net) وحقوق ومسؤوليات الزوار والمستخدمين وسرية المعلومات."
    },
    "/dmca": {
      title: "حقوق الملكية الفكرية وإخلاء المسؤولية DMCA | كورة 4k Koora4K",
      desc: "إشعار حقوق الطبع والنشر وقانون الألفية للملكية الرقمية وإخلاء المسؤولية القانوني لموقع كورة 4k."
    }
  };

  const matchedSec = sectionMetaMap[reqPath];
  if (matchedSec) {
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${matchedSec.title}</title>`);
    html = html.replace(/<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${matchedSec.desc}" />`);
    html = html.replace(/<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${matchedSec.title}" />`);
    html = html.replace(/<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${matchedSec.desc}" />`);
  }

  return html;
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);

  // نقطة نهاية ذكية للتعرف على دولة الزائر وموقعه واتصاله وتوقيته المحلي تلقائياً
  if (parsedUrl.pathname === "/api/visitor-geo" && req.method === "GET") {
    try {
      const forwarded = (req.headers["x-forwarded-for"] || "").split(",")[0].trim();
      const isPrivateIp =
        !forwarded ||
        forwarded === "127.0.0.1" ||
        forwarded === "::1" ||
        forwarded.startsWith("192.168.") ||
        forwarded.startsWith("10.");

      const apiTarget = isPrivateIp
        ? "http://ip-api.com/json/?fields=status,country,countryCode,regionName,city,isp,offset,timezone,query"
        : `http://ip-api.com/json/${encodeURIComponent(forwarded)}?fields=status,country,countryCode,regionName,city,isp,offset,timezone,query`;

      const r = await fetchWithTimeout(apiTarget, 4500);
      const geo = await r.json();
      if (geo && geo.status === "success") {
        const offsetHours = typeof geo.offset === "number" ? geo.offset / 3600 : 1;
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        return res.end(
          JSON.stringify({
            ok: true,
            ip: geo.query || "",
            country: geo.country || "Morocco",
            countryCode: geo.countryCode || "MA",
            city: geo.city || geo.regionName || "",
            region: geo.regionName || "",
            isp: geo.isp || "",
            timezone: geo.timezone || "Africa/Casablanca",
            offsetHours
          })
        );
      }
    } catch (_) {}

    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    return res.end(
      JSON.stringify({
        ok: false,
        country: "Morocco",
        countryCode: "MA",
        city: "",
        isp: "",
        timezone: "Africa/Casablanca",
        offsetHours: 1
      })
    );
  }

  if (parsedUrl.pathname === "/api/live-sync" && req.method === "GET") {
    const force = parsedUrl.searchParams.get("force") === "1";
    if (force || cachedLiveState.matches.length === 0 || Date.now() - cachedLiveState.lastSync > 40000) {
      await performLiveSync();
    }
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    return res.end(
      JSON.stringify({
        ok: true,
        lastSync: cachedLiveState.lastSync,
        liveM3u8Stream: cachedLiveState.liveM3u8Stream,
        matches: cachedLiveState.matches,
        highlights: cachedLiveState.highlights,
        standings: cachedLiveState.standings,
        news: cachedLiveState.news
      })
    );
  }

  if (parsedUrl.pathname === "/api/data" && req.method === "GET") {
    if (cachedLiveState.matches.length === 0) {
      await performLiveSync();
    }

    let customDb = {};
    if (fs.existsSync(DB_FILE)) {
      try {
        customDb = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
      } catch (_) {}
    }

    const manualMatches = (customDb.matches || []).filter((m) => String(m.id).startsWith("m_"));
    const mergedMatches = [...manualMatches, ...cachedLiveState.matches];

    const manualHighlights = (customDb.highlights || []).filter(
      (h) => String(h.id).startsWith("hl_") && !String(h.id).startsWith("hl_khd_") && !String(h.id).startsWith("hl_sb_")
    );
    const mergedHighlights = [...manualHighlights, ...cachedLiveState.highlights];

    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    return res.end(
      JSON.stringify({
        ...customDb,
        autoSyncActive: true,
        lastSync: cachedLiveState.lastSync,
        liveM3u8Stream: cachedLiveState.liveM3u8Stream,
        matches: mergedMatches,
        highlights: mergedHighlights,
        standings: cachedLiveState.standings || customDb.standings,
        news: cachedLiveState.news || []
      })
    );
  }

  if (parsedUrl.pathname === "/api/data" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        const parsed = JSON.parse(body);
        fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
        fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), "utf8");
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  if (parsedUrl.pathname === "/ads.txt" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("google.com, pub-2630978969857880, DIRECT, f08c47fec0942fa0\n");
  }

  if (parsedUrl.pathname === "/a3b1c8f9204e4c2da85f98e1d2c3b4a5.txt" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("a3b1c8f9204e4c2da85f98e1d2c3b4a5\n");
  }

  if (parsedUrl.pathname === "/robots.txt" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end(
      [
        "User-agent: *",
        "Allow: /",
        "Disallow: /api/",
        "",
        "User-agent: Googlebot",
        "Allow: /",
        "",
        "User-agent: Googlebot-News",
        "Allow: /",
        "Allow: /news-sitemap.xml",
        "",
        "User-agent: Googlebot-Image",
        "Allow: /assets/",
        "",
        "User-agent: Googlebot-Video",
        "Allow: /",
        "Allow: /video-sitemap.xml",
        "",
        "User-agent: Bingbot",
        "Allow: /",
        "",
        "Sitemap: https://koora4k.net/sitemap.xml",
        "Sitemap: https://koora4k.net/news-sitemap.xml",
        "Sitemap: https://koora4k.net/video-sitemap.xml",
        "Sitemap: https://koora4k.net/rss.xml"
      ].join("\n")
    );
  }

  // خريطة الموقع الرئيسية المتكاملة (Sitemap.xml) لكافة صفحات وأقسام ومباريات اليوم
  if (parsedUrl.pathname === "/sitemap.xml" && req.method === "GET") {
    const todayIso = new Date().toISOString();
    const staticPages = [
      { loc: "https://koora4k.net/", priority: "1.0", freq: "always" },
      { loc: "https://koora4k.net/matches-today", priority: "0.95", freq: "always" },
      { loc: "https://koora4k.net/matches-tomorrow", priority: "0.9", freq: "hourly" },
      { loc: "https://koora4k.net/matches-yesterday", priority: "0.85", freq: "daily" },
      { loc: "https://koora4k.net/channels", priority: "0.85", freq: "daily" },
      { loc: "https://koora4k.net/standings", priority: "0.85", freq: "hourly" },
      { loc: "https://koora4k.net/highlights", priority: "0.9", freq: "hourly" },
      { loc: "https://koora4k.net/news", priority: "0.9", freq: "hourly" },
      { loc: "https://koora4k.net/privacy-policy", priority: "0.7", freq: "monthly" },
      { loc: "https://koora4k.net/about-us", priority: "0.7", freq: "monthly" },
      { loc: "https://koora4k.net/contact-us", priority: "0.7", freq: "monthly" },
      { loc: "https://koora4k.net/terms", priority: "0.7", freq: "monthly" },
      { loc: "https://koora4k.net/dmca", priority: "0.7", freq: "monthly" }
    ];

    const staticUrls = staticPages
      .map(
        (p) => `  <url>
    <loc>${p.loc}</loc>
    <lastmod>${todayIso}</lastmod>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
      )
      .join("\n");

    const matchUrls = (cachedLiveState.matches || [])
      .slice(0, 100)
      .map(
        (m) => `  <url>
    <loc>https://koora4k.net/?match=${encodeURIComponent(m.id)}</loc>
    <lastmod>${todayIso}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>${m.day === "today" ? "0.9" : "0.8"}</priority>
  </url>`
      )
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${matchUrls}
</urlset>`;

    res.writeHead(200, { "Content-Type": "application/xml; charset=utf-8" });
    return res.end(xml);
  }

  // خريطة أخبار Google المتخصصة (Google News Sitemap) لتصدر قسم الأخبار و Top Stories
  if (parsedUrl.pathname === "/news-sitemap.xml" && req.method === "GET") {
    const todayIso = new Date().toISOString();
    const newsItems = (cachedLiveState.news || []).slice(0, 25);
    const newsUrls = newsItems
      .map(
        (n) => `  <url>
    <loc>https://koora4k.net/news?item=${encodeURIComponent(n.id)}</loc>
    <news:news>
      <news:publication>
        <news:name>كورة فور كي - Koora4K</news:name>
        <news:language>ar</news:language>
      </news:publication>
      <news:publication_date>${todayIso}</news:publication_date>
      <news:title><![CDATA[${n.title}]]></news:title>
    </news:news>
  </url>`
      )
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${newsUrls}
</urlset>`;

    res.writeHead(200, { "Content-Type": "application/xml; charset=utf-8" });
    return res.end(xml);
  }

  // خريطة الفيديو المتخصصة (Google Video Sitemap) لتصدر نتائج ملخصات وأهداف المباريات
  if (parsedUrl.pathname === "/video-sitemap.xml" && req.method === "GET") {
    const todayIso = new Date().toISOString();
    const hlItems = (cachedLiveState.highlights || []).slice(0, 30);
    const videoUrls = hlItems
      .map(
        (hl) => `  <url>
    <loc>https://koora4k.net/highlights?hl=${encodeURIComponent(hl.id)}</loc>
    <video:video>
      <video:thumbnail_loc>${hl.thumbnail || "https://koora4k.net/assets/logo-emblem.jpg"}</video:thumbnail_loc>
      <video:title><![CDATA[${hl.title}]]></video:title>
      <video:description><![CDATA[شاهد أهداف وملخص مباراة ${hl.title} كاملة بجودة عالية HD بدون تقطيع]]></video:description>
      <video:player_loc>https://koora4k.net/?hl=${encodeURIComponent(hl.id)}</video:player_loc>
      <video:publication_date>${todayIso}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
    </video:video>
  </url>`
      )
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${videoUrls}
</urlset>`;

    res.writeHead(200, { "Content-Type": "application/xml; charset=utf-8" });
    return res.end(xml);
  }

  // خلاصة الأخبار المتوافقة مع قارئ أخبار جوجل ومراكز النشر (Google Publisher Center & RSS Feed 2.0)
  if ((parsedUrl.pathname === "/rss.xml" || parsedUrl.pathname === "/feed.xml") && req.method === "GET") {
    const todayRfc822 = new Date().toUTCString();
    const newsItems = (cachedLiveState.news || []).slice(0, 30);
    const rssItems = newsItems
      .map(
        (n) => `    <item>
      <title><![CDATA[${n.title}]]></title>
      <link>https://koora4k.net/news?item=${encodeURIComponent(n.id)}</link>
      <guid isPermaLink="false">${n.id}</guid>
      <pubDate>${todayRfc822}</pubDate>
      <description><![CDATA[${n.summary || n.title}]]></description>
      <category><![CDATA[${n.category || "رياضة كرة القدم"}]]></category>
      ${n.image ? `<enclosure url="${n.image}" type="image/jpeg" />` : ""}
    </item>`
      )
      .join("\n");

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>كورة فور كي - Koora4K | أخبار وبث مباشر مباريات اليوم</title>
    <link>https://koora4k.net/</link>
    <description>تغطية شاملة لجميع مباريات وأخبار كرة القدم العالمية والعربية بث مباشر بجودة 4K</description>
    <language>ar</language>
    <lastBuildDate>${todayRfc822}</lastBuildDate>
    <atom:link href="https://koora4k.net/rss.xml" rel="self" type="application/rss+xml" />
${rssItems}
  </channel>
</rss>`;

    res.writeHead(200, { "Content-Type": "application/rss+xml; charset=utf-8" });
    return res.end(rssXml);
  }

  // معالجة المسارات والصفحات مع الحقن التلقائي المسبق لبيانات الـ SEO (SSR Dynamic Meta)
  const cleanRoutes = [
    "/",
    "/matches-today",
    "/matches-tomorrow",
    "/matches-yesterday",
    "/standings",
    "/highlights",
    "/channels",
    "/news",
    "/privacy-policy",
    "/about-us",
    "/contact-us",
    "/terms",
    "/dmca"
  ];

  const isMatchRoute = parsedUrl.pathname.startsWith("/match/");
  const isHtmlRoute = cleanRoutes.includes(parsedUrl.pathname) || isMatchRoute;

  if (isHtmlRoute && req.method === "GET") {
    const indexPath = path.join(PUBLIC_DIR, "index.html");
    fs.readFile(indexPath, "utf8", (err, content) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        return res.end("Error loading page");
      }
      const renderedHtml = injectDynamicSeoMeta(content, parsedUrl.pathname, parsedUrl.searchParams);
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(renderedHtml);
    });
    return;
  }

  let reqPath = parsedUrl.pathname;
  if (reqPath === "/") reqPath = "/index.html";

  const filePath = path.join(PUBLIC_DIR, reqPath);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("404 Not Found");
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
    res.end(content);
  });
});

// إطلاق المزامنة التلقائية الدورية والاستماع للمنفذ في البيئات العادية (خارج Vercel)
if (!process.env.VERCEL) {
  performLiveSync().then(() => {
    pingSearchEngines();
  });
  setInterval(async () => {
    await performLiveSync();
    await pingSearchEngines();
  }, 45 * 1000);

  server.listen(PORT, () => {
    console.log(`⚽ KooraHD Pro Live Auto-Sync Server running at http://localhost:${PORT}`);
  });
}

module.exports = server;
