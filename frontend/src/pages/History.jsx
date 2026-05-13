import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { getGroupData } from '../services/api';
import ExpenseCard from '../components/ExpenseCard';
import { ArrowLeft, Receipt, CheckCircle, Wallet, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const History = () => {
  const { user } = useContext(AppContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Tabs: 'all', 'personal', 'settlements'
  const [filter, setFilter] = useState('all'); 

  useEffect(() => {
    const loadData = async () => {
      const activeGroupId = user?.groupId; 
      if (!activeGroupId) return setLoading(false);
      
      try {
        const res = await getGroupData(activeGroupId);
        setData(res.data);
        setError(false);
      } catch (error) {
        console.error("Error fetching history");
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    if (user) loadData();
  }, [user]);

  // --- DYNAMIC CALCULATIONS & FILTERING ---
  const expenses = data?.expenses || [];
  
  const filteredData = useMemo(() => {
    if (!user) return [];
    const currentUserId = user._id;

    return expenses.filter(exp => {
      // 1. SETTLEMENTS TAB: Only show settlement payments
      if (filter === 'settlements') {
        return exp.type === 'settlement';
      }
      
      // 2. MY EXPENSES TAB: Only show bills where the logged-in user is involved
      if (filter === 'personal') {
        if (exp.type === 'settlement') return false; // Hide settlements here
        
        // Did the user pay for this?
        const isPayer = exp.paidBy?._id === currentUserId || exp.paidBy === currentUserId;
        
        // Is the user included in the split?
        const isInSplit = exp.splitAmong?.some(
          split => split.user?._id === currentUserId || split.user === currentUserId
        );

        return isPayer || isInSplit;
      }
      
      // 3. ALL HISTORY TAB: Show everything in the flat
      return true; 
    });
  }, [expenses, filter, user]);

  const totalGroupSpent = useMemo(() => {
    return expenses
      .filter(exp => exp.type !== 'settlement')
      .reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses]);

  // --- EDGE CASES UI ---
  if (!user?.groupId && !loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center text-center p-6 bg-[#0f172a]">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="text-slate-400" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Flat Found</h2>
        <p className="text-slate-400 max-w-sm mb-6">You need to join or create a flat to view transaction history.</p>
        <Link to="/" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition">Go to Home</Link>
      </div>
    );
  }

  // --- TAB CONFIGURATION ---
  const TABS = [
    { id: 'all', label: 'All Flat History' },
    { id: 'personal', label: 'My Expenses' },
    { id: 'settlements', label: 'Settlements' }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans pb-24 md:pb-12 overflow-x-hidden">
      
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-800 pt-8 sm:pt-12 pb-24 px-4 sm:px-6 md:px-8 rounded-b-[2.5rem] shadow-lg relative z-0">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/" className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 text-white transition-all hover:scale-105 active:scale-95">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <p className="text-indigo-200 font-semibold text-xs sm:text-sm uppercase tracking-wider mb-1">Ledger</p>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Flat History</h1>
            </div>
          </div>

          {/* Quick Stats */}
          {!loading && !error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-5 py-4 rounded-2xl flex-1 max-w-xs">
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Total Group Spending</p>
                <p className="text-2xl font-black text-white">₹{totalGroupSpent.toLocaleString('en-IN')}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 -mt-10 relative z-10">
        
        <div className="bg-[#1E2330] rounded-[2rem] p-4 sm:p-6 md:p-8 shadow-xl border border-slate-800 min-h-[50vh]">
          
          {/* FILTER TABS */}
          <div className="flex p-1 bg-slate-900/50 rounded-2xl mb-8 w-full max-w-lg mx-auto sm:mx-0 border border-slate-800 overflow-x-auto custom-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex-1 min-w-[120px] py-2.5 px-3 text-sm font-bold rounded-xl transition-all ${
                  filter === tab.id 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* LOADING STATE (Skeleton Loaders) */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 animate-pulse flex gap-4">
                  <div className="w-12 h-12 bg-slate-700 rounded-xl"></div>
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            /* ERROR STATE */
            <div className="text-center py-16">
              <AlertCircle size={48} className="mx-auto text-rose-500 mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Oops! Something went wrong.</h2>
              <p className="text-slate-400 text-sm">We couldn't load your history. Please try refreshing.</p>
            </div>
          ) : filteredData.length === 0 ? (
            /* EMPTY STATE */
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 border border-dashed border-slate-700 rounded-3xl bg-slate-800/20">
              {filter === 'settlements' ? (
                <CheckCircle size={56} className="mx-auto text-emerald-500/50 mb-4" />
              ) : filter === 'personal' ? (
                <Receipt size={56} className="mx-auto text-indigo-500/50 mb-4" />
              ) : (
                <Wallet size={56} className="mx-auto text-slate-500/50 mb-4" />
              )}
              <h2 className="text-xl font-bold text-white mb-2">
                {filter === 'settlements' ? 'No settlements yet' : filter === 'personal' ? "You have no personal expenses yet" : 'No history yet'}
              </h2>
              <p className="text-slate-400 text-sm">
                {filter === 'settlements' 
                  ? 'When someone pays off their debt, it will appear here.' 
                  : 'Start adding bills from the dashboard to see them here.'}
              </p>
            </motion.div>
          ) : (
            /* DATA GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <AnimatePresence mode="popLayout">
                {filteredData.map((exp, index) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    key={exp._id}
                  >
                    <ExpenseCard expense={exp} members={data.group.members} index={index} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;