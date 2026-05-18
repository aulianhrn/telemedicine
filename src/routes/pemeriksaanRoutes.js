const express = require('express');
const auth = require('../middleware/auth');
const {
  listPemeriksaan,
  createPemeriksaan,
} = require('../controllers/pemeriksaanController');

const router = express.Router();

router.get('/', auth, listPemeriksaan);
router.post('/', auth, createPemeriksaan);

module.exports = router;
