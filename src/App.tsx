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
  Award,
  Lock,
  User,
  LogOut,
  Mail,
  KeyRound,
  ShieldCheck,
  X,
  Wallet,
  CreditCard,
  Building2,
  Coins,
  ArrowUpRight
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
const MIN_WITHDRAW_USD = 100.0;

interface AuthUser {
  name: string;
  email: string;
}

interface RegisteredAccount {
  name: string;
  email: string;
  password: string;
}

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('ce_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [registeredAccounts, setRegisteredAccounts] = useState<RegisteredAccount[]>(() => {
    const saved = localStorage.getItem('ce_registered_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Modal tab: 'login' | 'signup'
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => {
    // If not logged in on initial load, show auth modal
    const saved = localStorage.getItem('ce_auth_user');
    return !saved;
  });

  // Auth form inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Points and Clicks State
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

  // Visual cues
  const [showToast, setShowToast] = useState<boolean>(false);
  const [pointsGlow, setPointsGlow] = useState<boolean>(false);

  // Modals
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [hasCopiedCode, setHasCopiedCode] = useState<boolean>(false);

  // Withdraw / Payout Modal State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState<boolean>(false);
  const [selectedPayoutMethod, setSelectedPayoutMethod] = useState<'paypal' | 'crypto' | 'bank'>('paypal');
  const [destinationDetails, setDestinationDetails] = useState<string>('');
  const [withdrawSubmitStatus, setWithdrawSubmitStatus] = useState<string | null>(null);

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
    if (currentUser) {
      localStorage.setItem('ce_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('ce_auth_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('ce_registered_users', JSON.stringify(registeredAccounts));
  }, [registeredAccounts]);

  useEffect(() => {
    localStorage.setItem('ce_lang', currentLang);
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

          if (!savedLang && COUNTRY_LANG_MAP[code]) {
            setCurrentLang(COUNTRY_LANG_MAP[code]);
          }
          setIsDetectingLocation(false);
          return;
        }
      } catch {
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
          // Graceful fallback
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

  // Active translation dictionary
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  // 10 Points = $1.00 USD ($0.10 / pt)
  const dollarEarningsNumber = points / 10;
  const dollarEarnings = dollarEarningsNumber.toFixed(2);
  const isEligibleForPayout = dollarEarningsNumber >= MIN_WITHDRAW_USD;
  const neededMoreAmount = Math.max(0, MIN_WITHDRAW_USD - dollarEarningsNumber).toFixed(2);
  const payoutPercent = Math.min(100, Math.round((dollarEarningsNumber / MIN_WITHDRAW_USD) * 100));

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const emailClean = loginEmail.trim().toLowerCase();
    const pass = loginPassword;

    if (!emailClean || !pass) {
      setAuthError(t.authErrorFillFields);
      return;
    }

    const match = registeredAccounts.find(
      u => u.email.toLowerCase() === emailClean && u.password === pass
    );

    let loggedUser: AuthUser;
    if (match) {
      loggedUser = { name: match.name, email: match.email };
    } else if (registeredAccounts.length === 0) {
      const parsedName = emailClean.split('@')[0];
      const capitalized = parsedName.charAt(0).toUpperCase() + parsedName.slice(1);
      loggedUser = { name: capitalized, email: emailClean };
      setRegisteredAccounts(prev => [...prev, { name: capitalized, email: emailClean, password: pass }]);
    } else {
      setAuthError(t.authErrorInvalidCredentials);
      return;
    }

    setCurrentUser(loggedUser);
    setIsAuthModalOpen(false);
    setLoginPassword('');
    playChime();
  };

  // Handle Sign Up submission
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const name = signupName.trim();
    const emailClean = signupEmail.trim().toLowerCase();
    const pass = signupPassword;
    const confirmPass = signupConfirmPassword;

    if (!name || !emailClean || !pass) {
      setAuthError(t.authErrorFillFields);
      return;
    }

    if (pass !== confirmPass) {
      setAuthError(t.authErrorPassMismatch);
      return;
    }

    const existing = registeredAccounts.find(u => u.email.toLowerCase() === emailClean);
    if (existing) {
      setAuthError("An account with this email already exists. Please log in.");
      return;
    }

    const newAcc: RegisteredAccount = { name, email: emailClean, password: pass };
    setRegisteredAccounts(prev => [...prev, newAcc]);
    setCurrentUser({ name, email: emailClean });
    setIsAuthModalOpen(false);
    setSignupPassword('');
    setSignupConfirmPassword('');
    playChime();
  };

  // Handle Logout
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out of your session?")) {
      setCurrentUser(null);
      setIsAuthModalOpen(true);
      setAuthTab('login');
      setIsWithdrawModalOpen(false);
    }
  };

  // Main Click & Earn Handler (Blocked if not logged in)
  const handleClickAndEarn = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      setAuthTab('login');
      setAuthError("Please log in or sign up first to earn points!");
      return;
    }

    // 1. Open exact store link in a new tab
    try {
      window.open(STORE_OFFER_URL, '_blank', 'noopener,noreferrer');
    } catch {
      // popup blocker fallback
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

  // Open Withdraw Modal
  const handleOpenWithdrawModal = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      setAuthTab('login');
      setAuthError("Please sign in or create an account to request a payout.");
      return;
    }
    setWithdrawSubmitStatus(null);
    setIsWithdrawModalOpen(true);
  };

  // Handle Payout Submission
  const handlePayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEligibleForPayout) {
      return;
    }
    if (!destinationDetails.trim()) {
      alert("Please provide your destination account details.");
      return;
    }

    const alertMsg = t.withdrawSuccessAlert.replace('${amount}', '$' + dollarEarnings);
    setWithdrawSubmitStatus(alertMsg);
    playChime();
    setTimeout(() => {
      setIsWithdrawModalOpen(false);
      setWithdrawSubmitStatus(null);
      alert(alertMsg);
    }, 1500);
  };

  // Reset Progress confirmation
  const handleConfirmReset = () => {
    setPoints(0);
    setClicks(0);
    localStorage.removeItem('ce_points');
    localStorage.removeItem('ce_clicks');
    setShowResetModal(false);
  };

  const handleCopyCode = () => {
    fetch('/click-and-earn.html')
      .then(res => res.text())
      .then(code => {
        navigator.clipboard.writeText(code);
        setHasCopiedCode(true);
        setTimeout(() => setHasCopiedCode(false), 2000);
      })
      .catch(() => {
        setHasCopiedCode(true);
        setTimeout(() => setHasCopiedCode(false), 2000);
      });
  };

  const handleDownloadCode = () => {
    fetch('/click-and-earn.html')
      .then(res => res.text())
      .then(code => {
        const blob = new Blob([code], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'click-and-earn.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
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

          {/* Controls: Country Badge, Language Switcher, Withdraw Button & Auth Section */}
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

            {/* WITHDRAW BUTTON (Requirement 1: Matches current UI theme) */}
            <button
              onClick={handleOpenWithdrawModal}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 transition-all cursor-pointer flex items-center gap-1.5 transform hover:scale-[1.02] active:scale-[0.98]"
              title="Request Payout / Withdrawal"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{t.withdrawButton}</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(prev => !prev)}
              className="p-2 rounded-xl bg-slate-900 border border-indigo-800/60 text-indigo-300 hover:text-white transition-colors cursor-pointer"
              title={soundEnabled ? 'Mute sound' : 'Enable sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
            </button>

            {/* Logged in User Pill + Logout Button */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-indigo-900/60">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-bold text-white max-w-[120px] truncate">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    Verified Member
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700/60 hover:border-rose-700/60 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  title="Logout of current session"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>{t.logoutButton}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsAuthModalOpen(true);
                  setAuthTab('login');
                }}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{t.loginTab} / {t.signupTab}</span>
              </button>
            )}

            {/* Single HTML Code Export Modal Trigger */}
            <button
              onClick={() => setShowExportModal(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-900/70 to-purple-900/70 hover:from-indigo-800 hover:to-purple-800 border border-indigo-700/60 text-xs font-bold text-indigo-100 transition-all cursor-pointer shadow-sm"
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
        
        {/* Auth Locked Banner (When user is not signed in) */}
        {!currentUser && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-amber-200">
                  {t.guestLockedBadge}
                </div>
                <div className="text-[11px] text-amber-300/80">
                  Sign in or create an account to record your points and request payouts.
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setIsAuthModalOpen(true);
                setAuthTab('signup');
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer whitespace-nowrap"
            >
              {t.signupButton}
            </button>
          </div>
        )}

        {/* Hero Card with Purple/Indigo Gradient */}
        <section className={`relative overflow-hidden rounded-3xl border border-indigo-900/60 bg-gradient-to-b from-indigo-950/70 via-slate-900/80 to-slate-950 p-6 sm:p-12 text-center shadow-2xl transition-all ${
          !currentUser ? 'opacity-95' : ''
        }`}>
          
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

          {/* BIG ATTRACTIVE CENTER BUTTON (Prompts auth modal if not signed in) */}
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

        {/* STATS CARDS (Current Points, Estimated Earnings in $, Total Clicks) */}
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

          {/* Card 2: Estimated Earnings ($) with Direct Withdraw Trigger */}
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
              <button
                onClick={handleOpenWithdrawModal}
                className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-0.5 cursor-pointer underline text-[11px]"
              >
                <span>{t.withdrawButton}</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
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

        {/* Milestone Threshold & Withdraw / Reset Bar */}
        <section className="p-6 sm:p-7 rounded-3xl border border-indigo-900/50 bg-slate-900/40 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="w-full md:w-7/12">
            <div className="flex justify-between items-center text-xs font-bold mb-2">
              <span className="text-slate-300">{t.payoutGoalTitle}</span>
              <span className="text-emerald-400 font-mono font-bold">{payoutPercent}%</span>
            </div>
            <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-700 relative overflow-hidden"
                style={{ width: `${payoutPercent}%` }}
              >
                <div className="absolute inset-0 shimmer-bar" />
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              {t.payoutGoalDesc}
            </div>
          </div>

          {/* Action Buttons: Withdraw & Reset */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={handleOpenWithdrawModal}
              className="px-5 py-3 rounded-2xl text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 transition-all shadow-lg shadow-emerald-500/25 cursor-pointer flex items-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Wallet className="w-4 h-4 text-slate-950" />
              <span>{t.withdrawButton}</span>
            </button>

            <button
              onClick={() => setShowResetModal(true)}
              className="px-4 py-3 rounded-2xl text-xs font-bold text-rose-300 hover:text-rose-100 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer flex items-center gap-1.5"
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

      {/* ========================================================= */}
      {/* WITHDRAW / PAYOUT MODAL (REQUIREMENT 2 & 3) */}
      {/* ========================================================= */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900/95 backdrop-blur-2xl border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            
            {/* Close Button */}
            <button
              onClick={() => setIsWithdrawModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg text-lg cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center text-slate-950 text-xl font-bold shadow-lg shadow-emerald-500/30">
                <Wallet className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {t.withdrawModalTitle}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {t.withdrawModalSubtitle}
                </p>
              </div>
            </div>

            {/* Current Balance Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-indigo-900/60 mb-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  {t.currentBalanceLabel}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-400">
                    ${dollarEarnings}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    USD ({points} {t.pointsUnit})
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 block font-semibold">Min Threshold</span>
                <span className="text-sm font-extrabold text-indigo-300 font-mono">$100.00 USD</span>
              </div>
            </div>

            {/* REQUIREMENT 3: Minimum Withdrawal Threshold Notice/Warning */}
            {!isEligibleForPayout ? (
              <div className="mb-5 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <span className="font-extrabold block text-rose-300 mb-0.5">
                      {t.payoutMinNotice}
                    </span>
                    <span>
                      {t.payoutNeedMorePrefix}
                      <strong className="font-mono font-bold text-white text-sm underline">{neededMoreAmount}</strong>
                      {t.payoutNeedMoreSuffix}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-5 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-xs font-semibold">
                  {t.payoutEligibleNotice}
                </span>
              </div>
            )}

            {/* Form for Payout Method & Details */}
            <form onSubmit={handlePayoutSubmit} className="space-y-4">
              
              {/* Payout Options */}
              <div>
                <label className="block text-xs font-bold text-indigo-200 mb-2">
                  {t.selectPayoutMethod}
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  
                  {/* PayPal */}
                  <button
                    type="button"
                    onClick={() => setSelectedPayoutMethod('paypal')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      selectedPayoutMethod === 'paypal'
                        ? 'border-emerald-500 bg-emerald-500/10 text-white ring-1 ring-emerald-500/40'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <span className="text-[11px] font-bold">PayPal</span>
                  </button>

                  {/* Crypto */}
                  <button
                    type="button"
                    onClick={() => setSelectedPayoutMethod('crypto')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      selectedPayoutMethod === 'crypto'
                        ? 'border-indigo-500 bg-indigo-500/10 text-white ring-1 ring-indigo-500/40'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <Coins className="w-4 h-4 text-indigo-400" />
                    <span className="text-[11px] font-bold">USDT / BTC</span>
                  </button>

                  {/* Bank Transfer */}
                  <button
                    type="button"
                    onClick={() => setSelectedPayoutMethod('bank')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      selectedPayoutMethod === 'bank'
                        ? 'border-purple-500 bg-purple-500/10 text-white ring-1 ring-purple-500/40'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-purple-400" />
                    <span className="text-[11px] font-bold">Bank Wire</span>
                  </button>

                </div>
              </div>

              {/* Destination Details */}
              <div>
                <label className="block text-xs font-bold text-indigo-200 mb-1.5">
                  {t.accountDetailsLabel}
                </label>
                <input
                  type="text"
                  required={isEligibleForPayout}
                  value={destinationDetails}
                  onChange={(e) => setDestinationDetails(e.target.value)}
                  placeholder={
                    selectedPayoutMethod === 'paypal'
                      ? 'PayPal account email (e.g. name@paypal.com)'
                      : selectedPayoutMethod === 'crypto'
                      ? 'USDT (TRC20) or BTC wallet address'
                      : 'Bank Account Number / IBAN & Routing SWIFT'
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-indigo-900/60 focus:border-emerald-500 text-white text-xs placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              {/* Submit Payout Button: Disabled if balance < $100 USD */}
              <button
                type="submit"
                disabled={!isEligibleForPayout}
                className={`w-full py-4 rounded-2xl font-extrabold text-sm transition-all shadow-xl flex items-center justify-center gap-2 ${
                  isEligibleForPayout
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-emerald-500/30 cursor-pointer transform hover:scale-[1.01]'
                    : 'bg-slate-800/80 text-slate-500 border border-slate-700/40 cursor-not-allowed opacity-60'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>{t.confirmWithdrawBtn}</span>
              </button>

              {!isEligibleForPayout && (
                <p className="text-[11px] text-center text-slate-400">
                  🔒 Button unlocked automatically once you reach $100.00 USD (1,000 points).
                </p>
              )}

            </form>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* AUTHENTICATION MODAL (LOGIN & SIGN UP GLASSMORPHISM) */}
      {/* ========================================================= */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            
            {/* Close button (allowed if already logged in) */}
            {currentUser && (
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg text-lg cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 mx-auto flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-500/30 mb-3">
                <Zap className="w-6 h-6 fill-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {t.authModalTitle}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                {t.authModalSubtitle}
              </p>
            </div>

            {/* Tab Buttons (Login vs Sign Up) */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-950/80 border border-indigo-900/60 mb-6">
              <button
                onClick={() => {
                  setAuthTab('login');
                  setAuthError(null);
                }}
                className={`py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  authTab === 'login'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.loginTab}
              </button>
              <button
                onClick={() => {
                  setAuthTab('signup');
                  setAuthError(null);
                }}
                className={`py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  authTab === 'signup'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.signupTab}
              </button>
            </div>

            {/* Error Alert Box */}
            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{authError}</span>
              </div>
            )}

            {/* LOGIN FORM */}
            {authTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-indigo-200 mb-1.5">
                    {t.emailLabel}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder={t.emailPlaceholder}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-indigo-900/60 focus:border-indigo-500 text-white text-xs placeholder:text-slate-500 focus:outline-none"
                    />
                    <Mail className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-indigo-200 mb-1.5">
                    {t.passwordLabel}
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder={t.passwordPlaceholder}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-indigo-900/60 focus:border-indigo-500 text-white text-xs placeholder:text-slate-500 focus:outline-none"
                    />
                    <KeyRound className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl font-extrabold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 transition-all shadow-xl shadow-indigo-600/30 cursor-pointer"
                >
                  {t.loginButton}
                </button>

                <div className="text-center pt-2">
                  <span className="text-xs text-slate-400">{t.noAccountYet}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('signup');
                      setAuthError(null);
                    }}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 ml-1 underline cursor-pointer"
                  >
                    {t.signupTab}
                  </button>
                </div>
              </form>
            )}

            {/* SIGN UP FORM */}
            {authTab === 'signup' && (
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-indigo-200 mb-1.5">
                    {t.fullNameLabel}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder={t.fullNamePlaceholder}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-indigo-900/60 focus:border-indigo-500 text-white text-xs placeholder:text-slate-500 focus:outline-none"
                    />
                    <User className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-indigo-200 mb-1.5">
                    {t.emailLabel}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder={t.emailPlaceholder}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-indigo-900/60 focus:border-indigo-500 text-white text-xs placeholder:text-slate-500 focus:outline-none"
                    />
                    <Mail className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-indigo-200 mb-1.5">
                    {t.passwordLabel}
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      minLength={4}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder={t.passwordPlaceholder}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-indigo-900/60 focus:border-indigo-500 text-white text-xs placeholder:text-slate-500 focus:outline-none"
                    />
                    <KeyRound className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-indigo-200 mb-1.5">
                    {t.confirmPasswordLabel}
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      minLength={4}
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder={t.confirmPasswordPlaceholder}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-indigo-900/60 focus:border-indigo-500 text-white text-xs placeholder:text-slate-500 focus:outline-none"
                    />
                    <ShieldCheck className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl font-extrabold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 transition-all shadow-xl shadow-indigo-600/30 cursor-pointer"
                >
                  {t.signupButton}
                </button>

                <div className="text-center pt-2">
                  <span className="text-xs text-slate-400">{t.alreadyHaveAccount}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('login');
                      setAuthError(null);
                    }}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 ml-1 underline cursor-pointer"
                  >
                    {t.loginTab}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

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
                <h3 className="text-lg font-black text-white">Single Standalone HTML File (with Withdraw & Auth)</h3>
                <p className="text-xs text-slate-400">Complete, standalone HTML file with withdraw modal and $100 threshold logic included.</p>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer"
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
                <span>Download /click-and-earn.html</span>
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-slate-950 p-4 rounded-2xl border border-indigo-950 font-mono text-[11px] text-indigo-200 select-all">
              <pre className="whitespace-pre">Please click "Copy Complete HTML" or "Download /click-and-earn.html" to get the complete single file.</pre>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
