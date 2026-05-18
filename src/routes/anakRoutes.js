const express = require('express');
const auth = require('../middleware/auth');
const { listAnak, getAnak, createAnak } = require('../controllers/anakController');

const router = express.Router();

router.get('/', auth, listAnak);
router.get('/:id', auth, getAnak);
router.post('/', auth, createAnak);

module.exports = router;
