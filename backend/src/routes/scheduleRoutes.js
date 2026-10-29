const express = require('express');
const router = express.Router();
const {
  getDashboardSchedule,
  getHeatmapSchedule,
} = require('../controllers/scheduleController');

router.get('/dashboard', getDashboardSchedule);
router.get('/heatmap', getHeatmapSchedule);

module.exports = router;

