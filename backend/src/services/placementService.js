const { Placement } = require('../models/Placement');
const Application = require('../models/Application');
const { generateQuestions } = require('./geminiQuestionService');

function buildSearchPattern(search) {
  const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return `(^|[^a-z0-9])${escapedSearch}`;
}

async function createPlacement(hostId, values) {
  const questionBank = await generateQuestions(values);
  const placement = await Placement.create({
    ...values,
    createdBy: hostId,
    questionBank,
    questionPoolSize: questionBank.length,
  });
  const safePlacement = placement.toObject();
  delete safePlacement.questionBank;
  safePlacement.questionPoolSize = questionBank.length;
  return safePlacement;
}

async function listHostPlacements(hostId) {
  return Placement.find({ createdBy: hostId }).select('-questionBank').sort({ createdAt: -1 }).lean();
}

async function listPublicPlacements({ search = '', domain = '', sort = 'recent' } = {}) {
  const now = new Date();
  const query = {
    status: 'published',
    registrationDeadline: { $gt: now },
    $expr: { $gte: ['$questionPoolSize', { $multiply: ['$questionCount', 3] }] },
  };

  if (search) {
    const searchPattern = buildSearchPattern(search);
    query.$or = [
      { companyName: { $regex: searchPattern, $options: 'i' } },
      { title: { $regex: searchPattern, $options: 'i' } },
      { description: { $regex: searchPattern, $options: 'i' } },
    ];
  }

  if (domain) query.domains = domain;

  const sortOrder = sort === 'deadline' ? { registrationDeadline: 1 } : { createdAt: -1 };
  return Placement.find(query).select('-questionBank').sort(sortOrder).limit(100).lean();
}

async function getPublicPlacement(placementId) {
  return Placement.findOne({
    _id: placementId,
    status: 'published',
    $expr: { $gte: ['$questionPoolSize', { $multiply: ['$questionCount', 3] }] },
  }).select('-questionBank').lean();
}

function serviceError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function listPlacementApplicants(hostId, placementId, order = 'highest') {
  const placement = await Placement.findOne({ _id: placementId, createdBy: hostId })
    .select('questionCount registrationLimit')
    .lean();

  if (!placement) throw serviceError('Placement not found', 404);

  const sort = order === 'lowest' ? { score: 1, registeredAt: 1 } : { score: -1, registeredAt: 1 };
  const applications = await Application.find({ placement: placementId })
    .select('candidate status score registeredAt startedAt completedAt')
    .populate('candidate', 'name fullName email')
    .sort(sort)
    .lean();

  return {
    questionCount: placement.questionCount,
    registrationLimit: placement.registrationLimit,
    registrationCount: applications.length,
    applicants: applications.map((application) => ({
      id: application._id,
      candidate: {
        id: application.candidate?._id,
        fullName: application.candidate?.fullName || application.candidate?.name || 'Applicant',
        email: application.candidate?.email || '',
      },
      status: application.status,
      score: application.score,
      registeredAt: application.registeredAt,
      startedAt: application.startedAt,
      completedAt: application.completedAt,
    })),
  };
}

async function registerCandidate(placementId, candidateId) {
  const existing = await Application.exists({ placement: placementId, candidate: candidateId });

  if (existing) {
    throw serviceError('You are already registered for this placement', 409);
  }

  const now = new Date();
  const placement = await Placement.findOneAndUpdate(
    {
      _id: placementId,
      status: 'published',
      registrationOpensAt: { $lte: now },
      registrationDeadline: { $gt: now },
      $expr: {
        $and: [
          { $lt: [{ $ifNull: ['$registrationCount', 0] }, '$registrationLimit'] },
          { $gte: ['$questionPoolSize', { $multiply: ['$questionCount', 3] }] },
        ],
      },
    },
    { $inc: { registrationCount: 1 } },
    { new: true }
  );

  if (!placement) {
    const current = await Placement.findById(placementId).select('registrationOpensAt registrationDeadline registrationCount registrationLimit questionCount questionPoolSize');
    if (!current) throw serviceError('Placement not found', 404);
    if ((current.questionPoolSize || 0) < current.questionCount * 3) throw serviceError('This placement has no adaptive question bank. Ask the host to publish it again.', 409);
    if (current.registrationOpensAt > now) throw serviceError('Registration has not opened yet', 409);
    if (current.registrationDeadline <= now) throw serviceError('Registration is closed', 409);
    throw serviceError('This placement has reached its registration limit', 409);
  }

  try {
    return await Application.create({ placement: placementId, candidate: candidateId });
  } catch (error) {
    await Placement.updateOne({ _id: placementId }, { $inc: { registrationCount: -1 } });
    if (error.code === 11000) throw serviceError('You are already registered for this placement', 409);
    throw error;
  }
}

module.exports = {
  createPlacement,
  listHostPlacements,
  listPublicPlacements,
  getPublicPlacement,
  listPlacementApplicants,
  registerCandidate,
  buildSearchPattern,
};

