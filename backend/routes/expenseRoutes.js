import express from 'express';
import { addExpense, getGroupData, settleUp, sendReminder } from '../controllers/expenseController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/', protect, upload.single('image'), addExpense);

// This routes the frontend settlement button to your new controller!
router.post('/settle', protect, settleUp); 

// Payment reminder (Ninja technique poke!)
router.post('/remind', protect, sendReminder);

router.get('/:groupId', protect, getGroupData);

export default router;