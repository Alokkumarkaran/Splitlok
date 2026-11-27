/**
 * Splitlok Premium Fintech & Witty Flatmate Notification Engine
 * Combines high-engagement flatmate banter with clean, dynamic one-liners and elevated Splitlok branding.
 * Punchy, hilarious, transparent, and penny-perfect.
 */

/**
 * 1. When an Expense is Added
 */
export const getRandomExpenseMessage = ({ payerName, expenseName, memberShare, totalAmount }) => {
  const formattedShare = Number(memberShare || totalAmount).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  const formattedTotal = Number(totalAmount).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  const templates = [
    {
      title: "Splitlok • Kharcha Alert! 💸",
      body: `${payerName} spent ₹${formattedTotal} on '${expenseName}'. Tera hissa ₹${formattedShare} banta hai — QR code dhoondo jaldi! 🏃‍♂️`,
      funCaption: "No 'kal pakka dunga' • Penny-perfect split"
    },
    {
      title: "Splitlok • Bill Split 🧾",
      body: `${payerName} logged '${expenseName}' (₹${formattedTotal}) • Pocket se ₹${formattedShare} nikaalo bhai, dosti safe rahegi! 🤝`,
      funCaption: "Continuous ledger math updated"
    },
    {
      title: "Splitlok • New Expense Logged 🍕",
      body: `'${expenseName}' added by ${payerName} (₹${formattedTotal}) • Your share is ₹${formattedShare}. Wallet ne chupchaap aansu bahaye! 🥲`,
      funCaption: "Zero rounding errors, guaranteed"
    },
    {
      title: "Splitlok • Flat Damage Report 📉",
      body: `${payerName} split ₹${formattedTotal} for '${expenseName}'. Your share: ₹${formattedShare}. Party chalu, balance update chalu! 🎉`,
      funCaption: "Keeping flat karma 100% clean"
    },
    {
      title: "Splitlok • Ledger Ping ⚡",
      body: `${payerName} paid ₹${formattedTotal} on '${expenseName}'. You owe ₹${formattedShare} — settle up before chai talks turn serious! ☕`,
      funCaption: "Instant flat ledger sync active"
    }
  ];

  return templates[Math.floor(Math.random() * templates.length)];
};

/**
 * 2. Payment Reminders (Friendly Nudge)
 */
export const getRandomReminderMessage = ({ creditorName, amount, flatName }) => {
  const formattedAmount = Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  const templates = [
    {
      title: "Splitlok • Friendly Poke ⏳",
      body: `${creditorName} is poking you for ₹${formattedAmount}. "Kal pakka dunga" trick purani ho gayi, aaj settle kar de! 😜`,
      funCaption: "1-tap UPI settlement ready"
    },
    {
      title: "Splitlok • Settle Up Call 📲",
      body: `${creditorName} wants ₹${formattedAmount} back. Settle button dabao aur tension-free ho jao! 🕊️💸`,
      funCaption: "Keep flat friendships sweet & clean"
    },
    {
      title: "Splitlok • Tareekh Pe Tareekh! ⚖️",
      body: `${creditorName} requested ₹${formattedAmount} for flat expenses. Sunny Deol banne se pehle pay kar do bhai! 🔨😤`,
      funCaption: "Instant ledger settlement in 5s"
    },
    {
      title: "Splitlok • Gentle Nudge ☕",
      body: `Pending balance: ₹${formattedAmount} with ${creditorName}. Clear dues before morning chai discussion! 🤝`,
      funCaption: "Zero awkward money talks"
    }
  ];

  return templates[Math.floor(Math.random() * templates.length)];
};

/**
 * 3. When Someone Settles Up (Debt Cleared)
 */
export const getRandomSettlementMessage = ({ payerName, amount, flatName }) => {
  const formattedAmount = Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  const templates = [
    {
      title: "Splitlok • Paisa Hi Paisa! 🤑",
      body: `Miracles do happen! ${payerName} cleared ₹${formattedAmount} with you. Ledger balance 0 — aaj ki party teri taraf se? 🍕🍻`,
      funCaption: "Zero dues • All square!"
    },
    {
      title: "Splitlok • Dues Cleared ✨",
      body: `${payerName} just settled ₹${formattedAmount}. A rare sight in flatmate history — balance is officially even! 🏆`,
      funCaption: "Transaction verified & recorded"
    },
    {
      title: "Splitlok • Debt-Free Era 🕊️",
      body: `${payerName} sent ₹${formattedAmount}. Account check kar, paisa credit ho chuka hai hero! 🚀`,
      funCaption: "Continuous ledger math balanced"
    },
    {
      title: "Splitlok • All Square 🤝",
      body: `Payment of ₹${formattedAmount} confirmed by ${payerName}. Dosti bani rahe, hisaab clear rahe! 💃`,
      funCaption: "Penny-perfect zero balance"
    }
  ];

  return templates[Math.floor(Math.random() * templates.length)];
};
