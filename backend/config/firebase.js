const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

function getCredential() {
  const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
  }

  if (fs.existsSync(serviceAccountPath)) {
    return admin.credential.cert(require(serviceAccountPath));
  }

  return admin.credential.applicationDefault();
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: getCredential(),
  });
}

const firestore = admin.firestore();

module.exports = firestore;
