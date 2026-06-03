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
    storage: multer.memoryStorage(),
    fileFilter: imageOnly,
    limits: {
      fileSize: 2 * 1024 * 1024,
    },
  });
}

const uploadAvatar = createAvatarUploader('profile');

module.exports = uploadAvatar;
module.exports.uploadAnakAvatar = createAvatarUploader('anak');
