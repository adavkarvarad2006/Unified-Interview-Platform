const express = require('express');
const router = express.Router();
const {
  listCandidateApplicationsHandler,
  startQuizHandler,
  submitQuizAnswerHandler,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');

router.get('/mine', protect, listCandidateApplicationsHandler);
router.post('/:applicationId/start', protect, startQuizHandler);
router.post('/:applicationId/answer', protect, submitQuizAnswerHandler);

module.exports = router;

