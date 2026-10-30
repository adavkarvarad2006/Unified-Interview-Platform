const test = require('node:test');
const assert = require('node:assert/strict');
const { generateQuestions } = require('../src/services/geminiQuestionService');
const { generateSessionQuizQuestionBank } = require('../src/services/sessionQuizQuestionBankService');

test('uses only the configured Gemini model and one Flash-Lite fallback', async () => {
  const previousModel = process.env.GEMINI_MODEL;
  process.env.GEMINI_MODEL = 'gemini-3.8-flash';
  const modelsUsed = [];
  const questions = ['easy', 'medium', 'hard'].flatMap((difficulty) => [0, 1].map((index) => ({
    question: `A valid ${difficulty} question number ${index} about algorithms?`,
    options: ['First option', 'Second option', 'Third option', 'Fourth option'],
    correctOptionIndex: 1,
    explanation: 'The second option is correct for this generated test question.',
    domain: 'Algorithms',
    difficulty,
  })));
  const client = {
    models: {
      async generateContent({ model }) {
        modelsUsed.push(model);
        if (modelsUsed.length === 1) {
          const error = new Error('temporary Gemini outage');
          error.status = 503;
          throw error;
        }
        return { text: JSON.stringify({ questions }) };
      },
    },
  };

  try {
    const result = await generateQuestions({
      title: 'Backend Engineer',
      companyName: 'Test Company',
      description: 'A test role focused on algorithms and software development.',
      location: 'Online',
      domainMode: 'specific',
      domains: ['Algorithms'],
      questionCount: 2,
      difficulty: 'easy',
      randomnessPercent: 0,
    }, client);

    assert.equal(result.length, 6);
    assert.deepEqual(modelsUsed, ['gemini-3.8-flash', 'gemini-3.5-flash-lite']);
  } finally {
    if (previousModel === undefined) delete process.env.GEMINI_MODEL;
    else process.env.GEMINI_MODEL = previousModel;
  }
});

test('generates and validates three difficulty tiers for a session before quiz start', async () => {
  const previousApiKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  try {
    const questionBank = await generateSessionQuizQuestionBank({
      title: 'Resume Review',
      description: 'Review a candidate resume and discuss software engineering experience.',
      sessionType: 'RESUME_REVIEW',
      quizQuestionCount: 3,
    });

    assert.equal(questionBank.length, 9);
    assert.deepEqual(
      ['easy', 'medium', 'hard'].map((difficulty) =>
        questionBank.filter((question) => question.difficulty === difficulty).length
      ),
      [3, 3, 3]
    );
    assert.ok(questionBank.every((question) =>
      ['Software Engineering', 'Git & Version Control'].includes(question.domain)
    ));
    assert.ok(questionBank.every((question) =>
      question.options.length === 4 && Number.isInteger(question.correctOptionIndex)
    ));
  } finally {
    if (previousApiKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousApiKey;
  }
});
