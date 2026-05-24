import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  description: { type: String, required: true }, 
  amount: { type: Number, required: true },
  type: { type: String, enum: ['expense', 'settlement'], default: 'expense' }, 
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  splitAmong: [{ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amountOwed: { type: Number, required: true }
  }],
  
  receiptImage: { type: String },

  // NEW: Added for Phase 2! (Starting a new settlement cycle)
  isArchived: { type: Boolean, default: false }

}, { timestamps: true });

export default mongoose.model('Expense', expenseSchema);