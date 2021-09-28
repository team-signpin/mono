import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import store from './store';

import FirebaseProvider from './comps/FirebaseContext';

import {BrowserRouter as Router} from 'react-router-dom';
import {StateProvider} from './comps/StateContext';
import {auth, db, functions} from './firebase';

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    db.useEmulator(window.location.hostname, 8080);
    functions.useEmulator(window.location.hostname, 5001);
}

ReactDOM.render(
    <React.StrictMode>
        <StateProvider store={store}>
            <FirebaseProvider services={{db, auth, functions}}>
                <Router>
                    <App />
                </Router>
            </FirebaseProvider>
        </StateProvider>
    </React.StrictMode>,
    document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
