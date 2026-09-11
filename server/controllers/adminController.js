const User = require('../models/User');
const Donor = require('../models/Donor');
const Drive = require('../models/Drive');
const Notification = require('../models/Notification');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDonors = await Donor.countDocuments();
    const totalDrives = await Drive.countDocuments();
    const activeDrives = await Drive.countDocuments({ status: 'Active' });
    const completedDrives = await Drive.countDocuments({ status: 'Completed' });
    
    const donorsByBloodGroup = await Donor.aggregate([
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    
    const drivesByType = await Drive.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    
    const recentDonors = await Donor.find().sort({ registrationDate: -1 }).limit(5);
    const upcomingDrives = await Drive.find({ status: 'Active' }).sort({ createdAt: -1 }).limit(5);
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalDonors,
        totalDrives,
        activeDrives,
        completedDrives,
        donorsByBloodGroup,
        drivesByType,
        recentDonors,
        upcomingDrives,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
