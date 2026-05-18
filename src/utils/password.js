const bcrypt = require('bcryptjs');

async function verifyPassword(inputPassword, savedPassword) {
  if (!savedPassword) {
    return false;
  }

  const looksHashed = savedPassword.startsWith('$2a$') ||
    savedPassword.startsWith('$2b$') ||
    savedPassword.startsWith('$2y$');

  if (looksHashed) {
    return bcrypt.compare(inputPassword, savedPassword);
  }

  return inputPassword === savedPassword;
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

module.exports = { hashPassword, verifyPassword };
