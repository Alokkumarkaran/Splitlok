import React, { useState } from 'react';
import { Receipt, CheckCircle, Users, Image as ImageIcon, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ExpenseCard = ({ expense, members, index }) => {
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // 1. Resolve Payer Name Safely
  const payer = expense.paidBy?.name || 
                members.find(m => m._id === (expense.paidBy?._id || expense.paidBy))?.name || 
                'Unknown';

  // 2. Determine if this is a Settlement or Normal Expense
  const isSettlement = expense.type === 'settlement';
  
  // 3. Dynamic Styling based on Type
  const IconCmp = isSettlement ? CheckCircle : Receipt;
  const iconColorClass = isSettlement 
    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20'
    : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20';
  
  const amountColorClass = isSettlement
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-slate-800 dark:text-white';

  const splitCount = expense.splitAmong?.length || 0;
  const hasReceipt = !!expense.receiptImage;

  const getReceiptUrl = (imgPath) => {
    if (!imgPath) return '';
    if (imgPath.startsWith('http')) return imgPath;
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
    const cleanPath = imgPath.replace(/\\/g, '/');
    return `${baseUrl}/${cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath}`;
  };

  return (
    <>
      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ delay: index * 0.05, type: "spring", stiffness: 200, damping: 20 }}
        whileTap={{ scale: 0.98 }}
        className="group flex items-center p-4 sm:p-5 bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-700/80 cursor-pointer transition-all hover:border-indigo-200 dark:hover:border-indigo-500/30 relative overflow-hidden"
      >
        {/* Decorative left border accent on hover */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity ${isSettlement ? 'bg-emerald-500' : 'bg-indigo-500'}`} />

        {/* ICON */}
        <div className={`p-3.5 sm:p-4 rounded-2xl mr-4 sm:mr-5 transition-colors flex-shrink-0 ${iconColorClass}`}>
          <IconCmp size={24} className={isSettlement ? 'stroke-[2.5px]' : 'stroke-2'} />
        </div>

        {/* DETAILS */}
        <div className="flex-1 min-w-0 pr-2">
          <h4 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 truncate">
            {expense.description}
          </h4>
          
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex-shrink-0">
              {isSettlement ? 'Paid by' : 'Paid by'} <span className="font-bold text-slate-700 dark:text-slate-200">{payer}</span>
            </p>
            
            {/* Metadata Badges */}
            {!isSettlement && (
              <div className="flex items-center gap-2">
                <span className="hidden sm:flex items-center text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  <Users size={12} className="mr-1" /> {splitCount} {splitCount === 1 ? 'person' : 'people'}
                </span>
                
                {hasReceipt && (
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowReceiptModal(true);
                    }}
                    className="flex items-center text-[10px] sm:text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 px-2 py-0.5 rounded-md transition-colors"
                  >
                    <ImageIcon size={12} className="mr-1" /> View Receipt
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* AMOUNT & DATE */}
        <div className="text-right flex-shrink-0">
          <div className={`font-black text-xl sm:text-2xl tracking-tight ${amountColorClass}`}>
            ₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-bold mt-1 uppercase tracking-wider">
            {new Date(expense.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
          </div>
        </div>
      </motion.div>

      {/* Receipt Image Lightbox Modal */}
      <AnimatePresence>
        {showReceiptModal && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReceiptModal(false)}
              className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md cursor-pointer"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white dark:bg-[#131b2e] rounded-3xl p-5 max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 z-10 overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                <div className="min-w-0 pr-2">
                  <h3 className="font-black text-slate-800 dark:text-white text-base truncate">
                    {expense.description}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    ₹{expense.amount.toLocaleString('en-IN')} • Paid by {payer}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <a
                    href={getReceiptUrl(expense.receiptImage)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-cyan-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Open full image in new tab"
                  >
                    <ExternalLink size={18} />
                  </a>
                  <button
                    onClick={() => setShowReceiptModal(false)}
                    className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900/60 p-2">
                <img
                  src={getReceiptUrl(expense.receiptImage)}
                  alt={`Receipt for ${expense.description}`}
                  className="max-h-[60vh] w-auto max-w-full rounded-xl object-contain shadow-sm"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ExpenseCard;