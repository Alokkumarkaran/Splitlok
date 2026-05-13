import express from 'express';
import { addExpense, getGroupData } from '../controllers/expenseController.js';
import { settleUp } from '../controllers/settlementController.js'; // <-- IMPORT FROM NEW FILE
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/', protect, upload.single('image'), addExpense);

// This routes the frontend settlement button to your new controller!
router.post('/settle', protect, settleUp); 

router.get('/:groupId', protect, getGroupData);

export default router;