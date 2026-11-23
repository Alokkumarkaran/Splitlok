/**
 * Dynamic, Funny & Engaging Hinglish Notification Generator
 * Curated for flatmate banter, roommate culture, and instant relatability.
 */

/**
 * 1. When an Expense is Added (Bhai pe udhaari chadh gayi 💸)
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
      title: "Bhai, kharcha ho gaya! 💸",
      body: `${payerName} just added '${expenseName}'. Tera hissa ₹${formattedShare} hai. Ambani mat ban, time pe de dena! 😜`,
      funCaption: "Ambani mat ban, time pe de dena! 💸"
    },
    {
      title: "Naya bill faada gaya hai! 🚨",
      body: `${payerName} added '${expenseName}' of ₹${formattedTotal}. Tera hissa ₹${formattedShare} banta hai. App khol aur dekh apni badhti udhaari! 📉`,
      funCaption: "App khol aur dekh apni badhti udhaari! 🚨"
    },
    {
      title: "Jeb dhili karne ka waqt aa gaya! ✂️",
      body: `You owe ${payerName} ₹${formattedShare} for '${expenseName}'. Dosti bani rahe, isliye chup-chaap check kar le! 🤝`,
      funCaption: "Dosti bani rahe, isliye check kar le! ✂️"
    },
    {
      title: "Kharcha alert! Wallets out! 💳",
      body: `${payerName} ne ₹${formattedTotal} uda diye on '${expenseName}'. Tera share: ₹${formattedShare}. QR code dhoondo jaldi! 🏃‍♂️`,
      funCaption: "QR code dhoondo jaldi! 💳"
    },
    {
      title: "Budget ka janaza nikal gaya! ⚰️😂",
      body: `${payerName} dropped ₹${formattedTotal} on '${expenseName}'. Pocket se ₹${formattedShare} nikaal bhai!`,
      funCaption: "Pocket se hissa nikaal bhai! 💸"
    }
  ];

  return templates[Math.floor(Math.random() * templates.length)];
};

/**
 * 2. Payment Reminders (Paisa nikalwane ki ninja technique 🥷)
 */
export const getRandomReminderMessage = ({ creditorName, amount, flatName }) => {
  const formattedAmount = Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  const templates = [
    {
      title: "Bhai paise kab dega? 🥺",
      body: `${creditorName} is still waiting for ₹${formattedAmount}. "Kal pakka dunga" wali trick purani ho gayi, aaj settle kar de! ⏳`,
      funCaption: '"Kal pakka dunga" wali trick purani ho gayi! 🥺'
    },
    {
      title: "Tareekh pe tareekh! ⚖️",
      body: `${creditorName} is tired of waiting for ₹${formattedAmount}. Sunny Deol banne se pehle pay kar de bhai! 🔨😤`,
      funCaption: "Sunny Deol banne se pehle pay kar de bhai! ⚖️"
    },
    {
      title: "Zinda ho ya paise leke bhaag gaye? 🏃‍♂️",
      body: `${creditorName} is poking you for ₹${formattedAmount}. Bhai izzat ka sawal hai, chup-chaap settle kar de! 🤫💸`,
      funCaption: "Bhai izzat ka sawal hai, settle kar de! 🏃‍♂️"
    },
    {
      title: "Dost dost na raha... 💔",
      body: `Agar ₹${formattedAmount} settle nahi kiye toh! ${creditorName} is waiting. Splitlok khol aur hisaab clear kar! 📲`,
      funCaption: "Splitlok khol aur hisaab clear kar! 💔"
    },
    {
      title: "Kripya dhyan dein! 📢",
      body: `${creditorName} wants ₹${formattedAmount} back. Settle button dabao aur tension free ho jao! 🕊️`,
      funCaption: "Settle dabao aur tension free ho jao! 📢"
    }
  ];

  return templates[Math.floor(Math.random() * templates.length)];
};

/**
 * 3. When Someone Settles Up (Paisa hi paisa hoga 🤑)
 */
export const getRandomSettlementMessage = ({ payerName, amount, flatName }) => {
  const formattedAmount = Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  const templates = [
    {
      title: "Paisa hi paisa hoga! 🤑",
      body: `Miracles do happen! ${payerName} ne finally tera ₹${formattedAmount} settle kar diya. Aaj ki party teri taraf se? 🍕🍻`,
      funCaption: "Miracles do happen! Aaj ki party teri taraf se? 🤑"
    },
    {
      title: "Ameeri feel ho rahi hai? 💰",
      body: `${payerName} just paid you ₹${formattedAmount}. Balance check kar le aur khushiyaan mana! 💃✨`,
      funCaption: "Balance check kar le aur khushiyaan mana! 💰"
    },
    {
      title: "Udhaari mukt bharat! 🇮🇳",
      body: `${payerName} cleared their dues of ₹${formattedAmount}. You are a little richer today, hero! 🏆`,
      funCaption: "You are a little richer today! 🇮🇳"
    },
    {
      title: "Laxmi ji aayin hain darwaaze pe! 🪔💸",
      body: `${payerName} sent ₹${formattedAmount}. Account check kar, paisa credit ho chuka hai! 🚀`,
      funCaption: "Paisa credit ho chuka hai! 🪔"
    }
  ];

  return templates[Math.floor(Math.random() * templates.length)];
};

