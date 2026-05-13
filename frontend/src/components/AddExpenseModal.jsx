import React, { useState } from 'react';
import { X, Receipt, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AddExpenseModal = ({ isOpen, onClose, onSubmit }) => {
  const [form, setForm] = useState({ description: '', amount: '', image: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(form);
    setForm({ description: '', amount: '', image: null });
    setIsSubmitting(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 font-sans">
          
          {/* Backdrop Blur */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 dark:bg-[#0B1120]/80 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            // THE FIX: Prevent clicks inside the modal from closing it!
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-[#131B2F] rounded-t-[2.5rem] sm:rounded-[2.5rem] relative z-10 shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
          >
            {/* Mobile Drag Indicator */}
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-4 mb-2 sm:hidden"></div>

            <div className="p-6 sm:p-8 pt-4 sm:pt-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Add Expense</h2>
                <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Description - Floating Label */}
                <div className="relative">
                  <input 
                    required autoFocus type="text" id="description"
                    className="peer w-full pl-12 pr-4 py-4 border-b-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 placeholder-transparent bg-transparent font-medium text-lg"
                    placeholder="What was this for?"
                    value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value})}
                  />
                  <label htmlFor="description" className="absolute left-12 -top-3 text-slate-500 text-sm transition-all peer-placeholder-shown:text-lg peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-4 peer-focus:-top-3 peer-focus:text-blue-600 dark:peer-focus:text-blue-400 peer-focus:text-sm cursor-text font-medium">
                    What was this for?
                  </label>
                  <Receipt className="absolute left-2 top-4 text-slate-400 peer-focus:text-blue-600 dark:peer-focus:text-blue-400 transition-colors" size={24} />
                </div>
                
                {/* Amount - Massive Input */}
                <div className="relative pt-4">
                  <span className="absolute left-4 top-[2.2rem] text-3xl font-black text-slate-300 dark:text-slate-600">₹</span>
                  <input 
                    required type="number" min="1" step="0.01"
                    className="w-full p-6 pl-12 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 dark:focus:border-blue-500 text-slate-900 dark:text-white text-4xl font-black tracking-tighter transition-all"
                    placeholder="0"
                    value={form.amount}
                    onChange={(e) => setForm({...form, amount: e.target.value})}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-500 font-medium text-center mt-3">
                    This will be split equally among all flatmates.
                  </p>
                </div>

                <div className="pt-4 pb-6 sm:pb-0">
                  <button 
                    type="submit" disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 text-white p-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-blue-600/30 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Splitting...' : 'Split Expense'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddExpenseModal;