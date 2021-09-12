const admin = require('firebase-admin');

// a firebasePrivateKey.json file should be added in this directory.
// it can be obtained from Firebase Project Settings -> Service Accounts
const serviceAccount = require('./firebasePrivateKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
