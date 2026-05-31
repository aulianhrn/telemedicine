const express = require('express');
const auth = require('../middleware/auth');
const {
  listPemeriksaan,
  createPemeriksaan,
  getWeightChart,
  getHeightChart,
  getNutritionStatusCard,
  getMobileGrowthSummary,
} = require('../controllers/pemeriksaanController');

const router = express.Router();

router.get('/', auth, listPemeriksaan);
router.post('/', auth, createPemeriksaan);
router.get('/anak/:childId/grafik-berat-badan', auth, getWeightChart);
router.get('/anak/:childId/grafik-tinggi-badan', auth, getHeightChart);
router.get('/anak/:childId/status-gizi-card', auth, getNutritionStatusCard);
router.get('/anak/:childId/mobile-growth-summary', auth, getMobileGrowthSummary);
router.get('/children/:childId/weight-chart', auth, getWeightChart);
router.get('/children/:childId/height-chart', auth, getHeightChart);
router.get('/children/:childId/nutrition-status-card', auth, getNutritionStatusCard);
router.get('/children/:childId/mobile-growth-summary', auth, getMobileGrowthSummary);

module.exports = router;
