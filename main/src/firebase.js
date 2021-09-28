import firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/functions';

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIRE_API_KEY,
    authDomain: process.env.REACT_APP_FIRE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIRE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIRE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIRE_MESSAGE_SENDER_ID,
    appId: process.env.REACT_APP_FIRE_APP_ID,
};

firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore();
export const auth = firebase.auth();
export const functions = firebase.functions();
