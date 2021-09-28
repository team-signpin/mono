import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {observer} from 'mobx-react';
import Pad from './Pad';
import {useHistory} from 'react-router-dom';
import {useFirebase} from './FirebaseContext';

export const Add = observer(({...props}) => {
    const {db} = useFirebase();

    const [id, setId] = useState('omran');
    const [locked, setLocked] = useState(false);
    const [count, setCount] = useState(0);
    const history = useHistory();

    const save = (data) => {
        (async () => {
            await db
                .collection('customers')
                .doc(id)
                .collection('signs')
                .doc(`${Date.now()}`)
                .set({
                    id,
                    data,
                });
        })();

        setCount((old) => old + 1);
    };

    useEffect(() => {
        if (count >= 10) {
            alert('Customer Signature Trained');
            history.push('/');
        }
    }, [count]);

    return locked ? (
        <Pad onBack={() => history.push('/')} onSave={save} />
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
                className={'btn btn-primary btn-lg d-block w-100'}
                onClick={() => setLocked(true)}
                disabled={id.length < 3}>
                Start Training
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

export default Add;
