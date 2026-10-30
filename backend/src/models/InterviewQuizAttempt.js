const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctOptionIndex: { type: Number, required: true, min: 0, max: 3 },
    explanation: { type: String, required: true },
    domain: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
  },
  { _id: false }
);

const answerSchema = new mongoose.Schema(
  {
    questionPoolIndex: { type: Number, required: true },
    selectedOptionIndex: { type: Number, required: true, min: 0, max: 3 },
    isCorrect: { type: Boolean, required: true },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    answeredAt: { type: Date, required: true },
  },
  { _id: false }
);

const interviewQuizAttemptSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      unique: true,
      index: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    questionCount: {
      type: Number,
      enum: [3, 5, 10],
      required: true,
    },
    questionBank: { type: [questionSchema], required: true },
    questionOrder: { type: [Number], default: [] },
    currentQuestionIndex: { type: Number, default: 0 },
    answers: { type: [answerSchema], default: [] },
    score: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'in_progress',
    },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  'InterviewQuizAttempt',
  interviewQuizAttemptSchema
);