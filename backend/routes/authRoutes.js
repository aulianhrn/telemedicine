const express = require('express');
const auth = require('../middleware/auth');
const uploadAvatar = require('../middleware/uploadAvatar');
const {
  login,
  me,
  register,
  updateIbuProfile,
  updatePassword,
  updateAvatar,
} = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', auth, me);
router.patch('/me', auth, updateIbuProfile);
router.patch('/me/password', auth, updatePassword);
router.post('/me/avatar', auth, uploadAvatar.single('ava_pict'), updateAvatar);
router.patch('/me/avatar', auth, uploadAvatar.single('ava_pict'), updateAvatar);

module.exports = router;
