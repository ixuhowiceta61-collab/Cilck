/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  MousePointerClick,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Globe,
  Code2,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Volume2,
  VolumeX,
  Zap,
  DollarSign,
  TrendingUp,
  Award
} from 'lucide-react';
import {
  TRANSLATIONS,
  COUNTRY_LANG_MAP,
  COUNTRY_NAMES,
  COUNTRY_FLAGS,
  type SupportedLang
} from './translations';

// Exact partner store offer link specified by user
const STORE_OFFER_URL = "https://www.profitableratecpmnetwork.com/h5can1a6kf?key=1f487ec4c12509fbc3ca2b1632129777";

export default function App() {
  // State: Points and Clicks stored in localStorage
  const [points, setPoints] = useState<number>(() => {
    const saved = localStorage.getItem('ce_points');
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  const [clicks, setClicks] = useState<number>(() => {
    const saved = localStorage.getItem('ce_clicks');
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  // Sound preference
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('ce_sound');
    return saved !== null ? saved === 'true' : true;
  });

  // Language state
  const [currentLang, setCurrentLang] = useState<SupportedLang>(() => {
    const saved = localStorage.getItem('ce_lang') as SupportedLang;
    if (saved && TRANSLATIONS[saved]) return saved;
    return 'en';
  });

  // Location / Country state
  const [countryCode, setCountryCode] = useState<string>('US');
  const [countryName, setCountryName] = useState<string>('Detecting...');
  const [countryFlag, setCountryFlag] = useState<string>('🌐');
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(true);

  // Success celebration toast
  const [showToast, setShowToast] = useState<boolean>(false);
  const [pointsGlow, setPointsGlow] = useState<boolean>(false);

  // Modals
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [hasCopiedCode, setHasCopiedCode] = useState<boolean>(false);

  // Synchronize to localStorage
  useEffect(() => {
    localStorage.setItem('ce_points', points.toString());
  }, [points]);

  useEffect(() => {
    localStorage.setItem('ce_clicks', clicks.toString());
  }, [clicks]);

  useEffect(() => {
    localStorage.setItem('ce_sound', soundEnabled.toString());
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('ce_lang', currentLang);
    // RTL Handling for Arabic
    if (currentLang === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  // Country Detection using ipapi.co with fallback to api.country.is
  useEffect(() => {
    let isMounted = true;

    async function detectCountry() {
      setIsDetectingLocation(true);
      const savedLang = localStorage.getItem('ce_lang') as SupportedLang;

      try {
        const res = await fetch('https://ipapi.co/json/', { cache: 'no-cache' });
        if (!res.ok) throw new Error('Primary detection failed');
        const data = await res.json();

        if (isMounted && data && data.country_code) {
          const code = data.country_code.toUpperCase();
          const name = data.country_name || COUNTRY_NAMES[code] || code;
          const flag = COUNTRY_FLAGS[code] || '📍';

          setCountryCode(code);
          setCountryName(name);
          setCountryFlag(flag);

          // If user hasn't explicitly picked a language before, auto switch based on country mapping
          if (!savedLang && COUNTRY_LANG_MAP[code]) {
            setCurrentLang(COUNTRY_LANG_MAP[code]);
          }
          setIsDetectingLocation(false);
          return;
        }
      } catch (err) {
        // Fallback detection
        try {
          const fallbackRes = await fetch('https://api.country.is/', { cache: 'no-cache' });
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            if (isMounted && fallbackData.country) {
              const code = fallbackData.country.toUpperCase();
              setCountryCode(code);
              setCountryName(COUNTRY_NAMES[code] || code);
              setCountryFlag(COUNTRY_FLAGS[code] || '📍');

              if (!savedLang && COUNTRY_LANG_MAP[code]) {
                setCurrentLang(COUNTRY_LANG_MAP[code]);
              }
              setIsDetectingLocation(false);
              return;
            }
          }
        } catch {
          // Graceful fallback to default
        }
      }

      if (isMounted) {
        setCountryCode('US');
        setCountryName('Global (EN)');
        setCountryFlag('🌐');
        setIsDetectingLocation(false);
      }
    }

    detectCountry();

    return () => {
      isMounted = false;
    };
  }, []);

  // Web Audio Synth Chime
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      // High, cheerful ascending arpeggio (C5 -> E5 -> G5 -> C6)
      const frequencies = [523.25, 659.25, 783.99, 1046.50];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.001, now + idx * 0.07);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.36);
      });
    } catch {
      // Audio context policy fallback
    }
  };

  // Main Click & Earn Handler (Core Feature)
  const handleClickAndEarn = () => {
    // 1. Open exact store link in a new tab
    try {
      window.open(STORE_OFFER_URL, '_blank', 'noopener,noreferrer');
    } catch {
      // popup blocker fallback link
    }

    // 2. Award +1 Point immediately and +1 click count
    setPoints(prev => prev + 1);
    setClicks(prev => prev + 1);

    // 3. Play audio chime
    playChime();

    // 4. Trigger visual feedback
    setShowToast(true);
    setPointsGlow(true);
    setTimeout(() => setPointsGlow(false), 2000);
    setTimeout(() => setShowToast(false), 2500);
  };

  // Reset Progress confirmation
  const handleConfirmReset = () => {
    setPoints(0);
    setClicks(0);
    localStorage.removeItem('ce_points');
    localStorage.removeItem('ce_clicks');
    setShowResetModal(false);
  };

  // Active translation dictionary
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  // 10 Points = $1.00 USD ($0.10 / pt)
  const dollarEarnings = (points / 10).toFixed(2);
  const payoutGoal = 5.0; // $5.00 goal (50 points)
  const payoutPercent = Math.min(100, Math.round(((points / 10) / payoutGoal) * 100));

  // Standalone HTML template string (to copy or download)
  const getSingleHtmlFileCode = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Click & Earn - Verified Rewards Portal</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: { 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca' }
          }
        }
      }
    };
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .mono { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }
    @keyframes pulseGlow {
      0%, 100% { box-shadow: 0 0 35px -5px rgba(99, 102, 241, 0.5), 0 0 15px -3px rgba(168, 85, 247, 0.4); }
      50% { box-shadow: 0 0 55px 8px rgba(99, 102, 241, 0.8), 0 0 25px 2px rgba(168, 85, 247, 0.6); }
    }
    .pulse-btn { animation: pulseGlow 2.4s infinite; }
    @keyframes floatUp {
      0% { opacity: 0; transform: translateY(20px) scale(0.85); }
      20% { opacity: 1; transform: translateY(0px) scale(1.05); }
      80% { opacity: 1; transform: translateY(-15px) scale(1); }
      100% { opacity: 0; transform: translateY(-35px) scale(0.9); }
    }
    .animate-float { animation: floatUp 2.2s forwards; }
  </style>
</head>
<body class="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white" id="mainBody">
  <!-- Toast Notification -->
  <div id="toastNotification" class="fixed top-6 right-6 z-50 pointer-events-none hidden">
    <div class="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-2xl border border-emerald-300">
      <div class="w-8 h-8 rounded-full bg-slate-950/20 flex items-center justify-center text-lg">✓</div>
      <div>
        <div class="text-base font-extrabold" id="toastTitle">+1 Point Earned!</div>
        <div class="text-xs font-semibold text-emerald-950/80" id="toastSub">+$0.10 USD added to balance</div>
      </div>
    </div>
  </div>

  <header class="border-b border-indigo-950/80 bg-slate-900/70 backdrop-blur-md sticky top-0 z-40">
    <div class="max-w-6xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg text-white font-black text-xl">⚡</div>
        <div>
          <div class="font-extrabold text-lg sm:text-xl text-white" id="headerBrand">Click & Earn</div>
          <div class="text-[10px] sm:text-xs font-semibold text-indigo-300/70" id="headerTagline">Verified Global Rewards Platform</div>
        </div>
      </div>
      <div class="flex items-center gap-2 sm:gap-3">
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-800/50 text-xs text-indigo-200">
          <span id="countryFlag">🌐</span>
          <span class="font-semibold hidden sm:inline" id="countryName">Detecting...</span>
        </div>
        <select id="languageSelect" onchange="changeLanguage(this.value)" class="bg-slate-900 border border-indigo-800/60 text-indigo-100 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none">
          <option value="en">English (US/UK)</option>
          <option value="bn">বাংলা (Bengali)</option>
          <option value="hi">हिन्दी (Hindi)</option>
          <option value="fr">Français (French)</option>
          <option value="es">Español (Spanish)</option>
          <option value="ar">العربية (Arabic)</option>
          <option value="pt">Português (Brazil)</option>
          <option value="de">Deutsch (German)</option>
        </select>
      </div>
    </div>
  </header>

  <main class="flex-1 max-w-5xl mx-auto w-full px-4 py-8 sm:py-12 flex flex-col gap-8">
    <section class="relative overflow-hidden rounded-3xl border border-indigo-900/60 bg-gradient-to-b from-indigo-950/70 via-slate-900/80 to-slate-950 p-6 sm:p-12 text-center shadow-2xl">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-5" id="heroBadge">
        ✨ Instant Verification & Direct Payouts
      </div>
      <h1 class="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4">
        <span id="heroTitle1">Click, Discover &</span> <br class="hidden sm:inline" />
        <span class="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent" id="heroHighlight">Earn Real Cash</span>
      </h1>
      <p class="text-slate-300/80 text-sm sm:text-lg max-w-2xl mx-auto mb-8 font-normal" id="heroSubtitle">
        Visit verified partner offers and watch your balance grow instantly. Every click awards +1 Point guaranteed.
      </p>

      <div class="flex flex-col items-center justify-center gap-4">
        <button id="mainEarnButton" onclick="handleClickAndEarn()" class="pulse-btn inline-flex items-center justify-center gap-3.5 px-8 sm:px-14 py-5 sm:py-6 rounded-2xl font-black text-lg sm:text-2xl text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:scale-[1.03] active:scale-[0.98] transition-all shadow-2xl cursor-pointer">
          <div class="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white">⚡</div>
          <span id="mainBtnText">CLAIM +1 POINT NOW</span>
        </button>
        <div class="text-xs sm:text-sm text-indigo-300/80" id="mainBtnSubtext">
          Opens official partner link · Awards +1 Point ($0.10 USD)
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      <div class="p-6 rounded-3xl border border-indigo-900/60 bg-slate-900/60 backdrop-blur-md">
        <div class="text-xs font-bold uppercase text-indigo-300/80 mb-3" id="labelPoints">Current Points</div>
        <div class="text-4xl sm:text-5xl font-black mono text-indigo-400 flex items-baseline gap-2">
          <span id="statPoints">0</span>
          <span class="text-sm font-bold text-slate-400" id="unitPoints">PTS</span>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400" id="statRate">Rate: 10 Points = $1.00 USD</div>
      </div>

      <div class="p-6 rounded-3xl border border-indigo-900/60 bg-slate-900/60 backdrop-blur-md">
        <div class="text-xs font-bold uppercase text-purple-300/80 mb-3" id="labelEarnings">Estimated Earnings</div>
        <div class="text-4xl sm:text-5xl font-black mono text-white flex items-baseline gap-1">
          <span class="text-purple-400">$</span>
          <span id="statEarnings">0.00</span>
          <span class="text-xs font-semibold text-slate-400 ml-1">USD</span>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-800/80 text-xs text-purple-300/80" id="earningsSub">Real-time balance ready to withdraw</div>
      </div>

      <div class="p-6 rounded-3xl border border-indigo-900/60 bg-slate-900/60 backdrop-blur-md">
        <div class="text-xs font-bold uppercase text-pink-300/80 mb-3" id="labelClicks">Total Clicks</div>
        <div class="text-4xl sm:text-5xl font-black mono text-pink-400 flex items-baseline gap-2">
          <span id="statClicks">0</span>
          <span class="text-sm font-bold text-slate-400" id="unitClicks">VISITS</span>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400" id="clicksSub">Total verified partner interactions</div>
      </div>
    </section>

    <!-- Cashout Progress & Reset -->
    <section class="p-6 rounded-3xl border border-indigo-900/50 bg-slate-900/40 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="w-full md:w-2/3">
        <div class="flex justify-between items-center text-xs font-bold mb-2">
          <span class="text-slate-300" id="payoutGoalTitle">Withdrawal Threshold ($5.00 USD / 50 Points)</span>
          <span class="text-indigo-400 mono" id="payoutGoalPercent">0%</span>
        </div>
        <div class="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden">
          <div id="payoutProgressBar" class="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-700" style="width: 0%"></div>
        </div>
      </div>
      <button onclick="handleResetConfirm()" class="px-5 py-3 rounded-2xl text-xs font-bold text-rose-300 hover:text-rose-100 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer" id="resetBtnLabel">
        Reset Progress
      </button>
    </section>
  </main>

  <script>
    const STORE_OFFER_URL = "${STORE_OFFER_URL}";
    let points = parseInt(localStorage.getItem('ce_points') || '0', 10);
    let clicks = parseInt(localStorage.getItem('ce_clicks') || '0', 10);
    let currentLang = localStorage.getItem('ce_lang') || 'en';

    function updateStats() {
      document.getElementById('statPoints').textContent = points;
      document.getElementById('statEarnings').textContent = (points / 10).toFixed(2);
      document.getElementById('statClicks').textContent = clicks;
      const pct = Math.min(100, Math.round(((points / 10) / 5.0) * 100));
      document.getElementById('payoutProgressBar').style.width = pct + '%';
      document.getElementById('payoutGoalPercent').textContent = pct + '%';
      localStorage.setItem('ce_points', points.toString());
      localStorage.setItem('ce_clicks', clicks.toString());
    }

    function handleClickAndEarn() {
      window.open(STORE_OFFER_URL, '_blank', 'noopener,noreferrer');
      points += 1;
      clicks += 1;
      updateStats();
      showToast();
    }

    function showToast() {
      const toast = document.getElementById('toastNotification');
      toast.classList.remove('hidden', 'animate-float');
      void toast.offsetWidth;
      toast.classList.add('animate-float');
      setTimeout(() => { toast.classList.add('hidden'); }, 2300);
    }

    function handleResetConfirm() {
      if (confirm('Reset all points and clicks to zero?')) {
        points = 0;
        clicks = 0;
        updateStats();
      }
    }

    // Auto country detection
    async function detectCountry() {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          document.getElementById('countryName').textContent = data.country_name || data.country_code;
          const map = { BD: 'bn', IN: 'hi', PK: 'hi', FR: 'fr', BE: 'fr', ES: 'es', MX: 'es', AR: 'es', SA: 'ar', AE: 'ar', EG: 'ar', BR: 'pt', PT: 'pt', DE: 'de', AT: 'de' };
          if (data.country_code && map[data.country_code]) {
            changeLanguage(map[data.country_code]);
          }
        }
      } catch (e) {
        document.getElementById('countryName').textContent = 'Global (EN)';
      }
    }

    const dict = ${JSON.stringify(TRANSLATIONS)};
    function changeLanguage(lang) {
      if (!dict[lang]) lang = 'en';
      currentLang = lang;
      localStorage.setItem('ce_lang', lang);
      document.getElementById('languageSelect').value = lang;
      if (lang === 'ar') document.documentElement.setAttribute('dir', 'rtl');
      else document.documentElement.setAttribute('dir', 'ltr');
      const t = dict[lang];
      document.getElementById('headerBrand').textContent = t.brandName;
      document.getElementById('heroBadge').textContent = t.badgeInstant;
      document.getElementById('heroTitle1').textContent = t.heroTitle1;
      document.getElementById('heroHighlight').textContent = t.heroHighlight;
      document.getElementById('heroSubtitle').textContent = t.heroSubtitle;
      document.getElementById('mainBtnText').textContent = t.buttonText;
      document.getElementById('mainBtnSubtext').textContent = t.buttonSubtext;
      document.getElementById('labelPoints').textContent = t.currentPointsLabel;
      document.getElementById('statRate').textContent = t.rateSubtext;
      document.getElementById('labelEarnings').textContent = t.earningsLabel;
      document.getElementById('earningsSub').textContent = t.earningsSubtext;
      document.getElementById('labelClicks').textContent = t.clicksLabel;
      document.getElementById('clicksSub').textContent = t.clicksSubtext;
      document.getElementById('resetBtnLabel').textContent = t.resetButton;
    }

    updateStats();
    detectCountry();
  </script>
</body>
</html>`;
  };

  const handleCopyCode = () => {
    const code = getSingleHtmlFileCode();
    navigator.clipboard.writeText(code);
    setHasCopiedCode(true);
    setTimeout(() => setHasCopiedCode(false), 2000);
  };

  const handleDownloadCode = () => {
    const code = getSingleHtmlFileCode();
    const blob = new Blob([code], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'click-and-earn.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white relative">
      
      {/* Floating Success Toast */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 animate-float-up pointer-events-none">
          <div className="flex items-center gap-3.5 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 text-slate-950 font-black shadow-2xl shadow-emerald-500/40 border border-emerald-300">
            <div className="w-8 h-8 rounded-full bg-slate-950/20 flex items-center justify-center text-slate-950">
              <CheckCircle2 className="w-5 h-5 fill-slate-950 text-emerald-200" />
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight">{t.successMessage}</div>
              <div className="text-xs font-semibold text-emerald-950/80">{t.successSubtext}</div>
            </div>
          </div>
        </div>
      )}

      {/* Header Navigation */}
      <header className="border-b border-indigo-950/80 bg-slate-900/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-3">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white font-black text-xl">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="font-extrabold text-lg sm:text-xl tracking-tight leading-none bg-gradient-to-r from-white via-indigo-100 to-purple-200 bg-clip-text text-transparent">
                {t.brandName}
              </div>
              <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-indigo-300/70 mt-0.5">
                {t.tagline}
              </div>
            </div>
          </div>

          {/* Controls: Country Badge, Language Switcher, Sound & Single HTML Export */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Detected Country Pill */}
            <div 
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-800/50 text-xs text-indigo-200"
              title={`${t.detectedCountryLabel}: ${countryName} (${countryCode})`}
            >
              <span className="text-base">{countryFlag}</span>
              <span className="font-semibold hidden sm:inline">
                {isDetectingLocation ? t.detectingCountry : countryName}
              </span>
            </div>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <select
                value={currentLang}
                onChange={(e) => setCurrentLang(e.target.value as SupportedLang)}
                aria-label={t.languageSelectLabel}
                className="appearance-none bg-slate-900 border border-indigo-800/60 text-indigo-100 text-xs font-semibold rounded-xl px-3 py-1.5 pr-7 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer hover:bg-slate-800 transition-colors"
              >
                <option value="en">English (US/UK/AU)</option>
                <option value="bn">বাংলা (Bengali - BD)</option>
                <option value="hi">हिन्दी (Hindi - IN/PK)</option>
                <option value="fr">Français (FR/BE)</option>
                <option value="es">Español (ES/MX/AR)</option>
                <option value="ar">العربية (Arabic - SA/AE/EG)</option>
                <option value="pt">Português (BR/PT)</option>
                <option value="de">Deutsch (DE/AT)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-400">
                <Globe className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(prev => !prev)}
              className="p-2 rounded-xl bg-slate-900 border border-indigo-800/60 text-indigo-300 hover:text-white transition-colors cursor-pointer"
              title={soundEnabled ? 'Mute sound' : 'Enable sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
            </button>

            {/* Single HTML Code Export Modal Trigger */}
            <button
              onClick={() => setShowExportModal(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-900/70 to-purple-900/70 hover:from-indigo-800 hover:to-purple-800 border border-indigo-700/60 text-xs font-bold text-indigo-100 transition-all cursor-pointer shadow-sm"
              title="View & copy single standalone HTML code"
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-300" />
              <span>{t.copyHtmlButton}</span>
            </button>

          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 sm:py-12 flex flex-col gap-8 sm:gap-10">
        
        {/* Hero Card with Purple/Indigo Gradient */}
        <section className="relative overflow-hidden rounded-3xl border border-indigo-900/60 bg-gradient-to-b from-indigo-950/70 via-slate-900/80 to-slate-950 p-6 sm:p-12 text-center shadow-2xl">
          
          {/* Ambient Lighting Blobs */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t.badgeInstant}</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
            {t.heroTitle1} <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              {t.heroHighlight}
            </span>
          </h1>

          <p className="text-slate-300/80 text-sm sm:text-lg max-w-2xl mx-auto mb-8 sm:mb-10 font-normal leading-relaxed">
            {t.heroSubtitle}
          </p>

          {/* CORE FEATURE 1: BIG ATTRACTIVE CENTER BUTTON */}
          <div className="flex flex-col items-center justify-center gap-4">
            <button
              onClick={handleClickAndEarn}
              className="animate-pulse-glow group relative inline-flex items-center justify-center gap-3.5 px-8 sm:px-14 py-5 sm:py-6 rounded-2xl font-black text-lg sm:text-2xl text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.98] shadow-2xl cursor-pointer"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <span className="tracking-tight">{t.buttonText}</span>
              <ExternalLink className="w-5 h-5 text-white/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>

            {/* Subtext info */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-indigo-300/80 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{t.buttonSubtext}</span>
            </div>
          </div>

        </section>

        {/* CORE FEATURE 2: STATS CARDS (Current Points, Estimated Earnings in $, Total Clicks) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Card 1: Current Points */}
          <div className={`relative overflow-hidden p-6 sm:p-7 rounded-3xl border transition-all ${
            pointsGlow ? 'border-indigo-400 ring-2 ring-indigo-500/50 shadow-indigo-500/20 shadow-2xl' : 'border-indigo-900/60'
          } bg-slate-900/60 backdrop-blur-md shadow-lg flex flex-col justify-between`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300/80">
                {t.currentPointsLabel}
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-sm font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-indigo-400">
                {points}
              </span>
              <span className="text-sm font-bold text-slate-400">
                {t.pointsUnit}
              </span>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex justify-between items-center">
              <span>{t.rateSubtext}</span>
            </div>
          </div>

          {/* Card 2: Estimated Earnings ($) */}
          <div className="relative overflow-hidden p-6 sm:p-7 rounded-3xl border border-indigo-900/60 bg-slate-900/60 backdrop-blur-md shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300/80">
                {t.earningsLabel}
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-sm font-bold">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-bold text-purple-400">$</span>
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                {dollarEarnings}
              </span>
              <span className="text-xs font-semibold text-slate-400 ml-1">
                {t.earningsUnit}
              </span>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-purple-300/80 flex justify-between items-center">
              <span>{t.earningsSubtext}</span>
            </div>
          </div>

          {/* Card 3: Total Clicks */}
          <div className="relative overflow-hidden p-6 sm:p-7 rounded-3xl border border-indigo-900/60 bg-slate-900/60 backdrop-blur-md shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-300/80">
                {t.clicksLabel}
              </span>
              <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center text-sm font-bold">
                <MousePointerClick className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-pink-400">
                {clicks}
              </span>
              <span className="text-sm font-bold text-slate-400">
                {t.clicksUnit}
              </span>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex justify-between items-center">
              <span>{t.clicksSubtext}</span>
            </div>
          </div>

        </section>

        {/* Milestone Threshold & Reset Progress Bar */}
        <section className="p-6 sm:p-7 rounded-3xl border border-indigo-900/50 bg-slate-900/40 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="w-full md:w-2/3">
            <div className="flex justify-between items-center text-xs font-bold mb-2">
              <span className="text-slate-300">{t.payoutGoalTitle}</span>
              <span className="text-indigo-400 font-mono">{payoutPercent}%</span>
            </div>
            <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700 relative overflow-hidden"
                style={{ width: `${payoutPercent}%` }}
              >
                <div className="absolute inset-0 shimmer-bar" />
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              {t.payoutGoalDesc}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={() => setShowResetModal(true)}
              className="px-5 py-3 rounded-2xl text-xs font-bold text-rose-300 hover:text-rose-100 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.resetButton}</span>
            </button>
          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-indigo-950/80 bg-slate-950/90 py-6 text-slate-500 text-xs">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            © {new Date().getFullYear()} {t.brandName} · Verified Global Partner Network
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowExportModal(true)}
              className="text-indigo-400 hover:underline cursor-pointer"
            >
              {t.copyHtmlButton}
            </button>
            <span>•</span>
            <span className="text-emerald-400">● 100% Anti-Fraud Verified</span>
          </div>
        </div>
      </footer>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-indigo-900/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-left">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">{t.resetModalTitle}</h3>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              {t.resetModalDesc}
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                {t.resetCancelBtn}
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                {t.resetConfirmBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standalone Single HTML Code Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-slate-900 border border-indigo-900/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-black text-white">Single Standalone HTML File</h3>
                <p className="text-xs text-slate-400">Complete, standalone HTML file that runs anywhere in any browser directly.</p>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={handleCopyCode}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-md shadow-indigo-600/30"
              >
                {hasCopiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{hasCopiedCode ? 'Copied to Clipboard!' : 'Copy Complete HTML'}</span>
              </button>
              <button
                onClick={handleDownloadCode}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download .html File</span>
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-slate-950 p-4 rounded-2xl border border-indigo-950 font-mono text-[11px] text-indigo-200 select-all">
              <pre className="whitespace-pre">{getSingleHtmlFileCode()}</pre>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
