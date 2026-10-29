const mongoose = require('mongoose');

const personOptions = {
  discriminatorKey: 'personType',
  collection: 'people',
  timestamps: true,
};

const personSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
  },
  personOptions
);

const Person = mongoose.models.Person || mongoose.model('Person', personSchema);

module.exports = Person;

