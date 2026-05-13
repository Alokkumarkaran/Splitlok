import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { loginUser } from '../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast'; 

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AppContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await loginUser(formData);
      const userData = res.data.user || res.data;
      const tokenData = res.data.token || null;
      
      login(userData, tokenData);
      
      toast.success(`Welcome back, ${userData.name.split(' ')[0]}!`);
      navigate('/');
      
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // MAIN WRAPPER: Flex column on mobile, Flex row on desktop. Fixed min height.
    <div className="min-h-[100dvh] w-full flex flex-col lg:flex-row bg-slate-50 dark:bg-[#0B1120] font-sans transition-colors duration-300 overflow-x-hidden">
      
      {/* ========================================== */}
      {/* LEFT BRANDING PANEL (45% Width on Desktop) */}
      {/* ========================================== */}
      <div className="relative w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-center items-center text-center pt-16 pb-24 lg:py-12 px-6 lg:min-h-screen flex-shrink-0 z-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-indigo-900 overflow-hidden">
        
        {/* Animated Background Orbs (Strictly contained) */}
        <div className="absolute inset-0 opacity-30 pointer-events-none mix-blend-screen">
           <motion.div 
             animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }} 
             transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
             className="absolute -top-[20%] -left-[20%] w-[140%] h-[140%] bg-white rounded-full blur-[120px] max-w-[600px] max-h-[600px]"
           />
           <motion.div 
             animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }} 
             transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
             className="absolute bottom-[-10%] right-[-10%] w-[120%] h-[120%] bg-indigo-300 rounded-full blur-[100px] max-w-[500px] max-h-[500px]"
           />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="relative z-10 flex flex-col items-center w-full max-w-md mx-auto"
        >
          <div className="w-20 h-20 bg-white/10 rounded-[2rem] backdrop-blur-md border border-white/20 flex items-center justify-center mb-8 shadow-2xl">
            <Zap className="text-white fill-white" size={40} />
          </div>
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-4 tracking-tight leading-[1.1]">
            Split bills.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400">Not friendships.</span>
          </h1>
          <p className="text-indigo-100/90 text-base lg:text-lg font-medium px-4 mt-2">
            Join FlatSync to instantly track, share, and settle expenses with your roommates.
          </p>
        </motion.div>
      </div>

      {/* ========================================== */}
      {/* RIGHT LOGIN PANEL (55% Width on Desktop) */}
      {/* ========================================== */}
      <div className="relative w-full lg:w-[55%] xl:w-[60%] flex-1 flex flex-col justify-center items-center bg-white dark:bg-[#0f172a] rounded-t-[2.5rem] lg:rounded-none -mt-12 lg:mt-0 z-10 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.15)] lg:shadow-[-20px_0_40px_-15px_rgba(0,0,0,0.3)] transition-colors duration-300 border-l border-transparent dark:border-slate-800/50">
        
        {/* Mobile Pull-Tab Handle */}
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full absolute top-4 lg:hidden"></div>

        {/* Form Container (Perfectly centered, max-width applied) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md px-6 sm:px-10 py-12 lg:py-0"
        >
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Enter your details to access your flat.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* EMAIL INPUT */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
              <div className="flex items-center bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 rounded-2xl px-4 py-4 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all group">
                <Mail className="text-slate-400 group-focus-within:text-indigo-500 transition-colors mr-3 flex-shrink-0" size={20} />
                <input 
                  type="email" 
                  placeholder="you@example.com" 
                  className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-medium w-full min-w-0" 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  required 
                />
              </div>
            </div>

            {/* PASSWORD INPUT */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Password</label>
              <div className="flex items-center bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 rounded-2xl px-4 py-4 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all group">
                <Lock className="text-slate-400 group-focus-within:text-indigo-500 transition-colors mr-3 flex-shrink-0" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-medium tracking-wide w-full min-w-0" 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="text-slate-400 hover:text-indigo-500 focus:outline-none transition-colors ml-2 p-1 flex-shrink-0"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* FORGOT PASSWORD LINK */}
            <div className="flex justify-end pt-1">
              <button type="button" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
                Forgot password?
              </button>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white py-4 rounded-2xl font-bold text-[15px] transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(79,70,229,0.3)] hover:shadow-[0_8px_30px_rgba(79,70,229,0.5)] active:scale-95"
              >
                {isLoading ? (
                  <><Loader2 size={20} className="animate-spin" /> Signing In...</>
                ) : (
                  <>Sign In <ArrowRight size={18} /></>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-10 text-center flex-shrink-0">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              New to FlatSync? <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-black hover:underline transition-all">Create an account</Link>
            </p>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default Login;