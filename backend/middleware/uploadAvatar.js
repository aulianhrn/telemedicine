const path = require('path');
const multer = require('multer');

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'profile'));
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    cb(null, uniqueName);
  },
});

function imageOnly(req, file, cb) {
  if (!file.mimetype.startsWith('image/')) {
    const error = new Error('File avatar harus berupa gambar');
    error.status = 400;
    return cb(error);
  }

  return cb(null, true);
}

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageOnly,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

module.exports = uploadAvatar;
