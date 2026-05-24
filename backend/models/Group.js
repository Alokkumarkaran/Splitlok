import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // NEW: Keeps track of who has permission to wipe the flat
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] 
  
}, { timestamps: true });

export default mongoose.model('Group', groupSchema);