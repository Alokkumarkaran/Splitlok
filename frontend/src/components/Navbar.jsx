import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ThemeContext } from '../context/ThemeContext';
import { LogOut, Home, List, Moon, Sun, Zap, PlusSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ onOpenAddExpense }) => {
  const { user, logout } = useContext(AppContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  // STATE FOR LOGOUT MODAL
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [greeting, setGreeting] = useState('');

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/login');
  };

  // --- DYNAMIC GREETING LOGIC (Updates automatically) ---
  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) setGreeting('Good Morning');
      else if (hour < 17) setGreeting('Good Afternoon');
      else if (hour < 21) setGreeting('Good Evening');
      else setGreeting('Good Night');
    };
    updateGreeting();
    // Check every minute just in case they leave the app open
    const interval = setInterval(updateGreeting, 60000); 
    return () => clearInterval(interval);
  }, []);

  const firstName = user?.name ? user.name.split(' ')[0] : '';

  // --- DESKTOP NAV ITEM ---
  const DesktopNavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`relative flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all duration-300 ${
          isActive 
            ? 'text-indigo-600 dark:text-cyan-400' 
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
        }`}
      >
        {isActive && (
          <motion.div layoutId="desktopNavBg" className="absolute inset-0 bg-indigo-50 dark:bg-cyan-500/10 rounded-2xl -z-10" />
        )}
        <Icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
        <span className="text-sm font-bold">{label}</span>
      </Link>
    );
  };

  // --- ULTRA-PREMIUM MOBILE NAV ITEM ---
  const MobileNavItem = ({ to, icon: Icon, onClick, isPrimary }) => {
    const isActive = location.pathname === to && !onClick;
    
    const baseClasses = "relative flex items-center justify-center w-14 h-14 rounded-2xl select-none -webkit-tap-highlight-color-transparent z-10";

    // PRIMARY ACTION BUTTON (The glowing '+' button)
    if (isPrimary && onClick) {
      return (
        <div className="relative -top-5"> {/* Elevates the primary button slightly out of the pill */}
          <div className="absolute inset-2 bg-indigo-600 dark:bg-cyan-400 rounded-2xl blur-md opacity-40 dark:opacity-50 animate-pulse"></div>
          <motion.button 
            whileTap={{ scale: 0.85 }}
            type="button" 
            onClick={onClick} 
            className="relative flex items-center justify-center w-14 h-14 bg-indigo-600 dark:bg-cyan-500 text-white rounded-[1.25rem] shadow-xl border-2 border-white dark:border-[#111827] z-20"
          >
            <Icon size={26} className="stroke-[2.5px]" />
          </motion.button>
        </div>
      );
    }

    if (onClick) {
      return (
        <motion.button whileTap={{ scale: 0.85 }} type="button" onClick={onClick} className={`${baseClasses} text-slate-500 dark:text-slate-400`}>
          <Icon size={26} className="stroke-[2.5px]" />
        </motion.button>
      );
    }

    return (
      <Link to={to} className={`${baseClasses} ${isActive ? 'text-indigo-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400'}`}>
        {isActive && (
          <motion.div 
            layoutId="mobileNavBg" 
            className="absolute inset-1 bg-indigo-100 dark:bg-[#0891b2]/20 rounded-[1.1rem] pointer-events-none -z-10" 
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          />
        )}
        <motion.div whileTap={{ scale: 0.85 }}>
          <Icon size={26} className={isActive ? 'stroke-[2.5px]' : 'stroke-[2.5px]'} />
        </motion.div>
      </Link>
    );
  };

  return (
    <>
      {/* ========================================== */}
      {/* MOBILE TOP HEADER (With Dynamic Greeting) */}
      {/* ========================================== */}
      <div className="md:hidden sticky top-0 z-40 w-full bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-2xl px-5 py-3 flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
  
  {/* LEFT SIDE: Logo & Greeting */}
  <div className="flex flex-col justify-center">
    
    {/* LOGO */}
    {/* Note: Added -ml-1 just in case your PNG has built-in transparent padding on the edges */}
    <Link to="/" className="flex items-center group -ml-1">
      <img 
        src="/Splitlok-512x512.png" 
        alt="Splitlok" 
        className="h-7 sm:h-8 w-auto object-contain group-active:scale-95 transition-all duration-300" 
      />
    </Link>

    {/* DYNAMIC GREETING */}
    {firstName && (
      <motion.span 
        key={greeting} 
        initial={{ opacity: 0, x: -5 }} 
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="text-[10px] sm:text-[11px] font-bold mt-0.5 tracking-wider uppercase pl-1"
      >
        <span className="text-slate-400 dark:text-slate-500">{greeting},</span>{' '}
        <span className="text-slate-700 dark:text-slate-200">{firstName}</span> 👋
      </motion.span>
    )}
  </div>

  {/* RIGHT SIDE: Theme Toggle */}
  <button 
    onClick={toggleTheme} 
    className="relative p-2.5 rounded-full bg-slate-50 dark:bg-slate-800/80 text-slate-500 hover:text-slate-700 dark:text-[#fcd34d] border border-slate-200/60 dark:border-slate-700/50 shadow-sm active:scale-90 transition-all duration-300 flex items-center justify-center"
    aria-label="Toggle Dark Mode"
  >
    {theme === 'dark' ? <Sun size={18} className="stroke-[2.5px]" /> : <Moon size={18} className="stroke-[2.5px]" />}
  </button>

</div>

      {/* ========================================== */}
      {/* DESKTOP TOP NAV */}
      {/* ========================================== */}
      <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} className="hidden md:flex sticky top-0 z-50 w-full bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="w-full max-w-[1400px] mx-auto px-6 py-3 flex justify-between items-center">
          
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-black flex items-center gap-2 group">
              <Zap size={24} className="text-indigo-600 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="text-slate-800 dark:text-white tracking-tight">
                Split<span className="text-indigo-600 dark:text-cyan-400">lok</span>
              </span>
            </Link>
            
            {firstName && (
              <div className="ml-5 pl-5 border-l-2 border-slate-200 dark:border-slate-700/50 flex items-center">
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  {greeting}, <span className="text-slate-800 dark:text-slate-200">{firstName}</span> 👋
                </span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 items-center">
            <DesktopNavItem to="/" icon={Home} label="Dashboard" />
            <DesktopNavItem to="/history" icon={List} label="History" />
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700/50 mx-2"></div>
            <button onClick={toggleTheme} className="p-2.5 rounded-xl text-slate-500 bg-slate-50 dark:bg-slate-800 transition-all hover:bg-slate-100 dark:hover:bg-slate-700">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => setShowLogoutModal(true)} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2.5 rounded-xl font-bold ml-2 transition-all hover:text-rose-500 dark:hover:text-rose-400">
              <LogOut size={18} /> <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ========================================== */}
      {/* MOBILE FLOATING BOTTOM NAV (Glassmorphism Pill) */}
      {/* ========================================== */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 z-50 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-2xl border border-white/50 dark:border-slate-700/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex justify-between items-center p-2 px-4 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        <MobileNavItem to="/" icon={Home} />
        <MobileNavItem to="/history" icon={List} />
        
        {/* The glowing raised button */}
        <MobileNavItem icon={PlusSquare} onClick={onOpenAddExpense} isPrimary={true} />
        
        <MobileNavItem icon={LogOut} onClick={() => setShowLogoutModal(true)} />
      </nav>

      {/* ========================================== */}
      {/* LOGOUT CONFIRMATION MODAL */}
      {/* ========================================== */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm cursor-pointer"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white dark:bg-[#1e293b] p-6 sm:p-8 rounded-[2.5rem] w-full max-w-sm relative z-10 shadow-2xl border border-slate-100 dark:border-slate-700 text-center"
            >
              <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-5">
                <LogOut size={28} className="stroke-[2.5px] -ml-1" />
              </div>
              
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Sign Out?</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
                Are you sure you want to securely log out of Splitlok?
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLogoutModal(false)} 
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-bold active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmLogout} 
                  className="flex-1 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold active:scale-95 transition-all shadow-lg shadow-rose-600/30"
                >
                  Yes, Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;