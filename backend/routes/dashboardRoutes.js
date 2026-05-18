const express = require('express');
const auth = require('../middleware/auth');
const { dashboard } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/', auth, dashboard);

module.exports = router;
