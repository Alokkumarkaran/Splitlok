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

    // 3. Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 4. Save the new password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error("Password Update Error:", error);
    res.status(500).json({ message: "Server error while updating password." });
  }
};