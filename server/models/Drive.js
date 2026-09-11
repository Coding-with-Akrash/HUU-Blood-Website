const { createModel } = require('../config/jsonDb');

const driveSchema = {
  name: { type: String, required: true, trim: true },
  type: { type: String, required: true, enum: ['Blood Donation', 'Plantation', 'Rashan', 'Rozgar', 'Ghaza', 'Education', 'Health', 'Other'] },
  description: { type: String, required: true },
  location: {
    venue: { type: String, required: true },
    city: { type: String, required: true },
    state: String,
    country: { type: String, default: 'India' },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },
  date: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  time: {
    startTime: String,
    endTime: String,
  },
  organizer: { type: String, required: true },
  volunteers: Array,
  maxParticipants: { type: Number, default: 100 },
  registeredParticipants: { type: Number, default: 0 },
  status: { type: String, enum: ['Planning', 'Active', 'Completed', 'Cancelled'], default: 'Planning' },
  requirements: Array,
  budget: {
    total: { type: Number, default: 0 },
    spent: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
  },
  outcomes: {
    beneficiaries: { type: Number, default: 0 },
    itemsDistributed: { type: Number, default: 0 },
    notes: String,
  },
  images: Array,
  contactPerson: {
    name: String,
    phone: String,
    email: String,
  },
  isPublic: { type: Boolean, default: true },
};

module.exports = createModel('drives', driveSchema);
