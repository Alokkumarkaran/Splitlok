import express from 'express';
import { updateProfile, updatePassword } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Both of these routes require the user to be logged in
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);

export default router;