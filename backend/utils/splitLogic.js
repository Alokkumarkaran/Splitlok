export const calculateBalances = (members, expenses) => {
  const balances = {};

  // 1. Initialize everyone's balance to 0
  members.forEach(m => {
    if (m && m._id) balances[m._id.toString()] = 0;
  });

  expenses.forEach(exp => {
    // CRASH PROTECTION: Safely skip corrupted data
    if (!exp.splitAmong || exp.splitAmong.length === 0) return;

    // 2. The person who paid gets credit (+)
    // Handle both populated objects { _id: "..." } and raw string IDs
    const payerId = exp.paidBy?._id || exp.paidBy; 
    
    if (payerId && balances[payerId.toString()] !== undefined) {
      balances[payerId.toString()] += Number(exp.amount);
    }

    // 3. Everyone in the split gets a debit (-)
    exp.splitAmong.forEach(split => {
      // Because we upgraded the backend, 'split' is now an object: { user: ID, amountOwed: 33.34 }
      const userId = split.user?._id || split.user;
      
      if (userId && balances[userId.toString()] !== undefined) {
        // USE THE EXACT PENNY-PERFECT AMOUNT FROM THE DATABASE!
        balances[userId.toString()] -= Number(split.amountOwed);
      }
    });
  });

  return balances;
};