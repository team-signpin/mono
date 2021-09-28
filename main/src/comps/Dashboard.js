import React, {useState, useEffect, useMemo} from 'react';
import {observer} from 'mobx-react';
import {useHistory} from 'react-router-dom';

export const Dashboard = observer(({...props}) => {
    const history = useHistory();

    return (
        <div className={'m-5'} style={{maxWidth: '20em'}}>
            <h1 className="h1">
                Sign<span className={'text-muted'}>Pin</span>
            </h1>

            <br />
            <br />

            <h3 className="h3">Choose an Action</h3>

            <br />
            <br />

            <button
                className={'btn btn-outline-primary btn-lg d-block w-100'}
                onClick={() => history.push('/add')}>
                Add Signature
            </button>

            <br />

            <button
                className={'btn btn-primary btn-lg d-block w-100'}
                onClick={() => history.push('/verify')}>
                Verify Signature
            </button>
        </div>
    );
});

export default Dashboard;
