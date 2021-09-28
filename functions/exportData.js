const functions = require('firebase-functions');

exports.exportData = functions.https.onRequest(async (request, response) => {
    const admin = require('firebase-admin');

    const db = admin.firestore();

    const [forgerySnapshot, signaturesSnapshot] = await Promise.all([
        db.collection('forgeries').get(),
        db.collectionGroup('signatures').get(),
    ]);

    const forgeries = [];
    const signatures = [];

    forgerySnapshot.forEach((doc) => {
        forgeries.push(doc.data());
    });

    signaturesSnapshot.forEach((doc) => {
        signatures.push(doc.data());
    });

    response.json({
        forgeries,
        signatures,
    });
});
