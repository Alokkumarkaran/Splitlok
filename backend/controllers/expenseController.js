import Expense from '../models/Expense.js';
import Group from '../models/Group.js';

// ==========================================
// 1. ADD EXPENSE (Penny-Perfect Algorithm)
// ==========================================
export const addExpense = async (req, res) => {
  try {
    const { groupId, description, splitAmong } = req.body;
    const amount = parseFloat(req.body.amount);
    const paidBy = req.user._id; 
    
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

    res.status(200).json({ payment: populatedPayment });
  } catch (error) {
    console.error("Settle Error:", error);
    res.status(500).json({ message: "Failed to settle up" });
  }
};

// ==========================================
// 3. GET DASHBOARD DATA
// ==========================================
export const getGroupData = async (req, res) => {
  try {
    const groupId = req.params.groupId || req.params.id; 
    
    // FETCH GROUP & MEMBERS
    const group = await Group.findById(groupId).populate('members', 'name email upiId'); // <-- ADDED upiId
    if (!group) return res.status(404).json({ message: 'Flat not found' });

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