import express from 'express';
import { createGroup, joinGroup } from '../controllers/groupController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Both routes require the user to be logged in
router.post('/', protect, createGroup);
router.post('/join', protect, joinGroup);

export default router;