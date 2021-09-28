const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const exportData = require('./exportData');
exports.exportData = exportData;

exports.verifyUser = functions.https.onCall(async (data, context) => {
    function makeSendable(arr) {
        return arr.map((x) => [x.ty, x.ti, x.x, x.y]);
    }

    const axios = require('axios');

    const db = admin.firestore();
    const snap = await db
        .collection('customers')
        .doc(data.customer)
        .collection('signs')
        .get();

    const docs = [];

    snap.forEach((doc) => {
        docs.push(makeSendable(doc.data().data));
    });

    if (docs.length < 10) {
        return [false, 0, 99999];
    }

    const res = await axios.post('http://localhost:2021/verify', {
        training: docs,
        test: makeSendable(data.data),
    });

    return res.data;
});
