const express = require('express');
const router = express.Router();
const Drive = require('../models/Drive');

router.post('/', async (req, res) => {
  try {
    req.body.organizer = req.body.organizer || null;
    const drive = await Drive.create(req.body);
    
    if (!req.xhr) {
      return res.redirect('/drives');
    }
    
    res.status(201).json({ success: true, data: drive });
  } catch (error) {
    if (!req.xhr) {
      return res.render('drives/form', { user: null, drive: null, error: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const drives = await Drive.find().populate('organizer', 'name email').sort({ createdAt: -1 });
    
    if (!req.xhr) {
      return res.render('drives/list', { user: null, drives });
    }
    
    res.status(200).json({ success: true, count: drives.length, data: drives });
  } catch (error) {
    if (!req.xhr) {
      return res.render('drives/list', { user: null, drives: [] });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id).populate('organizer', 'name email');
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }
    res.status(200).json({ success: true, data: drive });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
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
});

router.delete('/:id', async (req, res) => {
  try {
    const drive = await Drive.findByIdAndDelete(req.params.id);
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }
    
    if (!req.xhr) {
      return res.redirect('/drives');
    }
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    if (!req.xhr) {
      return res.redirect('/drives');
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
