const { createModel } = require('../config/jsonDb');
const bcrypt = require('bcryptjs');

const userSchema = {
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/ },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['admin', 'staff', 'volunteer'], default: 'volunteer' },
  phone: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
};

const User = createModel('users', userSchema);

User.comparePassword = async function (candidatePassword, hash) {
  return await bcrypt.compare(candidatePassword, hash);
};

module.exports = User;
