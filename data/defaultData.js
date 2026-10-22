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
  "ريال مدريد": "https://crests.football-data.org/86.png",
  "برشلونة": "https://crests.football-data.org/81.png",
  "أتلتيكو مدريد": "https://crests.football-data.org/78.png",
  "أرسنال": "https://crests.football-data.org/57.png",
  "مانشستر سيتي": "https://crests.football-data.org/65.png",
  "ليفربول": "https://crests.football-data.org/64.png",
  "تشيلسي": "https://crests.football-data.org/61.png",
  "مانشستر يونايتد": "https://crests.football-data.org/66.png",
  "توتنهام": "https://crests.football-data.org/73.png",
  "نيوكاسل يونايتد": "https://crests.football-data.org/67.png",
  "باريس سان جيرمان": "https://crests.football-data.org/524.png",
  "بايرن ميونخ": "https://crests.football-data.org/5.png",
  "بوروسيا دورتموند": "https://crests.football-data.org/4.png",
  "باير ليفركوزن": "https://crests.football-data.org/3.png",
  "إنتر ميلان": "https://crests.football-data.org/108.png",
  "إي سي ميلان": "https://crests.football-data.org/98.png",
  "يوفنتوس": "https://crests.football-data.org/109.png",
  "نابولي": "https://crests.football-data.org/113.png",
  // الأندية المغربية والعربية والأفريقية بشعارات درع احترافية بألوان النادي الرسمية
  "الرجاء الرياضي": createClubCrestSVG("RCA", "#047857", "#064e3b", "#fbbf24", true),
  "الوداد الرياضي": createClubCrestSVG("WAC", "#dc2626", "#7f1d1d", "#fbbf24", true),
  "نهضة بركان": createClubCrestSVG("RSB", "#ea580c", "#111827", "#fbbf24", true),
  "الجيش الملكي": createClubCrestSVG("FAR", "#15803d", "#991b1b", "#fbbf24", true),
  "الفتح الرباطي": createClubCrestSVG("FUS", "#dc2626", "#1e293b", "#e2e8f0", false),
  "المغرب الفاسي": createClubCrestSVG("MAS", "#eab308", "#111827", "#fde047", true),
  "حسنية أكادير": createClubCrestSVG("HUSA", "#dc2626", "#991b1b", "#ffffff", false),
  "اتحاد طنجة": createClubCrestSVG("IRT", "#2563eb", "#1e3a8a", "#ffffff", false),
  "أولمبيك آسفي": createClubCrestSVG("OCS", "#1d4ed8", "#991b1b", "#fbbf24", false),
  "المغرب التطواني": createClubCrestSVG("MAT", "#dc2626", "#1e3a8a", "#ffffff", false),
  "الهلال": createClubCrestSVG("HILAL", "#1d4ed8", "#1e3a8a", "#fbbf24", true),
  "النصر": createClubCrestSVG("NASSR", "#eab308", "#1d4ed8", "#fde047", true),
  "الاتحاد": createClubCrestSVG("ITTI", "#ca8a04", "#111827", "#fde047", true),
  "الأهلي السعودي": createClubCrestSVG("AHLI", "#059669", "#064e3b", "#fbbf24", true),
  "الأهلي المصري": createClubCrestSVG("ASC", "#dc2626", "#7f1d1d", "#fbbf24", true),
  "الزمالك": createClubCrestSVG("ZSC", "#b91c1c", "#0f172a", "#fbbf24", true),
  "الترجي التونسي": createClubCrestSVG("EST", "#dc2626", "#eab308", "#fbbf24", true),
  "صن داونز": createClubCrestSVG("SUN", "#eab308", "#15803d", "#fbbf24", true)
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
    telegramUrl: "https://t.me/",
    adminPin: "1234",
    defaultTimezoneOffset: 1 // GMT+1 (توقيت المغرب)
  },
  matches: [
    // ==================== مباريات اليوم (TODAY) ====================
    {
      id: "m1",
      day: "today",
      dateLabel: "اليوم - الخميس 22 أكتوبر",
      league: "دوري أبطال أوروبا",
      leagueLogo: "🏆",
      status: "live",
      minute: "68'",
      timeGMT: "19:00",
      homeTeam: "ريال مدريد",
      homeLogo: window.CLUB_LOGOS["ريال مدريد"],
      homeScore: 2,
      homeScorers: "فينيسيوس (14')، مبابي (61')",
      awayTeam: "برشلونة",
      awayLogo: window.CLUB_LOGOS["برشلونة"],
      awayScore: 1,
      awayScorers: "لامين يامال (39')",
      channel: "beIN Sports HD 1",
      commentator: "عصام الشوالي",
      stadium: "سانتياغو برنابيو",
      round: "قمة الجولة - دوري الأبطال",
      featured: true,
      events: [
        { time: "14'", team: "home", player: "فينيسيوس جونيور", type: "goal" },
        { time: "39'", team: "away", player: "لامين يامال", type: "goal" },
        { time: "61'", team: "home", player: "كيليان مبابي", type: "goal" }
      ],
      servers: [
        {
          name: "سيرفر 1 الرئيسي (FHD 1080p)",
          quality: "1080p",
          type: "m3u8",
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        },
        {
          name: "سيرفر 2 سريع (HD 720p)",
          quality: "720p",
          type: "m3u8",
          url: "https://assets.afcdn.com/video49/20210722/v_645516.m3u8"
        },
        {
          name: "سيرفر 3 للإنترنت الضعيف (SD 480p)",
          quality: "480p",
          type: "m3u8",
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        }
      ]
    },
    {
      id: "m2",
      day: "today",
      dateLabel: "اليوم - الخميس 22 أكتوبر",
      league: "البطولة المغربية الاحترافية Inwi",
      leagueLogo: "🇲🇦",
      status: "live",
      minute: "55'",
      timeGMT: "19:00",
      homeTeam: "الرجاء الرياضي",
      homeLogo: window.CLUB_LOGOS["الرجاء الرياضي"],
      homeScore: 1,
      homeScorers: "يسري بوزوق (22')",
      awayTeam: "الوداد الرياضي",
      awayLogo: window.CLUB_LOGOS["الوداد الرياضي"],
      awayScore: 1,
      awayScorers: "حكيم زياش (44')",
      channel: "الرياضية المغربية TNT",
      commentator: "هشام فرج",
      stadium: "المركب الرياضي محمد الخامس",
      round: "الجولة 24 - ديربي الدار البيضاء",
      featured: true,
      events: [
        { time: "22'", team: "home", player: "يسري بوزوق", type: "goal" },
        { time: "44'", team: "away", player: "حكيم زياش", type: "goal" }
      ],
      servers: [
        {
          name: "سيرفر الرياضية 1 (FHD 1080p)",
          quality: "1080p",
          type: "m3u8",
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        },
        {
          name: "سيرفر 2 متعدد الجودات (HD 720p)",
          quality: "720p",
          type: "m3u8",
          url: "https://assets.afcdn.com/video49/20210722/v_645516.m3u8"
        }
      ]
    },
    {
      id: "m3",
      day: "today",
      dateLabel: "اليوم - الخميس 22 أكتوبر",
      league: "دوري أبطال أوروبا",
      leagueLogo: "🏆",
      status: "live",
      minute: "34'",
      timeGMT: "19:30",
      homeTeam: "إنتر ميلان",
      homeLogo: window.CLUB_LOGOS["إنتر ميلان"],
      homeScore: 1,
      homeScorers: "لاوتارو مارتينيز (19')",
      awayTeam: "بايرن ميونخ",
      awayLogo: window.CLUB_LOGOS["بايرن ميونخ"],
      awayScore: 0,
      awayScorers: "",
      channel: "beIN Sports HD 3",
      commentator: "خليل البلوشي",
      stadium: "جوزيبي مياتزا - سان سيرو",
      round: "دوري أبطال أوروبا",
      featured: false,
      events: [],
      servers: [
        {
          name: "سيرفر 1 (FHD 1080p)",
          quality: "1080p",
          type: "m3u8",
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        }
      ]
    },
    {
      id: "m4",
      day: "today",
      dateLabel: "اليوم - الخميس 22 أكتوبر",
      league: "الدوري الإنجليزي الممتاز",
      leagueLogo: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      status: "upcoming",
      minute: "تبدأ قريباً",
      timeGMT: "20:00",
      homeTeam: "أرسنال",
      homeLogo: window.CLUB_LOGOS["أرسنال"],
      homeScore: 0,
      awayTeam: "مانشستر سيتي",
      awayLogo: window.CLUB_LOGOS["مانشستر سيتي"],
      awayScore: 0,
      channel: "beIN Sports HD 2",
      commentator: "حفيظ دراجي",
      stadium: "ملعب الإمارات - لندن",
      round: "الأسبوع 32",
      featured: false,
      events: [],
      servers: [
        {
          name: "سيرفر 1 (FHD 1080p)",
          quality: "1080p",
          type: "m3u8",
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        }
      ]
    },
    {
      id: "m5",
      day: "today",
      dateLabel: "اليوم - الخميس 22 أكتوبر",
      league: "البطولة المغربية الاحترافية Inwi",
      leagueLogo: "🇲🇦",
      status: "upcoming",
      minute: "الليلة",
      timeGMT: "21:00",
      homeTeam: "نهضة بركان",
      homeLogo: window.CLUB_LOGOS["نهضة بركان"],
      homeScore: 0,
      awayTeam: "الجيش الملكي",
      awayLogo: window.CLUB_LOGOS["الجيش الملكي"],
      awayScore: 0,
      channel: "الرياضية المغربية HD",
      commentator: "عبد الصمد ولد شهيبة",
      stadium: "الملعب البلدي ببركان",
      round: "الجولة 24",
      featured: false,
      events: [],
      servers: [
        {
          name: "سيرفر 1 (FHD 1080p)",
          quality: "1080p",
          type: "m3u8",
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        }
      ]
    },
    {
      id: "m6",
      day: "today",
      dateLabel: "اليوم - الخميس 22 أكتوبر",
      league: "دوري روشن السعودي",
      leagueLogo: "🇸🇦",
      status: "finished",
      minute: "انتهت",
      timeGMT: "17:00",
      homeTeam: "الهلال",
      homeLogo: window.CLUB_LOGOS["الهلال"],
      homeScore: 3,
      homeScorers: "ميتروفيتش (12'، 54')، سالم الدوسري (81')",
      awayTeam: "النصر",
      awayLogo: window.CLUB_LOGOS["النصر"],
      awayScore: 2,
      awayScorers: "كريستيانو رونالدو (28'، 75')",
      channel: "SSC 1 HD",
      commentator: "فارس عوض",
      stadium: "المملكة أرينا - الرياض",
      round: "الجولة 28",
      featured: false,
      events: [],
      servers: [
        {
          name: "إعادة وملخص المباراة (FHD)",
          quality: "1080p",
          type: "m3u8",
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        }
      ]
    },

    // ==================== مباريات الأمس (YESTERDAY) ====================
    {
      id: "m7",
      day: "yesterday",
      dateLabel: "أمس - الأربعاء 21 أكتوبر",
      league: "دوري أبطال أوروبا",
      leagueLogo: "🏆",
      status: "finished",
      minute: "انتهت",
      timeGMT: "19:00",
      homeTeam: "باريس سان جيرمان",
      homeLogo: window.CLUB_LOGOS["باريس سان جيرمان"],
      homeScore: 2,
      homeScorers: "ديمبيلي (18')، حكيمي (74')",
      awayTeam: "ليفربول",
      awayLogo: window.CLUB_LOGOS["ليفربول"],
      awayScore: 2,
      awayScorers: "محمد صلاح (33'، 88')",
      channel: "beIN Sports HD 1",
      commentator: "حسن العيدروس",
      stadium: "حديقة الأمراء - باريس",
      round: "دوري أبطال أوروبا",
      featured: false,
      events: [],
      servers: [
        {
          name: "ملخص وأهداف اللقاء (HD)",
          quality: "1080p",
          type: "m3u8",
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        }
      ]
    },
    {
      id: "m8",
      day: "yesterday",
      dateLabel: "أمس - الأربعاء 21 أكتوبر",
      league: "دوري أبطال أوروبا",
      leagueLogo: "🏆",
      status: "finished",
      minute: "انتهت",
      timeGMT: "19:00",
      homeTeam: "بوروسيا دورتموند",
      homeLogo: window.CLUB_LOGOS["بوروسيا دورتموند"],
      homeScore: 3,
      homeScorers: "سيرهو غيراسي (11'، 49')، براندت (82')",
      awayTeam: "إي سي ميلان",
      awayLogo: window.CLUB_LOGOS["إي سي ميلان"],
      awayScore: 1,
      awayScorers: "رافائيل لياو (56')",
      channel: "beIN Sports HD 2",
      commentator: "علي محمد علي",
      stadium: "سيغنال إيدونا بارك",
      round: "دوري أبطال أوروبا",
      featured: false,
      events: [],
      servers: [
        {
          name: "ملخص وأهداف اللقاء",
          quality: "1080p",
          type: "m3u8",
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        }
      ]
    },
    {
      id: "m9",
      day: "yesterday",
      dateLabel: "أمس - الأربعاء 21 أكتوبر",
      league: "البطولة المغربية الاحترافية Inwi",
      leagueLogo: "🇲🇦",
      status: "finished",
      minute: "انتهت",
      timeGMT: "18:00",
      homeTeam: "المغرب الفاسي",
      homeLogo: window.CLUB_LOGOS["المغرب الفاسي"],
      homeScore: 2,
      homeScorers: "بورغيس (25')، الجناتي (67')",
      awayTeam: "الفتح الرباطي",
      awayLogo: window.CLUB_LOGOS["الفتح الرباطي"],
      awayScore: 1,
      awayScorers: "هنوري (41')",
      channel: "الرياضية المغربية TNT",
      commentator: "سفيان رشيدي",
      stadium: "المركب الرياضي بفاس",
      round: "الجولة 24",
      featured: false,
      events: [],
      servers: [
        {
          name: "ملخص المباراة الكامل",
          quality: "1080p",
          type: "m3u8",
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        }
      ]
    },
    {
      id: "m10",
      day: "yesterday",
      dateLabel: "أمس - الأربعاء 21 أكتوبر",
      league: "دوري أبطال أفريقيا",
      leagueLogo: "🌍",
      status: "finished",
      minute: "انتهت",
      timeGMT: "17:00",
      homeTeam: "الأهلي المصري",
      homeLogo: window.CLUB_LOGOS["الأهلي المصري"],
      homeScore: 2,
      homeScorers: "وسام أبو علي (15')، إمام عاشور (79')",
      awayTeam: "الترجي التونسي",
      awayLogo: window.CLUB_LOGOS["الترجي التونسي"],
      awayScore: 0,
      awayScorers: "",
      channel: "beIN Sports HD 6",
      commentator: "عصام الشوالي",
      stadium: "استاد القاهرة الدولي",
      round: "نصف النهائي",
      featured: false,
      events: [],
      servers: [
        {
          name: "ملخص وأهداف اللقاء",
          quality: "1080p",
          type: "m3u8",
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        }
      ]
    },

    // ==================== مباريات الغد (TOMORROW) ====================
    {
      id: "m11",
      day: "tomorrow",
      dateLabel: "غداً - الجمعة 23 أكتوبر",
      league: "الدوري الإنجليزي الممتاز",
      leagueLogo: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      status: "upcoming",
      minute: "غداً",
      timeGMT: "18:30",
      homeTeam: "ليفربول",
      homeLogo: window.CLUB_LOGOS["ليفربول"],
      homeScore: 0,
      awayTeam: "تشيلسي",
      awayLogo: window.CLUB_LOGOS["تشيلسي"],
      awayScore: 0,
      channel: "beIN Sports HD 1",
      commentator: "رؤوف خليف",
      stadium: "ملعب أنفيلد",
      round: "الأسبوع 33",
      featured: false,
      events: [],
      servers: [
        {
          name: "سيرفر البث الرئيسي (FHD)",
          quality: "1080p",
          type: "m3u8",
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        }
      ]
    },
    {
      id: "m12",
      day: "tomorrow",
      dateLabel: "غداً - الجمعة 23 أكتوبر",
      league: "الدوري الإسباني LaLiga",
      leagueLogo: "🇪🇸",
      status: "upcoming",
      minute: "غداً",
      timeGMT: "19:00",
      homeTeam: "أتلتيكو مدريد",
      homeLogo: window.CLUB_LOGOS["أتلتيكو مدريد"],
      homeScore: 0,
      awayTeam: "ريال مدريد",
      awayLogo: window.CLUB_LOGOS["ريال مدريد"],
      awayScore: 0,
      channel: "beIN Sports HD 3",
      commentator: "حفيظ دراجي",
      stadium: "سيفيتاس ميتروبوليتانو",
      round: "ديربي مدريد - الجولة 32",
      featured: false,
      events: [],
      servers: [
        {
          name: "سيرفر 1 (FHD 1080p)",
          quality: "1080p",
          type: "m3u8",
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        }
      ]
    },
    {
      id: "m13",
      day: "tomorrow",
      dateLabel: "غداً - الجمعة 23 أكتوبر",
      league: "البطولة المغربية الاحترافية Inwi",
      leagueLogo: "🇲🇦",
      status: "upcoming",
      minute: "غداً",
      timeGMT: "17:00",
      homeTeam: "اتحاد طنجة",
      homeLogo: window.CLUB_LOGOS["اتحاد طنجة"],
      homeScore: 0,
      awayTeam: "حسنية أكادير",
      awayLogo: window.CLUB_LOGOS["حسنية أكادير"],
      awayScore: 0,
      channel: "الرياضية المغربية TNT",
      commentator: "محمد العدالي",
      stadium: "الملعب الكبير لطنجة",
      round: "الجولة 25",
      featured: false,
      events: [],
      servers: [
        {
          name: "سيرفر الرياضية (FHD)",
          quality: "1080p",
          type: "m3u8",
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        }
      ]
    },
    {
      id: "m14",
      day: "tomorrow",
      dateLabel: "غداً - الجمعة 23 أكتوبر",
      league: "دوري روشن السعودي",
      leagueLogo: "🇸🇦",
      status: "upcoming",
      minute: "غداً",
      timeGMT: "18:00",
      homeTeam: "الاتحاد",
      homeLogo: window.CLUB_LOGOS["الاتحاد"],
      homeScore: 0,
      awayTeam: "الأهلي السعودي",
      awayLogo: window.CLUB_LOGOS["الأهلي السعودي"],
      awayScore: 0,
      channel: "SSC 1 HD",
      commentator: "فهد العتيبي",
      stadium: "الجوهرة المشعة - جدة",
      round: "ديربي جدة - الجولة 29",
      featured: false,
      events: [],
      servers: [
        {
          name: "سيرفر SSC 1 (FHD)",
          quality: "1080p",
          type: "m3u8",
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        }
      ]
    },

    // ==================== مباريات الأيام المقبلة (UPCOMING DAYS) ====================
    {
      id: "m15",
      day: "upcoming_days",
      dateLabel: "السبت 24 أكتوبر 2026",
      league: "الدوري الإنجليزي الممتاز",
      leagueLogo: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      status: "upcoming",
      minute: "السبت 24 أكتوبر",
      timeGMT: "16:30",
      homeTeam: "مانشستر يونايتد",
      homeLogo: window.CLUB_LOGOS["مانشستر يونايتد"],
      homeScore: 0,
      awayTeam: "توتنهام",
      awayLogo: window.CLUB_LOGOS["توتنهام"],
      awayScore: 0,
      channel: "beIN Sports HD 1",
      commentator: "عصام الشوالي",
      stadium: "أولد ترافورد",
      round: "الأسبوع 33",
      featured: false,
      events: [],
      servers: [
        {
          name: "سيرفر البث الرئيسي (FHD)",
          quality: "1080p",
          type: "m3u8",
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        }
      ]
    },
    {
      id: "m16",
      day: "upcoming_days",
      dateLabel: "السبت 24 أكتوبر 2026",
      league: "الدوري الإيطالي Serie A",
      leagueLogo: "🇮🇹",
      status: "upcoming",
      minute: "السبت 24 أكتوبر",
      timeGMT: "18:45",
      homeTeam: "يوفنتوس",
      homeLogo: window.CLUB_LOGOS["يوفنتوس"],
      homeScore: 0,
      awayTeam: "نابولي",
      awayLogo: window.CLUB_LOGOS["نابولي"],
      awayScore: 0,
      channel: "AD Sports Premium 1",
      commentator: "فارس عوض",
      stadium: "أليانز ستاديوم - تورينو",
      round: "الجولة 33",
      featured: false,
      events: [],
      servers: [
        {
          name: "سيرفر البث الرئيسي (FHD)",
          quality: "1080p",
          type: "m3u8",
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        }
      ]
    },
    {
      id: "m17",
      day: "upcoming_days",
      dateLabel: "الأحد 25 أكتوبر 2026",
      league: "البطولة المغربية الاحترافية Inwi",
      leagueLogo: "🇲🇦",
      status: "upcoming",
      minute: "الأحد 25 أكتوبر",
      timeGMT: "19:00",
      homeTeam: "الجيش الملكي",
      homeLogo: window.CLUB_LOGOS["الجيش الملكي"],
      homeScore: 0,
      awayTeam: "الرجاء الرياضي",
      awayLogo: window.CLUB_LOGOS["الرجاء الرياضي"],
      awayScore: 0,
      channel: "الرياضية المغربية TNT",
      commentator: "هشام فرج",
      stadium: "الملعب البلدي بالقنيطرة",
      round: "كلاسيكو المغرب - الجولة 25",
      featured: false,
      events: [],
      servers: [
        {
          name: "سيرفر الرياضية 1 (FHD)",
          quality: "1080p",
          type: "m3u8",
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        }
      ]
    },
    {
      id: "m18",
      day: "upcoming_days",
      dateLabel: "الأحد 25 أكتوبر 2026",
      league: "الدوري الألماني Bundesliga",
      leagueLogo: "🇩🇪",
      status: "upcoming",
      minute: "الأحد 25 أكتوبر",
      timeGMT: "17:30",
      homeTeam: "بايرن ميونخ",
      homeLogo: window.CLUB_LOGOS["بايرن ميونخ"],
      homeScore: 0,
      awayTeam: "باير ليفركوزن",
      awayLogo: window.CLUB_LOGOS["باير ليفركوزن"],
      awayScore: 0,
      channel: "beIN Sports HD 5",
      commentator: "علي محمد علي",
      stadium: "أليانز أرينا - ميونخ",
      round: "قمة البوندسليغا",
      featured: false,
      events: [],
      servers: [
        {
          name: "سيرفر البث الرئيسي (FHD)",
          quality: "1080p",
          type: "m3u8",
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        }
      ]
    },
    {
      id: "m19",
      day: "upcoming_days",
      dateLabel: "الثلاثاء 27 أكتوبر 2026",
      league: "دوري أبطال أوروبا",
      leagueLogo: "🏆",
      status: "upcoming",
      minute: "الثلاثاء 27 أكتوبر",
      timeGMT: "19:00",
      homeTeam: "برشلونة",
      homeLogo: window.CLUB_LOGOS["برشلونة"],
      homeScore: 0,
      awayTeam: "باريس سان جيرمان",
      awayLogo: window.CLUB_LOGOS["باريس سان جيرمان"],
      awayScore: 0,
      channel: "beIN Sports HD 1",
      commentator: "عصام الشوالي",
      stadium: "سبوتيفاي كامب نو",
      round: "إياب نصف النهائي",
      featured: false,
      events: [],
      servers: [
        {
          name: "سيرفر 1 الرئيسي (FHD)",
          quality: "1080p",
          type: "m3u8",
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        }
      ]
    },
    {
      id: "m20",
      day: "upcoming_days",
      dateLabel: "الأربعاء 28 أكتوبر 2026",
      league: "كأس الكونفدرالية الأفريقية",
      leagueLogo: "🌍",
      status: "upcoming",
      minute: "الأربعاء 28 أكتوبر",
      timeGMT: "18:00",
      homeTeam: "نهضة بركان",
      homeLogo: window.CLUB_LOGOS["نهضة بركان"],
      homeScore: 0,
      awayTeam: "الزمالك",
      awayLogo: window.CLUB_LOGOS["الزمالك"],
      awayScore: 0,
      channel: "beIN Sports HD 6",
      commentator: "جواد بدة",
      stadium: "الملعب البلدي ببركان",
      round: "النهائي الأفريقي",
      featured: false,
      events: [],
      servers: [
        {
          name: "سيرفر 1 الرئيسي (FHD)",
          quality: "1080p",
          type: "m3u8",
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
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
