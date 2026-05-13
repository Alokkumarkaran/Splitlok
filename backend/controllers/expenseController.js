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

    // 3. Save Expense Record
    const expense = await Expense.create({
      groupId, description, amount, paidBy, 
      splitAmong: exactSplits,
      receiptImage: req.file ? req.file.path : null 
    });

    // 4. THE MASTER LEDGER UPDATE
    const group = await Group.findById(groupId);

    // Ensure payer exists in balance ledger
    if (!group.balances.find(b => b.user.toString() === paidBy.toString())) {
      group.balances.push({ user: paidBy, balance: 0 });
    }

    // A. CREDIT the Payer (+)
    const payerIdx = group.balances.findIndex(b => b.user.toString() === paidBy.toString());
    group.balances[payerIdx].balance += amount;

    // B. DEBIT Everyone in the split (-)
    exactSplits.forEach(split => {
      let memberIdx = group.balances.findIndex(b => b.user.toString() === split.user.toString());
      if (memberIdx === -1) {
        group.balances.push({ user: split.user, balance: 0 });
        memberIdx = group.balances.length - 1;
      }
      group.balances[memberIdx].balance -= split.amountOwed;
    });

    // C. Clean up floating point errors (e.g., 0.000000001)
    group.balances.forEach(b => {
      b.balance = Math.round(b.balance * 100) / 100;
    });

    await group.save();

    const populatedExpense = await Expense.findById(expense._id)
      .populate('paidBy', 'name email')
      .populate('splitAmong.user', 'name email');

    res.status(201).json({ expense: populatedExpense, balances: group.balances });
  } catch (error) {
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

    const payment = await Expense.create({
      groupId,
      description: "Settled Up 💸",
      amount: settleAmount,
      type: 'settlement',
      paidBy: payerId,
      splitAmong: [{ user: receiverId, amountOwed: settleAmount }]
    });

    const group = await Group.findById(groupId);

    // Payer's balance goes UP (+)
    let payerIdx = group.balances.findIndex(b => b.user.toString() === payerId.toString());
    if (payerIdx === -1) {
      group.balances.push({ user: payerId, balance: 0 });
      payerIdx = group.balances.length - 1;
    }
    group.balances[payerIdx].balance = Math.round((group.balances[payerIdx].balance + settleAmount) * 100) / 100;

    // Receiver's balance goes DOWN (-)
    let receiverIdx = group.balances.findIndex(b => b.user.toString() === receiverId.toString());
    if (receiverIdx === -1) {
      group.balances.push({ user: receiverId, balance: 0 });
      receiverIdx = group.balances.length - 1;
    }
    group.balances[receiverIdx].balance = Math.round((group.balances[receiverIdx].balance - settleAmount) * 100) / 100;

    await group.save();

    // FIX FOR "UNKNOWN": Populate names for the settlement!
    const populatedPayment = await Expense.findById(payment._id)
      .populate('paidBy', 'name email')
      .populate('splitAmong.user', 'name email');

    res.status(200).json({ payment: populatedPayment, balances: group.balances });
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
    const group = await Group.findById(req.params.groupId)
      .populate('members', 'name email upiId')
      .populate('balances.user', 'name');

    if (!group) return res.status(404).json({ message: "Group not found" });

    // Fetch all expenses and populate the names for the UI
    const expenses = await Expense.find({ groupId: req.params.groupId })
      .sort({ createdAt: -1 })
      .populate('paidBy', 'name email upiId')
      .populate('splitAmong.user', 'name email upiId');

    res.status(200).json({ group, balances: group.balances, expenses });
  } catch (error) {
    console.error("Fetch Data Error:", error);
    res.status(500).json({ message: "Failed to fetch data" });
  }
};