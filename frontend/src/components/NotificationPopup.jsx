import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Receipt, ArrowRight, IndianRupee, CheckCircle2, BellRing } from 'lucide-react';
import { NotificationContext } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationPopup = () => {
  const { activePopup, dismissPopup, setIsModalOpen } = useContext(NotificationContext);
  const navigate = useNavigate();

  if (!activePopup) return null;

  const isSettlement = activePopup.type === 'settlement';
  const isReminder = activePopup.type === 'payment_reminder';
  const initial = activePopup.senderName ? activePopup.senderName.charAt(0).toUpperCase() : 'F';

  const headerTitle = activePopup.title || (
    isSettlement ? 'Paisa hi paisa hoga! 🤑' : isReminder ? 'Bhai paise kab dega? 🥺' : 'Bhai, kharcha ho gaya! 💸'
  );

  const handleOpenLedger = () => {
    dismissPopup();
    navigate('/');
  };

  const handleOpenHistory = () => {
    dismissPopup();
    setIsModalOpen(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        drag="y"
        dragConstraints={{ top: -100, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.y < -30 || info.velocity.y < -200) {
            dismissPopup();
          }
        }}
        initial={{ y: -80, opacity: 0, scale: 0.92, filter: 'blur(10px)' }}
        animate={{ y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' }}
        exit={{ y: -80, opacity: 0, scale: 0.92, filter: 'blur(10px)' }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[120] w-[94%] sm:w-full max-w-md pointer-events-auto"
      >
        {/* Glow halo */}
        <div className={`absolute -inset-1 rounded-[2.2rem] blur-xl opacity-60 dark:opacity-40 -z-10 ${
          isSettlement 
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
            : isReminder
              ? 'bg-gradient-to-r from-amber-500 to-orange-500'
              : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
        }`} />

        <div className="relative bg-white/95 dark:bg-[#111827]/95 backdrop-blur-2xl rounded-[2rem] border border-slate-200/80 dark:border-slate-700/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden p-4 sm:p-5">
          
          {/* Top Label & Close Button */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-3.5">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <span className={`flex items-center justify-center w-6 h-6 rounded-lg flex-shrink-0 ${
                isSettlement 
                  ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                  : isReminder
                    ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                    : 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
              }`}>
                {isSettlement ? <CheckCircle2 size={14} className="stroke-[2.5px]" /> : isReminder ? <BellRing size={14} className="stroke-[2.5px]" /> : <Receipt size={14} className="stroke-[2.5px]" />}
              </span>
              <span className="text-xs font-black tracking-tight text-slate-800 dark:text-white truncate">
                {headerTitle}
              </span>
            </div>
            
            <button
              onClick={dismissPopup}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex-shrink-0"
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>

          {/* Main Body */}
          <div className="flex items-start gap-3.5">
            {/* Sender Avatar */}
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md flex-shrink-0 ${
              isSettlement 
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-500' 
                : isReminder
                  ? 'bg-gradient-to-tr from-amber-500 to-orange-500'
                  : 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-violet-500'
            }`}>
              {initial}
            </div>

            {/* Notification Details */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex flex-wrap items-baseline gap-1.5 leading-tight">
                <span className="font-black text-slate-900 dark:text-white text-base">
                  {activePopup.senderName}
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
                  {isSettlement ? 'settled' : isReminder ? 'poked for' : 'spent'}
                </span>
                <span className={`font-black text-base ${
                  isSettlement 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : isReminder
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-indigo-600 dark:text-indigo-400'
                }`}>
                  ₹{Number(activePopup.amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Object / Description Name */}
              {!isReminder && (
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">Item:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md">
                    "{activePopup.description}"
                  </span>
                </div>
              )}

              {/* Fun Hinglish Punchline */}
              {activePopup.funCaption && (
                <p className="text-xs font-bold text-indigo-600 dark:text-cyan-400 mt-1.5 italic">
                  👉 {activePopup.funCaption}
                </p>
              )}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="mt-4 pt-3 flex items-center gap-2">
            <button
              onClick={handleOpenLedger}
              className={`flex-1 py-2.5 px-3 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 ${
                isReminder
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/20'
                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-600/20'
              }`}
            >
              <span>{isReminder ? 'Settle Now 💸' : 'View Dashboard'}</span>
              <ArrowRight size={13} />
            </button>
            <button
              onClick={handleOpenHistory}
              className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all active:scale-95"
            >
              All Alerts
            </button>
          </div>

          {/* Auto-dismiss Countdown Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 7.5, ease: 'linear' }}
              className={`h-full ${
                isSettlement 
                  ? 'bg-emerald-500' 
                  : isReminder
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-r from-indigo-500 to-violet-500'
              }`}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationPopup;

