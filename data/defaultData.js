// ==========================================================================
// KooraHD Pro v2 - قاعدة بيانات احترافية شاملة مع شعارات الأندية والبطولات المضمونة 100%
// ==========================================================================

// مولد شعارات أندية احترافية (درع كروي ثلاثي الأبعاد SVG يعمل دائماً 100% بدون انقطاع)
function createClubCrestSVG(shortName, primaryColor, secondaryColor, accentColor = "#fbbf24", star = true) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
    <defs>
      <linearGradient id="bg_${shortName}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${primaryColor}" />
        <stop offset="100%" stop-color="${secondaryColor}" />
      </linearGradient>
      <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fde047" />
        <stop offset="100%" stop-color="${accentColor}" />
      </linearGradient>
      <filter id="sh" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity="0.45"/>
      </filter>
    </defs>
    <!-- Outer Shield -->
    <path d="M60 8 L104 24 L104 62 C104 88 84 106 60 114 C36 106 16 88 16 62 L16 24 Z" fill="url(#gold)" filter="url(#sh)"/>
    <!-- Inner Shield -->
    <path d="M60 14 L98 28 L98 61 C98 83 80 100 60 107 C40 100 22 83 22 61 L22 28 Z" fill="url(#bg_${shortName})"/>
    <!-- Vertical Stripe Accent -->
    <path d="M48 19 L72 19 L72 102 C68 104 64 106 60 107 C56 106 52 104 48 102 Z" fill="${secondaryColor}" fill-opacity="0.35"/>
    <!-- Top Crown / Star -->
    ${star ? `<polygon points="60,18 63,25 70,25 64,29 66,36 60,32 54,36 56,29 50,25 57,25" fill="url(#gold)"/>` : ""}
    <!-- Center Circle Ring -->
    <circle cx="60" cy="64" r="24" fill="rgba(0,0,0,0.28)" stroke="url(#gold)" stroke-width="2.5"/>
    <!-- Club Initials -->
    <text x="60" y="71" font-family="Arial, Cairo, sans-serif" font-weight="900" font-size="19" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">${shortName}</text>
  </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

// قاموس شعارات الأندية العالمية والعربية والمغربية (روابط رسمية + دروع احتياطية مضمونة)
window.CLUB_LOGOS = {
  "الهلال": "/assets/clubs/al-hilal.png",
  "القادسية": "/assets/clubs/al-qadsiah.png",
  "النصر": "/assets/clubs/al-nassr.png",
  "الاتحاد": "/assets/clubs/al-ittihad.png",
  "الأهلي السعودي": "/assets/clubs/al-ahli-saudi.png",
  "الخليج": "/assets/clubs/al-khaleej.png",
  "الفيصلي": "/assets/clubs/al-faisaly.png",
  "الشباب": "/assets/clubs/al-shabab.png",
  "الاتفاق": "/assets/clubs/al-ettifaq.png",
  "التعاون": "/assets/clubs/al-taawoun.png",
  "الفتح": "/assets/clubs/al-fateh.png",
  "الوحدة": "/assets/clubs/al-wehda.png",
  "ضمك": "/assets/clubs/damac.png",
  "الرائد": "/assets/clubs/al-raed.png",
  "الأخدود": "/assets/clubs/al-okhdood.png",
  "العروبة": "/assets/clubs/al-orobah.png",
  "الخلود": "/assets/clubs/al-kholood.png",
  "الرياض": "/assets/clubs/al-riyadh.png",
  "الرجاء الرياضي": "/assets/clubs/raja.png",
  "الوداد الرياضي": "/assets/clubs/wydad.png",
  "الجيش الملكي": "/assets/clubs/far-rabat.png",
  "نهضة بركان": "/assets/clubs/rs-berkane.png",
  "الفتح الرباطي": "/assets/clubs/fus-rabat.png",
  "المغرب الفاسي": "/assets/clubs/mas-fes.png",
  "حسنية أكادير": "/assets/clubs/husa.png",
  "اتحاد طنجة": "/assets/clubs/irt.png",
  "أولمبيك آسفي": "/assets/clubs/ocs.png",
  "المغرب التطواني": "/assets/clubs/mat.png",
  "الأهلي المصري": "/assets/clubs/al-ahly-egypt.png",
  "الزمالك": "/assets/clubs/zamalek.png",
  "الترجي التونسي": "/assets/clubs/esperance.png",
  "صن داونز": "/assets/clubs/sundowns.png",
  "ريال مدريد": "/assets/clubs/real-madrid.png",
  "برشلونة": "/assets/clubs/barcelona.png",
  "أتلتيكو مدريد": "/assets/clubs/atletico-madrid.png",
  "إسبانيول": "/assets/clubs/espanyol.png",
  "إشبيلية": "/assets/clubs/sevilla.png",
  "أرسنال": "/assets/clubs/arsenal.png",
  "مانشستر سيتي": "/assets/clubs/manchester-city.png",
  "ليفربول": "/assets/clubs/liverpool.png",
  "مانشستر يونايتد": "/assets/clubs/manchester-united.png",
  "تشيلسي": "/assets/clubs/chelsea.png",
  "توتنهام": "/assets/clubs/tottenham.png",
  "نيوكاسل يونايتد": "/assets/clubs/newcastle.png",
  "ليستر سيتي": "/assets/clubs/leicester.png",
  "نوتينغهام فورست": "/assets/clubs/nottingham-forest.png",
  "ساوثهامبتون": "/assets/clubs/southampton.png",
  "باريس سان جيرمان": "/assets/clubs/psg.png",
  "رين": "/assets/clubs/rennes.png",
  "لوهافر": "/assets/clubs/le-havre.png",
  "بايرن ميونخ": "/assets/clubs/bayern-munich.png",
  "بوروسيا دورتموند": "/assets/clubs/borussia-dortmund.png",
  "باير ليفركوزن": "/assets/clubs/bayer-leverkusen.png",
  "ماينز": "/assets/clubs/mainz.png",
  "بوروسيا مونشنغلادباخ": "/assets/clubs/monchengladbach.png",
  "إنتر ميلان": "/assets/clubs/inter-milan.png",
  "إي سي ميلان": "/assets/clubs/ac-milan.png",
  "يوفنتوس": "/assets/clubs/juventus.png",
  "نابولي": "/assets/clubs/napoli.png",
  "روما": "/assets/clubs/as-roma.png",
  "تورينو": "/assets/clubs/torino.png",
  "كومو": "/assets/clubs/como.png",
  "فنربخشة": "/assets/clubs/fenerbahce.png",
  "دينامو كييف": "/assets/clubs/dynamo-kyiv.png",
  "إي زد ألكمار": "/assets/clubs/az-alkmaar.png"
};

window.FALLBACK_CLUB_CREST = function (teamName) {
  if (window.CLUB_LOGOS[teamName]) return window.CLUB_LOGOS[teamName];
  // توليد درع كروي احترافي لأي فريق جديد يتم إضافته
  const clean = (teamName || "FC").replace(/[^a-zA-Z\u0600-\u06FF]/g, "").slice(0, 4).toUpperCase() || "FC";
  return createClubCrestSVG(clean, "#0f766e", "#0f172a", "#10b981", false);
};

window.DEFAULT_KOORA_DATA = {
  settings: {
    siteName: "كورة فور كي",
    siteBadge: "Koora4K",
    siteSlogan: "البث المباشر للمباريات والقنوات الرياضية بجودة 4K بدون تقطيع",
    announcement: "🔥 تابع مباريات اليوم والأمس والغد والأيام المقبلة بث مباشر بجودة 4K و FHD حصرياً على كورة فور كي Koora4K.com",
    telegramUrl: "https://t.me/+_wHGd3-w4ZRlM2Q0",
    adminPin: "1234",
    defaultTimezoneOffset: 1 // GMT+1 (توقيت المغرب)
  },
  matches: [
  {
    "id": "m_hilal_qadisiya",
    "day": "today",
    "dateLabel": "اليوم الجمعة 23 أكتوبر",
    "league": "دوري روشن السعودي للمحترفين",
    "leagueLogo": "🇸🇦",
    "status": "live",
    "minute": "76'",
    "timeGMT": "15:00",
    "homeTeam": "الهلال",
    "homeLogo": "https://crests.football-data.org/86.png",
    "homeScore": 2,
    "homeScorers": "ألكساندر ميتروفيتش (21')، مالكوم (58')",
    "awayTeam": "القادسية",
    "awayLogo": "https://crests.football-data.org/81.png",
    "awayScore": 1,
    "awayScorers": "بيير إيميريك أوباميانغ (41')",
    "channel": "SSC1 HD",
    "commentator": "فهد العتيبي",
    "stadium": "استاد الأمير محمد بن فهد",
    "round": "الجولة 8 - قمة دوري روشن",
    "featured": true,
    "events": [
      {
        "time": "21'",
        "team": "home",
        "player": "ألكساندر ميتروفيتش",
        "type": "goal"
      },
      {
        "time": "41'",
        "team": "away",
        "player": "بيير إيميريك أوباميانغ",
        "type": "goal"
      },
      {
        "time": "58'",
        "team": "home",
        "player": "مالكوم أوليفيرا",
        "type": "goal"
      }
    ],
    "servers": [
      {
        "name": "سيرفر 1 الرئيسي (4K UHD)",
        "quality": "4K",
        "type": "m3u8",
        "url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
      },
      {
        "name": "سيرفر 2 مباشر (FHD 1080p)",
        "quality": "1080p",
        "type": "m3u8",
        "url": "https://assets.afcdn.com/video49/20210722/v_645516.m3u8"
      },
      {
        "name": "سيرفر 3 للإنترنت الضعيف (HD 720p)",
        "quality": "720p",
        "type": "m3u8",
        "url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
      }
    ]
  },
  {
    "id": "m_leicester_forest",
    "day": "today",
    "dateLabel": "اليوم الجمعة 23 أكتوبر",
    "league": "الدوري الإنجليزي الممتاز",
    "leagueLogo": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    "status": "upcoming",
    "minute": "20:00 بتوقيت المغرب",
    "timeGMT": "19:00",
    "homeTeam": "ليستر سيتي",
    "homeLogo": "https://crests.football-data.org/61.png",
    "homeScore": 0,
    "awayTeam": "نوتينغهام فورست",
    "awayLogo": "https://crests.football-data.org/67.png",
    "awayScore": 0,
    "channel": "beIN Sports HD 1",
    "commentator": "خليل البلوشي",
    "stadium": "ملعب كينغ باور",
    "round": "الأسبوع 9 - قمة الجمعة",
    "featured": true,
    "events": [],
    "servers": [
      {
        "name": "سيرفر 1 (FHD 1080p)",
        "quality": "1080p",
        "type": "m3u8",
        "url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
      }
    ]
  },
  {
    "id": "m_espanyol_sevilla",
    "day": "today",
    "dateLabel": "اليوم الجمعة 23 أكتوبر",
    "league": "الدوري الإسباني - لا ليغا",
    "leagueLogo": "🇪🇸",
    "status": "upcoming",
    "minute": "20:00 بتوقيت المغرب",
    "timeGMT": "19:00",
    "homeTeam": "إسبانيول",
    "homeLogo": "https://crests.football-data.org/81.png",
    "homeScore": 0,
    "awayTeam": "إشبيلية",
    "awayLogo": "https://crests.football-data.org/78.png",
    "awayScore": 0,
    "channel": "beIN Sports HD 3",
    "commentator": "حفيظ دراجي",
    "stadium": "ملعب كورنيلا إل برات",
    "round": "الجولة 11 - الدوري الإسباني",
    "featured": false,
    "events": [],
    "servers": [
      {
        "name": "سيرفر 1 (FHD 1080p)",
        "quality": "1080p",
        "type": "m3u8",
        "url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
      }
    ]
  },
  {
    "id": "m_ahli_khaleej",
    "day": "today",
    "dateLabel": "اليوم الجمعة 23 أكتوبر",
    "league": "دوري روشن السعودي للمحترفين",
    "leagueLogo": "🇸🇦",
    "status": "live",
    "minute": "62'",
    "timeGMT": "15:00",
    "homeTeam": "الأهلي السعودي",
    "homeLogo": "https://crests.football-data.org/86.png",
    "homeScore": 1,
    "homeScorers": "رياض محرز (28')",
    "awayTeam": "الخليج",
    "awayLogo": "https://crests.football-data.org/81.png",
    "awayScore": 0,
    "channel": "SSC EXTRA 1 HD",
    "commentator": "عيسى الحربين",
    "stadium": "مدينة الملك عبدالله الرياضية (الجوهرة)",
    "round": "الجولة 8 - دوري روشن",
    "featured": false,
    "events": [
      {
        "time": "28'",
        "team": "home",
        "player": "رياض محرز",
        "type": "goal"
      }
    ],
    "servers": [
      {
        "name": "سيرفر 1 (FHD 1080p)",
        "quality": "1080p",
        "type": "m3u8",
        "url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
      }
    ]
  },
  {
    "id": "m_faisaly_nassr",
    "day": "today",
    "dateLabel": "اليوم الجمعة 23 أكتوبر",
    "league": "دوري روشن السعودي للمحترفين",
    "leagueLogo": "🇸🇦",
    "status": "finished",
    "minute": "انتهت",
    "timeGMT": "10:30",
    "homeTeam": "الفيصلي",
    "homeLogo": "https://crests.football-data.org/78.png",
    "homeScore": 1,
    "homeScorers": "مارتينيز (30')",
    "awayTeam": "النصر",
    "awayLogo": "https://crests.football-data.org/65.png",
    "awayScore": 2,
    "awayScorers": "كريستيانو رونالدو (45+2')، تاليسكا (78')",
    "channel": "SSC1 HD",
    "commentator": "عبدالله الحربي",
    "stadium": "مدينة المجمعة الرياضية",
    "round": "الجولة 8 - دوري روشن",
    "featured": false,
    "events": [
      {
        "time": "30'",
        "team": "home",
        "player": "مارتينيز",
        "type": "goal"
      },
      {
        "time": "45+2'",
        "team": "away",
        "player": "كريستيانو رونالدو",
        "type": "goal"
      },
      {
        "time": "78'",
        "team": "away",
        "player": "أندرسون تاليسكا",
        "type": "goal"
      }
    ],
    "servers": [
      {
        "name": "سيرفر 1 (HD 720p)",
        "quality": "720p",
        "type": "m3u8",
        "url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
      }
    ]
  },
  {
    "id": "m_mainz_gladbach",
    "day": "today",
    "dateLabel": "اليوم الجمعة 23 أكتوبر",
    "league": "الدوري الألماني - بوندسليغا",
    "leagueLogo": "🇩🇪",
    "status": "upcoming",
    "minute": "19:30 بتوقيت المغرب",
    "timeGMT": "18:30",
    "homeTeam": "ماينز",
    "homeLogo": "https://crests.football-data.org/3.png",
    "homeScore": 0,
    "awayTeam": "بوروسيا مونشنغلادباخ",
    "awayLogo": "https://crests.football-data.org/4.png",
    "awayScore": 0,
    "channel": "beIN Sports HD 5",
    "commentator": "أحمد البلوشي",
    "stadium": "ميوا أرينا",
    "round": "الأسبوع 8 - البوندسليغا",
    "featured": false,
    "events": [],
    "servers": [
      {
        "name": "سيرفر 1 (FHD 1080p)",
        "quality": "1080p",
        "type": "m3u8",
        "url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
      }
    ]
  },
  {
    "id": "m_rennes_lehavre",
    "day": "today",
    "dateLabel": "اليوم الجمعة 23 أكتوبر",
    "league": "الدوري الفرنسي - ليغ 1",
    "leagueLogo": "🇫🇷",
    "status": "upcoming",
    "minute": "19:45 بتوقيت المغرب",
    "timeGMT": "18:45",
    "homeTeam": "رين",
    "homeLogo": "https://crests.football-data.org/524.png",
    "homeScore": 0,
    "awayTeam": "لوهافر",
    "awayLogo": "https://crests.football-data.org/524.png",
    "awayScore": 0,
    "channel": "beIN Sports HD 4",
    "commentator": "جواد بدة",
    "stadium": "رويزون بارك",
    "round": "الجولة 9 - الدوري الفرنسي",
    "featured": false,
    "events": [],
    "servers": [
      {
        "name": "سيرفر 1 (FHD 1080p)",
        "quality": "1080p",
        "type": "m3u8",
        "url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
      }
    ]
  },
  {
    "id": "m_torino_como",
    "day": "today",
    "dateLabel": "اليوم الجمعة 23 أكتوبر",
    "league": "الدوري الإيطالي - سيري آ",
    "leagueLogo": "🇮🇹",
    "status": "upcoming",
    "minute": "19:45 بتوقيت المغرب",
    "timeGMT": "18:45",
    "homeTeam": "تورينو",
    "homeLogo": "https://crests.football-data.org/108.png",
    "homeScore": 0,
    "awayTeam": "كومو",
    "awayLogo": "https://crests.football-data.org/98.png",
    "awayScore": 0,
    "channel": "AD SPORTS Premium 1",
    "commentator": "بلال علام",
    "stadium": "استاد أولمبيكو دي تورينو",
    "round": "الجولة 9 - الكالتشيو",
    "featured": false,
    "events": [],
    "servers": [
      {
        "name": "سيرفر 1 (FHD 1080p)",
        "quality": "1080p",
        "type": "m3u8",
        "url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
      }
    ]
  },
  {
    "id": "m_clasico_sat",
    "day": "tomorrow",
    "dateLabel": "غداً السبت 24 أكتوبر",
    "league": "الدوري الإسباني - لا ليغا",
    "leagueLogo": "🇪🇸",
    "status": "upcoming",
    "minute": "غداً 20:00 بتوقيت المغرب",
    "timeGMT": "19:00",
    "homeTeam": "ريال مدريد",
    "homeLogo": "https://crests.football-data.org/86.png",
    "homeScore": 0,
    "awayTeam": "برشلونة",
    "awayLogo": "https://crests.football-data.org/81.png",
    "awayScore": 0,
    "channel": "beIN Sports HD 1",
    "commentator": "عصام الشوالي",
    "stadium": "سانتياغو برنابيو - مدريد",
    "round": "الجولة 11 - كلاسيكو الأرض المرتقب",
    "featured": true,
    "events": [],
    "servers": [
      {
        "name": "سيرفر 1 الرئيسي (4K UHD)",
        "quality": "4K",
        "type": "m3u8",
        "url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
      }
    ]
  },
  {
    "id": "m_arsenal_liverpool",
    "day": "tomorrow",
    "dateLabel": "غداً السبت 24 أكتوبر",
    "league": "الدوري الإنجليزي الممتاز",
    "leagueLogo": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    "status": "upcoming",
    "minute": "غداً 16:30 بتوقيت المغرب",
    "timeGMT": "15:30",
    "homeTeam": "أرسنال",
    "homeLogo": "https://crests.football-data.org/57.png",
    "homeScore": 0,
    "awayTeam": "ليفربول",
    "awayLogo": "https://crests.football-data.org/64.png",
    "awayScore": 0,
    "channel": "beIN Sports HD 1",
    "commentator": "خليل البلوشي",
    "stadium": "استاد الإمارات - لندن",
    "round": "قمة الجولة 9 - البريميرليج",
    "featured": true,
    "events": [],
    "servers": [
      {
        "name": "سيرفر 1 (FHD 1080p)",
        "quality": "1080p",
        "type": "m3u8",
        "url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
      }
    ]
  },
  {
    "id": "m_raja_wydad",
    "day": "tomorrow",
    "dateLabel": "غداً السبت 24 أكتوبر",
    "league": "البطولة المغربية الاحترافية Inwi",
    "leagueLogo": "🇲🇦",
    "status": "upcoming",
    "minute": "غداً 17:00 بتوقيت المغرب",
    "timeGMT": "16:00",
    "homeTeam": "الرجاء الرياضي",
    "homeLogo": "https://crests.football-data.org/86.png",
    "homeScore": 0,
    "awayTeam": "الوداد الرياضي",
    "awayLogo": "https://crests.football-data.org/81.png",
    "awayScore": 0,
    "channel": "الرياضية المغربية TNT",
    "commentator": "هشام فرج",
    "stadium": "المركب الرياضي محمد الخامس",
    "round": "الجولة 24 - ديربي الدار البيضاء",
    "featured": false,
    "events": [],
    "servers": [
      {
        "name": "سيرفر 1 (FHD 1080p)",
        "quality": "1080p",
        "type": "m3u8",
        "url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
      }
    ]
  },
  {
    "id": "m_mancity_southampton",
    "day": "tomorrow",
    "dateLabel": "غداً السبت 24 أكتوبر",
    "league": "الدوري الإنجليزي الممتاز",
    "leagueLogo": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    "status": "upcoming",
    "minute": "غداً 14:00 بتوقيت المغرب",
    "timeGMT": "13:00",
    "homeTeam": "مانشستر سيتي",
    "homeLogo": "https://crests.football-data.org/65.png",
    "homeScore": 0,
    "awayTeam": "ساوثهامبتون",
    "awayLogo": "https://crests.football-data.org/67.png",
    "awayScore": 0,
    "channel": "beIN Sports HD 2",
    "commentator": "عامر الخوذيري",
    "stadium": "استاد الاتحاد",
    "round": "الجولة 9",
    "featured": false,
    "events": [],
    "servers": [
      {
        "name": "سيرفر 1 (HD 720p)",
        "quality": "720p",
        "type": "m3u8",
        "url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
      }
    ]
  },
  {
    "id": "m_fenerbahce_manu",
    "day": "yesterday",
    "dateLabel": "أمس الخميس 22 أكتوبر",
    "league": "الدوري الأوروبي",
    "leagueLogo": "🏆",
    "status": "finished",
    "minute": "انتهت",
    "timeGMT": "19:00",
    "homeTeam": "فنربخشة",
    "homeLogo": "https://crests.football-data.org/86.png",
    "homeScore": 1,
    "homeScorers": "يوسف النصيري (49')",
    "awayTeam": "مانشستر يونايتد",
    "awayLogo": "https://crests.football-data.org/66.png",
    "awayScore": 1,
    "awayScorers": "كريستيان إريكسن (15')",
    "channel": "beIN Sports HD 1",
    "commentator": "علي محمد علي",
    "stadium": "ملعب شكري سراج أوغلو",
    "round": "الجولة 3 - الدوري الأوروبي",
    "featured": false,
    "events": [
      {
        "time": "15'",
        "team": "away",
        "player": "كريستيان إريكسن",
        "type": "goal"
      },
      {
        "time": "49'",
        "team": "home",
        "player": "يوسف النصيري",
        "type": "goal"
      }
    ],
    "servers": [
      {
        "name": "ملخص المباراة HD",
        "quality": "1080p",
        "type": "m3u8",
        "url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
      }
    ]
  },
  {
    "id": "m_roma_kyiv",
    "day": "yesterday",
    "dateLabel": "أمس الخميس 22 أكتوبر",
    "league": "الدوري الأوروبي",
    "leagueLogo": "🏆",
    "status": "finished",
    "minute": "انتهت",
    "timeGMT": "16:45",
    "homeTeam": "روما",
    "homeLogo": "https://crests.football-data.org/108.png",
    "homeScore": 1,
    "homeScorers": "أرتيم دوفبيك (23' ركلة جزاء)",
    "awayTeam": "دينامو كييف",
    "awayLogo": "https://crests.football-data.org/524.png",
    "awayScore": 0,
    "channel": "beIN Sports HD 2",
    "commentator": "أحمد عبده",
    "stadium": "ملعب أولمبيكو - روما",
    "round": "الجولة 3",
    "featured": false,
    "events": [
      {
        "time": "23'",
        "team": "home",
        "player": "أرتيم دوفبيك",
        "type": "goal"
      }
    ],
    "servers": [
      {
        "name": "أهداف المباراة HD",
        "quality": "720p",
        "type": "m3u8",
        "url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
      }
    ]
  },
  {
    "id": "m_tottenham_alkmaar",
    "day": "yesterday",
    "dateLabel": "أمس الخميس 22 أكتوبر",
    "league": "الدوري الأوروبي",
    "leagueLogo": "🏆",
    "status": "finished",
    "minute": "انتهت",
    "timeGMT": "19:00",
    "homeTeam": "توتنهام",
    "homeLogo": "https://crests.football-data.org/73.png",
    "homeScore": 1,
    "homeScorers": "ريتشارليسون (53' ركلة جزاء)",
    "awayTeam": "إي زد ألكمار",
    "awayLogo": "https://crests.football-data.org/67.png",
    "awayScore": 0,
    "channel": "beIN Sports HD 2",
    "commentator": "محمد بركات",
    "stadium": "استاد توتنهام هوتسبير",
    "round": "الجولة 3",
    "featured": false,
    "events": [
      {
        "time": "53'",
        "team": "home",
        "player": "ريتشارليسون",
        "type": "goal"
      }
    ],
    "servers": [
      {
        "name": "ملخص اللقاء HD",
        "quality": "720p",
        "type": "m3u8",
        "url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
      }
    ]
  }
],
  channels: [
    {
      id: "ch1",
      name: "beIN Sports HD 1",
      category: "قنوات بي إن سبورت",
      badge: "FHD 1080p",
      logo: createClubCrestSVG("beIN 1", "#5b21b6", "#2e1065", "#ffffff", false),
      status: "live",
      currentProgram: "البث الحي المباشر - القناة الصوتية الأولى",
      servers: [
        {
          name: "سيرفر 1 الرئيسي (AlbaPlayer FHD)",
          quality: "1080p",
          type: "iframe",
          url: "https://pl.matchlivehd.com/albaplayer/1bein1/?serv=1"
        },
        {
          name: "سيرفر 2 مباشر بدون إعلانات (HLS M3U8)",
          quality: "1080p",
          type: "m3u8",
          url: "https://lbgo.bozztv.com/ssh101/ssh101/yusfdara137152/chunks.m3u8"
        },
        {
          name: "سيرفر 3 (KooraHD Multi)",
          quality: "4K",
          type: "iframe",
          url: "https://t.korahlive.online/2026/09/ch1.html"
        },
        {
          name: "سيرفر 4 (YallaShoot HD)",
          quality: "720p",
          type: "iframe",
          url: "https://v6.yshoot-live.com/ch/ch1.php"
        }
      ]
    },
    {
      id: "ch2",
      name: "beIN Sports HD 2",
      category: "قنوات بي إن سبورت",
      badge: "FHD 1080p",
      logo: createClubCrestSVG("beIN 2", "#6d28d9", "#3b0764", "#ffffff", false),
      status: "live",
      currentProgram: "البث الحي المباشر - المباريات الأوروبية",
      servers: [
        {
          name: "سيرفر 1 الرئيسي (beIN 2 FHD)",
          quality: "1080p",
          type: "iframe",
          url: "https://pl.koralive1.cc/bein2/"
        },
        {
          name: "سيرفر 2 (YallaShoot ch2)",
          quality: "720p",
          type: "iframe",
          url: "https://v6.yshoot-live.com/ch/ch2.php"
        }
      ]
    },
    {
      id: "ch3",
      name: "beIN Sports HD 3",
      category: "قنوات بي إن سبورت",
      badge: "FHD 1080p",
      logo: createClubCrestSVG("beIN 3", "#4c1d95", "#1e1b4b", "#ffffff", false),
      status: "live",
      currentProgram: "البث الحي المباشر - الدوريات الكبرى",
      servers: [
        {
          name: "سيرفر 1 الرئيسي (beIN 3 FHD)",
          quality: "1080p",
          type: "iframe",
          url: "https://pl.koralive1.cc/bein3/"
        },
        {
          name: "سيرفر 2 (YallaShoot ch3)",
          quality: "720p",
          type: "iframe",
          url: "https://v6.yshoot-live.com/ch/ch3.php"
        }
      ]
    },
    {
      id: "ch4",
      name: "beIN Sports HD 4",
      category: "قنوات بي إن سبورت",
      badge: "FHD 1080p",
      logo: createClubCrestSVG("beIN 4", "#5b21b6", "#1e1b4b", "#fbbf24", false),
      status: "live",
      currentProgram: "البث الحي المباشر 24/7",
      servers: [
        {
          name: "سيرفر 1 الرئيسي (beIN 4 FHD)",
          quality: "1080p",
          type: "iframe",
          url: "https://pl.koralive1.cc/bein4/"
        },
        {
          name: "سيرفر 2 (YallaShoot ch4)",
          quality: "720p",
          type: "iframe",
          url: "https://v6.yshoot-live.com/ch/ch4.php"
        }
      ]
    },
    {
      id: "ch5",
      name: "SSC Sports 1 HD",
      category: "قنوات SSC السعودية",
      badge: "FHD 1080p",
      logo: createClubCrestSVG("SSC 1", "#0284c7", "#0c4a6e", "#fbbf24", false),
      status: "live",
      currentProgram: "دوري روشن السعودي والبطولات الآسيوية",
      servers: [
        {
          name: "سيرفر SSC الرئيسي (HD)",
          quality: "1080p",
          type: "iframe",
          url: "https://v6.yshoot-live.com/ch/ch10.php"
        },
        {
          name: "سيرفر 2 احتياطي (KooraHD)",
          quality: "1080p",
          type: "iframe",
          url: "https://t.korahlive.online/2026/09/ch1.html?match=الأهلي"
        }
      ]
    },
    {
      id: "ch6",
      name: "الكأس الرياضية Alkass 1 HD",
      category: "القنوات العربية",
      badge: "HD 1080p",
      logo: createClubCrestSVG("KASS", "#991b1b", "#450a0a", "#fbbf24", true),
      status: "live",
      currentProgram: "البطولات العربية والآسيوية",
      servers: [
        {
          name: "سيرفر الكأس 1 المباشر",
          quality: "1080p",
          type: "iframe",
          url: "https://v6.yshoot-live.com/ch/ch9.php"
        }
      ]
    }
  ],
  standings: {
    "البطولة المغربية الاحترافية": [
      { rank: 1, team: "نهضة بركان", played: 24, won: 17, draw: 5, lost: 2, gf: 42, ga: 14, pts: 56, form: ["W", "W", "D", "W", "W"] },
      { rank: 2, team: "الجيش الملكي", played: 24, won: 15, draw: 6, lost: 3, gf: 45, ga: 19, pts: 51, form: ["W", "D", "W", "W", "L"] },
      { rank: 3, team: "الرجاء الرياضي", played: 24, won: 14, draw: 7, lost: 3, gf: 38, ga: 17, pts: 49, form: ["W", "W", "D", "D", "W"] },
      { rank: 4, team: "الوداد الرياضي", played: 24, won: 13, draw: 6, lost: 5, gf: 35, ga: 22, pts: 45, form: ["D", "W", "W", "L", "W"] },
      { rank: 5, team: "الفتح الرباطي", played: 24, won: 11, draw: 7, lost: 6, gf: 31, ga: 21, pts: 40, form: ["W", "L", "D", "W", "D"] },
      { rank: 6, team: "المغرب الفاسي", played: 24, won: 10, draw: 7, lost: 7, gf: 27, ga: 24, pts: 37, form: ["D", "W", "L", "D", "W"] }
    ],
    "الدوري الإسباني": [
      { rank: 1, team: "برشلونة", played: 31, won: 23, draw: 4, lost: 4, gf: 78, ga: 31, pts: 73, form: ["W", "W", "W", "D", "W"] },
      { rank: 2, team: "ريال مدريد", played: 31, won: 22, draw: 6, lost: 3, gf: 69, ga: 28, pts: 72, form: ["W", "D", "W", "W", "W"] },
      { rank: 3, team: "أتلتيكو مدريد", played: 31, won: 19, draw: 6, lost: 6, gf: 58, ga: 33, pts: 63, form: ["W", "L", "W", "D", "W"] }
    ],
    "الدوري الإنجليزي الممتاز": [
      { rank: 1, team: "ليفربول", played: 31, won: 22, draw: 7, lost: 2, gf: 72, ga: 27, pts: 73, form: ["W", "W", "D", "W", "W"] },
      { rank: 2, team: "أرسنال", played: 31, won: 20, draw: 8, lost: 3, gf: 65, ga: 25, pts: 68, form: ["W", "D", "W", "W", "D"] },
      { rank: 3, team: "مانشستر سيتي", played: 31, won: 19, draw: 7, lost: 5, gf: 68, ga: 35, pts: 64, form: ["W", "W", "L", "W", "D"] },
      { rank: 4, team: "تشيلسي", played: 31, won: 16, draw: 8, lost: 7, gf: 56, ga: 39, pts: 56, form: ["D", "W", "W", "L", "W"] }
    ],
    "دوري أبطال أوروبا": [
      { rank: 1, team: "ليفربول", played: 8, won: 7, draw: 0, lost: 1, gf: 19, ga: 5, pts: 21, form: ["W", "W", "W", "W", "L"] },
      { rank: 2, team: "برشلونة", played: 8, won: 6, draw: 1, lost: 1, gf: 26, ga: 11, pts: 19, form: ["W", "W", "W", "W", "D"] },
      { rank: 3, team: "أرسنال", played: 8, won: 6, draw: 1, lost: 1, gf: 16, ga: 3, pts: 19, form: ["W", "D", "W", "W", "W"] },
      { rank: 4, team: "إنتر ميلان", played: 8, won: 6, draw: 1, lost: 1, gf: 11, ga: 1, pts: 19, form: ["W", "W", "L", "W", "W"] },
      { rank: 5, team: "ريال مدريد", played: 8, won: 5, draw: 0, lost: 3, gf: 20, ga: 12, pts: 15, form: ["W", "L", "W", "W", "W"] }
    ]
  },
  highlights: [
    {
      id: "hl_sb_default_1",
      title: "ملخص وأهداف مباراة باريس سان جيرمان ضد أنجيه",
      league: "الدوري الفرنسي Ligue 1",
      duration: "أهداف وملخص كامل",
      views: "تغطية رسمية HD",
      date: "اليوم",
      score: "ملخص وأهداف",
      thumbnail: "https://www.scorebat.com/og/m/og1730931.jpeg",
      videoUrl: "https://www.scorebat.com/embed/v/69eede64541f0/?utm_source=api&utm_medium=video&utm_campaign=lgc",
      videoType: "iframe",
      servers: [
        {
          name: "🎬 ملخص وأهداف المباراة (ScoreBat HD)",
          quality: "1080p HD",
          type: "iframe",
          url: "https://www.scorebat.com/embed/v/69eede64541f0/?utm_source=api&utm_medium=video&utm_campaign=lgc"
        }
      ]
    },
    {
      id: "hl_sb_default_2",
      title: "ملخص وأهداف مباراة برشلونة ضد خيتافي",
      league: "الدوري الإسباني LaLiga",
      duration: "أهداف وملخص كامل",
      views: "تغطية رسمية HD",
      date: "اليوم",
      score: "ملخص وأهداف",
      thumbnail: "https://i.ytimg.com/vi/QYuNjCaf4KM/hqdefault.jpg",
      videoUrl: "https://www.scorebat.com/embed/v/69ed93763aa37/?utm_source=api&utm_medium=video&utm_campaign=lgc",
      videoType: "iframe",
      servers: [
        {
          name: "🎬 ملخص المباراة الكامل (ScoreBat HD)",
          quality: "1080p HD",
          type: "iframe",
          url: "https://www.scorebat.com/embed/v/69ed93763aa37/?utm_source=api&utm_medium=video&utm_campaign=lgc"
        },
        {
          name: "⚽ أهداف برشلونة (YouTube HD)",
          quality: "1080p HD",
          type: "iframe",
          url: "https://www.youtube.com/embed/QYuNjCaf4KM?autoplay=1"
        }
      ]
    },
    {
      id: "hl_sb_default_3",
      title: "ملخص وأهداف مباراة ليفربول ضد كريستال بالاس",
      league: "الدوري الإنجليزي الممتاز",
      duration: "أهداف وملخص كامل",
      views: "تغطية رسمية HD",
      date: "أمس",
      score: "ملخص وأهداف",
      thumbnail: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://www.scorebat.com/embed/v/69ed9358a0b56/?utm_source=api&utm_medium=video&utm_campaign=lgc",
      videoType: "iframe",
      servers: [
        {
          name: "🎬 ملخص وأهداف اللقاء (ScoreBat HD)",
          quality: "1080p HD",
          type: "iframe",
          url: "https://www.scorebat.com/embed/v/69ed9358a0b56/?utm_source=api&utm_medium=video&utm_campaign=lgc"
        }
      ]
    }
  ]
};
