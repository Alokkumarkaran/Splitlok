import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { getGroupData, createExpense, createGroup, joinGroup } from '../services/api';
import BalanceSummary from '../components/BalanceSummary';
import ExpenseCard from '../components/ExpenseCard';
import AddExpenseModal from '../components/AddExpenseModal';
import SettleUpModal from '../components/SettleUpModal';
import { Plus, Home, Copy, CheckCircle, Receipt, ArrowRightLeft, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast'; 

const Dashboard = ({ openModalTrigger, resetModalTrigger }) => {
  const { user, login } = useContext(AppContext);
  const [data, setData] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  
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
      console.error("Group not found.");
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
    if(!activeGroupId) return;
    navigator.clipboard.writeText(activeGroupId);
    setCopied(true);
    toast.success("Invite code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B1120] transition-colors">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ==========================================
  // NO GROUP UI (Setup & Join)
  // ==========================================
  if (!activeGroupId || !data) {
    return (
      <div className="w-full min-h-[100dvh] flex flex-col lg:flex-row bg-slate-50 dark:bg-[#0B1120] font-sans overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-colors">
        
        {/* Left Side Branding */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center text-center px-6 pt-16 pb-12 lg:min-h-screen flex-shrink-0 relative z-0 bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-800">
          <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
             <div className="absolute top-[-20%] left-[-20%] w-80 h-80 bg-white rounded-full blur-3xl"></div>
             <div className="absolute bottom-[-20%] right-[-20%] w-80 h-80 bg-indigo-300 rounded-full blur-3xl"></div>
          </div>
  
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-md border border-white/30 flex items-center justify-center mb-6 shadow-xl">
              <Home className="text-white" size={32} />
            </div>
            <h1 className="text-3xl lg:text-5xl font-black text-white mb-3 tracking-tight">
              Welcome, {user?.name?.split(' ')[0] || "User"}!
            </h1>
            <p className="text-indigo-100 text-sm lg:text-base font-medium max-w-sm px-4">
              You aren't in a flat yet. Let's create your space to start splitting expenses.
            </p>
          </div>
        </div>
  
        {/* Right Side Action Panel */}
        <div className="w-full lg:w-1/2 flex-1 flex flex-col bg-white dark:bg-[#131B2F] rounded-t-[2.5rem] lg:rounded-none lg:rounded-l-[2.5rem] px-6 sm:px-10 pt-8 pb-12 shadow-2xl relative z-10 transition-colors border-l border-slate-100 dark:border-slate-800">
          <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-8 lg:hidden flex-shrink-0"></div>
          <div className="w-full max-w-md mx-auto flex flex-col justify-center flex-1">
            <AnimatePresence mode="wait">
              
              {/* BUTTONS STATE */}
              {!isCreating && !isJoining && (
                <motion.div key="buttons" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-wide">Get Started</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Choose an option below.</p>
                  </div>
                  <button onClick={() => setIsCreating(true)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex justify-center items-center gap-2">
                    <Plus size={20} /> Create a New Flat
                  </button>
                  <button onClick={() => setIsJoining(true)} className="w-full bg-slate-100 dark:bg-[#1e293b] text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 py-4 rounded-xl font-bold transition-all active:scale-95 flex justify-center items-center gap-2">
                    <Users size={20} /> Join via Invite Code
                  </button>
                </motion.div>
              )}

              {/* INPUT FORM STATE */}
              {(isCreating || isJoining) && (
                <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-left w-full">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-wide">
                      {isCreating ? "Name your Flat" : "Enter Code"}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                      {isCreating ? "Give your new shared space a name." : "Paste the 24-character invite code."}
                    </p>
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                      <input 
                        autoFocus type="text" 
                        placeholder={isCreating ? "e.g., The Chill Pad" : "Paste code here"} 
                        value={groupInput} onChange={(e) => setGroupInput(e.target.value)} 
                        className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium w-full" 
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setIsCreating(false); setIsJoining(false); setGroupInput(''); }} className="flex-1 py-4 font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors rounded-xl bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700">
                      Back
                    </button>
                    <button onClick={isCreating ? handleCreateFlat : handleJoinFlat} disabled={actionLoading || !groupInput.trim()} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all active:scale-95">
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

  // ==========================================
  // MAIN DASHBOARD UI 
  // ==========================================
  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#0B1120] font-sans pb-24 md:pb-12 overflow-x-hidden transition-colors [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      
      {/* BEAUTIFUL GRADIENT HEADER */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-800 pt-12 pb-24 px-6 rounded-b-[2.5rem] shadow-lg relative z-0">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-indigo-200 font-semibold text-xs sm:text-sm uppercase tracking-wider mb-1">Your Flat</p>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight truncate max-w-[200px] sm:max-w-md">{data.group.name}</h1>
            </div>
            <button onClick={copyInviteCode} className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95 shadow-sm flex-shrink-0">
              {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Invite Code'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* DASHBOARD CONTENT */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-16 relative z-10 space-y-6">
        
        {/* BALANCES CARD */}
        <div className="bg-white dark:bg-[#131B2F] rounded-[2rem] p-6 md:p-8 shadow-xl dark:shadow-2xl border border-slate-100 dark:border-slate-800 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <ArrowRightLeft size={20} className="text-indigo-500 dark:text-indigo-400" /> Balances
            </h2>
            <button onClick={() => setIsSettleModalOpen(true)} className="text-indigo-600 dark:text-indigo-400 font-bold text-sm bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 px-4 py-2 rounded-xl transition-all active:scale-95">
              Settle Up
            </button>
          </div>
          {/* Ensure BalanceSummary text colors are also handled inside that component! */}
          <BalanceSummary balances={data.balances} members={data.group.members} />
        </div>

        {/* RECENT SPLITS */}
        <div>
          <div className="flex justify-between items-end mb-4 px-2">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Recent Splits</h2>
            <a href="/history" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">View All</a>
          </div>
          
          <div className="space-y-3">
            <AnimatePresence>
              {data.expenses.length === 0 ? (
                <div className="bg-white dark:bg-[#131B2F] rounded-[2rem] p-12 text-center border border-dashed border-slate-300 dark:border-slate-700 transition-colors shadow-sm">
                  <Receipt size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                  <h3 className="text-lg font-bold text-slate-700 dark:text-white">No expenses yet</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Add your first bill to start splitting.</p>
                </div>
              ) : (
                data.expenses.slice(0, 5).map((exp, index) => (
                  <ExpenseCard key={exp._id} expense={exp} members={data.group.members} index={index} />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* DESKTOP ADD BUTTON (Hidden on Mobile) */}
      <motion.button 
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => setIsAddModalOpen(true)}
        className="hidden md:flex fixed bottom-8 right-8 z-40 bg-gradient-to-tr from-indigo-600 to-violet-500 text-white w-16 h-16 rounded-full shadow-[0_8px_30px_rgba(79,70,229,0.4)] items-center justify-center transition-all"
      >
        <Plus size={32} strokeWidth={2.5} />
      </motion.button>

      {/* MODALS */}
      <AddExpenseModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddExpense} members={data.group.members} />
      <SettleUpModal isOpen={isSettleModalOpen} onClose={() => setIsSettleModalOpen(false)} balances={data.balances} members={data.group.members} />
    </div>
  );
};

export default Dashboard;