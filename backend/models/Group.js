import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // Tracks who is owed money (+) and who owes money (-)
  balances: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    balance: { type: Number, default: 0 } 
  }]
}, { timestamps: true });

export default mongoose.model('Group', groupSchema);