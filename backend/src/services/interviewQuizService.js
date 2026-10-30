const Appointment = require('../models/Appointment');
const InterviewQuizAttempt = require('../models/InterviewQuizAttempt');
const { generateQuestions } = require('./geminiQuestionService');
const {
  difficultyIndex,
  selectInitialQuestion,
  selectNextQuestion,
} = require('./adaptiveQuestionService');

function serviceError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function getUserId(user) {
  return user?.id || user?._id;
}

async function loadAppointmentForCandidate(appointmentId, user) {
  const appointment = await Appointment.findById(appointmentId).populate('sessionId');

  if (!appointment) {
    throw serviceError('Appointment not found', 404);
  }

  const userId = getUserId(user);
  const userEmail = user?.email?.toLowerCase();

  const ownsById =
    appointment.studentId &&
    String(appointment.studentId) === String(userId);

  const ownsByEmail =
    appointment.studentEmail?.toLowerCase() &&
    userEmail &&
    appointment.studentEmail.toLowerCase() === userEmail;

  if (!ownsById && !ownsByEmail) {
    throw serviceError('You cannot access this appointment quiz', 403);
  }

  return appointment;
}

function publicQuestion(attempt) {
  const poolIndex = attempt.questionOrder[attempt.currentQuestionIndex];
  const question = attempt.questionBank[poolIndex];

  if (!question) {
    throw serviceError('Current quiz question was not found', 500);
  }

  return {
    questionNumber: attempt.currentQuestionIndex + 1,
    totalQuestions: attempt.questionCount,
    question: question.question,
    options: question.options,
    domain: question.domain,
    difficulty: question.difficulty,
  };
}

function buildResults(attempt) {
  return attempt.answers.map((answer, index) => {
    const question = attempt.questionBank[answer.questionPoolIndex];

    return {
      questionNumber: index + 1,
      question: question.question,
      options: question.options,
      difficulty: answer.difficulty,
      selectedOptionIndex: answer.selectedOptionIndex,
      correctOptionIndex: question.correctOptionIndex,
      isCorrect: answer.isCorrect,
      explanation: question.explanation,
    };
  });
}

function completedPayload(attempt) {
  return {
    completed: true,
    status: attempt.status,
    score: attempt.score,
    totalQuestions: attempt.questionCount,
    results: buildResults(attempt),
  };
}

async function getOrStartAppointmentQuiz(appointmentId, user) {
  const appointment = await loadAppointmentForCandidate(appointmentId, user);

  let attempt = await InterviewQuizAttempt.findOne({
    appointment: appointment._id,
  });

  if (attempt) {
    if (attempt.status === 'completed') {
      return completedPayload(attempt);
    }

    return {
      completed: false,
      status: attempt.status,
      score: attempt.score,
      question: publicQuestion(attempt),
    };
  }

  const questionCount = appointment.sessionId?.quizQuestionCount || 5;

  const domainsBySessionType = {
    SYSTEM_DESIGN: ['System Design'],
    MOCK_INTERVIEW: ['Data Structures', 'Algorithms', 'OOP'],
    RESUME_REVIEW: ['Software Engineering', 'Git & Version Control'],
    COUNSELLING: ['Data Structures', 'Algorithms'],
  };

  const domains =
    domainsBySessionType[appointment.sessionType] ||
    domainsBySessionType.COUNSELLING;

  // generateQuestions creates questionCount questions at each difficulty:
  // questionCount easy, questionCount medium, and questionCount hard.
  const questionBank = await generateQuestions({
    title: appointment.sessionTitle,
    companyName: 'Interview Preparation',
    description: `Generate interview practice questions for a ${appointment.sessionType || 'general'} session.`,
    location: 'Online',
    domainMode: 'specific',
    domains,
    questionCount,
    difficulty: 'easy',
    randomnessPercent: 0,
  });

  const firstQuestionIndex = selectInitialQuestion(questionBank, 'easy');

  try {
    attempt = await InterviewQuizAttempt.create({
      appointment: appointment._id,
      candidate: getUserId(user),
      questionCount,
      questionBank,
      questionOrder: [firstQuestionIndex],
      currentQuestionIndex: 0,
      status: 'in_progress',
    });
  } catch (error) {
    // If two start requests arrive together, return the attempt that won the race.
    if (error.code === 11000) {
      attempt = await InterviewQuizAttempt.findOne({
        appointment: appointment._id,
      });
    } else {
      throw error;
    }
  }

  if (!attempt) {
    throw serviceError('Could not start the quiz', 500);
  }

  if (attempt.status === 'completed') {
    return completedPayload(attempt);
  }

  return {
    completed: false,
    status: attempt.status,
    score: attempt.score,
    question: publicQuestion(attempt),
  };
}

async function submitAppointmentQuizAnswer(
  appointmentId,
  user,
  questionIndex,
  selectedOptionIndex
) {
  const appointment = await loadAppointmentForCandidate(appointmentId, user);
  const attempt = await InterviewQuizAttempt.findOne({
    appointment: appointment._id,
  });

  if (!attempt) {
    throw serviceError('Quiz has not been started', 404);
  }

  if (attempt.status !== 'in_progress') {
    throw serviceError('This quiz is already complete', 409);
  }

  if (attempt.currentQuestionIndex !== questionIndex) {
    throw serviceError('This question is no longer current', 409);
  }

  if (!Number.isInteger(selectedOptionIndex) ||
      selectedOptionIndex < 0 ||
      selectedOptionIndex > 3) {
    throw serviceError('Select a valid answer', 400);
  }

  const poolIndex = attempt.questionOrder[attempt.currentQuestionIndex];
  const question = attempt.questionBank[poolIndex];
  const isCorrect = selectedOptionIndex === question.correctOptionIndex;

  attempt.answers.push({
    questionPoolIndex: poolIndex,
    selectedOptionIndex,
    isCorrect,
    difficulty: question.difficulty,
    answeredAt: new Date(),
  });

  if (isCorrect) {
    attempt.score += 1;
  }

  if (attempt.answers.length >= attempt.questionCount) {
    attempt.status = 'completed';
    attempt.completedAt = new Date();
    await attempt.save();

    return {
      isCorrect,
      correctOptionIndex: question.correctOptionIndex,
      explanation: question.explanation,
      ...completedPayload(attempt),
    };
  }

  const currentLevel = difficultyIndex(question.difficulty);
  const nextLevel = Math.max(
    0,
    Math.min(2, currentLevel + (isCorrect ? 1 : -1))
  );

  const usedIndexes = attempt.questionOrder.map(Number);
  const nextPoolIndex = selectNextQuestion(
    attempt.questionBank,
    usedIndexes,
    question.domain,
    nextLevel
  );

  attempt.questionOrder.push(nextPoolIndex);
  attempt.currentQuestionIndex += 1;
  await attempt.save();

  return {
    isCorrect,
    correctOptionIndex: question.correctOptionIndex,
    explanation: question.explanation,
    score: attempt.score,
    totalQuestions: attempt.questionCount,
    completed: false,
    nextQuestion: publicQuestion(attempt),
  };
}

async function getAppointmentQuizResult(appointmentId) {
  const attempt = await InterviewQuizAttempt.findOne({
    appointment: appointmentId,
  });

  if (!attempt) {
    throw serviceError('No quiz attempt found for this appointment', 404);
  }

  return completedPayload(attempt);
}

async function getQuizSummaryMap(appointmentIds) {
  const attempts = await InterviewQuizAttempt.find({
    appointment: { $in: appointmentIds },
  })
    .select('appointment status score questionCount completedAt')
    .lean();

  return Object.fromEntries(
    attempts.map((attempt) => [
      String(attempt.appointment),
      {
        status: attempt.status,
        score: attempt.score,
        questionCount: attempt.questionCount,
        completedAt: attempt.completedAt,
      },
    ])
  );
}

module.exports = {
  getOrStartAppointmentQuiz,
  submitAppointmentQuizAnswer,
  getAppointmentQuizResult,
  getQuizSummaryMap,
};
