const functions = require('firebase-functions');

exports.verifyUser = functions.https.onCall(async (data, context) => {
    const admin = require('firebase-admin');
    admin.initializeApp();

    const db = admin.firestore();

    response.json({
        verified: false,
        thresh: 100,
        score: 937,
    });
});
