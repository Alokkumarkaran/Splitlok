import Group from '../models/Group.js';
import User from '../models/User.js'; // <-- We need the User model to update it!

// 1. Create a brand new flat
export const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    
    // Create the group 
    const group = await Group.create({
      name,
      members: [req.user._id]
    });

    // CRITICAL FIX: Save this group ID to the User's profile permanently!
    await User.findByIdAndUpdate(req.user._id, { groupId: group._id });

    res.status(201).json(group);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create group' });
  }
};

// 2. Join an existing flat using the Invite Code
export const joinGroup = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const group = await Group.findById(inviteCode);

    if (!group) {
      return res.status(404).json({ message: 'Invalid Invite Code. Flat not found.' });
    }

    // Check if user is already a member, if not, add them
    if (!group.members.includes(req.user._id)) {
      group.members.push(req.user._id);
      await group.save();
    }

    // CRITICAL FIX: Save this group ID to the User's profile permanently!
    await User.findByIdAndUpdate(req.user._id, { groupId: group._id });

    res.status(200).json(group);
  } catch (error) {
    res.status(400).json({ message: 'Invalid Invite Code format' });
  }
};