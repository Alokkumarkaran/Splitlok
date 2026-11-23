import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// ==========================================
// 1. UPDATE USER PROFILE (Name, Email, UPI)
// ==========================================
export const updateProfile = async (req, res) => {
  try {
    const { name, email, upiId } = req.body;
    const userId = req.user._id;

    // Optional: Check if the new email is already taken by someone else
    if (email !== req.user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email is already in use by another account." });
      }
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, upiId },
      { new: true, runValidators: true } // Returns the updated document
    ).select('-password'); // Never send the password back!

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: "Server error while updating profile." });
  }
};

// ==========================================
// 2. UPDATE USER PASSWORD
// ==========================================
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // 1. Get the user from the DB (we need the password field this time)
    const user = await User.findById(userId);

    // 2. Verify the current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password." });
    }

    // 3. Save the new password (pre('save') hook handles hashing)
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error("Password Update Error:", error);
    res.status(500).json({ message: "Server error while updating password." });
  }
};

// ==========================================
// 3. SUBSCRIBE TO PUSH NOTIFICATIONS
// ==========================================
export const subscribeToPush = async (req, res) => {
  try {
    const subscription = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Check if this exact subscription already exists
    const exists = user.pushSubscriptions.some(sub => sub.endpoint === subscription.endpoint);
    if (!exists) {
      user.pushSubscriptions.push(subscription);
      await user.save();
    }

    res.status(201).json({ message: "Successfully subscribed to push notifications." });
  } catch (error) {
    console.error("Push Subscription Error:", error);
    res.status(500).json({ message: "Server error during push subscription." });
  }
};

// ==========================================
// 4. UNSUBSCRIBE FROM PUSH NOTIFICATIONS
// ==========================================
export const unsubscribeToPush = async (req, res) => {
  try {
    const { endpoint } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.pushSubscriptions = user.pushSubscriptions.filter(sub => sub.endpoint !== endpoint);
    await user.save();

    res.status(200).json({ message: "Successfully unsubscribed." });
  } catch (error) {
    console.error("Push Unsubscription Error:", error);
    res.status(500).json({ message: "Server error during push unsubscription." });
  }
};