import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, IndianRupee, Sparkles } from 'lucide-react';

const loadingPhrases = [
  "Doing the math...",
  "Calculating split ratios...",
  "Balancing the ledger...",
  "Crunching the receipts...",
  "Waking up the accountant..."
];

// Premium Color Palettes
const themes = {
  indigo: {
    primary: "from-indigo-600 to-violet-600",
    glow: "bg-indigo-500",
    text: "from-indigo-400 via-purple-400 to-pink-400",
    bar: "from-transparent via-indigo-500 to-purple-400"
  },
  emerald: {
    primary: "from-emerald-500 to-teal-600",
    glow: "bg-emerald-500",
    text: "from-emerald-400 via-teal-400 to-cyan-400",
    bar: "from-transparent via-emerald-500 to-teal-400"
  },
  rose: {
    primary: "from-rose-500 to-orange-600",
    glow: "bg-rose-500",
    text: "from-rose-400 via-orange-400 to-amber-400",
    bar: "from-transparent via-rose-500 to-orange-400"
  }
};

const PremiumLoader = ({ fullScreen = false, text = null, colorTheme = "indigo" }) => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [crunchNumber, setCrunchNumber] = useState(0);
  const theme = themes[colorTheme] || themes.indigo;

  // 1. Smooth Phrase Cycler
  useEffect(() => {
    if (text) return;
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % loadingPhrases.length);
    }, 3000); // Slightly slower for a calmer, premium feel
    return () => clearInterval(interval);
  }, [text]);

  // 2. High-Fidelity Number Cruncher
  useEffect(() => {
    const crunchInterval = setInterval(() => {
      setCrunchNumber((prev) => {
        const addAmount = Math.random() * 950 + 45.5;
        if (prev > 99999) return addAmount; // Reset loop
        return prev + addAmount;
      });
    }, 35);
    return () => clearInterval(crunchInterval);
  }, []);

  const displayString = text || loadingPhrases[phraseIndex];

  const LoaderContent = () => (
    <div className="flex flex-col items-center justify-center p-6 sm:p-10 w-full max-w-md mx-auto relative z-10">
      
      {/* Ambient Background Glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 ${theme.glow} rounded-full blur-[100px] opacity-20 dark:opacity-30 pointer-events-none mix-blend-screen`} />

      {/* Floating Hero Section */}
      <div className="relative mb-16 mt-8 flex items-center justify-center w-36 h-36">
        
        {/* Soft Radar Pulses */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`ring-${i}`}
            className="absolute inset-0 rounded-full border-[1.5px] border-slate-300/30 dark:border-slate-600/30"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [0.8, 2, 3], opacity: [0, 0.5, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: i * 1.2, ease: "easeOut" }}
          />
        ))}
        
        {/* Central Wallet Container with Glass Glare */}
        <motion.div
          animate={{ y: [-6, 6, -6] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className={`relative z-10 bg-gradient-to-br ${theme.primary} p-6 rounded-[1.75rem] shadow-2xl shadow-${theme.glow}/40 border border-white/20 backdrop-blur-xl overflow-hidden group`}
        >
          {/* Animated Glare Effect */}
          <motion.div 
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
            className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
          />
          <Wallet size={48} className="text-white drop-shadow-md relative z-10 stroke-[1.5px]" />
          
          {/* Sparkle Accent */}
          <motion.div 
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5], rotate: [0, 15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-1 -right-1 z-20 text-yellow-300"
          >
            <Sparkles size={16} className="fill-yellow-300" />
          </motion.div>
        </motion.div>

        {/* --- PREMIUM GLASS COINS --- */}
        <GlassCoin 
          size={20} yVals={[-55, -65, -55]} xOffset={0} rotate={[-5, 5, -5]} delay={0} 
        />
        <GlassCoin 
          size={16} yVals={[-35, -45, -35]} xOffset={-55} rotate={[10, -10, 10]} delay={0.7} 
        />
        <GlassCoin 
          size={14} yVals={[-25, -35, -25]} xOffset={55} rotate={[-15, 15, -15]} delay={1.4} 
        />
      </div>

      {/* Typography & Data Display */}
      <div className="w-full flex flex-col items-center gap-4 relative z-20">
        
        {/* Data Cruncher */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-slate-400 dark:text-slate-500 font-semibold text-[10px] sm:text-xs uppercase tracking-[0.2em]">
            Syncing Ledger
          </span>
          <div className={`font-mono text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r ${theme.text} tabular-nums tracking-tight drop-shadow-sm`}>
            ₹{crunchNumber.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Dynamic Status Text */}
        <div className="h-6 overflow-hidden relative w-full flex justify-center items-center mt-2">
          <AnimatePresence mode="popLayout">
            <motion.h3
              key={displayString}
              initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="absolute text-sm sm:text-base font-medium tracking-wide text-slate-600 dark:text-slate-300"
            >
              {displayString}
            </motion.h3>
          </AnimatePresence>
        </div>

        {/* Premium Indeterminate Loader Bar */}
        <div className="w-56 sm:w-72 h-1 bg-slate-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden flex mt-4 shadow-inner">
          <motion.div 
            className={`h-full w-1/3 bg-gradient-to-r ${theme.bar} rounded-full`}
            animate={{ x: ["-100%", "300%"] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
      
    </div>
  );

  if (fullScreen) {
    return (
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }} 
          animate={{ opacity: 1, backdropFilter: "blur(16px)" }} 
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50/80 dark:bg-[#0B1120]/80"
        >
          <LoaderContent />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="w-full flex items-center justify-center py-12 sm:py-16">
      <LoaderContent />
    </div>
  );
};

// Extracted Glass Coin Component for cleaner code
const GlassCoin = ({ size, yVals, xOffset, rotate, delay }) => (
  <motion.div
    animate={{ y: yVals, rotate: rotate }}
    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: delay }}
    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
    style={{ marginLeft: `${xOffset}px` }}
  >
    <div className="relative group">
      {/* Inner glass layer */}
      <div className="absolute inset-0 bg-white/40 dark:bg-slate-800/40 rounded-full blur-[2px]" />
      <div className="relative text-emerald-600 dark:text-emerald-400 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-full p-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.4)] border border-white/60 dark:border-slate-500/50">
        <IndianRupee size={size} className="stroke-[2.5px] drop-shadow-sm" />
      </div>
    </div>
  </motion.div>
);

export default PremiumLoader;