import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {observer} from 'mobx-react';
import Pad from './Pad';
import {useHistory} from 'react-router-dom';
import {useFirebase} from './FirebaseContext';

export const Verify = observer(({...props}) => {
    const {db, functions} = useFirebase();

    const [id, setId] = useState('omran');
    const [locked, setLocked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const history = useHistory();

    const check = (data) => {
        setLoading(true);

        (async () => {
            const verifyUser = functions.httpsCallable('verifyUser');

            const response = await verifyUser({
                customer: id,
                data,
            });

            setResult(response.data);
            setLoading(false);
        })();
    };

    return result ? (
        <div className="m-5" style={{maxWidth: '20em'}}>
            <h1 className="h1">
                Sign<span className={'text-muted'}>Pin</span>
            </h1>

            <br />
            <br />

            <h1 className={`h1`} style={{color: result[0] ? 'green' : 'red'}}>
                {result[0] ? 'ACCEPTED' : 'REJECTED'}
            </h1>

            <h3 className={'h2'}>THRESHOLD</h3>
            <h4>{Math.round(result[1] * 1000)}</h4>

            <br />
            <br />

            <h3>SCORE</h3>
            <h4>{Math.round(result[2] * 1000)}</h4>

            <p>Anything above threshold is rejected.</p>

            <br />

            <br />
            <br />

            <button
                className={'btn btn-outline-danger btn-lg d-block w-100'}
                onClick={() => history.push('/')}>
                BACK
            </button>

            <br />
            <br />

            <button
                className={'btn btn-outline-success btn-lg d-block w-100'}
                onClick={() => setResult(null)}>
                Try Again
            </button>
        </div>
    ) : locked ? (
        <Pad
            onBack={() => history.push('/')}
            actionName={'CHECK'}
            onSave={check}
        />
    ) : (
        <div className={'m-5'} style={{maxWidth: '20em'}}>
            <h1 className="h1">
                Sign<span className={'text-muted'}>Pin</span>
            </h1>

            <br />
            <br />

            <input
                type={'text'}
                className={'form-control form-control-lg'}
                placeholder={'User ID'}
                value={id}
                onChange={(ev) => setId(ev.target.value)}
            />

            <br />

            <button
                className={'btn btn-danger btn-lg d-block w-100'}
                onClick={() => setLocked(true)}
                disabled={id.length < 3 || loading}>
                Verify
            </button>

            <br />
            <br />

            <button
                className={'btn btn-outline-danger btn-lg d-block w-100'}
                onClick={() => history.push('/')}>
                BACK
            </button>
        </div>
    );
});

export default Verify;
