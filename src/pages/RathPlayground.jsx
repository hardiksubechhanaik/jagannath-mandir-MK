import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet, apiPost, endpoints, resolveMediaUrl } from '../api/client';
import { INSTAGRAM_URL, TEMPLE_PHONE } from '../data/site';
import { CERT_NAME_Y_RATIO, certificateFilename, downloadCertificate, renderCertificatePng } from '../lib/melaCertificate';
import {
  CREATOR_TIERS,
  CREATOR_TIER_LABELS,
  formatInstagramHandle,
  instagramProfileUrl,
  partitionCreators,
  subscribeCreatorSpotlightUpdates,
} from '../lib/creatorSpotlight';
import { notifyDivyangAssistUpdate, pushLocalDivyangRequest, saveDivyangRequestLocally } from '../lib/divyangAssist';
import { buildTriviaRound } from '../lib/rathTrivia';
import { fetchMelaStats, trackMelaInteraction } from '../lib/melaStats';
import MemoryMatch from '../components/MemoryMatch';
import MelaTicTacToe from '../components/MelaTicTacToe';
import IndianMobileInput from '../components/IndianMobileInput';
import { isValidIndianMobile } from '../lib/indianMobile';
import RathPuzzleSlider from '../components/RathPuzzleSlider';
import DiyaLanternCanvas from '../components/DiyaLanternCanvas';
import RopePetalCanvas from '../components/RopePetalCanvas';
import styles from './RathPlayground.module.css';

const STALLS_WITHOUT_BADGE = new Set(['trivia', 'guide', 'puzzle', 'tictactoe']);

const STALL_KEYS = [
  'rope',
  'diya',
  'sankalp',
  'trivia',
  'cert',
  'guide',
  'creators',
  'memory',
  'tictactoe',
  'puzzle',
];

const SUPPORT_META = {
  title: 'Support',
  icon: '🤝',
  color: '#FF922B',
  colorLight: '#FFC078',
};

const STALL_META = {
  rope: { title: 'Pull the Rope', icon: '🪢', color: '#FF6B6B', colorLight: '#FFA8A8' },
  diya: { title: 'Light a Diya', icon: '🪔', color: '#FFA94D', colorLight: '#FFD08A' },
  sankalp: { title: 'Make a Sankalp or a Wish', icon: '🙏', color: '#F5A623', colorLight: '#FFE08A' },
  trivia: { title: 'Ratha Yatra Trivia', icon: '🎯', color: '#B983FF', colorLight: '#DBBBFF' },
  cert: { title: 'Darshan Certificate', icon: '🎖', color: '#4D96FF', colorLight: '#9DC4FF' },
  guide: { title: 'First-Time Guide', icon: '🧭', color: '#6BCB77', colorLight: '#A6E6AC' },
  creators: { title: 'Creator Spotlight', icon: '🎥', color: '#FF6BAA', colorLight: '#FFA8D0' },
  memory: { title: 'Memory Match', icon: '🧠', color: '#7C5CFF', colorLight: '#B983FF' },
  tictactoe: { title: 'Tic Tac Toe', icon: '⭕', color: '#22B8CF', colorLight: '#99E9F2' },
  puzzle: { title: 'Rath Yatra Puzzle', icon: '🧩', color: '#F06595', colorLight: '#FAA2C1' },
};

const BUNTING_COLORS = ['#FF6F91', '#FFC93C', '#4FD1C5', '#FF6B6B', '#B983FF', '#6BCB77'];
const BALLOON_COLORS = ['#FF6B6B', '#4D96FF', '#FFD93D', '#6BCB77', '#B983FF', '#FF922B', '#F783AC', '#22B8CF'];

const STORAGE_ROPE = 'mandir_rope_pulls';
const DIYA_LIGHT_SOUND = '/mela-diya-light.mp3';
const SANKALP_CONCH_SOUND = '/mela-sankalp-conch.mp3';
const CERT_CHEER_SOUND = '/mela-cert-cheer.mp3';
const CREATORS_AMBIENT_SOUND = '/mela-creators-ambient.mp3';
const MEMORY_WIN_SOUND = '/mela-memory-win.mp3';
const MELA_AMBIENT_SOUND = '/mela-ambient.mp3';
const MELA_LOADER_VOLUME = 0.9;
const MELA_BG_VOLUME = 0.15;
const MELA_FADE_MS = 3200;

function fadeAudioVolume(audio, toVolume, durationMs) {
  const from = audio.volume;
  const start = performance.now();
  let rafId = 0;

  const cancel = () => {
    if (rafId) cancelAnimationFrame(rafId);
  };

  const step = (now) => {
    const t = Math.min(1, (now - start) / durationMs);
    audio.volume = from + (toVolume - from) * t;
    if (t < 1) rafId = requestAnimationFrame(step);
  };

  rafId = requestAnimationFrame(step);
  return cancel;
}

function playTrackedSound(src, registry, { loop = false } = {}) {
  const audio = new Audio(src);
  if (loop) audio.loop = true;
  registry.add(audio);
  const release = () => registry.delete(audio);
  audio.addEventListener('ended', release);
  audio.play().catch(release);
  return audio;
}

function stopTrackedSounds(registry) {
  registry.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
  registry.clear();
}

const GUIDE_TIPS = [
  'Dress modestly — traditional or fully covered attire is appreciated at the mandir and during the procession.',
  'Photography may not be permitted inside the sanctum — please follow posted signs.',
  'Wear comfortable, easy-to-remove footwear — you\'ll need to take it off at designated stands before entering.',
  'Carry water and ORS/electrolytes, especially during summer darshan hours and while following the procession outdoors.',
  'Carry a cap, umbrella, or sunscreen — you\'ll likely be outdoors for extended periods during the Yatra.',
  'Arrive early for Mangala Arati or evening darshan to avoid peak crowds.',
  'Hold on to children and elderly family members in crowded areas, and pick a common meeting point in case you get separated.',
  'Keep a safe distance from the chariot wheels and ropes during the pulling — the crowd can shift quickly and the chariots are heavy.',
  'Note the location of the nearest medical/help desk before joining the procession.',
];

const DEFAULT_CREATORS = [
  { id: 'fallback-1', name: 'Devotee Reels', instagramHandle: '@devotee_reels', photoUrl: '', tier: 'digital' },
  { id: 'fallback-2', name: 'Mandir Moments', instagramHandle: '@mandir_moments', photoUrl: '', tier: 'digital' },
  { id: 'fallback-3', name: 'Bhakti Vlogs', instagramHandle: '@bhakti_vlogs', photoUrl: '', tier: 'digital' },
];

const SIZE_VARIATIONS = [0.82, 1.0, 1.14, 0.88, 1.08, 0.92, 1.18, 0.86, 1.05, 0.95];
const CONFETTI_COLORS = ['#FF6B6B', '#FFC93C', '#4FD1C5', '#B983FF', '#6BCB77', '#FF922B', '#F783AC'];
const CONFETTI_SIZE_TIERS = [6, 9, 12, 16];
const FIREWORK_COLORS = ['#FF6B6B', '#FFD93D', '#4FD1C5', '#B983FF', '#FF922B', '#fff'];

function generateSkyDeco(viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200) {
  const isMobile = viewportWidth < 480;
  const isTablet = viewportWidth < 768;
  const cloudCount = isMobile ? 6 : isTablet ? 10 : 22;
  const sizeScale = isMobile ? 0.48 : isTablet ? 0.68 : 1;
  const kiteCount = isMobile ? 2 : isTablet ? 3 : 4;
  const flagCount = isMobile ? 3 : isTablet ? 5 : 7;

  return {
    clouds: Array.from({ length: cloudCount }, (_, i) => ({
      id: `cloud-${i}`,
      left: i * (isMobile ? 14 : isTablet ? 9 : 4.5) + Math.random() * (isMobile ? 8 : 5),
      top: 2 + Math.random() * (isMobile ? 18 : 28),
      width: (56 + Math.random() * 84) * sizeScale,
      height: (20 + Math.random() * 18) * sizeScale,
      opacity: (0.28 + Math.random() * 0.18) * (isMobile ? 0.9 : 1),
      duration: 32 + Math.random() * 24,
      delay: Math.random() * -45,
    })),
    kites: Array.from({ length: kiteCount }, (_, i) => ({
      id: `kite-${i}`,
      left: 10 + i * 22 + Math.random() * 8,
      color: BUNTING_COLORS[i % BUNTING_COLORS.length],
      swayDuration: 3 + Math.random() * 2,
      delay: Math.random() * 2,
    })),
    paperFlags: Array.from({ length: flagCount }, (_, i) => ({
      id: `pflag-${i}`,
      left: 6 + i * (isMobile ? 24 : isTablet ? 18 : 13),
      color: BUNTING_COLORS[(i + 2) % BUNTING_COLORS.length],
      delay: (i % 5) * 0.3,
    })),
  };
}

const BUBBLE_SIZES = [14, 18, 22, 28, 34, 40];
const FIREWORK_SIZE_TIERS = [0.75, 1, 1.35, 1.7, 2.1];

const PORTAL_CRACKER_COLORS = [
  '#FF6B6B',
  '#FFD93D',
  '#4FD1C5',
  '#B983FF',
  '#FF922B',
  '#F783AC',
  '#6BCB77',
  '#FFE066',
  '#FF4081',
  '#22B8CF',
  '#E599F7',
  '#fff',
];

const PORTAL_CRACKERS = [
  { id: 'pc-0', left: 7, top: 11, scale: 0.62, rotate: -18, delay: 0 },
  { id: 'pc-1', left: 22, top: 28, scale: 1.15, rotate: 12, delay: 0.35 },
  { id: 'pc-2', left: 38, top: 9, scale: 0.78, rotate: -8, delay: 0.7 },
  { id: 'pc-3', left: 54, top: 34, scale: 1.38, rotate: 22, delay: 0.2 },
  { id: 'pc-4', left: 71, top: 14, scale: 0.88, rotate: -14, delay: 0.55 },
  { id: 'pc-5', left: 88, top: 26, scale: 1.05, rotate: 6, delay: 0.9 },
  { id: 'pc-6', left: 12, top: 52, scale: 1.28, rotate: -22, delay: 0.45 },
  { id: 'pc-7', left: 31, top: 68, scale: 0.72, rotate: 16, delay: 0.15 },
  { id: 'pc-8', left: 48, top: 58, scale: 1.48, rotate: -6, delay: 0.8 },
  { id: 'pc-9', left: 65, top: 72, scale: 0.95, rotate: 20, delay: 0.25 },
  { id: 'pc-10', left: 82, top: 48, scale: 1.22, rotate: -12, delay: 0.6 },
  { id: 'pc-11', left: 93, top: 63, scale: 0.68, rotate: 8, delay: 1.05 },
].map((cracker, i) => ({
  ...cracker,
  color: PORTAL_CRACKER_COLORS[i % PORTAL_CRACKER_COLORS.length],
}));

function generateGuideFallingStars(batchId = Date.now()) {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `gfs-${batchId}-${i}`,
    left: 4 + Math.random() * 92,
    delay: Math.random() * 1.4,
    duration: 2.1 + Math.random() * 1.8,
    size: 22 + Math.random() * 20,
    drift: -48 + Math.random() * 96,
    opacity: 0.55 + Math.random() * 0.45,
  }));
}

function generateGuideWelcomeCrackers() {
  const positions = [
    { left: 8, top: 16 },
    { left: 88, top: 20 },
    { left: 5, top: 74 },
    { left: 91, top: 70 },
    { left: 46, top: 10 },
    { left: 24, top: 84 },
    { left: 74, top: 82 },
    { left: 16, top: 44 },
    { left: 80, top: 48 },
    { left: 50, top: 88 },
  ];

  return positions.map((pos, i) => ({
    id: `gwc-${i}`,
    left: pos.left,
    top: pos.top,
    color: PORTAL_CRACKER_COLORS[i % PORTAL_CRACKER_COLORS.length],
    scale: 0.78 + Math.random() * 0.52,
    rotate: -22 + Math.random() * 44,
    delay: Math.random() * 0.65,
  }));
}

function generateBubbles(count = 26, viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200) {
  const isMobile = viewportWidth < 480;
  const isTablet = viewportWidth < 768;
  const sizes = isMobile ? [10, 12, 14, 16] : isTablet ? [12, 16, 20, 26] : BUBBLE_SIZES;

  return Array.from({ length: count }, (_, i) => ({
    id: `bubble-${i}`,
    x: 2 + Math.random() * 96,
    size: sizes[Math.floor(Math.random() * sizes.length)],
    duration: 14 + Math.random() * 18,
    delay: Math.random() * -18,
    opacity: (isMobile ? 0.35 : 0.55) + Math.random() * (isMobile ? 0.2 : 0.35),
  }));
}

function generateParticles(count = 35, viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200) {
  const isMobile = viewportWidth < 480;
  const isTablet = viewportWidth < 768;
  const sizeMin = isMobile ? 1 : isTablet ? 1.2 : 1.5;
  const sizeRange = isMobile ? 1.2 : isTablet ? 1.6 : 2.5;

  return Array.from({ length: count }, (_, i) => ({
    id: `pt-${i}`,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: sizeMin + Math.random() * sizeRange,
    duration: 4 + Math.random() * 6,
    delay: Math.random() * -8,
  }));
}

function getFairgroundDecorConfig(viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200) {
  const isMobile = viewportWidth < 480;
  const isTablet = viewportWidth < 768;

  if (isMobile) {
    return {
      balloonCount: 70,
      starCount: 50,
      bubbleCount: 15,
      particleCount: 15,
      balloonMinDist: 4.2,
      starMinDist: 3.4,
      balloonSizeMin: 7,
      balloonSizeRange: 5,
      starSizeMin: 6,
      starSizeRange: 4,
      balloonOpacityMin: 0.38,
      balloonOpacityRange: 0.12,
      starOpacityMin: 0.35,
      starOpacityRange: 0.2,
    };
  }

  if (isTablet) {
    return {
      balloonCount: 36,
      starCount: 26,
      bubbleCount: 14,
      particleCount: 18,
      balloonMinDist: 4.6,
      starMinDist: 3.8,
      balloonSizeMin: 10,
      balloonSizeRange: 7,
      starSizeMin: 8,
      starSizeRange: 5,
      balloonOpacityMin: 0.52,
      balloonOpacityRange: 0.14,
      starOpacityMin: 0.42,
      starOpacityRange: 0.24,
    };
  }

  return {
    balloonCount: 52,
    starCount: 38,
    bubbleCount: 26,
    particleCount: 35,
    balloonMinDist: 3.4,
    starMinDist: 2.6,
    balloonSizeMin: 14,
    balloonSizeRange: 10,
    starSizeMin: 10,
    starSizeRange: 8,
    balloonOpacityMin: 0.7,
    balloonOpacityRange: 0.1,
    starOpacityMin: 0.5,
    starOpacityRange: 0.3,
  };
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function computeLayout(fieldEl, stallKeys) {
  const w = fieldEl.clientWidth;
  const h = fieldEl.clientHeight;
  if (!w || !h) return null;

  const n = stallKeys.length;
  let cols = 5;
  if (w < 480) cols = 3;
  else if (w < 768) cols = 4;

  const rows = Math.ceil(n / cols);
  const topClear = w < 480 ? 52 : w < 768 ? 64 : 105;
  const bottomClear = w < 480 ? 10 : 16;
  const sideClear = w < 480 ? 6 : w < 768 ? 10 : 14;
  const usableW = Math.max(100, w - sideClear * 2);
  const usableH = Math.max(100, h - topClear - bottomClear);
  const cellW = usableW / cols;
  const cellH = usableH / rows;

  const isDesktop = w >= 768;
  const desktopScale = isDesktop ? 1.5 : 1;

  const minCircle = (w < 480 ? 34 : w < 768 ? 40 : 52) * desktopScale;
  const maxCircle = (w < 480 ? 58 : w < 768 ? 72 : 110) * desktopScale;

  // Hard caps so tiles never spill outside their grid cell
  const fitCapW = (cellW * 0.94) / 1.55;
  const fitCapH = (cellH - 8) / 1.28;

  const circleSize = Math.max(
    minCircle,
    Math.min(
      maxCircle,
      fitCapW,
      fitCapH,
      cellW * 0.68 * desktopScale,
      cellH * 0.56 * desktopScale,
      (usableW / cols) * 0.72 * desktopScale,
    ),
  );
  const labelH = Math.max(18, circleSize * 0.28);

  const order = shuffle([...Array(n).keys()]);
  return stallKeys.map((key, idx) => {
    const scale = SIZE_VARIATIONS[idx % SIZE_VARIATIONS.length];
    const tileCircle = Math.max(minCircle * 0.78, Math.min(circleSize * scale, maxCircle * 1.08));
    const tileWrapW = Math.min(cellW * 0.94, tileCircle * 1.55);
    const tileBorderW = Math.max(2, Math.min(5, tileCircle * 0.055));
    const tileLabelH = Math.max(18, tileCircle * 0.28);
    const tileBoxH = tileCircle + 8 + tileLabelH;
    const tileMaxJitterX = Math.max(0, (cellW - tileWrapW) / 2 - 3);
    const tileMaxJitterY = Math.max(0, (cellH - tileBoxH) / 2 - 3);
    const cellIndex = order[idx];
    const col = cellIndex % cols;
    const row = Math.floor(cellIndex / cols);
    const cx = sideClear + col * cellW + cellW / 2 + (Math.random() - 0.5) * 2 * tileMaxJitterX;
    const cy = topClear + row * cellH + cellH / 2 + (Math.random() - 0.5) * 2 * tileMaxJitterY;
    return {
      key,
      xPx: cx,
      yPx: cy,
      circleSize: tileCircle,
      wrapW: tileWrapW,
      borderW: tileBorderW,
      iconSize: tileCircle * 0.42,
      badgeSize: tileCircle * 0.28,
      labelFont: Math.max(9, Math.min(13, tileCircle * 0.11)),
      floatDelay: (idx * 0.41) % 3.2,
      floatDuration: 3 + (idx % 6) * 0.35,
    };
  });
}

function placeNonOverlapping(count, minDist, aspectWeight) {
  const pts = [];
  for (let i = 0; i < count; i += 1) {
    let placed = null;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const x = 2 + Math.random() * 96;
      const y = 4 + Math.random() * 92;
      const ok = pts.every((p) => {
        const dx = p.x - x;
        const dy = (p.y - y) * aspectWeight;
        return dx * dx + dy * dy >= minDist * minDist;
      });
      if (ok) {
        placed = { x, y };
        break;
      }
    }
    pts.push(placed || { x: 2 + Math.random() * 96, y: 4 + Math.random() * 92 });
  }
  return pts;
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function generateSankalpSpiritFx() {
  const batchId = Date.now();
  const particleColors = ['#FFF8ED', '#FFE08A', '#FFD56B', '#FFB627', '#FFECB3', '#F5C842'];

  return {
    rays: Array.from({ length: 9 }, (_, i) => ({
      id: `${batchId}-ray-${i}`,
      left: 4 + i * 11 + Math.random() * 5,
      width: 14 + Math.random() * 22,
      rotate: -28 + Math.random() * 56,
      delay: Math.random() * 2,
      opacity: 0.12 + Math.random() * 0.18,
    })),
    particles: Array.from({ length: 44 }, (_, i) => ({
      id: `${batchId}-pt-${i}`,
      left: Math.random() * 100,
      size: 3 + Math.random() * 6,
      duration: 4.2 + Math.random() * 3.8,
      delay: Math.random() * 2,
      drift: -45 + Math.random() * 90,
      color: particleColors[i % particleColors.length],
      opacity: 0.45 + Math.random() * 0.55,
    })),
  };
}

function StallModal({ stallKey, onClose, creators, onInteraction, ropePullCount, onRopePull, onMemoryCelebrate, onMemoryCelebrateStop }) {
  const meta = stallKey === 'support' ? SUPPORT_META : STALL_META[stallKey];

  const [diyaName, setDiyaName] = useState('');
  const [diyaDone, setDiyaDone] = useState(false);
  const [diyaSubmitting, setDiyaSubmitting] = useState(false);
  const [diyaError, setDiyaError] = useState('');
  const [sankalpText, setSankalpText] = useState('');
  const [sankalpDone, setSankalpDone] = useState(false);
  const [sankalpSubmitting, setSankalpSubmitting] = useState(false);
  const [sankalpError, setSankalpError] = useState('');
  const [triviaRound, setTriviaRound] = useState(() => buildTriviaRound());
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [triviaScore, setTriviaScore] = useState(0);
  const [triviaDone, setTriviaDone] = useState(false);
  const [triviaFeedback, setTriviaFeedback] = useState(null);
  const [triviaPick, setTriviaPick] = useState(null);
  const [certName, setCertName] = useState('');
  const [certShown, setCertShown] = useState('');
  const [certDownloading, setCertDownloading] = useState(false);
  const [divyangPhone, setDivyangPhone] = useState('');
  const [divyangPhoneError, setDivyangPhoneError] = useState('');
  const [divyangDone, setDivyangDone] = useState('');
  const [divyangSubmitting, setDivyangSubmitting] = useState(false);
  const [showRopeVideo, setShowRopeVideo] = useState(false);
  const [ropePetalsActive, setRopePetalsActive] = useState(false);
  const [ropePetalsFading, setRopePetalsFading] = useState(false);
  const [diyaFxActive, setDiyaFxActive] = useState(false);
  const [diyaFxFading, setDiyaFxFading] = useState(false);
  const [diyaFxBurstKey, setDiyaFxBurstKey] = useState(0);
  const [sankalpSpiritFx, setSankalpSpiritFx] = useState(null);
  const [sankalpFxFading, setSankalpFxFading] = useState(false);
  const diyaFxTimersRef = useRef([]);
  const sankalpFxTimersRef = useRef([]);
  const ropeVideoRef = useRef(null);
  const stallSoundsRef = useRef(new Set());
  const triviaWinSoundPlayedRef = useRef(false);
  const guideFxTimersRef = useRef([]);
  const [guideFallingStars, setGuideFallingStars] = useState([]);
  const [guideCrackers, setGuideCrackers] = useState([]);

  const playStallSound = useCallback((src, options) => {
    playTrackedSound(src, stallSoundsRef.current, options);
  }, []);

  const stopStallSounds = useCallback(() => {
    stopTrackedSounds(stallSoundsRef.current);
    const video = ropeVideoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  }, []);

  const clearGuideFxTimers = useCallback(() => {
    guideFxTimersRef.current.forEach((timerId) => {
      window.clearTimeout(timerId);
      window.clearInterval(timerId);
    });
    guideFxTimersRef.current = [];
  }, []);

  const stopGuideFx = useCallback(() => {
    clearGuideFxTimers();
    setGuideFallingStars([]);
    setGuideCrackers([]);
  }, [clearGuideFxTimers]);

  const addGuideStarWave = useCallback(() => {
    const batchId = Date.now();
    const wave = generateGuideFallingStars(batchId);
    setGuideFallingStars((prev) => [...prev, ...wave].slice(-80));
    guideFxTimersRef.current.push(
      window.setTimeout(() => {
        setGuideFallingStars((prev) => prev.filter((star) => !String(star.id).includes(String(batchId))));
      }, 4500),
    );
  }, []);

  const handleClose = useCallback(() => {
    stopStallSounds();
    stopGuideFx();
    onClose();
  }, [onClose, stopStallSounds, stopGuideFx]);

  const clearDiyaFxTimers = useCallback(() => {
    diyaFxTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    diyaFxTimersRef.current = [];
  }, []);

  const clearSankalpFxTimers = useCallback(() => {
    sankalpFxTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    sankalpFxTimersRef.current = [];
  }, []);

  const stopDiyaFx = useCallback((fade = false) => {
    clearDiyaFxTimers();
    if (fade) {
      setDiyaFxFading(true);
      diyaFxTimersRef.current.push(
        window.setTimeout(() => {
          setDiyaFxActive(false);
          setDiyaFxFading(false);
        }, 900),
      );
      return;
    }
    setDiyaFxActive(false);
    setDiyaFxFading(false);
  }, [clearDiyaFxTimers]);

  const startDiyaFx = useCallback(() => {
    clearDiyaFxTimers();
    setDiyaFxFading(false);
    setDiyaFxBurstKey((k) => k + 1);
    setDiyaFxActive(true);
    diyaFxTimersRef.current.push(
      window.setTimeout(() => setDiyaFxFading(true), 6000),
    );
    diyaFxTimersRef.current.push(
      window.setTimeout(() => {
        setDiyaFxActive(false);
        setDiyaFxFading(false);
      }, 6900),
    );
  }, [clearDiyaFxTimers]);

  const spawnSankalpSpiritFx = useCallback(() => {
    clearSankalpFxTimers();
    setSankalpFxFading(false);
    setSankalpSpiritFx(generateSankalpSpiritFx());
    sankalpFxTimersRef.current.push(
      window.setTimeout(() => setSankalpFxFading(true), 6000),
    );
    sankalpFxTimersRef.current.push(
      window.setTimeout(() => {
        setSankalpSpiritFx(null);
        setSankalpFxFading(false);
      }, 6900),
    );
  }, [clearSankalpFxTimers]);

  const stopRopePetals = useCallback((fade = false) => {
    if (fade) {
      setRopePetalsFading(true);
      window.setTimeout(() => {
        setRopePetalsActive(false);
        setRopePetalsFading(false);
      }, 850);
      return;
    }
    setRopePetalsActive(false);
    setRopePetalsFading(false);
  }, []);

  const startRopePetals = useCallback(() => {
    setRopePetalsFading(false);
    setRopePetalsActive(true);
  }, []);

  useEffect(() => () => {
    clearDiyaFxTimers();
    clearSankalpFxTimers();
    stopRopePetals(false);
    stopDiyaFx(false);
    stopStallSounds();
    stopGuideFx();
  }, [clearDiyaFxTimers, clearSankalpFxTimers, stopRopePetals, stopDiyaFx, stopStallSounds, stopGuideFx]);

  function pullRope() {
    const next = ropePullCount + 1;
    writeJson(STORAGE_ROPE, next);
    onRopePull(next);
    setShowRopeVideo(true);
    onInteraction?.('rope');
  }

  useEffect(() => {
    if (stallKey !== 'rope' || !showRopeVideo) {
      stopRopePetals(false);
      return undefined;
    }

    startRopePetals();
    const video = ropeVideoRef.current;
    if (!video) {
      return () => stopRopePetals(false);
    }

    const handleEnded = () => stopRopePetals(true);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('ended', handleEnded);
      stopRopePetals(false);
    };
  }, [stallKey, showRopeVideo, ropePullCount, startRopePetals, stopRopePetals]);

  useEffect(() => {
    if (stallKey !== 'rope' || !showRopeVideo) return;
    const video = ropeVideoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play().catch(() => {});
  }, [ropePullCount, showRopeVideo, stallKey]);

  useEffect(() => {
    if (stallKey !== 'creators') return undefined;

    playStallSound(CREATORS_AMBIENT_SOUND, { loop: true });

    return () => stopStallSounds();
  }, [stallKey, playStallSound, stopStallSounds]);

  useEffect(() => {
    triviaWinSoundPlayedRef.current = false;
    if (stallKey !== 'trivia') return;
    setTriviaRound(buildTriviaRound());
    setTriviaIndex(0);
    setTriviaScore(0);
    setTriviaDone(false);
    setTriviaFeedback(null);
    setTriviaPick(null);
  }, [stallKey]);

  useEffect(() => {
    if (stallKey !== 'trivia' || !triviaDone || triviaWinSoundPlayedRef.current) return;
    triviaWinSoundPlayedRef.current = true;
    playStallSound(MEMORY_WIN_SOUND);
    onMemoryCelebrate?.();
  }, [stallKey, triviaDone, playStallSound, onMemoryCelebrate]);

  useEffect(() => {
    if (stallKey !== 'guide') {
      stopGuideFx();
      return undefined;
    }

    setGuideCrackers(generateGuideWelcomeCrackers());
    addGuideStarWave();
    const intervalId = window.setInterval(addGuideStarWave, 800);
    guideFxTimersRef.current.push(intervalId);

    return () => stopGuideFx();
  }, [stallKey, addGuideStarWave, stopGuideFx]);

  async function lightDiya() {
    const name = diyaName.trim();
    if (!name || diyaSubmitting) return;

    startDiyaFx();
    playStallSound(DIYA_LIGHT_SOUND);
    setDiyaSubmitting(true);
    setDiyaError('');
    try {
      await apiPost(endpoints.diyaSubmit, { name });
      setDiyaDone(true);
      setDiyaName('');
      onInteraction?.('diya');
    } catch (err) {
      setDiyaError(err.message ?? 'Could not light diya');
    } finally {
      setDiyaSubmitting(false);
    }
  }

  async function submitSankalp() {
    const text = sankalpText.trim();
    if (!text || sankalpSubmitting) return;

    spawnSankalpSpiritFx();
    playStallSound(SANKALP_CONCH_SOUND);
    setSankalpSubmitting(true);
    setSankalpError('');
    try {
      await apiPost(endpoints.sankalpSubmit, { text });
      setSankalpDone(true);
      setSankalpText('');
      onInteraction?.('sankalp');
    } catch (err) {
      setSankalpError(err.message ?? 'Could not submit sankalp');
    } finally {
      setSankalpSubmitting(false);
    }
  }

  function answerTrivia(optionIndex) {
    if (triviaFeedback !== null) return;
    const current = triviaRound[triviaIndex];
    if (!current) return;
    const correct = optionIndex === current.answer;
    setTriviaPick(optionIndex);
    setTriviaFeedback(correct ? 'correct' : 'wrong');
    if (correct) setTriviaScore((s) => s + 1);
    window.setTimeout(() => {
      if (triviaIndex >= triviaRound.length - 1) {
        setTriviaDone(true);
        onInteraction?.('trivia');
      } else {
        setTriviaIndex((i) => i + 1);
        setTriviaFeedback(null);
        setTriviaPick(null);
      }
    }, 700);
  }

  function resetTrivia() {
    onMemoryCelebrateStop?.();
    setTriviaRound(buildTriviaRound());
    setTriviaIndex(0);
    setTriviaScore(0);
    setTriviaDone(false);
    setTriviaFeedback(null);
    setTriviaPick(null);
    triviaWinSoundPlayedRef.current = false;
  }

  function generateCert() {
    const name = certName.trim();
    if (!name) return;
    setCertShown(name);
    playStallSound(CERT_CHEER_SOUND);
    onMemoryCelebrate?.();
    onInteraction?.('cert');
  }

  async function downloadCert() {
    if (!certShown || certDownloading) return;
    setCertDownloading(true);
    try {
      const dataUrl = await renderCertificatePng(certShown);
      downloadCertificate(dataUrl, certificateFilename(certShown));
    } catch {
      window.alert('Could not generate the certificate. Please try again.');
    } finally {
      setCertDownloading(false);
    }
  }

  async function requestDivyang() {
    const phone = divyangPhone.trim();
    if (!phone || divyangSubmitting) return;

    if (!isValidIndianMobile(phone)) {
      setDivyangPhoneError('Enter a valid 10-digit mobile number starting with 5, 6, 7, 8, or 9.');
      return;
    }

    setDivyangPhoneError('');
    setDivyangSubmitting(true);
    try {
      const data = await apiPost(endpoints.divyangAssistRequest, { phone });
      if (data?.request) {
        saveDivyangRequestLocally(data.request);
      } else {
        pushLocalDivyangRequest(phone);
      }
    } catch {
      pushLocalDivyangRequest(phone);
    }
    notifyDivyangAssistUpdate();

    setDivyangDone('Thank you — our seva team will reach out shortly.');
    setDivyangPhone('');
    setDivyangSubmitting(false);
    onInteraction?.('divyang');
  }

  function renderBody() {
    switch (stallKey) {
      case 'rope':
        return (
          <>
            <p>Every pull helps the Ratha move forward in spirit!</p>
            <div className={styles.bigNumber}>{ropePullCount}</div>
            {showRopeVideo ? (
              <div className={styles.ropeVideoWrap}>
                <video
                  ref={ropeVideoRef}
                  className={styles.ropeVideo}
                  src="/mela-rope-pull.mp4"
                  playsInline
                  preload="auto"
                />
              </div>
            ) : null}
            <button type="button" className={styles.modalBtn} style={{ background: meta.color, width: '100%' }} onClick={pullRope}>
              Pull!
            </button>
          </>
        );
      case 'diya':
        return (
          <>
            <input className={styles.modalInput} placeholder="Your name" value={diyaName} onChange={(e) => setDiyaName(e.target.value)} />
            <button
              type="button"
              className={styles.modalBtn}
              style={{ background: meta.color, width: '100%' }}
              onClick={lightDiya}
              disabled={diyaSubmitting}
            >
              {diyaSubmitting ? 'Submitting…' : 'Light it 🪔'}
            </button>
            {diyaError ? <p className={styles.errorMsg} style={{ marginTop: 12 }}>{diyaError}</p> : null}
            {diyaDone ? (
              <p className={styles.confirmMsg} style={{ marginTop: 12 }}>
                Your diya has been sent for volunteer review. Once approved, it will glow on the{' '}
                <Link to="/rath-yatra-wall" className={styles.sankalpWallLink} onClick={(e) => e.stopPropagation()}>Ratha Yatra Wall</Link>.
                {' '}Jai Jagannath!
              </p>
            ) : null}
          </>
        );
      case 'sankalp':
        return (
          <>
            <textarea className={styles.modalTextarea} placeholder="Share your sankalp…" value={sankalpText} onChange={(e) => setSankalpText(e.target.value)} />
            <button
              type="button"
              className={styles.modalBtn}
              style={{ background: meta.color, width: '100%' }}
              onClick={submitSankalp}
              disabled={sankalpSubmitting}
            >
              {sankalpSubmitting ? 'Submitting…' : 'Offer Sankalp'}
            </button>
            {sankalpError ? <p className={styles.errorMsg} style={{ marginTop: 12 }}>{sankalpError}</p> : null}
            {sankalpDone ? (
              <p className={styles.confirmMsg} style={{ marginTop: 12 }}>
                Your sankalp has been sent for volunteer review. Once approved, it will appear on the{' '}
                <Link to="/rath-yatra-wall" className={styles.sankalpWallLink} onClick={(e) => e.stopPropagation()}>Ratha Yatra Wall</Link>.
                {' '}Jai Jagannath!
              </p>
            ) : null}
          </>
        );
      case 'trivia': {
        const currentQuestion = triviaRound[triviaIndex];
        if (!currentQuestion) {
          return <p style={{ textAlign: 'center', color: '#7a6e5c' }}>Loading trivia…</p>;
        }
        if (triviaDone) {
          return (
            <>
              <p className={styles.bigNumber} style={{ fontSize: 42 }}>{triviaScore} / {triviaRound.length}</p>
              <p style={{ textAlign: 'center', marginBottom: 14 }}>Well done, devotee!</p>
              <button type="button" className={styles.modalBtn} style={{ background: meta.color, width: '100%' }} onClick={resetTrivia}>
                Play again
              </button>
            </>
          );
        }
        return (
          <>
            <p className={styles.triviaQuestion}>{currentQuestion.q}</p>
            <div className={styles.triviaOptions}>
              {currentQuestion.options.map((opt, i) => {
                let cls = styles.triviaOption;
                if (triviaFeedback !== null) {
                  if (i === currentQuestion.answer) cls += ` ${styles.triviaCorrect}`;
                  else if (i === triviaPick) cls += ` ${styles.triviaWrong}`;
                }
                return (
                  <button
                    key={`${triviaIndex}-${i}-${opt}`}
                    type="button"
                    className={cls}
                    onClick={() => answerTrivia(i)}
                    disabled={triviaFeedback !== null}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            <p style={{ marginTop: 10, fontSize: 12, color: '#7a6e5c' }}>Question {triviaIndex + 1} of {triviaRound.length}</p>
          </>
        );
      }
      case 'cert':
        return (
          <>
            <p className={styles.modalText}>Enter your name to receive your Rath Yatra Online Mela certificate.</p>
            <input
              className={styles.modalInput}
              placeholder="Your name"
              value={certName}
              onChange={(e) => setCertName(e.target.value)}
            />
            <button
              type="button"
              className={styles.modalBtn}
              style={{ background: meta.color, width: '100%' }}
              onClick={generateCert}
              disabled={!certName.trim()}
            >
              Generate
            </button>
            {certShown ? (
              <div className={styles.certPreviewWrap}>
                <div
                  className={styles.certPreview}
                  aria-label={`Certificate for ${certShown}`}
                  style={{ '--cert-name-y': `${CERT_NAME_Y_RATIO * 100}%` }}
                >
                  <img
                    src="/mela-certificate-template.png"
                    alt=""
                    className={styles.certTemplate}
                    width={1024}
                    height={819}
                  />
                  <p className={styles.certNameOverlay}>{certShown}</p>
                </div>
                <button
                  type="button"
                  className={styles.modalBtn}
                  style={{ background: meta.color, width: '100%', marginTop: 12 }}
                  onClick={downloadCert}
                  disabled={certDownloading}
                >
                  {certDownloading ? 'Preparing download…' : 'Download certificate'}
                </button>
              </div>
            ) : null}
          </>
        );
      case 'guide':
        return (
          <ul className={styles.guideList}>
            {GUIDE_TIPS.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
            <li>
              Can&apos;t make it in person? Follow the{' '}
              <Link to="/live-darshan" className={styles.guideLink} onClick={(e) => e.stopPropagation()}>
                Live Darshan
              </Link>{' '}
              page for real-time streaming and procession location updates.
            </li>
          </ul>
        );
      case 'support':
        return (
          <>
            <section className={styles.supportBlock}>
              <h3 className={styles.supportBlockTitle}>Senior Helpline</h3>
              <p className={styles.modalText}>Tap to call our seva helpline:</p>
              <a
                className={styles.helplineLink}
                href={`tel:${TEMPLE_PHONE.replace(/\s/g, '')}`}
                onClick={() => onInteraction?.('helpline')}
              >
                {TEMPLE_PHONE}
              </a>
            </section>
            <section className={styles.supportBlock}>
              <h3 className={styles.supportBlockTitle}>Request assistance</h3>
              <p className={styles.modalText}>
                Need help during your visit? Leave your number and our seva team will reach out.
              </p>
              <IndianMobileInput
                className={styles.modalInput}
                placeholder="9876543210"
                value={divyangPhone}
                onChange={(e) => {
                  setDivyangPhone(e.target.value);
                  setDivyangPhoneError('');
                }}
                hasError={Boolean(divyangPhoneError)}
              />
              {divyangPhoneError ? (
                <p className={styles.modalText} style={{ color: '#c92a04', marginTop: 8 }} role="alert">
                  {divyangPhoneError}
                </p>
              ) : null}
              <button
                type="button"
                className={styles.modalBtn}
                style={{ background: meta.color, width: '100%' }}
                onClick={requestDivyang}
                disabled={divyangSubmitting || !divyangPhone.trim() || divyangPhone.length < 10}
              >
                {divyangSubmitting ? 'Sending…' : 'Request assistance'}
              </button>
              {divyangDone ? <p className={styles.confirmMsg} style={{ marginTop: 12 }}>{divyangDone}</p> : null}
            </section>
          </>
        );
      case 'creators': {
        const { official, digital } = partitionCreators(creators);

        function renderCreatorCard(creator, isOfficial) {
          return (
            <a
              key={creator.id}
              href={instagramProfileUrl(creator.instagramHandle)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.creatorCard} ${isOfficial ? styles.creatorCardOfficial : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onInteraction?.('creators');
              }}
            >
              {isOfficial ? (
                <span className={styles.creatorOfficialBadge}>★ Official Partner</span>
              ) : null}
              {creator.photoUrl ? (
                <img
                  src={resolveMediaUrl(creator.photoUrl)}
                  alt=""
                  className={`${styles.creatorPhoto} ${isOfficial ? styles.creatorPhotoOfficial : ''}`}
                />
              ) : (
                <div
                  className={`${styles.creatorPhotoFallback} ${isOfficial ? styles.creatorPhotoOfficial : ''}`}
                  aria-hidden="true"
                >
                  {isOfficial ? '★' : '🎥'}
                </div>
              )}
              <div className={styles.creatorName}>{creator.name}</div>
              <div className={styles.creatorHandle}>
                {formatInstagramHandle(creator.instagramHandle)}
              </div>
            </a>
          );
        }

        return (
          <>
            {creators.length === 0 ? (
              <p className={styles.modalText}>Creator spotlight coming soon!</p>
            ) : (
              <>
                {official.length > 0 ? (
                  <section className={styles.creatorSection}>
                    <h3 className={styles.creatorSectionTitleOfficial}>
                      {CREATOR_TIER_LABELS[CREATOR_TIERS.OFFICIAL]}
                    </h3>
                    <div className={styles.creatorGridOfficial}>
                      {official.map((creator) => renderCreatorCard(creator, true))}
                    </div>
                  </section>
                ) : null}
                {digital.length > 0 ? (
                  <section className={styles.creatorSection}>
                    <h3 className={styles.creatorSectionTitleDigital}>
                      {CREATOR_TIER_LABELS[CREATOR_TIERS.DIGITAL]}
                    </h3>
                    <div className={styles.creatorGrid}>
                      {digital.map((creator) => renderCreatorCard(creator, false))}
                    </div>
                  </section>
                ) : null}
              </>
            )}
            <a
              className={styles.creatorJoin}
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              Join the Creator Program ↗
            </a>
          </>
        );
      }
      case 'memory':
        return (
          <MemoryMatch
            onWin={() => onInteraction?.('memory')}
            onCelebrate={onMemoryCelebrate}
            onCelebrateStop={onMemoryCelebrateStop}
          />
        );
      case 'tictactoe':
        return (
          <MelaTicTacToe
            onGameComplete={() => onInteraction?.('tictactoe')}
            onCelebrate={onMemoryCelebrate}
            onCelebrateStop={onMemoryCelebrateStop}
          />
        );
      case 'puzzle':
        return (
          <RathPuzzleSlider
            onSolve={() => onInteraction?.('puzzle')}
            onCelebrate={onMemoryCelebrate}
            onCelebrateStop={onMemoryCelebrateStop}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className={styles.modalBackdrop} onClick={handleClose} role="presentation">
      {diyaFxActive ? (
        <DiyaLanternCanvas
          key={diyaFxBurstKey}
          fading={diyaFxFading}
          className={diyaFxFading ? `${styles.diyaFxLayer} ${styles.diyaFxLayerFading}` : styles.diyaFxLayer}
        />
      ) : null}
      {sankalpSpiritFx ? (
        <div
          className={sankalpFxFading ? `${styles.sankalpFxLayer} ${styles.sankalpFxLayerFading}` : styles.sankalpFxLayer}
          aria-hidden="true"
        >
          <div className={styles.sankalpLightGlow} />
          {sankalpSpiritFx.rays.map((ray) => (
            <span
              key={ray.id}
              className={styles.sankalpLightRay}
              style={{
                left: `${ray.left}%`,
                width: `${ray.width}%`,
                opacity: ray.opacity,
                transform: `rotate(${ray.rotate}deg)`,
                animationDelay: `${ray.delay}s`,
              }}
            />
          ))}
          {sankalpSpiritFx.particles.map((particle) => (
            <span
              key={particle.id}
              className={styles.sankalpParticle}
              style={{
                left: `${particle.left}%`,
                width: particle.size,
                height: particle.size,
                background: particle.color,
                animationDuration: `${particle.duration}s`,
                animationDelay: `${particle.delay}s`,
                '--particle-drift': `${particle.drift}px`,
                '--particle-o': particle.opacity,
                '--particle-glow': `${Math.max(4, particle.size * 2.2)}px`,
              }}
            />
          ))}
        </div>
      ) : null}
      {ropePetalsActive ? (
        <RopePetalCanvas
          key={ropePullCount}
          fading={ropePetalsFading}
          className={ropePetalsFading ? `${styles.ropePetalLayer} ${styles.ropePetalLayerFading}` : styles.ropePetalLayer}
        />
      ) : null}
      {stallKey === 'guide' ? (
        <div className={styles.guideFxLayer} aria-hidden="true">
          {guideFallingStars.map((star) => (
            <span
              key={star.id}
              className={styles.guideFallingStar}
              style={{
                left: `${star.left}%`,
                fontSize: star.size,
                '--star-o': star.opacity,
                '--star-delay': `${star.delay}s`,
                '--star-duration': `${star.duration}s`,
                '--star-drift': `${star.drift}px`,
              }}
            >
              ⭐
            </span>
          ))}
          {guideCrackers.map((cracker) => (
            <div
              key={cracker.id}
              className={styles.portalFirecracker}
              style={{
                left: `${cracker.left}%`,
                top: `${cracker.top}%`,
                '--cracker-color': cracker.color,
                '--cracker-scale': cracker.scale,
                '--cracker-delay': `${cracker.delay}s`,
                '--cracker-rotate': `${cracker.rotate}deg`,
              }}
            >
              <span className={styles.crackerBurst}>
                {Array.from({ length: 6 }, (_, sparkIndex) => (
                  <span
                    key={sparkIndex}
                    className={styles.crackerSpark}
                    style={{ '--spark-i': sparkIndex }}
                  />
                ))}
              </span>
              <span className={styles.crackerFuse} />
              <span className={styles.crackerBody} />
            </div>
          ))}
        </div>
      ) : null}
      <div
        className={
          stallKey === 'puzzle'
            ? `${styles.modalCard} ${styles.modalCardGame} ${styles.modalCardPuzzle}`
            : stallKey === 'memory' || stallKey === 'tictactoe'
              ? `${styles.modalCard} ${styles.modalCardGame}`
              : styles.modalCard
        }
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={meta.title}
      >
        <div className={styles.modalHeader} style={{ background: meta.color }}>
          <h2 className={styles.modalTitle}>
            <span>{meta.icon}</span>
            {meta.title}
          </h2>
          <button type="button" className={styles.modalClose} aria-label="Close" onClick={handleClose}>✕</button>
        </div>
        <div className={styles.modalBody}>{renderBody()}</div>
      </div>
    </div>
  );
}

const LOADER_DURATION_MS = 2800;

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

export default function RathPlayground() {
  const fairgroundRef = useRef(null);
  const progressRafRef = useRef(null);
  const progressDismissTimerRef = useRef(null);
  const fxIdRef = useRef(0);
  const winCelebrationIntervalRef = useRef(null);
  const winCelebrationEndTimerRef = useRef(null);
  const melaAudioRef = useRef(null);
  const melaFadeCancelRef = useRef(null);

  const [showPortal, setShowPortal] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [stallLayout, setStallLayout] = useState([]);
  const [balloons, setBalloons] = useState([]);
  const [stars, setStars] = useState([]);
  const [activeStall, setActiveStall] = useState(null);
  const [skyDeco, setSkyDeco] = useState(() => generateSkyDeco());
  const [bubbles, setBubbles] = useState([]);
  const [particles, setParticles] = useState([]);
  const [confetti, setConfetti] = useState([]);
  const [fireworks, setFireworks] = useState([]);
  const [winCelebrationActive, setWinCelebrationActive] = useState(false);
  const [creators, setCreators] = useState(DEFAULT_CREATORS);
  const [stallCounts, setStallCounts] = useState({});
  const [ropePullCount, setRopePullCount] = useState(() => readJson(STORAGE_ROPE, 0));

  const refreshMelaStats = useCallback(async () => {
    try {
      const counts = await fetchMelaStats();
      setStallCounts(counts);
    } catch {
      // keep last known counts
    }
  }, []);

  const bumpStallCount = useCallback((key) => {
    trackMelaInteraction(key);
    setStallCounts((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));
  }, []);

  const fetchCreators = useCallback(async () => {
    try {
      const data = await apiGet(endpoints.creatorsPublic);
      if (Array.isArray(data.creators)) setCreators(data.creators);
    } catch {
      // keep current list on failure
    }
  }, []);

  const cancelProgressAnimation = useCallback(() => {
    if (progressRafRef.current) {
      cancelAnimationFrame(progressRafRef.current);
      progressRafRef.current = null;
    }
    if (progressDismissTimerRef.current) {
      window.clearTimeout(progressDismissTimerRef.current);
      progressDismissTimerRef.current = null;
    }
  }, []);

  const dismissPortal = useCallback(() => {
    cancelProgressAnimation();
    setShowPortal(false);
  }, [cancelProgressAnimation]);

  const ensureMelaAudio = useCallback(() => {
    if (!melaAudioRef.current) {
      const audio = new Audio(MELA_AMBIENT_SOUND);
      audio.loop = true;
      audio.preload = 'auto';
      melaAudioRef.current = audio;
    }
    return melaAudioRef.current;
  }, []);

  const startMelaLoaderSound = useCallback(() => {
    const audio = ensureMelaAudio();
    if (melaFadeCancelRef.current) {
      melaFadeCancelRef.current();
      melaFadeCancelRef.current = null;
    }
    audio.volume = MELA_LOADER_VOLUME;
    audio.play().catch(() => {});
  }, [ensureMelaAudio]);

  const fadeMelaToBackground = useCallback(() => {
    const audio = melaAudioRef.current;
    if (!audio) return;
    if (melaFadeCancelRef.current) melaFadeCancelRef.current();
    melaFadeCancelRef.current = fadeAudioVolume(audio, MELA_BG_VOLUME, MELA_FADE_MS);
  }, []);

  const pauseMelaAmbient = useCallback(() => {
    if (melaFadeCancelRef.current) {
      melaFadeCancelRef.current();
      melaFadeCancelRef.current = null;
    }
    melaAudioRef.current?.pause();
  }, []);

  const resumeMelaBackground = useCallback(() => {
    const audio = melaAudioRef.current;
    if (!audio) return;
    if (melaFadeCancelRef.current) {
      melaFadeCancelRef.current();
      melaFadeCancelRef.current = null;
    }
    audio.volume = MELA_BG_VOLUME;
    audio.play().catch(() => {});
  }, []);

  const stopMelaAmbient = useCallback(() => {
    if (melaFadeCancelRef.current) {
      melaFadeCancelRef.current();
      melaFadeCancelRef.current = null;
    }
    if (melaAudioRef.current) {
      melaAudioRef.current.pause();
      melaAudioRef.current = null;
    }
  }, []);

  const addConfettiBurst = useCallback((clientX, clientY, pieceCount = 28) => {
    const batchId = fxIdRef.current;
    fxIdRef.current += 1;

    const pieces = Array.from({ length: pieceCount }, (_, i) => {
      const angle = (Math.PI * 2 * i) / pieceCount + Math.random() * 0.5;
      const dist = 30 + Math.random() * 70;
      const size = CONFETTI_SIZE_TIERS[Math.floor(Math.random() * CONFETTI_SIZE_TIERS.length)];
      return {
        id: `${batchId}-c-${i}`,
        x: clientX,
        y: clientY,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        size,
        rot: Math.random() * 360,
        round: Math.random() > 0.45,
      };
    });

    setConfetti((prev) => [...prev, ...pieces].slice(-400));
    window.setTimeout(() => {
      setConfetti((prev) => prev.filter((p) => !p.id.startsWith(`${batchId}-`)));
    }, 1200);
  }, []);

  const spawnConfetti = useCallback((clientX, clientY) => {
    addConfettiBurst(clientX, clientY, 28);
  }, [addConfettiBurst]);

  const stopMemoryWinCelebration = useCallback(() => {
    if (winCelebrationIntervalRef.current) {
      window.clearInterval(winCelebrationIntervalRef.current);
      winCelebrationIntervalRef.current = null;
    }
    if (winCelebrationEndTimerRef.current) {
      window.clearTimeout(winCelebrationEndTimerRef.current);
      winCelebrationEndTimerRef.current = null;
    }
    setWinCelebrationActive(false);
  }, []);

  const spawnMemoryWinCelebration = useCallback(() => {
    stopMemoryWinCelebration();
    setWinCelebrationActive(true);

    const runBurst = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      for (let i = 0; i < 5; i += 1) {
        addConfettiBurst(Math.random() * w, Math.random() * h, 36);
      }
    };

    runBurst();
    winCelebrationIntervalRef.current = window.setInterval(runBurst, 420);
    winCelebrationEndTimerRef.current = window.setTimeout(stopMemoryWinCelebration, 5500);
  }, [addConfettiBurst, stopMemoryWinCelebration]);

  useEffect(() => () => stopMemoryWinCelebration(), [stopMemoryWinCelebration]);

  const spawnFireworksShow = useCallback(() => {
    const field = fairgroundRef.current;
    if (!field) return;
    const w = field.clientWidth;
    const h = field.clientHeight;
    if (!w || !h) return;

    const batchId = fxIdRef.current;
    fxIdRef.current += 1;
    const burstCount = 3 + Math.floor(Math.random() * 3);
    const allSparks = [];

    for (let b = 0; b < burstCount; b += 1) {
      const x = w * (0.08 + Math.random() * 0.84);
      const y = h * (0.06 + Math.random() * 0.52);
      const color = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];
      const burstScale = FIREWORK_SIZE_TIERS[Math.floor(Math.random() * FIREWORK_SIZE_TIERS.length)];
      const sparkCount = 14 + Math.floor(Math.random() * 8);

      for (let i = 0; i < sparkCount; i += 1) {
        const angle = (Math.PI * 2 * i) / sparkCount + Math.random() * 0.25;
        const dist = (28 + Math.random() * 42) * burstScale;
        const size = (5 + Math.random() * 7) * burstScale;
        allSparks.push({
          id: `${batchId}-f-${b}-${i}`,
          x,
          y,
          color,
          size,
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist,
        });
      }
    }

    setFireworks((prev) => [...prev, ...allSparks].slice(-240));
    window.setTimeout(() => {
      setFireworks((prev) => prev.filter((p) => !p.id.startsWith(`${batchId}-`)));
    }, 1200);
  }, []);

  const recomputeDecor = useCallback(() => {
    const viewportWidth = window.innerWidth;
    const cfg = getFairgroundDecorConfig(viewportWidth);

    const balloonPts = placeNonOverlapping(cfg.balloonCount, cfg.balloonMinDist, 2.4);
    setBalloons(
      balloonPts.map((pt, i) => ({
        x: pt.x,
        y: pt.y,
        color: BALLOON_COLORS[i % BALLOON_COLORS.length],
        size: cfg.balloonSizeMin + Math.random() * cfg.balloonSizeRange,
        opacity: cfg.balloonOpacityMin + Math.random() * cfg.balloonOpacityRange,
        delay: (i % 12) * 0.25,
      })),
    );

    const starPts = placeNonOverlapping(cfg.starCount, cfg.starMinDist, 2.4);
    setStars(
      starPts.map((pt, i) => ({
        x: pt.x,
        y: pt.y,
        size: cfg.starSizeMin + Math.random() * cfg.starSizeRange,
        opacity: cfg.starOpacityMin + Math.random() * cfg.starOpacityRange,
        delay: (i % 15) * 0.2,
      })),
    );

    setBubbles(generateBubbles(cfg.bubbleCount, viewportWidth));
    setParticles(generateParticles(cfg.particleCount, viewportWidth));
    setSkyDeco(generateSkyDeco(viewportWidth));
  }, []);

  const recomputeLayout = useCallback(() => {
    const el = fairgroundRef.current;
    if (!el) return;
    const layout = computeLayout(el, STALL_KEYS);
    if (layout) setStallLayout(layout);
  }, []);

  useEffect(() => {
    if (!showPortal) return undefined;
    startMelaLoaderSound();
    return undefined;
  }, [showPortal, startMelaLoaderSound]);

  useEffect(() => {
    if (showPortal) return undefined;

    if (activeStall) {
      pauseMelaAmbient();
      return undefined;
    }

    const audio = melaAudioRef.current;
    if (!audio) return undefined;

    if (audio.volume > MELA_BG_VOLUME + 0.05) {
      fadeMelaToBackground();
    } else {
      resumeMelaBackground();
    }

    return undefined;
  }, [showPortal, activeStall, pauseMelaAmbient, resumeMelaBackground, fadeMelaToBackground]);

  useEffect(() => () => stopMelaAmbient(), [stopMelaAmbient]);

  useEffect(() => {
    if (showPortal) return undefined;
    refreshMelaStats();
    const timer = window.setInterval(refreshMelaStats, 8_000);
    return () => window.clearInterval(timer);
  }, [showPortal, refreshMelaStats]);

  useEffect(() => {
    document.documentElement.style.height = '100%';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.height = '100%';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.height = '';
      document.documentElement.style.overflow = '';
      document.body.style.height = '';
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (!showPortal) return undefined;

    setLoadProgress(0);
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / LOADER_DURATION_MS);
      setLoadProgress(Math.round(easeOutCubic(t) * 100));

      if (t >= 1) {
        progressDismissTimerRef.current = window.setTimeout(dismissPortal, 250);
        return;
      }

      progressRafRef.current = requestAnimationFrame(tick);
    }

    progressRafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelProgressAnimation();
    };
  }, [showPortal, dismissPortal, cancelProgressAnimation]);

  useLayoutEffect(() => {
    recomputeDecor();
    recomputeLayout();
  }, [recomputeDecor, recomputeLayout]);

  useEffect(() => {
    fetchCreators();
    const unsubscribe = subscribeCreatorSpotlightUpdates(fetchCreators);
    return unsubscribe;
  }, [fetchCreators]);

  useEffect(() => {
    let resizeTimer;
    function onResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        recomputeDecor();
        recomputeLayout();
      }, 150);
    }

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.clearTimeout(resizeTimer);
    };
  }, [recomputeLayout, recomputeDecor]);

  useEffect(() => {
    if (showPortal) return undefined;

    spawnFireworksShow();
    const interval = window.setInterval(spawnFireworksShow, 2000);
    return () => window.clearInterval(interval);
  }, [showPortal, spawnFireworksShow]);

  function handleFairgroundClick(event) {
    spawnConfetti(event.clientX, event.clientY);
  }

  function handleStallClick(event, key) {
    event.stopPropagation();
    spawnConfetti(event.clientX, event.clientY);
    if (key === 'guide') bumpStallCount('guide');
    setActiveStall(key);
  }

  function formatStallBadge(count) {
    if (count >= 1000) return '999+';
    return String(count);
  }

  function getStallBadgeCount(key) {
    if (key === 'rope') return ropePullCount;
    if (key === 'creators') return creators.length;
    return stallCounts[key] ?? 0;
  }

  function handlePortalClick() {
    startMelaLoaderSound();
    dismissPortal();
  }

  return (
    <div className={styles.page}>
      {showPortal ? (
        <div className={styles.portal} onClick={handlePortalClick} role="presentation">
          <div className={styles.portalCrackers} aria-hidden="true">
            {PORTAL_CRACKERS.map((cracker) => (
              <div
                key={cracker.id}
                className={styles.portalFirecracker}
                style={{
                  left: `${cracker.left}%`,
                  top: `${cracker.top}%`,
                  '--cracker-color': cracker.color,
                  '--cracker-scale': cracker.scale,
                  '--cracker-delay': `${cracker.delay}s`,
                  '--cracker-rotate': `${cracker.rotate}deg`,
                }}
              >
                <span className={styles.crackerBurst}>
                  {Array.from({ length: 6 }, (_, sparkIndex) => (
                    <span
                      key={sparkIndex}
                      className={styles.crackerSpark}
                      style={{ '--spark-i': sparkIndex }}
                    />
                  ))}
                </span>
                <span className={styles.crackerFuse} />
                <span className={styles.crackerBody} />
              </div>
            ))}
          </div>

          <div className={styles.portalContent}>
            <p className={styles.portalTitle}>Entering the Mela…</p>

            <div className={styles.portalProgressBlock}>
              <div className={styles.portalProgressArea}>
                <div className={styles.portalProgressTrack}>
                  <div
                    className={styles.portalProgressFill}
                    style={{ width: `${loadProgress}%` }}
                  >
                    <span className={styles.portalProgressShine} aria-hidden="true" />
                  </div>
                </div>
                <span className={styles.portalProgressPct}>{loadProgress}%</span>
              </div>
            </div>

            <p className={styles.portalSkip}>tap to skip</p>
          </div>

          <span className={styles.portalSrOnly} aria-live="polite">
            Entering the mela: {loadProgress}%
          </span>
        </div>
      ) : null}

      <div className={styles.bunting} aria-hidden="true">
        <div className={styles.buntingString} />
        <div className={styles.buntingFlags}>
          {Array.from({ length: 18 }, (_, i) => (
            <span
              key={i}
              className={styles.flag}
              style={{
                '--flag-color': BUNTING_COLORS[i % BUNTING_COLORS.length],
                animationDelay: `${(i % 6) * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>

      <header className={styles.header}>
        <Link to="/" className={styles.backLink}>← Back to the Mandir</Link>
        <div className={styles.headerMelaRow}>
          <button
            type="button"
            className={styles.supportHeaderBtn}
            onClick={() => setActiveStall('support')}
            aria-haspopup="dialog"
          >
            <span className={styles.supportHeaderIcon} aria-hidden="true">🤝</span>
            Support
          </button>
          <span className={styles.headerTag}>RATHA YATRA 2026 · THE MELA</span>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.skyLayer} aria-hidden="true">
          {skyDeco.clouds.map((c) => (
            <div
              key={c.id}
              className={styles.cloud}
              style={{
                left: `${c.left}%`,
                top: `${c.top}%`,
                width: c.width,
                opacity: c.opacity,
                '--cloud-height': `${c.height}px`,
                '--cloud-duration': `${c.duration}s`,
                animationDelay: `${c.delay}s`,
              }}
            />
          ))}
          {skyDeco.kites.map((k) => (
            <div
              key={k.id}
              className={styles.kite}
              style={{
                left: `${k.left}%`,
                '--kite-color': k.color,
                '--kite-sway': `${k.swayDuration}s`,
                animationDelay: `${k.delay}s`,
              }}
            >
              <div className={styles.kiteString} />
              <div className={styles.kiteBody} />
              <div className={styles.kiteTail} />
            </div>
          ))}
          {skyDeco.paperFlags.map((f) => (
            <div
              key={f.id}
              className={styles.paperFlag}
              style={{
                left: `${f.left}%`,
                '--flag-color': f.color,
                animationDelay: `${f.delay}s`,
              }}
            />
          ))}
        </div>
        <div className={styles.heroEmoji} aria-hidden="true">🎪</div>
        <div className={styles.heroTitleWrap}>
          <svg
            className={styles.heroTitleSvg}
            viewBox="0 8 920 124"
            overflow="visible"
            role="img"
            aria-labelledby="hero-title-label"
          >
            <title id="hero-title-label">Welcome to the Mela Ground!</title>
            <defs>
              <pattern id="heroPolka" width="14" height="14" patternUnits="userSpaceOnUse">
                <circle cx="7" cy="7" r="1.15" fill="#ff4d6d" />
              </pattern>
            </defs>
            <text x="460" y="62" textAnchor="middle" className={styles.heroTitleSvgBase}>
              <tspan x="460" dy="0">Welcome to the</tspan>
              <tspan x="460" dy="1.15em">Mela Ground!</tspan>
            </text>
            <text x="460" y="62" textAnchor="middle" className={styles.heroTitleSvgPolka}>
              <tspan x="460" dy="0">Welcome to the</tspan>
              <tspan x="460" dy="1.15em">Mela Ground!</tspan>
            </text>
          </svg>
        </div>
        <p className={styles.heroSub}>Tap a stall to interact. ✨</p>
      </section>

      <section
        className={styles.fairground}
        ref={fairgroundRef}
        onClick={handleFairgroundClick}
        role="presentation"
      >
        <div className={styles.cornerTag}>
          <span className={styles.cornerTagEmoji} aria-hidden="true">🎪</span>
          RATH MELA · 2026
        </div>
        <div className={styles.fairgroundLights} aria-hidden="true" />

        <div className={styles.decoLayer} aria-hidden="true">
          {particles.map((p) => (
            <span
              key={p.id}
              className={styles.particle}
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
          {bubbles.map((b) => (
            <div
              key={b.id}
              className={styles.soapBubble}
              style={{
                left: `${b.x}%`,
                width: b.size,
                height: b.size,
                opacity: b.opacity,
                animationDuration: `${b.duration}s`,
                animationDelay: `${b.delay}s`,
              }}
            />
          ))}
          {balloons.map((b, i) => (
            <div
              key={`balloon-${i}`}
              className={styles.balloon}
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                opacity: b.opacity,
                animationDelay: `${b.delay}s`,
              }}
            >
              <div
                className={styles.balloonBody}
                style={{
                  width: b.size,
                  height: b.size * 1.15,
                  background: `radial-gradient(circle at 32% 26%, rgba(255,255,255,.6), ${b.color} 72%)`,
                }}
              />
              <div className={styles.balloonKnot} />
            </div>
          ))}
          {stars.map((s, i) => (
            <span
              key={`star-${i}`}
              className={styles.star}
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                fontSize: s.size,
                opacity: s.opacity,
                animationDelay: `${s.delay}s`,
              }}
            >
              ⭐
            </span>
          ))}
        </div>

        <div className={styles.fxLayer} aria-hidden="true">
          {fireworks.map((f) => (
            <span
              key={f.id}
              className={styles.fireworkSpark}
              style={{
                left: f.x,
                top: f.y,
                width: f.size,
                height: f.size,
                background: f.color,
                boxShadow: `0 0 ${Math.max(6, f.size * 1.5)}px ${f.color}`,
                '--fw-dx': `${f.dx}px`,
                '--fw-dy': `${f.dy}px`,
              }}
            />
          ))}
        </div>

        {stallLayout.map((tile) => {
          const meta = STALL_META[tile.key];
          return (
            <button
              key={tile.key}
              type="button"
              className={styles.stall}
              style={{
                left: `${tile.xPx}px`,
                top: `${tile.yPx}px`,
                width: tile.wrapW,
              }}
              onClick={(e) => handleStallClick(e, tile.key)}
            >
              <div
                className={styles.stallFloat}
                style={{
                  '--float-delay': `${tile.floatDelay}s`,
                  '--float-duration': `${tile.floatDuration}s`,
                }}
              >
                <div className={styles.stallCircleWrap}>
                  <div
                    className={styles.stallShadow}
                    style={{ width: tile.circleSize * 0.72, height: tile.circleSize * 0.18 }}
                  />
                  <div
                    className={styles.stallCircle}
                    style={{
                      width: tile.circleSize,
                      height: tile.circleSize,
                      '--stall-border': `${tile.borderW}px`,
                      background: `radial-gradient(circle at 32% 28%, ${meta.colorLight}, ${meta.color} 78%)`,
                    }}
                  >
                    <span className={styles.stallIcon} style={{ fontSize: tile.iconSize }}>{meta.icon}</span>
                    {!STALLS_WITHOUT_BADGE.has(tile.key) ? (
                      <span
                        className={styles.stallBadge}
                        style={{ width: tile.badgeSize, height: tile.badgeSize, fontSize: tile.badgeSize * 0.45 }}
                      >
                        {formatStallBadge(getStallBadgeCount(tile.key))}
                      </span>
                    ) : null}
                  </div>
                </div>
                <span
                  className={styles.stallLabel}
                  style={{ fontSize: tile.labelFont, background: meta.color, maxWidth: tile.wrapW }}
                >
                  {meta.title}
                </span>
              </div>
            </button>
          );
        })}
      </section>

      <footer className={styles.footer}>ଜୟ ଜଗନ୍ନାଥ · ରଥଯାତ୍ରା ୨୦୨୬</footer>

      {activeStall ? (
        <StallModal
          stallKey={activeStall}
          onClose={() => {
            stopMemoryWinCelebration();
            setActiveStall(null);
          }}
          creators={creators}
          onInteraction={bumpStallCount}
          ropePullCount={ropePullCount}
          onRopePull={setRopePullCount}
          onMemoryCelebrate={spawnMemoryWinCelebration}
          onMemoryCelebrateStop={stopMemoryWinCelebration}
        />
      ) : null}

      <div
        className={winCelebrationActive ? `${styles.pageFxLayer} ${styles.pageFxLayerCelebration}` : styles.pageFxLayer}
        aria-hidden="true"
      >
        {confetti.map((c) => (
          <span
            key={c.id}
            className={styles.confettiPiece}
            style={{
              left: c.x,
              top: c.y,
              width: c.size,
              height: c.round ? c.size : c.size * 1.35,
              borderRadius: c.round ? '50%' : '2px',
              background: c.color,
              boxShadow: `0 0 4px ${c.color}`,
              '--cf-dx': `${c.dx}px`,
              '--cf-dy': `${c.dy}px`,
              '--cf-rot': `${c.rot}deg`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
