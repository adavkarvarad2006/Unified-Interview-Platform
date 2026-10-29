const mongoose = require('mongoose');
const { z } = require('zod');
const {
  listCandidateApplications,
  startQuiz,
  submitQuizAnswer
} = require('../services/applicationService');

const answerSchema = z.object({
  questionIndex: z.number().int().min(0).max(49),
  selectedOptionIndex: z.number().int().min(0).max(3),
});

function validateApplicationId(applicationId, res) {
  if (!mongoose.isValidObjectId(applicationId)) {
    res.status(400).json({ success: false, message: 'Invalid application id' });
    return false;
  }
  return true;
}

async function listCandidateApplicationsHandler(req, res) {
  try {
    const userId = req.user.id || req.user._id;
    const applications = await listCandidateApplications(userId);
    res.json({ success: true, applications });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function startQuizHandler(req, res) {
  try {
    if (!validateApplicationId(req.params.applicationId, res)) return;
    const userId = req.user.id || req.user._id;
    const session = await startQuiz(req.params.applicationId, userId);
    res.json({ success: true, ...session });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function submitQuizAnswerHandler(req, res) {
  try {
    if (!validateApplicationId(req.params.applicationId, res)) return;
    const result = answerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error.issues[0]?.message || 'Invalid answer' });
    }

    const userId = req.user.id || req.user._id;
    const response = await submitQuizAnswer(
      req.params.applicationId,
      userId,
      result.data.questionIndex,
      result.data.selectedOptionIndex,
    );
    res.json({ success: true, ...response });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

module.exports = {
  listCandidateApplicationsHandler,
  startQuizHandler,
  submitQuizAnswerHandler,
};

