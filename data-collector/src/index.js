import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import firebase from 'firebase/app';
import 'firebase/firestore';
import FirebaseProvider from './comps/FirebaseContext';

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIRE_API_KEY,
    authDomain: process.env.REACT_APP_FIRE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIRE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIRE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIRE_MESSAGE_SENDER_ID,
    appId: process.env.REACT_APP_FIRE_APP_ID,
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    db.useEmulator(window.location.hostname, 8080);
}

ReactDOM.render(
    <React.StrictMode>
        <FirebaseProvider services={{db}}>
            <App />
        </FirebaseProvider>
    </React.StrictMode>,
    document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
