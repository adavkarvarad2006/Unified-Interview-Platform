require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const InterviewSession = require('../models/InterviewSession');
const { generateSessionQuizQuestionBank } = require('../services/sessionQuizQuestionBankService');

async function backfillInterviewSessionQuizBanks() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/interview_counselling_db';
  await mongoose.connect(mongoUri);

  try {
    const sessions = await InterviewSession.find().select('+quizQuestionBank');
    let updatedCount = 0;

    for (const session of sessions) {
      const expectedSize = (Number(session.quizQuestionCount) || 5) * 3;
      if (session.quizQuestionBank?.length === expectedSize) continue;

      session.quizQuestionBank = await generateSessionQuizQuestionBank(session);
      await session.save();
      updatedCount += 1;
    }

    console.log(`[Quiz Bank Backfill] Generated banks for ${updatedCount} session(s).`);
  } finally {
    await mongoose.disconnect();
  }
}

backfillInterviewSessionQuizBanks().catch((error) => {
  console.error('[Quiz Bank Backfill] Failed:', error.message);
  process.exitCode = 1;
});
