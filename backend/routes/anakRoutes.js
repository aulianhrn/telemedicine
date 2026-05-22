const express = require('express');
const auth = require('../middleware/auth');
const { uploadAnakAvatar } = require('../middleware/uploadAvatar');
const { listAnak, getAnak, createAnak, updateAnakAvatar } = require('../controllers/anakController');

const router = express.Router();

router.get('/', auth, listAnak);
router.get('/:id', auth, getAnak);
router.post('/', auth, uploadAnakAvatar.single('ava_pict'), createAnak);
router.post('/:id/avatar', auth, uploadAnakAvatar.single('ava_pict'), updateAnakAvatar);
router.patch('/:id/avatar', auth, uploadAnakAvatar.single('ava_pict'), updateAnakAvatar);

module.exports = router;
