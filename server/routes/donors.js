const express = require('express');
const router = express.Router();
const Donor = require('../models/Donor');

router.post('/', async (req, res) => {
  try {
    const donor = await Donor.create(req.body);
    
    if (!req.xhr) {
      return res.render('donors/register', { user: null, success: 'Donor registered successfully!', error: null, donor });
    }
    
    res.status(201).json({ success: true, data: donor });
  } catch (error) {
    if (!req.xhr) {
      return res.render('donors/register', { user: null, success: null, error: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const donors = await Donor.find().sort({ registrationDate: -1 });
    
    if (!req.xhr) {
      return res.render('donors/list', { user: null, donors });
    }
    
    res.status(200).json({ success: true, count: donors.length, data: donors });
  } catch (error) {
    if (!req.xhr) {
      return res.render('donors/list', { user: null, donors: [] });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }
    res.status(200).json({ success: true, data: donor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const donor = await Donor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }
    res.status(200).json({ success: true, data: donor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const donor = await Donor.findByIdAndDelete(req.params.id);
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }
    
    if (!req.xhr) {
      return res.redirect('/donors');
    }
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    if (!req.xhr) {
      return res.redirect('/donors');
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
