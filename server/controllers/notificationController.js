const Notification = require('../models/Notification');
const User = require('../models/User');

exports.createNotification = async (req, res) => {
  try {
    req.body.sender = req.user.id;

    let recipients = [];
    if (req.body.targetAudience === 'all') {
      const users = await User.find({}, '_id');
      recipients = users.map(u => u._id);
    } else if (req.body.targetAudience === 'donors') {
      const donors = await User.find({ role: 'donor' }, '_id');
      recipients = donors.map(u => u._id);
    } else if (req.body.targetAudience === 'volunteers') {
      const volunteers = await User.find({ role: 'volunteer' }, '_id');
      recipients = volunteers.map(u => u._id);
    }

    req.body.recipients = recipients;

    const notification = await Notification.create(req.body);
    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('sender', 'name email')
      .populate('relatedDrive', 'name type')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
