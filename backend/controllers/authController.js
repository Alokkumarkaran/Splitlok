import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const registerUser = async (req, res) => {
  const { name, email, password, upiId } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) return res.status(400).json({ message: 'User already exists' });

  const user = await User.create({ name, email, password, upiId });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      upiId: user.upiId,
      groupId: user.groupId, // <-- CRITICAL FIX: Tells the frontend if they have a flat
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      upiId: user.upiId,
      groupId: user.groupId, // <-- CRITICAL FIX: Remembers the flat on login!
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};