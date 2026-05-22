const path = require('path');
const fs = require('fs');
const multer = require('multer');

function imageOnly(req, file, cb) {
  if (!file.mimetype.startsWith('image/')) {
    const error = new Error('File avatar harus berupa gambar');
    error.status = 400;
    return cb(error);
  }

  return cb(null, true);
}

function createAvatarUploader(folder) {
  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '..', 'uploads', folder);
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
        cb(null, uniqueName);
      },
    }),
    fileFilter: imageOnly,
    limits: {
      fileSize: 2 * 1024 * 1024,
    },
  });
}

const uploadAvatar = createAvatarUploader('profile');

module.exports = uploadAvatar;
module.exports.uploadAnakAvatar = createAvatarUploader('anak');
