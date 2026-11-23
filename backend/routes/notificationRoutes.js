import express from 'express';
import { streamNotifications, getNotifications, markNotificationsAsRead } from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// SSE Stream for real-time notifications
router.get('/stream', protect, streamNotifications);

// Fetch notification history
router.get('/', protect, getNotifications);

// Mark all as read
router.post('/mark-read', protect, markNotificationsAsRead);

export default router;

