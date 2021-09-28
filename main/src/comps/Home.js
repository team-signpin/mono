import React, {useState, useEffect, useMemo} from 'react';
import {useAppState} from './StateContext';
import {observer} from 'mobx-react';
import {useHistory} from 'react-router-dom';

export const Home = observer(({...props}) => {
    const history = useHistory();

    return (
        <div className="m-4 text-center">
            <h1 className="h1">
                Sign<span className={'text-muted'}>Pin</span>
            </h1>

            <br />
            <br />
            <br />
            <br />

            <div className={'w-25 m-auto'}>
                <button className="btn btn-primary btn-lg w-100 d-block">
                    Login
                </button>
                <br />
                <div className="text-muted">OR</div>
                <br />
                <button className="btn btn-outline-primary btn-lg w-100 d-block">
                    Register
                </button>
                <br />
                <h5 className={'h5'}>
                    To start verifying customer signatures.
                </h5>
            </div>
        </div>
    );
});

export default Home;
