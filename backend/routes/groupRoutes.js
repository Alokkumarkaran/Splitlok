import express from 'express';
// 1. ADD startNewCycle TO YOUR IMPORTS
import { createGroup, joinGroup, startNewCycle } from '../controllers/groupController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Both routes require the user to be logged in
router.post('/', protect, createGroup);
router.post('/join', protect, joinGroup);

// 2. ADD THE ARCHIVE ROUTE HERE
router.post('/:id/archive', protect, startNewCycle);

export default router;