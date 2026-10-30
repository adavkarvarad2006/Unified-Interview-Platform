const { z } = require('zod');
const mongoose = require('mongoose');
const { placementDomains } = require('../models/Placement');
const {
  createPlacement,
  getPublicPlacement,
  listHostPlacements,
  listPlacementApplicants,
  listPublicPlacements,
  registerCandidate
} = require('../services/placementService');
const {
  generateInstantQuiz,
  generateMockInterviewQuestion,
  evaluateMockInterviewResponse
} = require('../services/geminiQuestionService');
const { generateAssessmentReportPdf } = require('../utils/pdfGenerator');

const placementSchema = z.object({
  companyName: z.string().trim().min(2).max(100),
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(20).max(3000),
  location: z.string().trim().min(2).max(120),
  domainMode: z.enum(['specific', 'random']),
  domains: z.array(z.enum(placementDomains)).max(placementDomains.length),
  registrationOpensAt: z.coerce.date(),
  registrationDeadline: z.coerce.date(),
  registrationLimit: z.coerce.number().int().min(1).max(1000),
  questionCount: z.coerce.number().int().min(1).max(50),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  randomnessPercent: z.coerce.number().int().min(0).max(100),
}).superRefine((values, context) => {
  if (values.domainMode === 'specific' && values.domains.length === 0) {
    context.addIssue({ code: 'custom', path: ['domains'], message: 'Choose at least one question domain' });
  }

  if (values.domainMode === 'random' && values.domains.length > 0) {
    context.addIssue({ code: 'custom', path: ['domains'], message: 'Random domain mode cannot include selected domains' });
  }

  if (values.registrationDeadline <= values.registrationOpensAt) {
    context.addIssue({ code: 'custom', path: ['registrationDeadline'], message: 'Deadline must be after registration opens' });
  }
});

function parsePlacement(body) {
  const result = placementSchema.safeParse(body);

  if (!result.success) {
    const error = new Error(result.error.issues[0]?.message || 'Invalid placement details');
    error.status = 400;
    throw error;
  }

  return result.data;
}

async function createPlacementHandler(req, res) {
  try {
    const values = parsePlacement(req.body);
    const userId = req.user.id || req.user._id;
    const placement = await createPlacement(userId, values);
    res.status(201).json({ success: true, placement });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function listHostPlacementsHandler(req, res) {
  try {
    const userId = req.user.id || req.user._id;
    const placements = await listHostPlacements(userId);
    res.json({ success: true, placements });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function listPlacementApplicantsHandler(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.placementId)) {
      return res.status(400).json({ success: false, message: 'Invalid placement id' });
    }

    const userId = req.user.id || req.user._id;
    const order = req.query.order === 'lowest' ? 'lowest' : 'highest';
    const result = await listPlacementApplicants(userId, req.params.placementId, order);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function listPublicPlacementsHandler(req, res) {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 100) : '';
    const domain = typeof req.query.domain === 'string' ? req.query.domain : '';
    const sort = req.query.sort === 'deadline' ? 'deadline' : 'recent';

    if (domain && !placementDomains.includes(domain)) {
      return res.status(400).json({ success: false, message: 'Unsupported placement domain' });
    }

    const placements = await listPublicPlacements({ search, domain, sort });
    res.json({ success: true, placements });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function getPublicPlacementHandler(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.placementId)) {
      return res.status(400).json({ success: false, message: 'Invalid placement id' });
    }

    const placement = await getPublicPlacement(req.params.placementId);
    if (!placement) return res.status(404).json({ success: false, message: 'Placement not found' });
    res.json({ success: true, placement });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function registerCandidateHandler(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.placementId)) {
      return res.status(400).json({ success: false, message: 'Invalid placement id' });
    }

    const userId = req.user.id || req.user._id;
    const application = await registerCandidate(req.params.placementId, userId);
    res.status(201).json({
      success: true,
      application: {
        id: application.id || application._id,
        status: application.status,
        registeredAt: application.registeredAt
      }
    });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function generateAiQuizHandler(req, res) {
  try {
    const { topic, difficulty, questionCount, engine } = req.body || {};
    const result = await generateInstantQuiz({
      topic: topic || 'Full-Stack Development',
      difficulty: difficulty || 'medium',
      questionCount: Number(questionCount) || 5,
      engine: engine || 'gemini',
    });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to generate AI quiz' });
  }
}

async function generateMockInterviewQuestionHandler(req, res) {
  try {
    const { topic, type, level } = req.body || {};
    const result = await generateMockInterviewQuestion({ topic, type, level });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to generate mock interview question' });
  }
}

async function evaluateMockInterviewResponseHandler(req, res) {
  try {
    const {
      title,
      scenario,
      prompt,
      keyFocusAreas,
      candidateResponse,
      role
    } = req.body || {};

    const candidateName = req.user?.name || req.body?.candidateName || 'Candidate';
    const result = await evaluateMockInterviewResponse({
      title,
      scenario,
      prompt,
      keyFocusAreas,
      candidateResponse,
      role,
      candidateName
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to evaluate interview response' });
  }
}

async function downloadAssessmentReportPdfHandler(req, res) {
  try {
    const candidateName = req.user?.name || req.body?.candidateName || 'Candidate';
    const candidateEmail = req.user?.email || req.body?.candidateEmail || 'student@domain.com';

    const pdfBuffer = generateAssessmentReportPdf({
      ...req.body,
      candidateName,
      candidateEmail
    });

    const safeFilename = `Assessment_Report_${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to generate assessment report PDF' });
  }
}

module.exports = {
  placementSchema,
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
};

