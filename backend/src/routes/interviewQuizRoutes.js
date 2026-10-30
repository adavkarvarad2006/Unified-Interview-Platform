const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const {
  startAppointmentQuiz,
  answerAppointmentQuiz,
  getAppointmentQuizResultHandler,
} = require('../controllers/interviewQuizController');

router.post('/:appointmentId/start', protect, startAppointmentQuiz);
router.post('/:appointmentId/answer', protect, answerAppointmentQuiz);
router.get(
  '/:appointmentId/result',
  protect,
  authorize('ADMIN', 'COUNSELLOR'),
  getAppointmentQuizResultHandler
);

module.exports = router;