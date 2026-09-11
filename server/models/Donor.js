const { createModel } = require('../config/jsonDb');

const donorSchema = {
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  bloodGroup: { type: String, required: true, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
  address: {
    street: String,
    city: String,
    state: String,
    country: { type: String, default: 'India' },
    pincode: String,
  },
  weight: { type: Number, required: true },
  medicalHistory: {
    hasDiseases: { type: Boolean, default: false },
    diseases: Array,
    lastDonation: Date,
    isEligible: { type: Boolean, default: true },
  },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String,
  },
  isVerified: { type: Boolean, default: false },
  totalDonations: { type: Number, default: 0 },
  registrationDate: { type: Date, default: Date.now },
  lastDonationDate: { type: Date },
};

module.exports = createModel('donors', donorSchema);
