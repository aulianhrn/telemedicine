const { Storage } = require('@google-cloud/storage');
const path = require('path');

const storage = new Storage();

function getBucket() {
  if (!process.env.GCS_BUCKET_NAME) {
    throw new Error('GCS_BUCKET_NAME belum diatur');
  }

  return storage.bucket(process.env.GCS_BUCKET_NAME);
}

function createAvatarPath(file, folder) {
  const extension = path.extname(file?.originalname || '').toLowerCase() || '.jpg';
  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
  return `/uploads/${folder}/${uniqueName}`;
}

function pathToObjectName(uploadPath) {
  return String(uploadPath || '')
    .replace(/^\/+/, '')
    .replace(/^uploads\//, '')
    .replace(/\\/g, '/');
}

async function uploadAvatarFile(uploadPath, file) {
  if (!uploadPath || !file) {
    return;
  }

  const data = file.buffer;
  if (!data) {
    throw new Error('Buffer file avatar tidak tersedia');
  }

  const objectName = pathToObjectName(uploadPath);
  const cloudFile = getBucket().file(objectName);

  await cloudFile.save(data, {
    metadata: {
      contentType: file.mimetype || 'application/octet-stream',
    },
    resumable: false,
  });
}

async function deleteAvatarFile(uploadPath) {
  if (!uploadPath) {
    return;
  }

  try {
    await getBucket().file(pathToObjectName(uploadPath)).delete();
  } catch (error) {
    if (error.code !== 404) {
      console.warn(`Gagal menghapus avatar dari Cloud Storage: ${uploadPath}`, error.message);
    }
  }
}

async function downloadAvatarFile(uploadPath) {
  if (!uploadPath) {
    return null;
  }

  try {
    const cloudFile = getBucket().file(pathToObjectName(uploadPath));
    const [exists] = await cloudFile.exists();

    if (!exists) {
      return null;
    }

    const [metadata] = await cloudFile.getMetadata();
    const [data] = await cloudFile.download();

    return {
      data,
      mimeType: metadata.contentType || 'application/octet-stream',
    };
  } catch (error) {
    console.warn(`Gagal membaca avatar dari Cloud Storage: ${uploadPath}`, error.message);
    return null;
  }
}

module.exports = {
  createAvatarPath,
  deleteAvatarFile,
  downloadAvatarFile,
  uploadAvatarFile,
};
