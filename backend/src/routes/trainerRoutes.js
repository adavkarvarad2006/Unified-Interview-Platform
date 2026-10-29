const express = require('express');
const router = express.Router();
const { getTrainers } = require('../controllers/trainerController');

router.get('/', getTrainers);

module.exports = router;

