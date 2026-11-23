import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  groupId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Group', 
    required: true,
    index: true 
  },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  senderName: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['expense_added', 'settlement', 'cycle_archived', 'payment_reminder'], 
    default: 'expense_added' 
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  funCaption: {
    type: String,
    default: ''
  },
  amount: { 
    type: Number, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  splitCount: { 
    type: Number, 
    default: 0 
  },
  readBy: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }]
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);

