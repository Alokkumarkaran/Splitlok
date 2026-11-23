import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Sparkles, Lock, Zap, ArrowRightLeft, CheckCircle2 } from 'lucide-react';

// Engaging, witty fintech & brand micro-copy
const defaultBrandPhrases = [
  { title: "Syncing your flat ledger...", subtitle: "Continuous ledger math in progress" },
  { title: "Penny-perfect splits...", subtitle: "Zero rounding errors, guaranteed" },
  { title: "Eliminating 'kal pakka dunga'...", subtitle: "Keeping flat friendships sweet & clean" },
  { title: "Verifying peer balances...", subtitle: "Real-time ledger audit active" },
  { title: "Split bills. Not friendships.", subtitle: "Your shared home finance engine" },
  { title: "Connecting real-time streams...", subtitle: "Instant notifications ready" }
];

// Curated Fintech Color Palettes
const brandThemes = {
  indigo: {
    primaryGradient: "from-indigo-600 via-purple-600 to-indigo-800",
    glowColor: "rgba(99, 102, 241, 0.25)",
    badgeBorder: "border-indigo-500/30",
    badgeBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    beamGradient: "from-transparent via-indigo-500 to-cyan-400",
    wordmarkGradient: "from-indigo-500 via-purple-500 to-cyan-400",
    accentIcon: "text-indigo-500"
  },
  emerald: {
    primaryGradient: "from-emerald-500 via-teal-600 to-emerald-800",
    glowColor: "rgba(16, 185, 129, 0.25)",
    badgeBorder: "border-emerald-500/30",
    badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    beamGradient: "from-transparent via-emerald-500 to-teal-300",
    wordmarkGradient: "from-emerald-500 via-teal-400 to-cyan-400",
    accentIcon: "text-emerald-500"
  },
  cyan: {
    primaryGradient: "from-cyan-500 via-blue-600 to-indigo-700",
    glowColor: "rgba(6, 182, 212, 0.25)",
    badgeBorder: "border-cyan-500/30",
    badgeBg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    beamGradient: "from-transparent via-cyan-400 to-indigo-500",
    wordmarkGradient: "from-cyan-400 via-blue-400 to-indigo-400",
    accentIcon: "text-cyan-400"
  },
  rose: {
    primaryGradient: "from-rose-500 via-pink-600 to-orange-600",
    glowColor: "rgba(244, 63, 94, 0.25)",
    badgeBorder: "border-rose-500/30",
    badgeBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    beamGradient: "from-transparent via-rose-500 to-amber-400",
    wordmarkGradient: "from-rose-500 via-orange-400 to-amber-400",
    accentIcon: "text-rose-500"
  }
};

const PremiumLoader = ({
  fullScreen = false,
  text = null,
  caption = null,
  colorTheme = "indigo",
  size = "md" // "sm" | "md" | "lg"
}) => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const theme = brandThemes[colorTheme] || brandThemes.indigo;

  // Cycle through engaging phrases only if custom text is not supplied
  useEffect(() => {
    if (text) return;
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % defaultBrandPhrases.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [text]);

  const activeTitle = text || defaultBrandPhrases[phraseIndex].title;
  const activeSubtitle = caption || (!text ? defaultBrandPhrases[phraseIndex].subtitle : "Please wait a moment");

  const isSmall = size === "sm" && !fullScreen;

  const LoaderCore = () => (
    <div className={`flex flex-col items-center justify-center relative z-10 w-full ${isSmall ? 'p-4 max-w-xs' : 'p-6 sm:p-10 max-w-md'} mx-auto select-none`}>
      
      {/* 1. Atmospheric Ambient Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px] pointer-events-none mix-blend-screen transition-all duration-700"
        style={{
          width: isSmall ? '160px' : '280px',
          height: isSmall ? '160px' : '280px',
          backgroundColor: theme.glowColor
        }}
      />

      {/* 2. Central Floating Brand Pod */}
      <div className={`relative flex items-center justify-center ${isSmall ? 'w-24 h-24 mb-6' : 'w-36 h-36 mb-8 mt-2'}`}>
        
        {/* Orbital Halo: Rotating Gradient Dash Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `conic-gradient(from 0deg, transparent 0%, rgba(99, 102, 241, 0.4) 50%, rgba(6, 182, 212, 0.8) 80%, transparent 100%)`,
            padding: '2px',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), black calc(100% - 2px))',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), black calc(100% - 2px))'
          }}
        />

        {/* Breathing Ripple Waves */}
        {[0, 1].map((idx) => (
          <motion.div
            key={`pulse-ring-${idx}`}
            className="absolute inset-0 rounded-full border border-indigo-400/20 dark:border-cyan-400/20 pointer-events-none"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: [0.85, 1.4, 1.8], opacity: [0, 0.4, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: idx * 1.5,
              ease: "easeOut"
            }}
          />
        ))}

        {/* Brand Container with Specular Light Sweep */}
        <motion.div
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          className={`relative z-10 ${
            isSmall ? 'w-16 h-16 rounded-2xl' : 'w-24 h-24 sm:w-26 sm:h-26 rounded-[1.75rem]'
          } bg-white dark:bg-[#111827] shadow-[0_15px_35px_-5px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6)] border border-slate-200/80 dark:border-white/10 flex items-center justify-center p-3.5 backdrop-blur-xl overflow-hidden group`}
        >
          {/* Animated Specular Light Sheen */}
          <motion.div 
            animate={{ x: ["-130%", "230%"] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
            className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent -skew-x-20 pointer-events-none"
          />

          {/* Official Splitlok Logo Image */}
          <img 
            src="/Splitlok-512x512.png" 
            alt="Splitlok Logo" 
            className="w-full h-full object-contain relative z-10 drop-shadow-sm select-none"
          />

          {/* Sparkle Accent */}
          <motion.div
            animate={{ scale: [0.8, 1.25, 0.8], opacity: [0.6, 1, 0.6], rotate: [0, 20, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-1 -right-1 z-20 text-amber-400 drop-shadow-sm"
          >
            <Sparkles size={isSmall ? 13 : 16} className="fill-amber-400 text-amber-400" />
          </motion.div>
        </motion.div>

        {/* Security & Ledger Verified Micro-Badge */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
          className={`absolute -bottom-1 -right-1 z-20 bg-emerald-500 text-white rounded-full p-1.5 shadow-lg shadow-emerald-500/40 border-2 border-white dark:border-[#0B1120] flex items-center justify-center`}
        >
          <ShieldCheck size={isSmall ? 11 : 14} className="stroke-[3px]" />
        </motion.div>
      </div>

      {/* 3. Typographic Branding & Live Copy */}
      <div className="w-full flex flex-col items-center text-center gap-2 relative z-20">
        
        {/* Splitlok Brand Wordmark */}
        <div className="flex items-center gap-2">
          <div className="flex items-center tracking-tight font-black text-slate-900 dark:text-white">
            <span className={`${isSmall ? 'text-lg' : 'text-xl sm:text-2xl'}`}>SPLIT</span>
            <span className={`${isSmall ? 'text-lg' : 'text-xl sm:text-2xl'} bg-gradient-to-r ${theme.wordmarkGradient} bg-clip-text text-transparent ml-0.5`}>
              LOK
            </span>
          </div>

          <span className={`text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full border ${theme.badgeBorder} ${theme.badgeBg}`}>
            Ledger v2.0
          </span>
        </div>

        {/* Dynamic Rotating Headline */}
        <div className={`${isSmall ? 'h-6' : 'h-7'} overflow-hidden relative w-full flex justify-center items-center mt-1`}>
          <AnimatePresence mode="popLayout">
            <motion.h3
              key={activeTitle}
              initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -14, filter: "blur(4px)" }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className={`absolute font-bold text-slate-800 dark:text-slate-100 ${
                isSmall ? 'text-xs' : 'text-sm sm:text-base'
              } tracking-tight`}
            >
              {activeTitle}
            </motion.h3>
          </AnimatePresence>
        </div>

        {/* Subtitle / Micro-tagline */}
        <div className={`${isSmall ? 'h-4' : 'h-5'} overflow-hidden relative w-full flex justify-center items-center`}>
          <AnimatePresence mode="popLayout">
            <motion.p
              key={activeSubtitle}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="absolute text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium"
            >
              {activeSubtitle}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* 4. Ultra-Sleek Indeterminate Beam Progress Bar */}
        <div className={`mt-3.5 ${isSmall ? 'w-44' : 'w-56 sm:w-64'} h-1.5 bg-slate-200/70 dark:bg-slate-800/80 rounded-full overflow-hidden p-[1px] relative shadow-inner border border-slate-200/60 dark:border-slate-700/60`}>
          <motion.div 
            className={`h-full w-2/5 bg-gradient-to-r ${theme.beamGradient} rounded-full shadow-sm`}
            animate={{ x: ["-100%", "280%"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
          />
        </div>

        {/* 5. Security & Live Sync Badges */}
        {!isSmall && (
          <div className="flex items-center gap-3 mt-4 text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide">
            <span className="flex items-center gap-1">
              <Lock size={10} className="stroke-[2.5px] text-emerald-500" /> 256-bit Encrypted
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Zap size={10} className="stroke-[2.5px] text-amber-500" /> Instant SSE Sync
            </span>
          </div>
        )}

      </div>
    </div>
  );

  // Fullscreen Immersive Mode (for page transitions, initial boot, authentication sync)
  if (fullScreen) {
    return (
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-50/85 dark:bg-[#0B1120]/85 backdrop-blur-2xl"
        >
          <LoaderCore />
        </motion.div>
      </AnimatePresence>
    );
  }

  // Inline Mode (for in-page cards, tab loaders, async widgets)
  return (
    <div className="w-full flex items-center justify-center py-8 sm:py-12">
      <LoaderCore />
    </div>
  );
};

export default PremiumLoader;
