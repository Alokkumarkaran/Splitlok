import Group from '../models/Group.js';
import User from '../models/User.js';
import Expense from '../models/Expense.js'; // <-- Needed to fetch the bills!

// 1. Create a brand new flat
export const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    const group = await Group.create({
      name,
      members: [req.user._id],
      admins: [req.user._id] // <-- NEW: Make the creator the Admin!
    });
    await User.findByIdAndUpdate(req.user._id, { groupId: group._id });
    res.status(201).json(group);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create group' });
  }
};

// 2. Join an existing flat
export const joinGroup = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const group = await Group.findById(inviteCode);

    if (!group) {
      return res.status(404).json({ message: 'Invalid Invite Code. Flat not found.' });
    }

    if (!group.members.includes(req.user._id)) {
      group.members.push(req.user._id);
      await group.save();
    }

    await User.findByIdAndUpdate(req.user._id, { groupId: group._id });
    res.status(200).json(group);
  } catch (error) {
    res.status(400).json({ message: 'Invalid Invite Code format' });
  }
};

// 3. THE MAGIC: Fetch Flat Data & Calculate Balances Dynamically
export const getGroupData = async (req, res) => {
  try {
    const groupId = req.params.id;
    
    // Fetch the group and members
    const group = await Group.findById(groupId).populate('members', 'name email');
    if (!group) return res.status(404).json({ message: 'Flat not found' });

    // Fetch ONLY ACTIVE expenses (ignores archived ones for the new cycle)
    const expenses = await Expense.find({ groupId, isArchived: false })
      .populate('paidBy', 'name email')
      .populate('splitAmong.user', 'name email')
      .sort({ createdAt: -1 });

    // ----------------------------------------------------
    // DYNAMIC BALANCE ENGINE (Null-Safe Version)
    // ----------------------------------------------------
    const balanceMap = {};
    
    // Initialize everyone at ₹0 (Added safety check to prevent crashes!)
    group.members.forEach(member => {
      if (member && member._id) {
        balanceMap[member._id.toString()] = { user: member, balance: 0 };
      }
    });

    // Run the math on every active expense
    expenses.forEach(exp => {
      // Safety check: ensure the payer actually exists before doing math
      if (!exp.paidBy || !exp.paidBy._id) return; 
      
      const payerId = exp.paidBy._id.toString();

      // The person who paid gets a POSITIVE balance (they are owed money)
      if (balanceMap[payerId]) {
        balanceMap[payerId].balance += exp.amount;
      }

      // Everyone involved gets a NEGATIVE balance subtracted from them (they owe money)
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

    // Convert our map back into an array for the frontend
    const balances = Object.values(balanceMap);

    // If you added the archive feature, don't forget to send those too!
    const archivedExpenses = await Expense.find({ groupId, isArchived: true }).populate('paidBy', 'name email').sort({ createdAt: -1 });

    res.status(200).json({ group, expenses, archivedExpenses, balances });
  } catch (error) {
    // THIS WILL TELL YOU EXACTLY WHAT WENT WRONG IN YOUR TERMINAL
    console.error("CRITICAL ERROR IN getGroupData:", error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
// 4. Archive current expenses to start a fresh cycle
export const startNewCycle = async (req, res) => {
  try {
    const groupId = req.params.id;
    const group = await Group.findById(groupId);

    // 🚨 SECURITY CHECK: Ensure the logged-in user is an Admin
    if (!group.admins.includes(req.user._id)) {
      return res.status(403).json({ message: "Access Denied. Only Flat Admins can start a new cycle." });
    }
    
    // Find all active expenses for this flat and mark them as archived
    await Expense.updateMany(
      { groupId: groupId, isArchived: false },
      { $set: { isArchived: true } }
    );

    res.status(200).json({ message: "New cycle started successfully!" });
  } catch (error) {
    console.error("Error archiving cycle:", error);
    res.status(500).json({ message: "Failed to start new cycle." });
  }
};