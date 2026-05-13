import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  description: { type: String, required: true }, 
  amount: { type: Number, required: true },
  
  // NEW: Tells us if this is a normal expense or someone paying someone back
  type: { type: String, enum: ['expense', 'settlement'], default: 'expense' }, 
  
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // NEW: Upgraded to track the EXACT amount each person owes
  splitAmong: [{ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amountOwed: { type: Number, required: true }
  }],
  
  receiptImage: { type: String },
}, { timestamps: true });

export default mongoose.model('Expense', expenseSchema);