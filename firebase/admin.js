// firebase/admin.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // ← JSON 경로도 맞는지 확인!

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();

module.exports = { admin, db };