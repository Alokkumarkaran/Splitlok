import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ThemeContext } from '../context/ThemeContext';
import { LogOut, Home, List, Moon, Sun, Zap, PlusSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = ({ onOpenAddExpense }) => {
  const { user, logout } = useContext(AppContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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

  // --- BULLETPROOF MOBILE NAV ITEM ---
  const MobileNavItem = ({ to, icon: Icon, onClick }) => {
    const isActive = location.pathname === to && !onClick;
    
    // FIX 1: Massive 56x56 tap target (w-14 h-14). 
    // FIX 2: Removed "hover:" classes so mobile doesn't require double-taps.
    // FIX 3: Added touch-none to prevent scrolling while tapping.
    const baseClasses = "relative flex items-center justify-center w-14 h-14 rounded-2xl active:scale-90 transition-transform select-none -webkit-tap-highlight-color-transparent";

    if (onClick) {
      return (
        <button type="button" onClick={onClick} className={`${baseClasses} text-slate-400 dark:text-slate-500`}>
          <Icon size={28} className="stroke-2" />
        </button>
      );
    }

    return (
      <Link to={to} className={`${baseClasses} ${isActive ? 'text-indigo-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500'}`}>
        {isActive && (
          <motion.div 
            layoutId="mobileNavBg" 
            // FIX 4: pointer-events-none ensures the animation block doesn't steal your clicks!
            className="absolute inset-0 bg-indigo-100 dark:bg-[#0891b2]/20 rounded-2xl pointer-events-none" 
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
        )}
        <Icon size={28} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
      </Link>
    );
  };

  return (
    <>
      {/* ========================================== */}
      {/* MOBILE TOP HEADER */}
      {/* ========================================== */}
      <div className="md:hidden sticky top-0 z-40 w-full bg-[#f8fafc] dark:bg-[#111827] px-5 py-4 flex justify-between items-center shadow-sm dark:shadow-none border-b border-slate-200/50 dark:border-slate-800/50">
        <Link to="/" className="text-xl font-black text-slate-800 dark:text-[#fcd34d] tracking-tight flex items-center gap-1.5">
          {user?.name ? user.name.split(' ')[0] : 'FlatSync'}
        </Link>
        <button 
          onClick={toggleTheme} 
          className="p-2.5 rounded-xl bg-slate-200/50 dark:bg-[#1f2937] text-slate-600 dark:text-[#fcd34d] border border-transparent dark:border-slate-700 active:scale-90 transition-transform"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* ========================================== */}
      {/* DESKTOP TOP NAV */}
      {/* ========================================== */}
      <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} className="hidden md:flex sticky top-0 z-50 w-full bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="w-full max-w-[1400px] mx-auto px-6 py-3 flex justify-between items-center">
          <Link to="/" className="text-2xl font-black flex items-center gap-2 group">
            <Zap size={24} className="text-indigo-600 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300">
              FlatSync
            </span>
          </Link>
          
          <div className="flex gap-2 items-center">
            <DesktopNavItem to="/" icon={Home} label="Dashboard" />
            <DesktopNavItem to="/history" icon={List} label="History" />
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700/50 mx-2"></div>
            <button onClick={toggleTheme} className="p-2.5 rounded-xl text-slate-500 bg-slate-50 dark:bg-slate-800 transition-all hover:bg-slate-100 dark:hover:bg-slate-700">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2.5 rounded-xl font-bold ml-2 transition-all hover:text-rose-500">
              <LogOut size={18} /> <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ========================================== */}
      {/* MOBILE FLOATING BOTTOM NAV */}
      {/* ========================================== */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 z-50 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-[2rem] shadow-2xl flex justify-between items-center p-2 px-4">
        <MobileNavItem to="/" icon={Home} />
        <MobileNavItem to="/history" icon={List} />
        <MobileNavItem icon={PlusSquare} onClick={onOpenAddExpense} />
        <MobileNavItem icon={LogOut} onClick={handleLogout} />
      </nav>
    </>
  );
};

export default Navbar;