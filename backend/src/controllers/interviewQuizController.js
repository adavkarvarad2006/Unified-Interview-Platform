const mongoose = require('mongoose');
const {
  getOrStartAppointmentQuiz,
  submitAppointmentQuizAnswer,
  getAppointmentQuizResult,
} = require('../services/interviewQuizService');

function validAppointmentId(appointmentId, res) {
  if (!mongoose.isValidObjectId(appointmentId)) {
    res.status(400).json({
      success: false,
      message: 'Invalid appointment id',
    });
    return false;
  }

  return true;
}

async function startAppointmentQuiz(req, res) {
  try {
    if (!validAppointmentId(req.params.appointmentId, res)) return;

    const result = await getOrStartAppointmentQuiz(
      req.params.appointmentId,
      req.user
    );

    res.json({ success: true, ...result });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
}

async function answerAppointmentQuiz(req, res) {
  try {
    if (!validAppointmentId(req.params.appointmentId, res)) return;

    const { questionIndex, selectedOptionIndex } = req.body || {};

    if (!Number.isInteger(questionIndex) || questionIndex < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question index',
      });
    }

    if (
      !Number.isInteger(selectedOptionIndex) ||
      selectedOptionIndex < 0 ||
      selectedOptionIndex > 3
    ) {
      return res.status(400).json({
        success: false,
        message: 'Select a valid answer',
      });
    }

    const result = await submitAppointmentQuizAnswer(
      req.params.appointmentId,
      req.user,
      questionIndex,
      selectedOptionIndex
    );

    res.json({ success: true, ...result });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getAppointmentQuizResultHandler(req, res) {
  try {
    if (!validAppointmentId(req.params.appointmentId, res)) return;

    const result = await getAppointmentQuizResult(req.params.appointmentId);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  startAppointmentQuiz,
  answerAppointmentQuiz,
  getAppointmentQuizResultHandler,
};