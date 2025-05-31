const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// ✅ 이미 초기화되었는지 확인 후 실행
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
module.exports = { db };
