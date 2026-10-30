const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const { timeToMinutes, checkOverlaps, calculateGaps } = require('../src/utils/scheduleUtils');
const { DailySummaryGenerator, DetailedSummaryGenerator } = require('../src/services/summaryGenerators');
const InMemoryStore = require('../src/services/inMemoryStore');
const { difficultyIndex, updateDomainDifficulty, selectNextQuestion } = require('../src/services/adaptiveQuestionService');
const { generateQuestions } = require('../src/services/geminiQuestionService');
const { createSession } = require('../src/controllers/sessionController');
const { getOrStartAppointmentQuiz } = require('../src/services/interviewQuizService');

// Models
const User = require('../src/models/User');
const Student = require('../src/models/Student');
const Counsellor = require('../src/models/Counsellor');
const InterviewSession = require('../src/models/InterviewSession');
const Appointment = require('../src/models/Appointment');
const InterviewQuizAttempt = require('../src/models/InterviewQuizAttempt');
const Trainer = require('../src/models/Trainer');
const TrainingSession = require('../src/models/TrainingSession');
const { Placement } = require('../src/models/Placement');
const Application = require('../src/models/Application');

test.before(async () => {
  const rawUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/interview_counselling_db';
  const mongoUri = rawUri.replace('localhost', '127.0.0.1');
  await mongoose.connect(mongoUri);
});

test.after(async () => {
  await mongoose.disconnect();
});

test.describe('1. Unified User & Authentication Model Compatibility', () => {
  test('Admin user exists and password matches', async () => {
    const admin = await User.findOne({ email: 'parkavi.a@msrit.edu' }).select('+password');
    assert.ok(admin, 'Admin user should exist in database');
    assert.strictEqual(admin.role, 'ADMIN');
    assert.strictEqual(admin.fullName, 'Dr. Parkavi A.', 'Virtual fullName should match name');

    const matches = await admin.matchPassword('Password123!');
    assert.strictEqual(matches, true, 'Password match should succeed');
  });

  test('Student user exists and has student profile', async () => {
    const student = await User.findOne({ email: 'emily.watson@gmail.com' });
    assert.ok(student, 'Student user should exist');
    assert.strictEqual(student.role, 'STUDENT');

    const studentProfile = await Student.findOne({ userId: student._id });
    assert.ok(studentProfile, 'Student profile document should be linked');
    assert.ok(studentProfile.targetCompanies.length > 0);
  });
});

test.describe('2. Interview Booking Core Module', () => {
  test('15-min and 30-min official interview sessions exist', async () => {
    const sessions = await InterviewSession.find({ status: 'ACTIVE' }).sort({ duration: 1 });
    assert.strictEqual(sessions.length >= 2, true);

    const durations = sessions.map(s => s.duration);
    assert.ok(durations.includes(15), 'Should include 15-min counseling session');
    assert.ok(durations.includes(30), 'Should include 30-min mock interview session');
  });

  test('Appointments link student and session', async () => {
    const appointments = await Appointment.find();
    assert.ok(appointments.length > 0, 'Should have seeded appointments');
    assert.ok(appointments[0].studentEmail, 'Appointment should have studentEmail');
  });

  test('Session creation stores its question bank and quiz start reuses it', async () => {
    const previousApiKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = '';
    let sessionId;
    let appointmentId;

    try {
      const student = await User.findOne({ email: 'emily.watson@gmail.com' });
      assert.ok(student, 'Seeded student should exist for the quiz smoke test');

      const response = {
        statusCode: 200,
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; },
      };

      await createSession({
        body: {
          title: 'Pre-generated quiz smoke test',
          description: 'A test interview session for validating cached adaptive questions.',
          duration: 15,
          sessionType: 'MOCK_INTERVIEW',
          calendlyEventUrl: 'https://example.test/events/quiz-smoke-test',
          quizQuestionCount: 3,
        },
      }, response);

      assert.equal(response.statusCode, 201);
      assert.ok(response.body.success);
      assert.equal(Object.hasOwn(response.body.data, 'quizQuestionBank'), false);
      sessionId = response.body.data._id;

      const session = await InterviewSession.findById(sessionId).select('+quizQuestionBank');
      assert.equal(session.quizQuestionBank.length, 9);

      const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const appointment = await Appointment.create({
        studentId: student._id,
        sessionId,
        calendlyEventId: `quiz-smoke-event-${suffix}`,
        calendlyInviteeId: `quiz-smoke-invitee-${suffix}`,
        date: '2026-10-30',
        startTime: '10:00',
        endTime: '10:15',
        duration: 15,
        studentName: student.name,
        studentEmail: student.email,
        sessionTitle: session.title,
        sessionType: session.sessionType,
      });
      appointmentId = appointment._id;

      const started = await getOrStartAppointmentQuiz(String(appointmentId), {
        id: String(student._id),
        email: student.email,
      });
      assert.equal(started.completed, false);
      assert.equal(started.question.difficulty, 'easy');
      assert.equal(started.question.totalQuestions, 3);
      assert.ok(session.quizQuestionBank.some((question) =>
        question.question === started.question.question && question.difficulty === 'easy'
      ));

      const attempt = await InterviewQuizAttempt.findOne({ appointment: appointmentId });
      assert.equal(attempt.questionBank.length, 9);
    } finally {
      if (appointmentId) {
        await InterviewQuizAttempt.deleteOne({ appointment: appointmentId });
        await Appointment.findByIdAndDelete(appointmentId);
      }
      if (sessionId) await InterviewSession.findByIdAndDelete(sessionId);
      if (previousApiKey === undefined) delete process.env.GEMINI_API_KEY;
      else process.env.GEMINI_API_KEY = previousApiKey;
    }
  });
});

test.describe('3. SmartRoute Placement & Adaptive AI Quiz Module', () => {
  test('Question bank generator generates balanced questions by difficulty', async () => {
    const questions = await generateQuestions({
      title: 'Unit Test Placement',
      companyName: 'Test Corp',
      description: 'Test placement description with more than twenty characters for validation.',
      location: 'Bengaluru',
      domainMode: 'specific',
      domains: ['Data Structures', 'Algorithms'],
      questionCount: 3,
      difficulty: 'medium',
      randomnessPercent: 20,
    });

    assert.strictEqual(questions.length, 9, '3 questions * 3 difficulty levels = 9 in pool');
    const easyCount = questions.filter(q => q.difficulty === 'easy').length;
    const medCount = questions.filter(q => q.difficulty === 'medium').length;
    const hardCount = questions.filter(q => q.difficulty === 'hard').length;
    assert.strictEqual(easyCount, 3);
    assert.strictEqual(medCount, 3);
    assert.strictEqual(hardCount, 3);
  });

  test('Adaptive algorithm adjusts level based on candidate correctness', () => {
    // Current level 1 (medium), correct answer -> increase level
    const nextLevelCorrect = updateDomainDifficulty(1, true, 0);
    assert.strictEqual(nextLevelCorrect, 2, 'Correct answer should promote to level 2 (hard)');

    // Current level 1, incorrect answer -> decrease level
    const nextLevelWrong = updateDomainDifficulty(1, false, 0);
    assert.strictEqual(nextLevelWrong, 0, 'Wrong answer should drop to level 0 (easy)');
  });

  test('Seeded Google placement and Emily Watson application exist', async () => {
    const placement = await Placement.findOne({ companyName: 'Google' });
    assert.ok(placement, 'Google placement should exist');
    assert.strictEqual(placement.questionCount, 5);

    const student = await User.findOne({ email: 'emily.watson@gmail.com' });
    const app = await Application.findOne({ placement: placement._id, candidate: student._id });
    assert.ok(app, 'Emily Watson should be registered for Google placement');
  });
});

test.describe('4. TrainDesk Training Operations Module', () => {
  test('Trainer profiles exist in database', async () => {
    const trainers = await Trainer.find();
    assert.strictEqual(trainers.length >= 3, true, 'At least 3 trainers should exist');
  });

  test('Training sessions exist with valid capacity and timings', async () => {
    const sessions = await TrainingSession.find();
    assert.ok(sessions.length >= 20, 'Should have at least 20 training sessions');
    assert.ok(sessions[0].capacity > 0);
    assert.ok(sessions[0].startTime);
    assert.ok(sessions[0].endTime);
  });

  test('DailySummaryGenerator computes stats, timeline blocks, and overlaps', () => {
    const mockSessions = [
      {
        sessionId: 'test-1',
        topic: 'Session A',
        startTime: '10:00',
        endTime: '11:30',
        capacity: 20,
        confirmedCount: 15,
        room: 'Lab 1',
      },
      {
        sessionId: 'test-2',
        topic: 'Session B',
        startTime: '11:00',
        endTime: '12:30',
        capacity: 20,
        confirmedCount: 12,
        room: 'Lab 2',
      }
    ];

    const summary = DailySummaryGenerator.generate({
      sessions: mockSessions,
      date: new Date(),
      dayOffset: 0,
      trainer: { name: 'Dr. Parkavi' }
    });

    assert.strictEqual(summary.stats[0].value, 2, 'Should count 2 sessions');
    assert.strictEqual(summary.clashesCount, 1, '10:00-11:30 and 11:00-12:30 should produce 1 clash');
    assert.strictEqual(summary.timeline.blocks.length, 2);
  });

  test('InMemoryStore provides standalone fallback when needed', () => {
    const dash = InMemoryStore.getDashboardSchedule('t1', 0);
    assert.strictEqual(dash.success, true);
    assert.ok(dash.sessions.length > 0);
    assert.ok(dash.weekStrip.length === 7);

    const heat = InMemoryStore.getHeatmapSchedule('t1');
    assert.strictEqual(heat.success, true);
    assert.strictEqual(heat.matrix.length, 7);
  });
});

