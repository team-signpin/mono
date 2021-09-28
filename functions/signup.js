const functions = require('firebase-functions');

exports.signup = functions.https.onRequest(async (request, response) => {
    const admin = require('firebase-admin');
    admin.initializeApp();

    response.json({
        ok: true,
    });
});
