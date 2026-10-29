const express = require('express');
const router = express.Router();
const {
  createPlacementHandler,
  generateAiQuizHandler,
  listHostPlacementsHandler,
  listPlacementApplicantsHandler,
  listPublicPlacementsHandler,
  getPublicPlacementHandler,
  registerCandidateHandler,
} = require('../controllers/placementController');
const { protect, optionalProtect, authorize } = require('../middleware/auth');

// Public & on-demand AI quiz endpoints
router.post('/generate-ai-quiz', optionalProtect, generateAiQuizHandler);
router.get('/', listPublicPlacementsHandler);
router.get('/mine', protect, authorize('ADMIN', 'COUNSELLOR'), listHostPlacementsHandler);
router.get('/:placementId/applicants', protect, authorize('ADMIN', 'COUNSELLOR'), listPlacementApplicantsHandler);
router.get('/:placementId', getPublicPlacementHandler);

// Protected endpoints
router.post('/', protect, authorize('ADMIN', 'COUNSELLOR'), createPlacementHandler);
router.post('/:placementId/register', protect, registerCandidateHandler);

module.exports = router;

