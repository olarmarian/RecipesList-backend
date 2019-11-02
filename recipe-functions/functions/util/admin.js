const admin = require('firebase-admin');
const service = require('../recipeserver-ca082-firebase-adminsdk-hsp3x-1540fcdc1a.json')

admin.initializeApp({
    credential:admin.credential.cert(service)
});

const db = admin.firestore();

module.exports = { admin, db };