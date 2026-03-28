const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('./serviceAccountKey.json');

const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: 'couple-diary-lq',
  httpAgent: new (require('http').Agent)({
    keepAlive: true,
    timeout: 60000
  })
});

const db = getFirestore();

module.exports = { db };
