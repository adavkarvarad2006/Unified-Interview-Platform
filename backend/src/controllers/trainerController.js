const mongoose = require('mongoose');
const Trainer = require('../models/Trainer');
const InMemoryStore = require('../services/inMemoryStore');

/**
 * GET /api/trainers
 * Fetches all registered trainers
 */
const getTrainers = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const trainers = await Trainer.find().sort({ trainerId: 1 }).lean();
      if (trainers.length > 0) {
        return res.status(200).json({
          success: true,
          count: trainers.length,
          data: trainers,
        });
      }
    }

    // Standalone In-Memory fallback mode (no DB required)
    const trainers = InMemoryStore.getTrainers();
    return res.status(200).json({
      success: true,
      count: trainers.length,
      data: trainers,
    });
  } catch (error) {
    console.error('Error fetching trainers, falling back to in-memory store:', error.message);
    const trainers = InMemoryStore.getTrainers();
    return res.status(200).json({
      success: true,
      count: trainers.length,
      data: trainers,
    });
  }
};

module.exports = {
  getTrainers,
};

