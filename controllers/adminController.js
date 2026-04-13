import User from '../models/User.js';
import Business from '../models/Business.js';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get all businesses for these users
    const userIds = users.map(u => u._id);
    const businesses = await Business.find({ userId: { $in: userIds } }).populate('industryId').lean();
    
    const businessMap = {};
    businesses.forEach(b => {
      businessMap[b.userId.toString()] = b;
    });

    const usersWithBusiness = users.map(user => ({
      ...user,
      business: businessMap[user._id.toString()] || null
    }));

    res.status(200).json({
      users: usersWithBusiness,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      totalUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Create user
export const createUser = async (req, res) => {
  try {
    const { email, firebaseUid, phoneNumber, role, businessName, industryId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { firebaseUid }, { phoneNumber }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email, UID or phone' });
    }

    const newUser = new User({
      ...req.body,
      role: role || 'user',
      firebaseUid: firebaseUid || `manual_${Date.now()}`,
      isProfileComplete: true
    });

    await newUser.save();

    // Create business if info provided
    if (businessName && industryId) {
      await Business.create({
        userId: newUser._id,
        businessName,
        industryId,
        logoUrl: req.body.logoUrl || '',
        contactPhone: req.body.contactPhone || phoneNumber
      });
    }

    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: 'Error creating user', error: error.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { businessName, industryId, logoUrl, contactPhone } = req.body;

    const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update or create business
    if (businessName || industryId) {
      let business = await Business.findOne({ userId: id });
      if (business) {
        if (businessName) business.businessName = businessName;
        if (industryId) business.industryId = industryId;
        if (logoUrl !== undefined) business.logoUrl = logoUrl;
        if (contactPhone !== undefined) business.contactPhone = contactPhone;
        await business.save();
      } else {
        await Business.create({
          userId: id,
          businessName: businessName || 'My Business',
          industryId,
          logoUrl: logoUrl || '',
          contactPhone: contactPhone || req.body.phoneNumber || ''
        });
      }
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
    console.log(error);
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};
