const { createModel } = require('../config/jsonDb');

const notificationSchema = {
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'success', 'warning', 'urgent', 'announcement'], default: 'info' },
  targetAudience: { type: String, enum: ['all', 'donors', 'volunteers', 'admins', 'specific'], default: 'all' },
  recipients: Array,
  sender: { type: String, required: true },
  relatedDrive: String,
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  isRead: Array,
  isSent: { type: Boolean, default: false },
  sentAt: Date,
  expiresAt: Date,
};

module.exports = createModel('notifications', notificationSchema);
