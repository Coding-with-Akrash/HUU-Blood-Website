const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Donor = require('../models/Donor');
const Drive = require('../models/Drive');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect, async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments(),
      totalDonors: await Donor.countDocuments(),
      totalDrives: await Drive.countDocuments(),
      activeDrives: await Drive.countDocuments({ status: 'Active' }),
      completedDrives: await Drive.countDocuments({ status: 'Completed' }),
      donorsByBloodGroup: await Donor.aggregate([
        { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      drivesByType: await Drive.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    };
    
    if (!req.xhr) {
      return res.render('admin/dashboard', { user: req.user, stats });
    }
    
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    if (!req.xhr) {
      return res.render('admin/dashboard', { user: req.user, stats: null });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/users', protect, async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/users/:id', protect, async (req, res) => {
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
});

router.delete('/users/:id', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/notifications', protect, async (req, res) => {
  try {
    req.body.sender = req.user ? req.user.id : null;
    
    let recipients = [];
    if (req.body.targetAudience === 'all') {
      const users = await User.find({}, '_id');
      recipients = users.map(u => u._id);
    }
    
    req.body.recipients = recipients;
    
    const notification = await Notification.create(req.body);
    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/notifications', protect, async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('sender', 'name email')
      .populate('relatedDrive', 'name type')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
