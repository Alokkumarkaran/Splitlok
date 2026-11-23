import Notification from '../models/Notification.js';
import Group from '../models/Group.js';

// In-memory active SSE connections mapped by groupId
// groupId -> Set of response objects
const sseClientsByGroup = new Map();

/**
 * Broadcast an event to all connected members of a flat
 */
export const broadcastToFlat = (groupId, eventType, payload) => {
  if (!groupId) return;
  const targetId = groupId.toString();
  const clients = sseClientsByGroup.get(targetId);

  if (clients && clients.size > 0) {
    const data = JSON.stringify({ event: eventType, data: payload, timestamp: new Date().toISOString() });
    clients.forEach((clientRes) => {
      try {
        clientRes.write(`data: ${data}\n\n`);
      } catch (err) {
        console.error('Error broadcasting to SSE client:', err);
      }
    });
  }
};

/**
 * SSE Stream endpoint: /api/notifications/stream
 * Connects flat members to real-time updates
 */
export const streamNotifications = async (req, res) => {
  const user = req.user;
  const groupId = user?.groupId?.toString();

  if (!groupId) {
    return res.status(400).json({ message: 'User does not belong to any flat' });
  }

  // Set SSE Headers while preserving Express CORS headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Flush initial connection packet
  res.write(`data: ${JSON.stringify({ event: 'connected', message: 'Real-time flat notifications connected' })}\n\n`);

  // Register client
  if (!sseClientsByGroup.has(groupId)) {
    sseClientsByGroup.set(groupId, new Set());
  }
  const groupClients = sseClientsByGroup.get(groupId);
  groupClients.add(res);

  // Send keepalive ping every 25 seconds to keep proxies/mobile sockets alive
  const keepAliveInterval = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch (e) {
      clearInterval(keepAliveInterval);
    }
  }, 25000);

  // Clean up on disconnect
  req.on('close', () => {
    clearInterval(keepAliveInterval);
    groupClients.delete(res);
    if (groupClients.size === 0) {
      sseClientsByGroup.delete(groupId);
    }
  });
};

/**
 * Get notification history for the user's flat
 */
export const getNotifications = async (req, res) => {
  try {
    const groupId = req.user.groupId;
    if (!groupId) {
      return res.status(200).json({ notifications: [], unreadCount: 0 });
    }

    const notifications = await Notification.find({ groupId })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate('sender', 'name email upiId');

    const userIdStr = req.user._id.toString();
    const unreadCount = notifications.filter(
      (n) => !n.readBy.some((id) => id.toString() === userIdStr)
    ).length;

    res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

/**
 * Mark notifications as read for the logged in user
 */
export const markNotificationsAsRead = async (req, res) => {
  try {
    const groupId = req.user.groupId;
    const userId = req.user._id;

    if (!groupId) {
      return res.status(200).json({ message: 'No flat associated' });
    }

    await Notification.updateMany(
      { groupId, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ message: 'Failed to mark notifications as read' });
  }
};

