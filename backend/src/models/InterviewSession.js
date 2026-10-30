const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: { type: [String], required: true, validate: (items) => items.length === 4 },
    correctOptionIndex: { type: Number, required: true, min: 0, max: 3 },
    explanation: { type: String, required: true },
    domain: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  },
  { _id: false }
);

const interviewSessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide session title'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide session description']
    },
    duration: {
      type: Number,
      required: [true, 'Please provide duration in minutes'],
      enum: [15, 30, 45, 60],
      default: 15
    },
    quizQuestionCount: {
      type: Number,
      enum: [3, 5, 10],
      default: 5,
    },
    // Keep the generated bank with the session so candidate quiz start is fast.
    // It is excluded from normal queries and therefore never sent to candidates.
    quizQuestionBank: {
      type: [quizQuestionSchema],
      default: undefined,
      select: false,
    },
    sessionType: {
      type: String,
      required: [true, 'Please provide session type'],
      enum: ['COUNSELLING', 'MOCK_INTERVIEW', 'RESUME_REVIEW', 'SYSTEM_DESIGN'],
      default: 'COUNSELLING'
    },
    calendlyEventUrl: {
      type: String,
      required: [true, 'Please provide Calendly Event URL'],
      trim: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE'
    },
    badge: {
      type: String,
      default: 'Most Popular'
    },
    features: [
      {
        type: String
      }
    ],
    displayOrder: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
