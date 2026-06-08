import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { getGroupData } from '../services/api';
import ExpenseCard from '../components/ExpenseCard';
import { ArrowLeft, Receipt, CheckCircle, Wallet, AlertCircle, Archive, Calendar, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
// Add this line at the top of Dashboard.jsx
import PremiumLoader from '../components/PremiumLoader';

// ... existing imports ...

const History = () => {
  const { user } = useContext(AppContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // States for Filtering
  const [filter, setFilter] = useState('all'); 
  const [monthFilter, setMonthFilter] = useState('all');

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
  const archivedExpenses = data?.archivedExpenses || [];

  // 1. Extract all unique months from the data for the dropdown
  const availableMonths = useMemo(() => {
    if (!data) return [];
    const allDocs = [...expenses, ...archivedExpenses];
    const monthsMap = new Map();

    allDocs.forEach(exp => {
      if (!exp.createdAt) return;
      const dateString = exp.createdAt.substring(0, 7); // Format: "YYYY-MM"
      if (!monthsMap.has(dateString)) {
        const dateObj = new Date(exp.createdAt);
        const label = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        monthsMap.set(dateString, label);
      }
    });

    // Sort newest first
    return Array.from(monthsMap.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([value, label]) => ({ value, label }));
  }, [data, expenses, archivedExpenses]);
  
  // 2. Apply both Tab and Month filters
  const filteredData = useMemo(() => {
    if (!user) return [];
    const currentUserId = user._id;

    // Base array selection
    let processedData = filter === 'archived' ? archivedExpenses : expenses;

    // Apply Tab Filter
    processedData = processedData.filter(exp => {
      if (filter === 'settlements') return exp.type === 'settlement';
      
      if (filter === 'personal') {
        if (exp.type === 'settlement') return false; 
        const isPayer = exp.paidBy?._id === currentUserId || exp.paidBy === currentUserId;
        return isPayer; 
      }
      return true; 
    });

    // Apply Month Filter
    if (monthFilter !== 'all') {
      processedData = processedData.filter(exp => {
        if (!exp.createdAt) return false;
        return exp.createdAt.substring(0, 7) === monthFilter;
      });
    }

    return processedData;
  }, [expenses, archivedExpenses, filter, monthFilter, user]);

  // 3. Contextual Spending Total (Updates based on filters!)
  const contextualTotal = useMemo(() => {
    return filteredData
      .filter(exp => exp.type !== 'settlement')
      .reduce((sum, exp) => sum + exp.amount, 0);
  }, [filteredData]);

  // --- EDGE CASES UI ---
  if (!user?.groupId && !loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center text-center p-6 bg-slate-50 dark:bg-[#0f172a] transition-colors">
        <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="text-slate-500 dark:text-slate-400" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Flat Found</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">You need to join or create a flat to view transaction history.</p>
        <Link to="/" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition">Go to Home</Link>
      </div>
    );
  }

  const TABS = [
    { id: 'all', label: 'All Flat History' },
    { id: 'personal', label: 'Added by Me' },
    { id: 'settlements', label: 'Settlements' },
    { id: 'archived', label: 'Past Cycles' } 
  ];

  // Logic to track rendering of month headers in the list
  let currentRenderedMonth = '';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] font-sans pb-24 md:pb-12 overflow-x-hidden transition-colors">
      
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

          {!loading && !error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-5 py-4 rounded-2xl flex-1 max-w-xs transition-all">
                <p className="text-indigo-200 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">
                  {filter === 'personal' ? 'My Filtered Total' : filter === 'archived' ? 'Cycle Total' : 'Group Filtered Total'}
                </p>
                <p className="text-2xl sm:text-3xl font-black text-white">₹{contextualTotal.toLocaleString('en-IN')}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 -mt-10 relative z-10">
        <div className="bg-white dark:bg-[#1E2330] rounded-[2rem] p-4 sm:p-6 md:p-8 shadow-xl border border-slate-100 dark:border-slate-800 min-h-[50vh] transition-colors">
          
          {/* CONTROLS ROW (Tabs + Dropdown) */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
            
            {/* FILTER TABS */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-900/50 rounded-2xl w-full lg:max-w-lg border border-slate-200 dark:border-slate-800 overflow-x-auto custom-scrollbar transition-colors">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`flex-1 min-w-[110px] py-2.5 px-3 text-sm font-bold rounded-xl transition-all ${
                    filter === tab.id 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* MONTH FILTER DROPDOWN */}
            {availableMonths.length > 0 && (
              <div className="relative w-full lg:w-48 flex-shrink-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={16} className="text-slate-400" />
                </div>
                <select
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-2xl pl-10 pr-10 py-3 appearance-none outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
                >
                  <option value="all">All Months</option>
                  {availableMonths.map(month => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown size={16} className="text-slate-400" />
                </div>
              </div>
            )}
          </div>

          {/* LOADING STATE */}
          {loading ? (
  <PremiumLoader text="Fetching your ledger history..." />
) : error ? (
  <div className="text-center py-16">
    <AlertCircle size={48} className="mx-auto text-rose-500 mb-4" />
    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Oops! Something went wrong.</h2>
    <p className="text-slate-500 dark:text-slate-400 text-sm">We couldn't load your history. Please try refreshing.</p>
  </div>
) : filteredData.length === 0 ? (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-700 rounded-3xl bg-slate-50 dark:bg-slate-800/20">
    {filter === 'settlements' ? <CheckCircle size={56} className="mx-auto text-emerald-500/50 mb-4" />
    : filter === 'personal' ? <Receipt size={56} className="mx-auto text-indigo-500/50 mb-4" />
    : filter === 'archived' ? <Archive size={56} className="mx-auto text-amber-500/50 mb-4" />
    : <Wallet size={56} className="mx-auto text-slate-400 dark:text-slate-500/50 mb-4" />}
    
    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
      {filter === 'settlements' ? 'No settlements found' : filter === 'personal' ? "No personal expenses found" : filter === 'archived' ? 'No Past Cycles found' : 'No history found'}
    </h2>
  </motion.div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
    {/* Your filteredData.map content stays exactly as it was */}
    <AnimatePresence mode="popLayout">
      {filteredData.map((exp, index) => {
                  // Determine if we need a new Month Divider
                  const expDateObj = new Date(exp.createdAt);
                  const monthLabel = expDateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                  
                  let showDivider = false;
                  if (monthLabel !== currentRenderedMonth) {
                    showDivider = true;
                    currentRenderedMonth = monthLabel;
                  }

                  return (
                    <React.Fragment key={exp._id}>
                      {showDivider && (
                        <motion.div 
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="col-span-1 md:col-span-2 flex items-center gap-4 pt-6 pb-2"
                        >
                          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-slate-200 dark:border-slate-700/50">
                            {monthLabel}
                          </span>
                          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                        </motion.div>
                      )}
                      
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <ExpenseCard expense={exp} members={data.group.members} index={index} />
                      </motion.div>
                    </React.Fragment>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;