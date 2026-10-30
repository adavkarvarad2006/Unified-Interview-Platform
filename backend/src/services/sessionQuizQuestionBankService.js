const { generateQuestions } = require('./geminiQuestionService');

const domainsBySessionType = {
  SYSTEM_DESIGN: ['System Design'],
  MOCK_INTERVIEW: ['Data Structures', 'Algorithms', 'OOP'],
  RESUME_REVIEW: ['Software Engineering', 'Git & Version Control'],
  COUNSELLING: ['Data Structures', 'Algorithms'],
};

async function generateSessionQuizQuestionBank(session) {
  const sessionType = session.sessionType || 'COUNSELLING';

  return generateQuestions({
    title: session.title || 'Interview Preparation',
    companyName: 'Interview Preparation',
    description: [
      session.description || 'General interview preparation session.',
      `Session type: ${sessionType}.`,
    ].join('\n'),
    location: 'Online',
    domainMode: 'specific',
    domains: domainsBySessionType[sessionType] || domainsBySessionType.COUNSELLING,
    questionCount: Number(session.quizQuestionCount) || 5,
    difficulty: 'easy',
    randomnessPercent: 0,
  });
}

module.exports = { generateSessionQuizQuestionBank };
