/* =========================================================
   script.js — A Day in Hyungee’s World (Version 2.0)
   ---------------------------------------------------------
   이 파일이 하는 일
   1. 한국시간(Asia/Seoul)을 계산해서 지금 시간에 맞는 캐릭터를 자동으로 보여줍니다.
   2. 왼쪽 카드를 누르면 캐릭터·배경색·설명이 부드럽게 바뀝니다.
      (직접 고른 동안에는 시간이 지나도 자동으로 바뀌지 않고, Back to Now로 복귀)
   3. 상단에 서울 날짜·시간·날씨를 표시합니다. (날씨: Open-Meteo 공개 API, 키 없음)
   4. 주소 끝에 ?test 를 붙이면 임의의 한국시간으로 테스트할 수 있는 패널이 나옵니다.

   ✏️ 문구·링크·시간표를 고치고 싶다면 → 아래 "A. 수정용 데이터"만 고치면 됩니다.
   ========================================================= */


/* =========================================================
   A. 수정용 데이터 (문구·링크·시간표를 모두 여기에 모아둠)
   ========================================================= */

/**
 * 캐릭터별 내용.
 * - links의 url이 null이면 "TBD(미설정)" 버튼으로 표시되고 눌러도 아무 일도 없습니다.
 *   주소가 생기면 null 대신 "https://..." (이메일은 "mailto:주소") 를 넣으세요.
 */
const CHARACTERS = {
  work: {
    name: "Work",
    image: "assets/work-hyungee.webp",
    width: 1131,
    height: 1354,
    alt: "Hyungee in a navy suit, typing on a laptop at her desk",
    label: "Work mode",
    title: "Oops, Hyungee’s at work!",
    body: "Probably juggling a million things right now.",
    facts: [
      { term: "Company", value: "Samsung Welstory" },
      { term: "Role", value: "Global F&B Export Planning & Strategy" },
    ],
    cta: "Let’s talk business!",
    links: [
      { label: "LinkedIn", url: "https://www.linkedin.com/in/hyungeejo" },
      { label: "Email", url: "mailto:hyungee.jo@samsung.com" }, // mailto: → 기본 메일 앱이 열림
    ],
  },

  foodie: {
    name: "Foodie",
    image: "assets/taste-hyungee.webp",
    width: 1150,
    height: 1342,
    alt: "Hyungee at a wooden table with steak, pasta and a glass of red wine",
    label: "Foodie mode",
    title: "Shhh… Hyungee’s eating!",
    body: "Good food, good wine, great company.",
    cta: "Coffee or dinner? I’m in!",
    links: [
      { label: "Instagram", url: "https://www.instagram.com/local_jo/" },
    ],
  },

  offduty: {
    name: "Off-Duty",
    image: "assets/life-hyungee.webp",
    width: 1279,
    height: 1342,
    alt: "Hyungee in a white visor swinging a golf club on the grass",
    label: "Off-Duty mode",
    title: "Out of office, into the wild!",
    body: "Probably chasing golf balls… or sunshine.",
    cta: "Wanna join the fun?",
    links: [
      { label: "Instagram", url: "https://www.instagram.com/local_jo/" },
    ],
  },

  sleep: {
    name: "Sleep",
    image: "assets/sleep-hyungee.webp",
    width: 1400,
    height: 1012,
    alt: "Hyungee asleep under a soft blanket next to a crescent-moon lamp",
    label: "Sleep mode",
    title: "Shhh… Hyungee’s dreaming.",
    body: "Even busy girls need their beauty sleep.",
    cta: "Leave me a message. I’ll be back at 8 AM!",
    links: [
      // 제목이 미리 채워진 이메일 (%20 = 띄어쓰기)
      { label: "Leave a message 💌", url: "mailto:hyungee.jo@samsung.com?subject=Hello%20Hyungee!" },
    ],
  },
};

// 썸네일 순서 (항상 이 순서로 고정, 선택해도 바뀌지 않음)
const ORDER = ["work", "foodie", "offduty", "sleep"];

/**
 * 한국시간 시간표. from~to는 "그 분(minute)까지 포함"입니다.
 * situation은 아래 QUIPS(재치 있는 문구)를 고를 때 쓰는 이름입니다.
 */
const SCHEDULE = {
  weekday: [ // 월~금
    { from: "00:00", to: "07:59", mode: "sleep",   situation: "night" },
    { from: "08:00", to: "11:29", mode: "work",    situation: "morningWork" },
    { from: "11:30", to: "12:30", mode: "foodie",  situation: "lunch" },
    { from: "12:31", to: "16:59", mode: "work",    situation: "afternoonWork" },
    { from: "17:00", to: "21:59", mode: "foodie",  situation: "dinner" },
    { from: "22:00", to: "23:59", mode: "sleep",   situation: "night" },
  ],
  weekend: [ // 토~일
    { from: "00:00", to: "07:59", mode: "sleep",   situation: "night" },
    { from: "08:00", to: "21:59", mode: "offduty", situation: "weekend" },
    { from: "22:00", to: "23:59", mode: "sleep",   situation: "night" },
  ],
};

/**
 * 지금 시간과 "다른" 캐릭터를 골랐을 때 보여줄 한 줄.
 * QUIPS[지금 상황][고른 캐릭터]
 */
const QUIPS = {
  morningWork: {
    foodie: "Thinking about food already? Lunch starts at 11:30!",
    offduty: "Daydreaming about the weekend? Same here.",
    sleep: "Nap time? Nice try. It’s still office hours.",
  },
  lunch: {
    work: "Working through lunch? She’d rather not.",
    offduty: "A quick swing after lunch? Only in her dreams.",
    sleep: "Food coma incoming… but not just yet!",
  },
  afternoonWork: {
    foodie: "Snack o’clock? Dinner starts at 5!",
    offduty: "Daydreaming about the weekend? Same here.",
    sleep: "Afternoon slump? Coffee first, sleep later.",
  },
  dinner: {
    work: "Clocked out! Work can wait until tomorrow.",
    offduty: "Evening plans? She’s busy with dinner.",
    sleep: "Bedtime’s at 10. Dessert first!",
  },
  weekend: {
    work: "It’s the weekend! She’s off the clock.",
    foodie: "Weekend calories don’t count… right?",
    sleep: "Sleeping in? The fairway is calling!",
  },
  night: {
    work: "Burning the midnight oil? She’s already asleep.",
    foodie: "Midnight snack? Tempting… but she’s dreaming.",
    offduty: "Night golf? The course is closed. See you in the morning!",
  },
};

// 화면에 쓰이는 기타 문구
const UI_TEXT = {
  greeting: (weekday) => `Hello, it’s ${weekday}!`, // 메인 헤드라인 (서울 요일)
  statusLive: "Live now in Seoul",
  tbdTitle: "Link coming soon",
  weatherUnavailable: "--", // 날씨를 못 불러왔을 때 표시
};

// 날씨 설정 (Open-Meteo: 무료·공개 API, 비밀 키 필요 없음)
const WEATHER = {
  url: "https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m,weather_code,is_day&timezone=Asia%2FSeoul",
  refreshMs: 15 * 60 * 1000, // 성공하면 15분 뒤 새로고침
  retryMs: 60 * 1000,        // 실패하면 1분 뒤 다시 시도
  timeoutMs: 8000,           // 8초 안에 응답이 없으면 실패로 처리
};

// 하늘(해·달) 설정 — 일출·일몰도 Open-Meteo(무료·공개, 키 없음)에서 받아옵니다
const SKY = {
  url: (start, end) =>
    "https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780" +
    `&daily=sunrise,sunset&timezone=Asia%2FSeoul&timeformat=unixtime&start_date=${start}&end_date=${end}`,
  timeoutMs: 8000,
  retryMs: 2 * 60 * 1000,  // 실패하면 2분 뒤 다시 시도
  twilightMinutes: 45,     // 일몰 후·일출 전 45분 동안 달·별이 서서히 나타나고 사라짐
  blendMinutes: 30,        // 배경 단계가 바뀔 때 두 그라데이션이 섞이는 시간 (경계 앞뒤 15분씩)
  borrowDays: 3,           // 조회 실패 시, 앞뒤 3일 안에 받아둔 실제 데이터가 있으면 사용
  storageKey: "hyungee-sun-times-v1", // 받아온 일출·일몰을 브라우저에 저장하는 이름
  // 배경 단계 규칙 (분 단위)
  phases: {
    morningBeforeSunriseMin: 30,   // Morning: 일출 30분 전부터
    daylightStartsAt: "10:00",     // Daylight: 오전 10시부터
    minMorningAfterSunriseMin: 60, //   (일출이 아주 늦은 날도 아침이 최소 1시간은 유지되도록)
    goldenBeforeSunsetMin: 60,     // Golden Hour: 일몰 1시간 전부터
    nightAfterSunsetMin: 30,       // Night: 일몰 30분 후부터
  },
  // 별 위치 [가로 %, 세로 %, 반짝임 시작 지연(초)] — 위쪽 하늘에만
  stars: [
    [8, 10, 0], [18, 26, 1.2], [27, 6, 2.6], [36, 18, 0.6], [47, 9, 3.1], [58, 22, 1.8],
    [66, 7, 0.3], [75, 16, 2.2], [86, 9, 1.0], [93, 24, 3.6], [13, 38, 2.9], [88, 36, 0.9],
  ],
};

// 시간 테스트 패널의 빠른 선택 버튼 (2026-10-19 = 월요일, 10-24 = 토요일)
const TEST_PRESETS = [
  { label: "Mon 07:59", value: "2026-10-19T07:59" },
  { label: "Mon 08:00", value: "2026-10-19T08:00" },
  { label: "Mon 11:29", value: "2026-10-19T11:29" },
  { label: "Mon 11:30", value: "2026-10-19T11:30" },
  { label: "Mon 12:30", value: "2026-10-19T12:30" },
  { label: "Mon 12:31", value: "2026-10-19T12:31" },
  { label: "Mon 16:59", value: "2026-10-19T16:59" },
  { label: "Mon 17:00", value: "2026-10-19T17:00" },
  { label: "Mon 21:59", value: "2026-10-19T21:59" },
  { label: "Mon 22:00", value: "2026-10-19T22:00" },
  { label: "Fri 23:30", value: "2026-10-23T23:30" },
  { label: "Sat 07:59", value: "2026-10-24T07:59" },
  { label: "Sat 08:00", value: "2026-10-24T08:00" },
  { label: "Sun 21:59", value: "2026-10-25T21:59" },
];


/* =========================================================
   B. 한국시간 계산
   ========================================================= */

const SEOUL_TZ = "Asia/Seoul";

// 기기 시간대와 관계없이 항상 서울 기준으로 바꿔주는 도구들 (Intl = 브라우저 내장 국제화 기능)
const seoulPartsFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: SEOUL_TZ, weekday: "long", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});
const seoulTimeFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: SEOUL_TZ, hour: "numeric", minute: "2-digit", hour12: true,
});

// 테스트용 시간 차이(밀리초). 0이면 실제 현재 시각을 사용합니다.
let testOffsetMs = 0;

/** 지금 시각 (테스트 중이면 테스트 시각) */
function now() {
  return new Date(Date.now() + testOffsetMs);
}

/** "08:30" → 510 (자정부터 몇 분째인지) */
function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** 주어진 시각의 서울 요일·시·분 */
function getSeoulParts(date) {
  const parts = {};
  seoulPartsFormat.formatToParts(date).forEach((p) => { parts[p.type] = p.value; });
  const weekday = parts.weekday;
  return {
    weekday,
    minutes: (Number(parts.hour) % 24) * 60 + Number(parts.minute),
    isWeekend: weekday === "Saturday" || weekday === "Sunday",
  };
}

/** 주어진 시각에 어떤 캐릭터/상황인지 시간표에서 찾기 */
function getScheduleAt(date) {
  const { minutes, isWeekend } = getSeoulParts(date);
  const table = isWeekend ? SCHEDULE.weekend : SCHEDULE.weekday;
  const slot = table.find((s) => minutes >= toMinutes(s.from) && minutes <= toMinutes(s.to));
  return slot || table[0];
}


/* =========================================================
   C. 화면 요소 & 상태
   ========================================================= */

const els = {
  time: document.getElementById("seoul-time"),
  weather: document.getElementById("seoul-weather"),
  greeting: document.getElementById("greeting"),
  picker: document.getElementById("picker"),
  hero: document.getElementById("hero-image"),
  heroArt: document.getElementById("hero-art"),
  heroParts: document.querySelectorAll(".hero__part"),
  info: document.getElementById("info"),
  content: document.getElementById("info-content"),
  status: document.getElementById("info-status"),
  statusText: document.getElementById("info-status-text"),
  backToNow: document.getElementById("back-to-now"),
  label: document.getElementById("info-label"),
  title: document.getElementById("info-title"),
  body: document.getElementById("info-body"),
  facts: document.getElementById("info-facts"),
  quip: document.getElementById("info-quip"),
  cta: document.getElementById("info-cta"),
  actions: document.getElementById("info-actions"),
};

const state = {
  autoMode: null,      // 지금 한국시간에 맞는 캐릭터
  situation: null,     // 지금 상황 (QUIPS용)
  pickedMode: null,    // 방문자가 직접 고른 캐릭터 (없으면 null)
  shownMode: null,     // 지금 화면에 보이는 캐릭터
  lastClock: "",       // 시계가 바뀌었는지 확인용
  swapToken: 0,        // 빠르게 여러 번 클릭할 때 전환이 꼬이지 않게 하는 번호
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");


/* =========================================================
   D. 화면 그리기
   ========================================================= */

/** 왼쪽 썸네일 카드 4개 만들기 (ORDER 순서 고정) */
function buildPicker() {
  ORDER.forEach((mode) => {
    const c = CHARACTERS[mode];
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "card";
    button.dataset.mode = mode;
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", c.name); // 화면에 글자는 없고, 화면 낭독기에는 이름을 알려줌
    button.title = c.name;                     // 마우스를 올리면 이름이 작게 보임

    const img = document.createElement("img");
    img.className = "card__thumb";
    img.src = c.image;
    img.alt = "";
    img.width = c.width;
    img.height = c.height;

    // 지금 시간 캐릭터 표시: 작은 점 (글자 'Now'는 화면 낭독기에만)
    const nowBadge = document.createElement("span");
    nowBadge.className = "card__now";
    nowBadge.innerHTML = `<span class="visually-hidden">Now</span>`;
    nowBadge.hidden = true;

    button.append(img, nowBadge);
    button.addEventListener("click", () => pick(mode));
    li.append(button);
    els.picker.append(li);
  });
}

/** 링크 버튼 하나 만들기 (url이 없으면 TBD 표시) */
function makeLink({ label, url }) {
  if (!url) {
    const span = document.createElement("span");
    span.className = "btn btn--tbd";
    span.setAttribute("role", "link");
    span.setAttribute("aria-disabled", "true");
    span.title = UI_TEXT.tbdTitle;
    span.innerHTML = `<span></span><span class="btn__tag">TBD</span>`;
    span.firstChild.textContent = label;
    return span;
  }
  const a = document.createElement("a");
  a.className = "btn";
  a.href = url;
  // 웹 주소는 새 탭에서 열고(↗ 표시), mailto: 이메일 링크는 기본 메일 앱이 열리도록 그대로 둠
  const isWeb = /^https?:/.test(url);
  if (isWeb) {
    a.target = "_blank";            // 새 탭에서 열기
    a.rel = "noopener noreferrer";  // 보안을 위한 설정
  }
  a.innerHTML = isWeb ? `<span></span><span aria-hidden="true">↗</span>` : `<span></span>`;
  a.firstChild.textContent = label;
  return a;
}

/** 오른쪽 설명 패널 내용 채우기 */
function fillInfo(mode) {
  const c = CHARACTERS[mode];
  els.label.textContent = c.label;
  els.title.textContent = c.title;
  els.body.textContent = c.body;
  els.cta.textContent = c.cta;

  // 소속·직무
  els.facts.replaceChildren();
  els.facts.hidden = !c.facts;
  (c.facts || []).forEach(({ term, value }) => {
    const row = document.createElement("div");
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = term;
    dd.textContent = value;
    row.append(dt, dd);
    els.facts.append(row);
  });

  // 버튼들
  els.actions.replaceChildren(...(c.links || []).map(makeLink));
}

/** 상태 표시(Live now), Back to Now, 재치 문구 갱신 */
function updateStatus() {
  const isManual = state.pickedMode !== null;
  els.info.classList.toggle("is-manual", isManual);
  // 지금 시간 캐릭터일 때만 'Live now in Seoul' 표시 (직접 고른 경우엔 Back to Now 링크만)
  els.status.hidden = isManual;
  els.statusText.textContent = UI_TEXT.statusLive;
  els.backToNow.hidden = !isManual;

  const quip = isManual ? QUIPS[state.situation]?.[state.shownMode] : null;
  els.quip.hidden = !quip;
  els.quip.textContent = quip || "";

  // 썸네일: 선택 표시 + 지금 시간 캐릭터에 'Now' 표시
  els.picker.querySelectorAll(".card").forEach((card) => {
    card.setAttribute("aria-pressed", String(card.dataset.mode === state.shownMode));
    card.querySelector(".card__now").hidden = card.dataset.mode !== state.autoMode;
  });
}

/** 캐릭터 화면 전환 (배경색·큰 이미지·설명) */
function show(mode) {
  if (mode === state.shownMode) {
    updateStatus();
    return;
  }
  const first = state.shownMode === null;
  state.shownMode = mode;
  document.body.dataset.mode = mode; // 캐릭터 모션용 (배경색은 하늘 단계가 결정)
  updateStatus();

  const c = CHARACTERS[mode];
  const apply = () => {
    els.hero.src = c.image;
    els.hero.alt = c.alt;
    els.hero.width = c.width;
    els.hero.height = c.height;
    // 모션용으로 겹쳐 둔 이미지들도 같은 그림으로 교체
    els.heroParts.forEach((part) => { part.src = c.image; });
    // 상자 비율을 이미지에 맞추고, 모드별 움직임(style.css 6-1)을 선택
    els.heroArt.style.setProperty("--ratio", `${c.width} / ${c.height}`);
    els.heroArt.dataset.motion = mode;
    fillInfo(mode);
  };

  // 첫 화면이거나 '동작 줄이기' 설정이면 애니메이션 없이 바로 바꿈
  if (first || reduceMotion.matches) {
    apply();
    return;
  }

  // 1) 살짝 작아지며 사라짐 → 2) 내용 교체 → 3) 이미지가 준비되면 다시 나타남
  const token = ++state.swapToken;
  els.heroArt.classList.add("is-swapping");
  els.content.classList.add("is-swapping");
  setTimeout(async () => {
    if (token !== state.swapToken) return; // 그 사이 다른 캐릭터를 눌렀으면 이번 전환은 취소
    apply();
    try { await els.hero.decode(); } catch (e) { /* 디코딩 실패해도 그대로 보여줌 */ }
    if (token !== state.swapToken) return;
    els.heroArt.classList.remove("is-swapping");
    els.content.classList.remove("is-swapping");
  }, 220);
}

/** 방문자가 카드를 눌렀을 때 */
function pick(mode) {
  // 지금 시간에 맞는 캐릭터를 고르면 = 'Live' 상태로 복귀
  state.pickedMode = mode === state.autoMode ? null : mode;
  show(mode);
  updateStatus();
}

/** Back to Now: 현재 한국시간 캐릭터로 복귀 */
function backToNow() {
  state.pickedMode = null;
  show(state.autoMode);
  updateStatus();
}


/* =========================================================
   E. 시계 (1초마다 확인)
   ========================================================= */

function tick() {
  const date = now();
  const { weekday } = getSeoulParts(date);
  const timeText = seoulTimeFormat.format(date);

  // 분이 바뀌었을 때만 글자 갱신
  if (timeText !== state.lastClock) {
    state.lastClock = timeText;
    els.time.textContent = timeText;
    els.greeting.textContent = UI_TEXT.greeting(weekday);
  }

  // 시간표 확인 → 바뀌었으면 캐릭터 자동 전환 (직접 고른 동안에는 덮어쓰지 않음)
  const slot = getScheduleAt(date);
  if (slot.mode !== state.autoMode || slot.situation !== state.situation) {
    state.autoMode = slot.mode;
    state.situation = slot.situation;
    if (state.pickedMode === state.autoMode) state.pickedMode = null; // 고른 캐릭터가 '지금'이 되면 Live로
    if (state.pickedMode === null) show(state.autoMode);
    updateStatus();
  }

  // 하늘은 캐릭터 선택과 관계없이 항상 '지금' 한국시간을 반영
  updateSky(date);
}


/* =========================================================
   F. 날씨 (Open-Meteo)
   ========================================================= */

/** WMO 날씨 코드 → 이모지 + 설명. 모르는 코드면 null (추측하지 않음) */
function describeWeather(code, isDay) {
  if (code === 0) return isDay ? { emoji: "☀️", label: "Clear" } : { emoji: "🌙", label: "Clear night" };
  if (code === 1) return isDay ? { emoji: "🌤️", label: "Mainly clear" } : { emoji: "🌙", label: "Mainly clear" };
  if (code === 2) return { emoji: "⛅", label: "Partly cloudy" };
  if (code === 3) return { emoji: "☁️", label: "Overcast" };
  if (code === 45 || code === 48) return { emoji: "🌫️", label: "Fog" };
  if ([51, 53, 55].includes(code)) return { emoji: "🌦️", label: "Drizzle" };
  if ([56, 57].includes(code)) return { emoji: "🌧️", label: "Freezing drizzle" };
  if ([61, 63, 65].includes(code)) return { emoji: "🌧️", label: "Rain" };
  if ([66, 67].includes(code)) return { emoji: "🌧️", label: "Freezing rain" };
  if ([71, 73, 75, 77].includes(code)) return { emoji: "❄️", label: "Snow" };
  if ([80, 81, 82].includes(code)) return { emoji: "🌧️", label: "Rain showers" };
  if ([85, 86].includes(code)) return { emoji: "🌨️", label: "Snow showers" };
  if ([95, 96, 99].includes(code)) return { emoji: "⛈️", label: "Thunderstorm" };
  return null;
}

/** 날씨를 불러와 표시. 성공하면 true, 실패하면 false */
async function updateWeather() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), WEATHER.timeoutMs);
  try {
    const res = await fetch(WEATHER.url, { signal: controller.signal, cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const current = (await res.json()).current || {};
    const weather = describeWeather(current.weather_code, current.is_day === 1);
    if (!weather) throw new Error("Unknown weather code");

    const temp = Number.isFinite(current.temperature_2m) ? `${Math.round(current.temperature_2m)}°C` : "";
    els.weather.textContent = `${weather.emoji} ${temp}`.trim();
    els.weather.title = weather.label;
    els.weather.setAttribute("aria-label", `Weather in Seoul: ${weather.label}${temp ? `, ${temp}` : ""}`);
    return true;
  } catch (error) {
    // 실패하면 날씨를 추측하지 않고 '--'로 표시
    els.weather.textContent = UI_TEXT.weatherUnavailable;
    els.weather.title = "Weather unavailable";
    els.weather.setAttribute("aria-label", "Weather unavailable");
    return false;
  } finally {
    clearTimeout(timer);
  }
}


/* =========================================================
   F-2. 하늘: 화면 배경 + 해·달 위치 (서울 일출·일몰 기준)
   - Open-Meteo에서 서울의 '어제·오늘·내일' 일출·일몰 시각을 받아옵니다.
   - 화면 배경(단계): Morning / Daylight / Golden Hour / Night (규칙은 맨 위 SKY.phases)
     단계가 바뀌는 경계에서는 30분에 걸쳐 두 그라데이션이 섞여 끊김이 없습니다.
   - 해: 일출(왼쪽 아래) → 가장 높이 → 일몰(오른쪽 아래). 일몰 후에는 달과 별.
   - 조회 실패: 이전에 받아둔 실제 데이터(브라우저에 저장, 앞뒤 3일 이내)가 있으면 사용,
     없으면 해·달을 추측하지 않고 중립 배경을 보여줍니다.
   - 캐릭터를 직접 골라도 하늘은 항상 '지금' 한국시간을 따릅니다.
   ========================================================= */

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;
const skyEl = document.getElementById("sky");
const backdropLayers = {};
document.querySelectorAll(".backdrop__layer").forEach((layer) => {
  backdropLayers[layer.dataset.layer] = layer;
});

const sun = {
  days: new Map(),     // "2026-10-19" → { rise, set } (밀리초 시각, 실제로 받아온 값만)
  loadingFor: null,    // 지금 받아오는 중인 날짜
  failedFor: null,     // 실패한 날짜 (잠시 뒤 다시 시도)
  lastKey: "",         // 화면 갱신을 줄이기 위한 이전 값
};

// 서울 기준 "YYYY-MM-DD"
const seoulIsoDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: SEOUL_TZ, year: "numeric", month: "2-digit", day: "2-digit",
});
const seoulHourMinute = new Intl.DateTimeFormat("en-GB", {
  timeZone: SEOUL_TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});

/** "2026-10-19" + 1 → "2026-10-20" */
function addDays(isoDate, n) {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** 서울 날짜 + "10:00" → 그 순간(밀리초). 한국은 서머타임이 없어 항상 UTC+9 */
function seoulTimeOn(isoDate, hhmm) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const [h, mi] = hhmm.split(":").map(Number);
  return Date.UTC(y, m - 1, d, h - 9, mi);
}

/** 밀리초 시각 → 테스트 패널 입력 형식 "2026-10-19T06:53" (서울 기준) */
function toSeoulInputValue(ms) {
  return `${seoulIsoDate.format(ms)}T${seoulHourMinute.format(ms)}`;
}

/* ----- 받아온 일출·일몰 저장/불러오기 (브라우저 저장소, 실패해도 무시) ----- */
function saveSunDays() {
  try {
    const recent = [...sun.days.entries()].sort().slice(-14);
    localStorage.setItem(SKY.storageKey, JSON.stringify(recent));
  } catch (error) { /* 저장 불가(시크릿 모드 등) → 무시 */ }
}

function restoreSunDays() {
  try {
    const saved = JSON.parse(localStorage.getItem(SKY.storageKey) || "[]");
    saved.forEach(([day, v]) => {
      if (v && Number.isFinite(v.rise) && Number.isFinite(v.set) && v.rise < v.set) sun.days.set(day, v);
    });
  } catch (error) { /* 저장된 값이 없거나 깨졌으면 무시 */ }
}

/** 기준 날짜의 앞뒤 하루씩(총 3일) 일출·일몰을 받아오기 */
async function loadSunTimes(isoDate) {
  sun.loadingFor = isoDate;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SKY.timeoutMs);
  try {
    const res = await fetch(SKY.url(addDays(isoDate, -1), addDays(isoDate, 1)), { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const daily = (await res.json()).daily || {};
    const ok = [daily.time, daily.sunrise, daily.sunset].every(Array.isArray);
    if (!ok) throw new Error("No daily data");

    daily.time.forEach((t, i) => {
      const rise = daily.sunrise[i] * 1000;
      const set = daily.sunset[i] * 1000;
      if (Number.isFinite(rise) && Number.isFinite(set) && rise < set) {
        sun.days.set(seoulIsoDate.format(t * 1000), { rise, set });
      }
    });
    sun.failedFor = null;
    saveSunDays();
  } catch (error) {
    sun.failedFor = isoDate;
    // 잠시 뒤 다시 시도 (그동안은 저장된 데이터 또는 중립 배경)
    setTimeout(() => { if (sun.failedFor === isoDate) sun.failedFor = null; }, SKY.retryMs);
  } finally {
    clearTimeout(timer);
    sun.loadingFor = null;
    sun.lastKey = "";
    updateSky(now());
  }
}

/**
 * 그 날짜의 일출·일몰.
 * 정확한 값이 없으면 앞뒤 SKY.borrowDays일 안에 '실제로 받아둔' 값을 날짜만 옮겨 사용
 * (하루 차이의 일출·일몰은 몇 분 정도라 자연스러움). 그것도 없으면 null.
 */
function getSunDay(isoDate) {
  const exact = sun.days.get(isoDate);
  if (exact) return exact;
  for (let k = 1; k <= SKY.borrowDays; k++) {
    for (const sign of [-1, 1]) {
      const near = sun.days.get(addDays(isoDate, sign * k));
      if (near) return { rise: near.rise - sign * k * DAY, set: near.set - sign * k * DAY, borrowed: true };
    }
  }
  return null;
}

/**
 * 하루의 배경 단계 경계 (SKY.phases 규칙)
 *   morningStart = 일출 - 30분
 *   daylightStart = 10:00 (일출이 늦은 날은 일출 + 1시간, 단 노을 시작보다 늦지 않게)
 *   goldenStart = 일몰 - 1시간
 *   nightStart = 일몰 + 30분
 */
function getPhaseBounds(isoDate) {
  const day = getSunDay(isoDate);
  if (!day) return null;
  const P = SKY.phases;
  const morningStart = day.rise - P.morningBeforeSunriseMin * MINUTE;
  const goldenStart = day.set - P.goldenBeforeSunsetMin * MINUTE;
  const daylightStart = Math.min(
    Math.max(seoulTimeOn(isoDate, P.daylightStartsAt), day.rise + P.minMorningAfterSunriseMin * MINUTE),
    goldenStart,
  );
  const nightStart = day.set + P.nightAfterSunsetMin * MINUTE;
  return { morningStart, daylightStart, goldenStart, nightStart };
}

/** 주어진 시각의 화면 배경: 현재 단계 + (경계 근처라면) 섞이는 이웃 단계 */
function getBackdropAt(date) {
  const t = date.getTime();
  const today = seoulIsoDate.format(date);
  const days = [-1, 0, 1].map((n) => getPhaseBounds(addDays(today, n)));
  if (days.some((d) => !d)) return null;

  // 어제~내일을 이어 붙인 단계 목록 (겹치거나 비는 구간 없이 연속)
  const segments = [];
  days.forEach((d, i) => {
    segments.push({ phase: "morning", start: d.morningStart, end: d.daylightStart });
    segments.push({ phase: "daylight", start: d.daylightStart, end: d.goldenStart });
    segments.push({ phase: "golden", start: d.goldenStart, end: d.nightStart });
    if (days[i + 1]) segments.push({ phase: "night", start: d.nightStart, end: days[i + 1].morningStart });
  });
  const live = segments.filter((s) => s.end > s.start);
  const index = live.findIndex((s) => t >= s.start && t < s.end);
  if (index === -1) return null;

  const seg = live[index];
  const half = (SKY.blendMinutes * MINUTE) / 2;
  let neighbor = null;
  let weight = 0;
  if (t - seg.start < half && live[index - 1]) {
    neighbor = live[index - 1].phase;
    weight = 0.5 - (t - seg.start) / (2 * half);
  } else if (seg.end - t < half && live[index + 1]) {
    neighbor = live[index + 1].phase;
    weight = 0.5 - (seg.end - t) / (2 * half);
  }
  return { phase: seg.phase, neighbor, weight: Math.max(0, weight) };
}

/** 주어진 시각의 해·달 상태 (캐릭터 뒤 원형 그래픽) */
function getSkyAt(date) {
  const t = date.getTime();
  const today = seoulIsoDate.format(date);
  const d0 = getSunDay(today);
  if (!d0) return { phase: "fallback" };

  // 낮: 해
  if (t >= d0.rise && t < d0.set) {
    const p = (t - d0.rise) / (d0.set - d0.rise);
    return { phase: "day", p, h: Math.sin(Math.PI * p), twilight: 0 };
  }

  // 밤: 오늘 일몰 → 내일 일출, 또는 어제 일몰 → 오늘 일출 (달·별)
  const start = t >= d0.set ? d0.set : getSunDay(addDays(today, -1))?.set;
  const end = t >= d0.set ? getSunDay(addDays(today, 1))?.rise : d0.rise;
  if (!start || !end) return { phase: "fallback" };

  const p = (t - start) / (end - start);
  const fade = SKY.twilightMinutes * MINUTE;
  const twilight = Math.max(0, Math.min(1, (t - start) / fade, (end - t) / fade));
  return { phase: "night", p, h: Math.sin(Math.PI * p), twilight };
}

/** 하늘 화면 갱신 (시계가 1초마다 호출) */
function updateSky(date) {
  const today = seoulIsoDate.format(date);

  // 어제·오늘·내일의 '실제' 데이터가 없으면 받아오기 (날짜가 바뀌거나 테스트 시간을 옮겼을 때도)
  const needsData = [-1, 0, 1].some((n) => !sun.days.has(addDays(today, n)));
  if (needsData && sun.loadingFor !== today && sun.failedFor !== today) loadSunTimes(today);

  const backdrop = getBackdropAt(date);
  let sky = getSkyAt(date);
  if (sky.phase === "fallback" && sun.loadingFor) sky = { phase: "loading" };

  // 값이 거의 그대로면 건너뜀 (불필요한 화면 갱신 줄이기)
  const key = [
    backdrop ? `${backdrop.phase}/${backdrop.neighbor}/${backdrop.weight.toFixed(3)}` : "neutral",
    sky.phase, (sky.p ?? 0).toFixed(4), (sky.twilight ?? 0).toFixed(2),
  ].join("|");
  if (key === sun.lastKey) return;
  sun.lastKey = key;

  // 1) 화면 배경 + 글자색 단계
  const phase = backdrop ? backdrop.phase : "neutral";
  document.body.dataset.sky = phase;
  Object.entries(backdropLayers).forEach(([name, layer]) => {
    let opacity = 0;
    let z = 0;
    if (name === phase) { opacity = 1; z = 1; }
    if (backdrop && name === backdrop.neighbor) { opacity = backdrop.weight; z = 2; }
    layer.style.opacity = String(opacity);
    layer.style.zIndex = String(z);
  });

  // 2) 해·달
  skyEl.dataset.phase = sky.phase;
  if (sky.p != null) {
    skyEl.style.setProperty("--p", sky.p.toFixed(4));
    skyEl.style.setProperty("--h", sky.h.toFixed(4));
    skyEl.style.setProperty("--twilight", sky.twilight.toFixed(3));
  }
}

/** 별 만들기 (위치는 고정 → 매번 같은 하늘) */
function buildStars() {
  const box = document.getElementById("sky-stars");
  SKY.stars.forEach(([x, y, delay], i) => {
    const star = document.createElement("span");
    star.className = "sky__star";
    star.style.left = `${x}%`;
    star.style.top = `${y}%`;
    star.style.animationDelay = `${delay}s`;
    if (i % 3 === 0) star.style.transform = "scale(0.7)";
    box.append(star);
  });
}


/* =========================================================
   G. 시간 테스트 (?test 또는 ?now=2026-10-19T11:30)
   ========================================================= */

/** "2026-10-19T11:30"(서울 시각) → 그 순간으로 시계를 옮김 */
function setSeoulTime(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value || "");
  if (!match) return false;
  const [, y, mo, d, h, mi] = match.map(Number);
  // 한국은 서머타임이 없어 항상 UTC+9 이므로, UTC 기준 9시간을 빼면 같은 순간이 됩니다
  const instant = Date.UTC(y, mo - 1, d, h - 9, mi);
  testOffsetMs = instant - Date.now();
  state.pickedMode = null; // 테스트 시간을 바꾸면 자동 선택 상태로
  state.lastClock = "";
  tick();
  show(state.autoMode); // 이전에 고른 캐릭터가 남아 있지 않도록 지금 시간 캐릭터로
  return true;
}

function useRealTime() {
  testOffsetMs = 0;
  state.pickedMode = null;
  state.lastClock = "";
  tick();
  show(state.autoMode); // 이전에 고른 캐릭터가 남아 있지 않도록 지금 시간 캐릭터로
}

function setupTestPanel() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has("test")) return;

  const panel = document.getElementById("test-panel");
  const input = document.getElementById("test-input");
  const presets = document.getElementById("test-presets");
  panel.hidden = false;

  TEST_PRESETS.forEach(({ label, value }) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.addEventListener("click", () => {
      input.value = value;
      setSeoulTime(value);
    });
    presets.append(b);
  });
  // 하늘 테스트: 지금 보고 있는 날짜의 실제 일출·일몰로 계산한 각 단계의 한가운데 시각으로 이동
  const skyTests = [
    { label: "Sky · Morning", at: (b) => (b.morningStart + b.daylightStart) / 2 },
    { label: "Sky · Daylight", at: (b) => (b.daylightStart + b.goldenStart) / 2 },
    { label: "Sky · Golden Hour", at: (b) => (b.goldenStart + b.nightStart) / 2 },
    { label: "Sky · Night", at: (b) => b.nightStart + 3 * 60 * MINUTE },
  ];
  skyTests.forEach(({ label, at }) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.addEventListener("click", () => {
      const bounds = getPhaseBounds(seoulIsoDate.format(now()));
      if (!bounds) { b.textContent = `${label} (no data yet)`; return; }
      const value = toSeoulInputValue(at(bounds));
      input.value = value;
      setSeoulTime(value);
    });
    presets.append(b);
  });

  input.addEventListener("change", () => setSeoulTime(input.value));
  document.getElementById("test-reset").addEventListener("click", () => {
    input.value = "";
    useRealTime();
  });
}

// 개발자 도구 콘솔에서도 테스트 가능: hyungee.setSeoulTime("2026-10-24T09:00")
window.hyungee = { setSeoulTime, useRealTime, getScheduleAt, getSkyAt, getBackdropAt, getPhaseBounds };


/* =========================================================
   H. 시작
   ========================================================= */

buildPicker();
buildStars();
restoreSunDays(); // 예전에 받아둔 일출·일몰이 있으면 먼저 불러옴 (조회 실패 대비)

// 이미지 4장을 미리 불러와서 전환이 끊기지 않게
ORDER.forEach((mode) => { new Image().src = CHARACTERS[mode].image; });

// 키보드 화살표로 카드 사이를 이동
els.picker.addEventListener("keydown", (event) => {
  const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
  if (!keys.includes(event.key)) return;
  const cards = [...els.picker.querySelectorAll(".card")];
  const index = cards.indexOf(document.activeElement);
  if (index === -1) return;
  event.preventDefault();
  const step = event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 1;
  cards[(index + step + cards.length) % cards.length].focus();
});

els.backToNow.addEventListener("click", backToNow);
document.getElementById("year").textContent = new Date().getFullYear();

// 주소에 ?now=2026-10-19T11:30 이 있으면 그 한국시간으로 시작 (없으면 실제 현재 시각)
const startTime = new URLSearchParams(window.location.search).get("now");
if (!startTime || !setSeoulTime(startTime)) tick(); // 처음 한 번 바로 실행
setInterval(tick, 1000);        // 이후 1초마다 시계·캐릭터 확인
setupTestPanel();

// 날씨: 성공하면 15분 뒤, 실패하면 1분 뒤에 다시 불러오기
async function weatherLoop() {
  const ok = await updateWeather();
  setTimeout(weatherLoop, ok ? WEATHER.refreshMs : WEATHER.retryMs);
}
weatherLoop();
