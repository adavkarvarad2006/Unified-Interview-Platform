const express = require('express');
const router = express.Router();
const {
  createPlacementHandler,
  generateAiQuizHandler,
  generateMockInterviewQuestionHandler,
  evaluateMockInterviewResponseHandler,
  downloadAssessmentReportPdfHandler,
  listHostPlacementsHandler,
  listPlacementApplicantsHandler,
  listPublicPlacementsHandler,
  getPublicPlacementHandler,
  registerCandidateHandler,
} = require('../controllers/placementController');
const { protect, optionalProtect, authorize } = require('../middleware/auth');

// Public & on-demand AI quiz & mock interviewer endpoints
router.post('/generate-ai-quiz', optionalProtect, generateAiQuizHandler);
router.post('/mock-interview/question', optionalProtect, generateMockInterviewQuestionHandler);
router.post('/mock-interview/evaluate', optionalProtect, evaluateMockInterviewResponseHandler);
router.post('/download-report-pdf', optionalProtect, downloadAssessmentReportPdfHandler);
router.get('/', listPublicPlacementsHandler);
router.get('/mine', protect, authorize('ADMIN', 'COUNSELLOR'), listHostPlacementsHandler);
router.get('/:placementId/applicants', protect, authorize('ADMIN', 'COUNSELLOR'), listPlacementApplicantsHandler);
router.get('/:placementId', getPublicPlacementHandler);

// Protected endpoints
router.post('/', protect, authorize('ADMIN', 'COUNSELLOR'), createPlacementHandler);
router.post('/:placementId/register', protect, registerCandidateHandler);

module.exports = router;

