import Expense from '../models/Expense.js';
import Group from '../models/Group.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { broadcastToFlat } from './notificationController.js';
import { getRandomExpenseMessage, getRandomSettlementMessage, getRandomReminderMessage } from '../utils/hinglishNotifications.js';
import webpush from 'web-push';
import dotenv from 'dotenv';
dotenv.config();

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:notifications@splitlok.app',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

/**
 * Send a Web Push notification to a flat member and prune expired subscriptions.
 */
const sendPushToMember = async (member, payloadObj) => {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return;
  if (!member?.pushSubscriptions?.length) return;

  const payload = JSON.stringify(payloadObj);
  const expiredEndpoints = [];

  await Promise.all(
    member.pushSubscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(sub, payload);
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          expiredEndpoints.push(sub.endpoint);
        } else {
          console.error('Push notification failed to send:', err.message);
        }
      }
    })
  );

  if (expiredEndpoints.length > 0) {
    await User.findByIdAndUpdate(member._id, {
      $pull: { pushSubscriptions: { endpoint: { $in: expiredEndpoints } } }
    });
  }
};

// ==========================================
// 1. ADD EXPENSE (Penny-Perfect Algorithm)
// ==========================================
export const addExpense = async (req, res) => {
  try {
    const { groupId, description, splitAmong } = req.body;
    const amount = parseFloat(req.body.amount);
    const paidBy = req.user._id; 

    // Verify group exists and user is a member
    const existingGroup = await Group.findById(groupId);
    if (!existingGroup) return res.status(404).json({ message: 'Flat not found' });
    const isMember = existingGroup.members.some(m => m.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied. You are not a member of this flat.' });
    }
    
    // 1. Dynamic Member Check
    let membersToSplit = typeof splitAmong === 'string' ? JSON.parse(splitAmong) : splitAmong;
    const numPeople = membersToSplit.length;

    // 2. Penny-Perfect Split Calculation
    const baseSplit = Math.floor((amount / numPeople) * 100) / 100;
    let remainder = Math.round((amount - (baseSplit * numPeople)) * 100) / 100;

    const exactSplits = membersToSplit.map(userId => {
      let share = baseSplit;
      if (remainder > 0) {
        share = Math.round((share + 0.01) * 100) / 100;
        remainder = Math.round((remainder - 0.01) * 100) / 100;
      }
      return { user: userId, amountOwed: share };
    });

    // 3. Save Expense Record ONLY
    const expense = await Expense.create({
      groupId, 
      description, 
      amount, 
      paidBy, 
      splitAmong: exactSplits,
      receiptImage: req.file ? req.file.path : null 
    });

    const populatedExpense = await Expense.findById(expense._id)
      .populate('paidBy', 'name email upiId') // <-- ADDED upiId
      .populate('splitAmong.user', 'name email upiId'); // <-- ADDED upiId

    // --- IN-APP REAL-TIME NOTIFICATION BROADCAST ---
    try {
      const generalHinglish = getRandomExpenseMessage({
        payerName: req.user.name,
        expenseName: description,
        memberShare: exactSplits[0]?.amountOwed || (amount / numPeople),
        totalAmount: amount
      });

      // 1. Save Notification record in database with Hinglish metadata
      const notification = await Notification.create({
        groupId,
        sender: req.user._id,
        senderName: req.user.name,
        type: 'expense_added',
        amount,
        description,
        splitCount: numPeople,
        title: generalHinglish.title,
        message: generalHinglish.body,
        funCaption: generalHinglish.funCaption,
        readBy: [req.user._id]
      });

      // 2. Broadcast instant popup payload to all connected flatmates
      broadcastToFlat(groupId, 'expense_added', {
        _id: notification._id,
        senderId: req.user._id,
        senderName: req.user.name,
        amount,
        description,
        splitCount: numPeople,
        createdAt: notification.createdAt,
        type: 'expense_added',
        title: generalHinglish.title,
        funCaption: generalHinglish.funCaption,
        message: generalHinglish.body
      });
    } catch (notifErr) {
      console.error("Error creating/broadcasting in-app notification:", notifErr);
    }
    // ------------------------------------------------

    // --- PUSH NOTIFICATION LOGIC (Personalized per Flat Member with Dynamic Hinglish) ---
    try {
      const group = await Group.findById(groupId).populate('members');
      if (group && group.members) {
        const splitMap = new Map(
          exactSplits.map(s => [s.user.toString(), s.amountOwed])
        );

        const membersToNotify = group.members.filter(
          member => member._id.toString() !== req.user._id.toString()
        );

        await Promise.all(
          membersToNotify.map(member => {
            const memberShare = splitMap.get(member._id.toString()) || (amount / numPeople);
            
            // Generate unique, hilarious Hinglish message per flatmate!
            const memberHinglish = getRandomExpenseMessage({
              payerName: req.user.name,
              expenseName: description,
              memberShare,
              totalAmount: amount
            });

            return sendPushToMember(member, {
              title: memberHinglish.title,
              body: memberHinglish.body,
              icon: '/Splitlok-192x192.png',
              badge: '/Splitlok-192x192.png',
              tag: `expense-${expense._id}`,
              url: '/',
              meta: {
                expenseId: expense._id,
                senderName: req.user.name,
                amount,
                description
              }
            });
          })
        );
      }
    } catch (pushError) {
      console.error("Error sending push notifications:", pushError);
    }
    // --------------------------------------------------------------

    res.status(201).json({ expense: populatedExpense });
  } catch (error) {
    console.error("Add Expense Error:", error);
    res.status(500).json({ message: "Failed to calculate split" });
  }
};

// ==========================================
// 2. SETTLE UP (The Continuous Ledger)
// ==========================================
export const settleUp = async (req, res) => {
  try {
    const { groupId, receiverId, amount } = req.body;
    const settleAmount = parseFloat(amount);
    const payerId = req.user._id; // Person clicking the button is paying

    // Save Settlement Record ONLY
    const payment = await Expense.create({
      groupId,
      description: "Settled Up 💸",
      amount: settleAmount,
      type: 'settlement',
      paidBy: payerId,
      splitAmong: [{ user: receiverId, amountOwed: settleAmount }]
    });

    const populatedPayment = await Expense.findById(payment._id)
      .populate('paidBy', 'name email upiId') // <-- ADDED upiId
      .populate('splitAmong.user', 'name email upiId'); // <-- ADDED upiId

    // Broadcast in-app notification & push to receiver with Dynamic Hinglish
    try {
      const group = await Group.findById(groupId);
      const settleHinglish = getRandomSettlementMessage({
        payerName: req.user.name,
        amount: settleAmount,
        flatName: group?.name
      });

      const notification = await Notification.create({
        groupId,
        sender: payerId,
        senderName: req.user.name,
        type: 'settlement',
        amount: settleAmount,
        description: 'Settled Up 💸',
        title: settleHinglish.title,
        message: settleHinglish.body,
        funCaption: settleHinglish.funCaption,
        readBy: [payerId]
      });

      broadcastToFlat(groupId, 'settlement_recorded', {
        _id: notification._id,
        senderId: payerId,
        senderName: req.user.name,
        amount: settleAmount,
        description: 'Settled Up 💸',
        type: 'settlement',
        createdAt: notification.createdAt,
        title: settleHinglish.title,
        funCaption: settleHinglish.funCaption,
        message: settleHinglish.body
      });

      const receiver = await User.findById(receiverId);
      if (receiver && group) {
        await sendPushToMember(receiver, {
          title: settleHinglish.title,
          body: settleHinglish.body,
          icon: '/Splitlok-192x192.png',
          badge: '/Splitlok-192x192.png',
          tag: `settle-${payment._id}`,
          url: '/'
        });
      }
    } catch (notifErr) {
      console.error("Error creating/sending settlement notification:", notifErr);
    }

    res.status(200).json({ payment: populatedPayment });
  } catch (error) {
    console.error("Settle Error:", error);
    res.status(500).json({ message: "Failed to settle up" });
  }
};

// ==========================================
// 3. SEND PAYMENT REMINDER (Ninja Technique 🥷)
// ==========================================
export const sendReminder = async (req, res) => {
  try {
    const { groupId, debtorId, amount } = req.body;
    const creditorId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Flat not found" });

    const debtor = await User.findById(debtorId);
    if (!debtor) return res.status(404).json({ message: "Flatmate not found" });

    const reminderMsg = getRandomReminderMessage({
      creditorName: req.user.name,
      amount,
      flatName: group.name
    });

    // 1. Save Notification
    const notification = await Notification.create({
      groupId,
      sender: creditorId,
      senderName: req.user.name,
      type: 'payment_reminder',
      amount: parseFloat(amount),
      description: 'Payment Reminder 🥷',
      title: reminderMsg.title,
      message: reminderMsg.body,
      funCaption: reminderMsg.funCaption,
      readBy: [creditorId]
    });

    // 2. Broadcast via SSE for in-app popup
    broadcastToFlat(groupId, 'payment_reminder', {
      _id: notification._id,
      senderId: creditorId,
      senderName: req.user.name,
      targetUserId: debtorId,
      amount: parseFloat(amount),
      title: reminderMsg.title,
      funCaption: reminderMsg.funCaption,
      message: reminderMsg.body,
      createdAt: notification.createdAt,
      type: 'payment_reminder'
    });

    // 3. OS Web Push directly to debtor's phone
    await sendPushToMember(debtor, {
      title: reminderMsg.title,
      body: reminderMsg.body,
      icon: '/Splitlok-192x192.png',
      badge: '/Splitlok-192x192.png',
      tag: `remind-${creditorId}-${Date.now()}`,
      url: '/'
    });

    res.status(200).json({ message: `Poke sent to ${debtor.name}! 🥷` });
  } catch (err) {
    console.error("Reminder error:", err);
    res.status(500).json({ message: "Failed to send reminder" });
  }
};

// ==========================================
// 4. GET DASHBOARD DATA
// ==========================================
export const getGroupData = async (req, res) => {
  try {
    const groupId = req.params.groupId || req.params.id; 
    
    // FETCH GROUP & MEMBERS
    const group = await Group.findById(groupId).populate('members', 'name email upiId'); // <-- ADDED upiId
    if (!group) return res.status(404).json({ message: 'Flat not found' });

    // Authorization: User must be a member of the flat
    const isMember = group.members.some(m => m && m._id && m._id.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied. You are not a member of this flat.' });
    }

    // Fetch ONLY ACTIVE expenses
    const expenses = await Expense.find({ groupId, isArchived: false })
      .populate('paidBy', 'name email upiId') // <-- ADDED upiId
      .populate('splitAmong.user', 'name email upiId') // <-- ADDED upiId
      .sort({ createdAt: -1 });

    // DYNAMIC BALANCE ENGINE (Null-Safe Version)
    const balanceMap = {};
    
    group.members.forEach(member => {
      if (member && member._id) {
        balanceMap[member._id.toString()] = { user: member, balance: 0 };
      }
    });

    expenses.forEach(exp => {
      if (!exp.paidBy || !exp.paidBy._id) return; 
      
      const payerId = exp.paidBy._id.toString();

      if (balanceMap[payerId]) {
        balanceMap[payerId].balance += exp.amount;
      }

      if (Array.isArray(exp.splitAmong)) {
        exp.splitAmong.forEach(split => {
          if (split.user && split.user._id) {
            const splitUserId = split.user._id.toString();
            if (balanceMap[splitUserId]) {
              balanceMap[splitUserId].balance -= split.amountOwed;
            }
          }
        });
      }
    });

    const balances = Object.values(balanceMap);
    
    // Fetch Archived Expenses
    const archivedExpenses = await Expense.find({ groupId, isArchived: true })
      .populate('paidBy', 'name email upiId') // <-- ADDED upiId
      .sort({ createdAt: -1 });

    res.status(200).json({ group, expenses, archivedExpenses, balances });
  } catch (error) {
    console.error("CRITICAL ERROR IN getGroupData:", error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};