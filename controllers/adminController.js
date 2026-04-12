import User from '../models/User.js';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Create user
export const createUser = async (req, res) => {
  try {
    const { name, email, phoneNumber, designation, firebaseUid, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { firebaseUid }, { phoneNumber }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email, UID or phone' });
    }

    const newUser = new User({
      name,
      email,
      phoneNumber,
      designation,
      role: role || 'user',
      firebaseUid: firebaseUid || `manual_${Date.now()}`, // Temporary UID if not provided
      isProfileComplete: true
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: 'Error creating user', error: error.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: 'Error updating user', error: error.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// Get Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const userCount = await User.countDocuments({ role: 'user' });
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');

    // Calculate growth (mocked for now as we don't have historical data)
    const growth = 12.5; 

    res.status(200).json({
      totalUsers,
      adminCount,
      userCount,
      recentUsers,
      growth
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};
