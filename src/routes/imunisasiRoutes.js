const express = require('express');
const auth = require('../middleware/auth');
const {
  listImunisasi,
  createImunisasi,
  updateStatusImunisasi,
} = require('../controllers/imunisasiController');

const router = express.Router();

router.get('/', auth, listImunisasi);
router.post('/', auth, createImunisasi);
router.patch('/:id/status', auth, updateStatusImunisasi);

module.exports = router;
