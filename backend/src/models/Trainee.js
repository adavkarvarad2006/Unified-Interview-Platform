const mongoose = require('mongoose');
const Person = require('./Person');

const traineeSchema = new mongoose.Schema({
  traineeId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  organization: {
    type: String,
    required: true,
    trim: true,
  },
});

const Trainee = Person.discriminators?.Trainee || Person.discriminator('Trainee', traineeSchema);

module.exports = Trainee;

