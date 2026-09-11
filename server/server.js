const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const { init } = require('./config/jsonDb');
const authRoutes = require('./routes/auth');
const donorRoutes = require('./routes/donors');
const driveRoutes = require('./routes/drives');
const adminRoutes = require('./routes/admin');
const { protect } = require('./middleware/auth');
const User = require('./models/User');
const Donor = require('./models/Donor');
const Drive = require('./models/Drive');

const app = express();

init();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/drives', driveRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => res.redirect('/home'));

app.get('/home', protect, async (req, res) => {
  try {
    const [drives] = await Promise.all([
      Drive.find({ status: 'Active' }).sort({ createdAt: -1 }).limit(6),
    ]);
    const stats = {
      totalDonors: await Donor.countDocuments(),
      totalDrives: await Drive.countDocuments(),
      activeDrives: await Drive.countDocuments({ status: 'Active' }),
      completedDrives: await Drive.countDocuments({ status: 'Completed' }),
    };
    res.render('home', { user: req.user, drives, stats });
  } catch (error) {
    res.render('home', { user: req.user, drives: [], stats: null });
  }
});

app.get('/login', protect, (req, res) => {
  if (req.user) return res.redirect('/home');
  res.render('auth/login', { error: null });
});

app.get('/signup', protect, (req, res) => {
  if (req.user) return res.redirect('/home');
  res.render('auth/signup', { error: null });
});

app.get('/donor/register', protect, (req, res) => {
  res.render('donors/register', { user: req.user, success: null, error: null });
});

app.get('/donors', protect, async (req, res) => {
  try {
    const donors = await Donor.find().sort({ registrationDate: -1 });
    res.render('donors/list', { user: req.user, donors });
  } catch (error) {
    res.render('donors/list', { user: req.user, donors: [] });
  }
});

app.get('/drives', protect, async (req, res) => {
  try {
    const drives = await Drive.find().sort({ createdAt: -1 });
    res.render('drives/list', { user: req.user, drives });
  } catch (error) {
    res.render('drives/list', { user: req.user, drives: [] });
  }
});

app.get('/drives/create', protect, (req, res) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
    res.render('drives/form', { user: req.user, drive: null, error: null });
  } else {
    res.redirect('/drives');
  }
});

app.get('/admin/dashboard', protect, async (req, res) => {
  try {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'staff')) {
      return res.redirect('/home');
    }
    
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
    res.render('admin/dashboard', { user: req.user, stats });
  } catch (error) {
    res.render('admin/dashboard', { user: req.user, stats: null });
  }
});

const startServer = async () => {
  init();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`Frontend: http://localhost:${PORT}`);
    console.log(`API: http://localhost:${PORT}/api`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = app;
