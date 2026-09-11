const Drive = require('../models/Drive');

exports.createDrive = async (req, res) => {
  try {
    req.body.organizer = req.user.id;
    const drive = await Drive.create(req.body);
    res.status(201).json({ success: true, data: drive });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDrives = async (req, res) => {
  try {
    const drives = await Drive.find().populate('organizer', 'name email');
    res.status(200).json({ success: true, count: drives.length, data: drives });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDrive = async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id).populate('organizer', 'name email');
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }
    res.status(200).json({ success: true, data: drive });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateDrive = async (req, res) => {
  try {
    const drive = await Drive.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('organizer', 'name email');
    
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }
    res.status(200).json({ success: true, data: drive });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteDrive = async (req, res) => {
  try {
    const drive = await Drive.findByIdAndDelete(req.params.id);
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
