import React, { useMemo, useContext } from 'react';
import { X, Send, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateTransactions } from '../utils/settleLogic';
import { generateUPILink } from '../utils/generateUPI';
import { AppContext } from '../context/AppContext'; // <-- Imported AppContext

const SettleUpModal = ({ isOpen, onClose, balances, members }) => {
  const { user } = useContext(AppContext); // <-- Get the logged-in user

  // 1. Calculate ALL flat transactions
  const allTransactions = useMemo(() => {
    if (!balances || !members) return [];

    const balanceMap = {};
    if (Array.isArray(balances)) {
      balances.forEach(b => {
        const userId = b.user?._id || b.user;
        if (userId) balanceMap[userId] = b.balance;
      });
    } else {
      Object.assign(balanceMap, balances);
    }

    return calculateTransactions(balanceMap, members);
  }, [balances, members]);

  // 2. FILTER: Only keep transactions where the logged-in user is involved!
  const myTransactions = useMemo(() => {
    if (!user) return [];
    return allTransactions.filter(
      tx => tx.from._id === user._id || tx.to._id === user._id
    );
  }, [allTransactions, user]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#1e293b] p-6 sm:p-8 rounded-[2rem] w-full max-w-lg shadow-2xl border border-slate-100 dark:border-slate-700 relative overflow-hidden"
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition bg-slate-100 dark:bg-slate-800 rounded-full p-2 z-10">
              <X size={20} />
            </button>
            
            <h2 className="text-3xl font-black mb-2 text-slate-800 dark:text-white">My Settlements</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Your personal pending debts.</p>
            
            {myTransactions.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
                <div className="text-5xl mb-4 drop-shadow-sm dark:drop-shadow-none">🎉</div>
                <h3 className="text-xl font-bold text-slate-700 dark:text-white">You're all settled up!</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">You don't owe anyone, and nobody owes you.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {myTransactions.map((tx, index) => {
                  const isPayer = tx.from._id === user._id; // Check if current user is the one paying
                  const upiLink = generateUPILink(tx.to.upiId || 'test@upi', tx.to.name, tx.amount);
                  
                  return (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
                      key={index} 
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors"
                    >
                      <div className="mb-4 sm:mb-0">
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-lg">
                          {isPayer ? "You" : tx.from.name}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500 mx-2 text-sm font-medium">pay</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">
                          {!isPayer ? "You" : tx.to.name}
                        </span>
                        <div className="text-3xl font-black text-slate-800 dark:text-white mt-1">₹{tx.amount.toLocaleString('en-IN')}</div>
                      </div>
                      
                      {/* SMART BUTTON LOGIC */}
                      {isPayer ? (
                        <a 
                          href={upiLink} target="_blank" rel="noreferrer"
                          className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] dark:shadow-none hover:scale-105 active:scale-95"
                        >
                          <Send size={18} /> Pay via UPI
                        </a>
                      ) : (
                        <div className="flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-6 py-3 rounded-xl font-bold cursor-default">
                          <Clock size={18} /> Awaiting
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettleUpModal;