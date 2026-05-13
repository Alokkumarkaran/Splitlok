import React from 'react';
import { motion } from 'framer-motion';

const BalanceSummary = ({ balances, members }) => {
  if (!balances || !members) return null;

  // THE FIX: Convert the backend Array into an easy-to-read Dictionary
  const balanceMap = {};
  if (Array.isArray(balances)) {
    balances.forEach(b => {
      const userId = b.user?._id || b.user; // Handle populated or unpopulated IDs
      if (userId) balanceMap[userId] = b.balance;
    });
  } else {
    Object.assign(balanceMap, balances); // Fallback if already an object
  }
  

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
      className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50"
    >
      <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-slate-100">Current Balances</h2>
      <div className="space-y-5">
        {members.map((member, i) => {
          
          // Use our new fixed map!
          const balance = balanceMap[member._id] || 0;
          const isOwed = balance >= 0;
          
          if (Math.abs(balance) < 0.01) return null; 
          
          return (
            <motion.div 
              key={member._id} 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
              className="flex justify-between items-center pb-4 border-b border-slate-50 dark:border-slate-700/50 last:border-0 last:pb-0"
            >
              <span className="font-medium text-slate-700 dark:text-slate-200">{member.name}</span>
              <div className="text-right">
                <span className={`block font-black text-lg ${isOwed ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                  ₹{Math.abs(balance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {isOwed ? 'Gets back' : 'Owes'}
                </span>
              </div>
            </motion.div>
          );
        })}
        
        {members.every(m => Math.abs(balanceMap[m._id] || 0) < 0.01) && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-slate-400 dark:text-slate-500 text-sm font-medium text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl"
          >
            🎉 Everyone is settled up!
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default BalanceSummary;