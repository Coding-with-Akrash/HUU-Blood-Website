const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'volunteer',
    });

    const token = generateToken(newUser._id);
    
    if (req.path === '/register' && !req.xhr) {
      res.cookie('token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
      return res.redirect('/home');
    }
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    if (!req.xhr) {
      return res.render('auth/signup', { error: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      if (!req.xhr) {
        return res.render('auth/login', { error: 'Please provide email and password' });
      }
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    
    const user = await User.findOne({ email });
    if (!user || !(await User.comparePassword(password, user.password))) {
      if (!req.xhr) {
        return res.render('auth/login', { error: 'Invalid credentials' });
      }
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const token = generateToken(user._id);
    
    user.lastLogin = new Date();
    await user.save();
    
    if (!req.xhr) {
      res.cookie('token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
      return res.redirect('/home');
    }
    
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    if (!req.xhr) {
      return res.render('auth/login', { error: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/home');
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
