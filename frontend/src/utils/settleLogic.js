export const calculateTransactions = (balances, members) => {
  const debtors = [];
  const creditors = [];

  members.forEach(member => {
    const balance = balances[member._id] || 0;
    // People who owe money (negative balance)
    if (balance < -0.01) debtors.push({ ...member, amount: Math.abs(balance) });
    // People who get money back (positive balance)
    if (balance > 0.01) creditors.push({ ...member, amount: balance });
  });

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions = [];
  let i = 0; 
  let j = 0; 

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    
    const settledAmount = Math.min(debtor.amount, creditor.amount);
    
    transactions.push({
      from: debtor,
      to: creditor,
      amount: Math.round(settledAmount)
    });

    debtor.amount -= settledAmount;
    creditor.amount -= settledAmount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return transactions;
};