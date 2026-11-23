import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { getGroupData, createExpense, createGroup, joinGroup } from '../services/api';
import ExpenseCard from '../components/ExpenseCard';
import AddExpenseModal from '../components/AddExpenseModal';
import SettleUpModal from '../components/SettleUpModal';
import { 
  Plus, Home, Copy, CheckCircle, Receipt, ArrowRightLeft, 
  Users, Zap, TrendingUp, TrendingDown, Sparkles, Search, 
  BellRing, Wallet, ArrowUpRight, ArrowDownLeft, X, Filter, 
  Check, ShieldCheck, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import PremiumLoader from '../components/PremiumLoader';

const Dashboard = ({ openModalTrigger, resetModalTrigger }) => {
  const { user, login } = useContext(AppContext);
  const [data, setData] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  
  // Search & Filter State for Activity Feed
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'expenses' | 'settlements' | 'mine'
  const [searchQuery, setSearchQuery] = useState('');

  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [groupInput, setGroupInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  const activeGroupId = user?.groupId;

  // --- MODAL TRIGGER BRIDGE ---
  useEffect(() => {
    if (openModalTrigger) {
      setIsAddModalOpen(true);
      if (resetModalTrigger) resetModalTrigger(); 
    }
  }, [openModalTrigger, resetModalTrigger]);

  const loadData = async () => {
    if (!activeGroupId) {
      setLoading(false);
      return;
    }
    try {
      const res = await getGroupData(activeGroupId);
      setData(res.data);
    } catch (error) {
      console.error("Group not found.", error);
      toast.error("Failed to load flat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user, activeGroupId]);

  // --- ACTIONS ---
  const handleCreateFlat = async () => {
    if (!groupInput.trim()) return;
    setActionLoading(true);
    try {
      const res = await createGroup({ name: groupInput });
      login({ ...user, groupId: res.data._id || res.data.groupId }, localStorage.getItem('token'));
      toast.success("Flat created successfully! 🎉");
    } catch (error) {
      toast.error("Failed to create flat.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinFlat = async () => {
    if (!groupInput.trim()) return;
    setActionLoading(true);
    try {
      const res = await joinGroup({ inviteCode: groupInput }); 
      login({ ...user, groupId: res.data._id || res.data.groupId || groupInput }, localStorage.getItem('token'));
      toast.success("Joined flat successfully! 🤝");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid Invite Code!");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddExpense = async (formDataState, selectedMembersArray) => {
    try {
      const formData = new FormData();
      formData.append('description', formDataState.description);
      formData.append('amount', formDataState.amount);
      formData.append('groupId', activeGroupId);
      
      const splitList = selectedMembersArray || data.group.members.map(m => m._id);
      formData.append('splitAmong', JSON.stringify(splitList));
      if (formDataState.image) formData.append('image', formDataState.image);

      await createExpense(formData);
      setIsAddModalOpen(false);
      toast.success("Expense split perfectly! 💸");
      loadData();
    } catch (error) {
      toast.error("Failed to add expense.");
    }
  };

  const copyInviteCode = () => {
    if (!activeGroupId) return;
    navigator.clipboard.writeText(activeGroupId);
    setCopied(true);
    toast.success("Invite code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  // ==========================================
  // FINANCIAL CALCULATIONS & DERIVED METRICS
  // ==========================================

  // Format Currency (Indian INR standard)
  const formatINR = (val) => {
    return Number(val || 0).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: Math.abs(val) % 1 === 0 ? 0 : 2
    });
  };

  // 1. User's Personal Net Balance
  const userBalance = useMemo(() => {
    if (!data?.balances || !user) return 0;
    const found = data.balances.find(b => {
      const bId = b.user?._id || b.user;
      return String(bId) === String(user._id);
    });
    return found ? (Number(found.balance) || 0) : 0;
  }, [data?.balances, user]);

  // 2. Total Flat Spending this Active Cycle (Non-settlement)
  const totalFlatSpend = useMemo(() => {
    if (!data?.expenses) return 0;
    return data.expenses
      .filter(e => e.type !== 'settlement')
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [data?.expenses]);

  // 3. User's Personal Total Out-of-Pocket Contribution
  const myContribution = useMemo(() => {
    if (!data?.expenses || !user) return 0;
    return data.expenses
      .filter(e => {
        const payerId = e.paidBy?._id || e.paidBy;
        return String(payerId) === String(user._id) && e.type !== 'settlement';
      })
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [data?.expenses, user]);

  // 4. Roommates with Balance Mapping
  const membersWithBalance = useMemo(() => {
    if (!data?.group?.members) return [];
    const balanceMap = {};
    if (Array.isArray(data?.balances)) {
      data.balances.forEach(b => {
        const uId = b.user?._id || b.user;
        if (uId) balanceMap[String(uId)] = Number(b.balance) || 0;
      });
    }
    return data.group.members.map(member => ({
      ...member,
      balance: balanceMap[String(member._id)] || 0,
      isCurrentUser: String(member._id) === String(user?._id)
    }));
  }, [data, user]);

  // Count of debtors in the flat
  const debtorsCount = useMemo(() => {
    return membersWithBalance.filter(m => m.balance < -0.01).length;
  }, [membersWithBalance]);

  // 5. Activity Feed Filtering & Searching
  const billsCount = useMemo(() => data?.expenses?.filter(e => e.type !== 'settlement').length || 0, [data?.expenses]);
  const settlementsCount = useMemo(() => data?.expenses?.filter(e => e.type === 'settlement').length || 0, [data?.expenses]);
  const myBillsCount = useMemo(() => {
    if (!data?.expenses || !user) return 0;
    return data.expenses.filter(e => {
      const payerId = e.paidBy?._id || e.paidBy;
      return String(payerId) === String(user._id);
    }).length;
  }, [data?.expenses, user]);

  const filteredExpenses = useMemo(() => {
    if (!data?.expenses) return [];
    return data.expenses.filter(exp => {
      // Tab filter
      if (activeTab === 'expenses' && exp.type === 'settlement') return false;
      if (activeTab === 'settlements' && exp.type !== 'settlement') return false;
      if (activeTab === 'mine') {
        const payerId = exp.paidBy?._id || exp.paidBy;
        if (String(payerId) !== String(user?._id)) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const descMatch = (exp.description || '').toLowerCase().includes(q);
        const payerName = (exp.paidBy?.name || '').toLowerCase();
        const payerMatch = payerName.includes(q);
        const amountMatch = String(exp.amount).includes(q);
        return descMatch || payerMatch || amountMatch;
      }

      return true;
    });
  }, [data?.expenses, activeTab, searchQuery, user]);

  // Color generator for roommate avatars
  const getAvatarGradient = (name = '') => {
    const gradients = [
      'from-indigo-500 to-purple-600',
      'from-emerald-500 to-teal-600',
      'from-blue-500 to-cyan-600',
      'from-violet-500 to-fuchsia-600',
      'from-amber-500 to-orange-600',
      'from-rose-500 to-pink-600',
    ];
    const code = (name.charCodeAt(0) || 0) + (name.charCodeAt(1) || 0);
    return gradients[code % gradients.length];
  };

  // ==========================================
  // PREMIUM LOADING STATE
  // ==========================================
  if (loading) {
    return <PremiumLoader fullScreen={true} text="Syncing your flat ledger..." />;
  }

  // ==========================================
  // NO GROUP UI (Setup & Join)
  // ==========================================
  if (!activeGroupId || !data) {
    return (
      <div className="w-full min-h-[100dvh] flex flex-col lg:flex-row bg-slate-50 dark:bg-[#0B1120] font-sans overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-colors">
        
        {/* Left Side Branding */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center text-center px-6 pt-16 pb-12 lg:min-h-screen flex-shrink-0 relative z-0 bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-800 overflow-hidden">
          <div className="absolute inset-0 opacity-30 pointer-events-none mix-blend-screen">
             <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 8, repeat: Infinity }} className="absolute -top-[20%] -left-[20%] w-[140%] h-[140%] bg-white rounded-full blur-[120px]" />
          </div>
  
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-white/10 rounded-[2rem] backdrop-blur-md border border-white/20 flex items-center justify-center mb-8 shadow-2xl">
              <Home className="text-white" size={36} />
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight leading-[1.1]">
              Welcome, {user?.name?.split(' ')[0] || "User"}!
            </h1>
            <p className="text-indigo-100/90 text-base lg:text-lg font-medium max-w-sm px-4 mt-2">
              You aren't in a flat yet. Let's create your shared space to start splitting expenses smoothly.
            </p>
          </motion.div>
        </div>
  
        {/* Right Side Action Panel */}
        <div className="w-full lg:w-1/2 flex-1 flex flex-col bg-white dark:bg-[#0f172a] rounded-t-[2.5rem] lg:rounded-none lg:rounded-l-[2.5rem] px-6 sm:px-10 pt-8 pb-12 shadow-[-20px_0_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[-20px_0_40px_-15px_rgba(0,0,0,0.3)] relative z-10 transition-colors border-l border-transparent dark:border-slate-800/50">
          <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-8 lg:hidden flex-shrink-0"></div>
          <div className="w-full max-w-md mx-auto flex flex-col justify-center flex-1">
            <AnimatePresence mode="wait">
              {!isCreating && !isJoining && (
                <motion.div key="buttons" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="text-center lg:text-left mb-10">
                    <h2 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Get Started</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Create a new flat or join your roommates.</p>
                  </div>
                  <button onClick={() => setIsCreating(true)} className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white py-4 rounded-2xl font-bold shadow-[0_8px_30px_rgba(79,70,229,0.3)] hover:shadow-[0_8px_30px_rgba(79,70,229,0.5)] transition-all active:scale-95 flex justify-center items-center gap-2">
                    <Plus size={20} className="stroke-[2.5px]" /> Create a New Flat
                  </button>
                  <button onClick={() => setIsJoining(true)} className="w-full bg-slate-50 dark:bg-[#1e293b] text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 py-4 rounded-2xl font-bold transition-all active:scale-95 flex justify-center items-center gap-2">
                    <Users size={20} className="stroke-[2.5px]" /> Join via Invite Code
                  </button>
                </motion.div>
              )}

              {(isCreating || isJoining) && (
                <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-left w-full">
                  <div className="text-center lg:text-left mb-10">
                    <h2 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                      {isCreating ? "Name your Flat" : "Enter Code"}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                      {isCreating ? "Give your new shared space a name." : "Paste the 24-character invite code."}
                    </p>
                  </div>
                  <div className="space-y-2 mb-8">
                    <div className="flex items-center bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 rounded-2xl px-4 py-4 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                      <input 
                        autoFocus type="text" 
                        placeholder={isCreating ? "e.g., The Chill Pad" : "Paste code here"} 
                        value={groupInput} onChange={(e) => setGroupInput(e.target.value)} 
                        className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-base font-medium w-full" 
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setIsCreating(false); setIsJoining(false); setGroupInput(''); }} className="flex-1 py-4 font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors rounded-2xl bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50">
                      Back
                    </button>
                    <button onClick={isCreating ? handleCreateFlat : handleJoinFlat} disabled={actionLoading || !groupInput.trim()} className="flex-[2] bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white py-4 rounded-2xl font-bold shadow-[0_8px_30px_rgba(79,70,229,0.3)] disabled:opacity-50 transition-all active:scale-95">
                      {actionLoading ? "Wait..." : "Submit"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // Determine Net Status Configuration
  const isNetOwed = userBalance > 0.01;
  const isNetOwing = userBalance < -0.01;
  const isSettled = !isNetOwed && !isNetOwing;

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#0B1120] font-sans pb-28 md:pb-16 overflow-x-hidden transition-colors [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      
      {/* ======================================================== */}
      {/* 1. TOP HEADER & FLAT IDENTITY */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 pt-8 sm:pt-10 pb-28 px-4 sm:px-6 rounded-b-[2.5rem] shadow-xl relative z-0">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-start gap-4">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-indigo-100 text-xs font-bold uppercase tracking-wider border border-white/10">
                  <Home size={12} /> Flat Dashboard
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-xs text-indigo-200/90 font-medium">
                  • {membersWithBalance.length} flatmates active
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight truncate max-w-[220px] sm:max-w-md">
                {data.group.name}
              </h1>
            </motion.div>
            
            {/* Quick Invite Code Button */}
            <motion.button 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyInviteCode} 
              className={`backdrop-blur-md border px-3.5 sm:px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-md flex-shrink-0 ${
                copied 
                  ? 'bg-emerald-500/30 border-emerald-300 text-white shadow-emerald-500/20' 
                  : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
              }`}
            >
              {copied ? <CheckCircle size={16} className="text-emerald-300" /> : <Copy size={16} />}
              <span className="hidden sm:inline">{copied ? 'Code Copied!' : 'Invite Code'}</span>
              <span className="sm:hidden">{copied ? 'Copied' : 'Invite'}</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MAIN DASHBOARD CONTENT */}
      {/* ======================================================== */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-20 relative z-10 space-y-6">
        
        {/* ========================================== */}
        {/* HERO FINANCIAL STATUS CARD ("Where do I stand?") */}
        {/* ========================================== */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4 }}
          className={`rounded-[2rem] p-6 sm:p-8 backdrop-blur-xl border shadow-xl relative overflow-hidden transition-all ${
            isNetOwed 
              ? 'bg-gradient-to-br from-white via-emerald-50/50 to-white dark:from-[#131B2F] dark:via-emerald-950/20 dark:to-[#131B2F] border-emerald-500/30 dark:border-emerald-500/20 shadow-emerald-500/5'
              : isNetOwing
              ? 'bg-gradient-to-br from-white via-rose-50/50 to-white dark:from-[#131B2F] dark:via-rose-950/20 dark:to-[#131B2F] border-rose-500/30 dark:border-rose-500/20 shadow-rose-500/5'
              : 'bg-white dark:bg-[#131B2F] border-slate-200/80 dark:border-slate-800 shadow-slate-900/5'
          }`}
        >
          {/* Subtle Ambient Background Glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full pointer-events-none opacity-20 blur-3xl"
            style={{
              backgroundColor: isNetOwed ? '#10B981' : isNetOwing ? '#F43F5E' : '#6366F1'
            }}
          />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            {/* Left: Net Balance Readout */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  isNetOwed 
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : isNetOwing
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                }`}>
                  {isNetOwed ? <TrendingUp size={14} className="stroke-[2.5px]" /> : isNetOwing ? <TrendingDown size={14} className="stroke-[2.5px]" /> : <ShieldCheck size={14} />}
                  {isNetOwed ? 'Net In Credit' : isNetOwing ? 'Dues Pending' : 'All Settled'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  Personal Balance
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <h2 className={`text-4xl sm:text-5xl font-black tracking-tight ${
                  isNetOwed 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : isNetOwing 
                    ? 'text-rose-600 dark:text-rose-400' 
                    : 'text-slate-800 dark:text-white'
                }`}>
                  {isSettled ? '₹0' : `₹${formatINR(Math.abs(userBalance))}`}
                </h2>
                <span className="text-sm sm:text-base font-bold text-slate-500 dark:text-slate-400">
                  {isNetOwed ? 'gets back' : isNetOwing ? 'you owe' : 'clean ledger'}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-md">
                {isNetOwed && "Flatmates owe you money. You can nudge debtors or record settlements when received."}
                {isNetOwing && "You have pending dues in this flat cycle. Settle up via instant UPI or mark paid."}
                {isSettled && "Hisaab-kitaab ekdum clear hai! Zero pending dues between you and your flatmates."}
              </p>
            </div>

            {/* Right: Quick Action CTAs */}
            <div className="flex items-center gap-3 pt-2 md:pt-0">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsAddModalOpen(true)}
                className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm sm:text-base px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all"
              >
                <Plus size={18} className="stroke-[2.5px]" />
                <span>Add Expense</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsSettleModalOpen(true)}
                className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-white font-bold text-sm sm:text-base px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 transition-all shadow-sm"
              >
                <ArrowRightLeft size={16} className="text-indigo-500 dark:text-indigo-400" />
                <span>Settle Up</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ========================================== */}
        {/* 3 MICRO-STAT FINANCIAL PULSE CARDS */}
        {/* ========================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Cycle Flat Spend */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#131B2F] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Receipt size={22} className="stroke-[2.5px]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Flat Spend</p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white truncate">
                ₹{formatINR(totalFlatSpend)}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">Total bills this cycle</p>
            </div>
          </motion.div>

          {/* Card 2: Personal Paid Contribution */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-white dark:bg-[#131B2F] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
              <Wallet size={22} className="stroke-[2.5px]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">You Paid Out</p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white truncate">
                ₹{formatINR(myContribution)}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">Fronted by you</p>
            </div>
          </motion.div>

          {/* Card 3: Roommates Status */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white dark:bg-[#131B2F] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
              <Users size={22} className="stroke-[2.5px]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Flatmates Roster</p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white truncate">
                {membersWithBalance.length} Members
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                {debtorsCount > 0 ? `${debtorsCount} pending dues` : 'Everyone all clear'}
              </p>
            </div>
          </motion.div>
        </div>

        {/* ========================================== */}
        {/* ROOMMATES ROSTER STRIP ("Who owes what?") */}
        {/* ========================================== */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white dark:bg-[#131B2F] p-6 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Users size={18} className="text-indigo-500" /> Flatmates Ledger
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Individual standing across all active splits</p>
            </div>

            <button 
              onClick={() => setIsSettleModalOpen(true)}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-500/20 transition-colors"
            >
              <span>Settlement Details</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {membersWithBalance.map((member) => {
              const isOwed = member.balance > 0.01;
              const isOwing = member.balance < -0.01;
              const hasUpi = !!member.upiId;

              return (
                <div 
                  key={member._id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Roommate Avatar with Initials */}
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${getAvatarGradient(member.name)} text-white font-black text-sm flex items-center justify-center shadow-sm flex-shrink-0`}>
                      {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">
                          {member.name}
                        </span>
                        {member.isCurrentUser && (
                          <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-md flex-shrink-0">
                            You
                          </span>
                        )}
                      </div>
                      <span className={`text-[11px] font-semibold flex items-center gap-1 ${hasUpi ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                        {hasUpi ? <Check size={11} className="stroke-[3px]" /> : null}
                        {hasUpi ? 'UPI Linked' : 'No UPI'}
                      </span>
                    </div>
                  </div>

                  {/* Balance Badge */}
                  <div className="text-right flex-shrink-0">
                    <span className={`block font-black text-sm ${
                      isOwed 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : isOwing 
                        ? 'text-rose-600 dark:text-rose-400' 
                        : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      {isOwed ? `+₹${formatINR(member.balance)}` : isOwing ? `-₹${formatINR(Math.abs(member.balance))}` : 'Settled'}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {isOwed ? 'Gets back' : isOwing ? 'Owes' : 'Clear'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ========================================== */}
        {/* SMART ACTIVITY FEED WITH SEARCH & TABS */}
        {/* ========================================== */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {/* Section Header & View All Link */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">
                Recent Splits & Activity
              </h2>
              <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black px-2.5 py-0.5 rounded-full">
                {filteredExpenses.length}
              </span>
            </div>

            <Link 
              to="/history" 
              className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1 transition-colors self-start sm:self-auto"
            >
              <span>View Full History</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {/* Search Bar & Tab Pills */}
          <div className="bg-white dark:bg-[#131B2F] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            {/* Search Input */}
            <div className="relative flex items-center">
              <Search size={18} className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by bill name, roommate or amount..."
                className="w-full bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium rounded-xl pl-10 pr-9 py-2.5 border border-slate-200 dark:border-slate-700/60 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-md"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {[
                { id: 'all', label: 'All', count: data.expenses.length },
                { id: 'expenses', label: 'Bills 🛒', count: billsCount },
                { id: 'settlements', label: 'Settlements 💸', count: settlementsCount },
                { id: 'mine', label: 'Paid by Me 👤', count: myBillsCount }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    activeTab === tab.id 
                      ? 'bg-white/20 text-white' 
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* List of Filtered Expenses */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredExpenses.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="bg-white dark:bg-[#131B2F] rounded-[2rem] p-10 text-center border border-dashed border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3 text-indigo-500">
                    <Receipt size={28} />
                  </div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white mb-1">
                    {searchQuery ? 'No matching splits found' : 'No expenses in this filter'}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm mx-auto mb-4 font-medium">
                    {searchQuery 
                      ? `Try searching for something else or clear the query.` 
                      : `Add a new bill or settle up to start tracking your flat expenses.`}
                  </p>
                  {searchQuery ? (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                    >
                      Clear Search
                    </button>
                  ) : (
                    <button 
                      onClick={() => setIsAddModalOpen(true)}
                      className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-xs font-bold shadow-md hover:from-indigo-500 transition-all inline-flex items-center gap-1.5"
                    >
                      <Plus size={16} /> Add First Bill
                    </button>
                  )}
                </motion.div>
              ) : (
                filteredExpenses.slice(0, 10).map((exp, index) => (
                  <motion.div 
                    key={exp._id}
                    layout
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: Math.min(index * 0.04, 0.4) }}
                  >
                    <ExpenseCard expense={exp} members={data.group.members} index={index} />
                  </motion.div>
                ))
              )}
            </AnimatePresence>

            {filteredExpenses.length > 10 && (
              <div className="text-center pt-2">
                <Link
                  to="/history"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline bg-white dark:bg-[#131B2F] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <span>See {filteredExpenses.length - 10} more items in history</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </motion.div>

      </div>

      {/* ======================================================== */}
      {/* 3. DESKTOP FLOATING ADD BUTTON (Hidden on Mobile) */}
      {/* ======================================================== */}
      <motion.button 
        whileHover={{ scale: 1.08 }} 
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsAddModalOpen(true)}
        className="hidden md:flex fixed bottom-8 right-8 z-40 bg-gradient-to-tr from-indigo-600 to-violet-500 text-white w-16 h-16 rounded-[1.5rem] shadow-[0_10px_30px_rgba(79,70,229,0.4)] items-center justify-center transition-all group"
      >
        <Plus size={30} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
      </motion.button>

      {/* ======================================================== */}
      {/* 4. MODALS (Add Expense & Settle Up) */}
      {/* ======================================================== */}
      <AddExpenseModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSubmit={handleAddExpense} 
        members={data.group.members} 
      />

      <SettleUpModal 
        isOpen={isSettleModalOpen} 
        onClose={() => setIsSettleModalOpen(false)} 
        balances={data.balances} 
        members={data.group.members} 
        groupId={activeGroupId} 
        onSettled={loadData} 
      />
    </div>
  );
};

export default Dashboard;
