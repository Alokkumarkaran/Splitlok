import Expense from '../models/Expense.js';
import Group from '../models/Group.js';

// ==========================================
// SETTLE UP (The Continuous Ledger)
// ==========================================
export const settleUp = async (req, res) => {
  try {
    const { groupId, receiverId, amount } = req.body;
    const settleAmount = parseFloat(amount);
    
    // The person currently logged in is the one paying the debt
    const payerId = req.user._id; 

    // 1. Record this as a special 'settlement' expense
    const payment = await Expense.create({
      groupId,
      description: "Settled Up 💸",
      amount: settleAmount,
      type: 'settlement', // Distinguishes it from a normal bill
      paidBy: payerId,
      splitAmong: [{ user: receiverId, amountOwed: settleAmount }]
    });

    // 2. Update the Master Ledger
    const group = await Group.findById(groupId);

    // Payer's balance goes UP (+) towards zero
    let payerIdx = group.balances.findIndex(b => b.user.toString() === payerId.toString());
    if (payerIdx !== -1) {
      group.balances[payerIdx].balance = Math.round((group.balances[payerIdx].balance + settleAmount) * 100) / 100;
    }

    // Receiver's balance goes DOWN (-) towards zero
    let receiverIdx = group.balances.findIndex(b => b.user.toString() === receiverId.toString());
    if (receiverIdx !== -1) {
      group.balances[receiverIdx].balance = Math.round((group.balances[receiverIdx].balance - settleAmount) * 100) / 100;
    }

    await group.save();

    // 3. Populate names for the UI
    const populatedPayment = await Expense.findById(payment._id)
      .populate('paidBy', 'name email')
      .populate('splitAmong.user', 'name email');

    res.status(200).json({ payment: populatedPayment, balances: group.balances });
  } catch (error) {
    console.error("Settle Error:", error);
    res.status(500).json({ message: "Failed to settle up" });
  }
};