import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useFirebase} from './comps/FirebaseContext';

const width = window.innerWidth;
const height = window.innerHeight;

function App() {
    const {db} = useFirebase();

    const lastPos = useRef({x: 0, y: 0});
    const runningData = useRef([]);
    const pathData = useRef([]);
    const started = useRef(false);
    const moves = useRef(0);

    const [context, setContext] = useState(null);
    const [renderMode, setRenderMode] = useState('display');
    const [saved, setSaved] = useState(false);
    const [playable, setPlayable] = useState({});
    const [target, setTarget] = useState('');
    const [preJoined, setPreJoined] = useState(true);

    const [nickname, setNickname] = useState('');

    const resolveControl = useCallback(
        (doc) => {
            if (!doc.exists) {
                return;
            }

            const data = doc.data();
            const nickname = data?.nickname || '';
            const renderMode = data?.renderMode || 'display';

            setRenderMode(renderMode);
            setNickname(nickname);
        },
        [setNickname, setRenderMode],
    );

    useEffect(() => {
        (async () => {
            const ref = db.collection('remote').doc('control');
            const doc = await ref.get();

            if (doc.exists) {
                console.log('REALLY');

                const data = doc.data();
                const joined = !!data?.joined;

                if (window.location.hostname !== 'localhost') {
                    setPreJoined(joined);
                } else {
                    setPreJoined(false);
                }

                if (!joined) {
                    await db
                        .collection('remote')
                        .doc('control')
                        .set({joined: true}, {merge: true});

                    resolveControl(doc);
                }
            }

            ref.onSnapshot((doc) => {
                resolveControl(doc);
            });
        })();
    }, []);

    useEffect(() => {
        window.localStorage.setItem('NICKNAME', nickname);
    }, [nickname]);

    const individuals = useMemo(() => {
        return Object.keys(playable).filter(
            (key) => key.toUpperCase() !== nickname.toUpperCase(),
        );
    }, [playable, nickname]);

    useEffect(() => {
        (async () => {
            const snapshot = await db.collection('individuals').get();

            const data = {};

            snapshot.forEach((doc) => {
                data[doc.id] = {
                    id: doc.id,
                    data: doc.data(),
                };
            });

            setPlayable(data);
        })();
    }, [setPlayable]);

    useEffect(() => {
        console.log(playable);
    }, [playable]);

    const updateNickname = useCallback(
        (ev) => {
            setNickname(ev.target.value.toUpperCase());
        },
        [setNickname],
    );

    const canvas = useCallback((element) => {
        const context = element?.getContext?.('2d');
        context && setContext(context);
        context && context.fillRect(0, 0, width, height);
    }, []);

    const touchStart = useCallback(
        (ev) => {
            if (context) {
                console.log('STARTED');

                moves.current = 0;
                pathData.current = [];

                const {
                    touches: [{pageX: x, pageY: y}],
                } = ev;

                started.current = true;
                lastPos.current = {x, y};

                pathData.current.push({ty: 0, ti: Date.now(), x, y});
            }
        },
        [context],
    );

    const touchMove = useCallback(
        (ev) => {
            if (context && started.current) {
                moves.current++;

                const {
                    touches: [{pageX: x, pageY: y}],
                } = ev;

                context.beginPath();

                context.strokeStyle = '#FFFFFF';
                context.lineWidth = 2;

                context.moveTo(lastPos.current.x, lastPos.current.y);
                context.lineTo(x, y);
                context.stroke();

                context.closePath();

                lastPos.current = {x, y};
                pathData.current.push({ty: 1, ti: Date.now(), x, y});
            }
        },
        [context],
    );

    const touchEnd = useCallback(
        (ev) => {
            if (context) {
                console.log('ENDED');

                started.current = false;
                context.stroke();
                context.closePath();

                pathData.current.push({
                    ty: 2,
                    ti: Date.now(),
                    x: lastPos.current.x,
                    y: lastPos.current.y,
                });

                if (moves.current > 4) {
                    console.log('APPENDING');
                    runningData.current = runningData.current.concat(
                        pathData.current,
                    );
                }
            }
        },
        [context],
    );

    const clear = useCallback(
        (ev) => {
            if (context) {
                runningData.current = [];
                context && context.fillRect(0, 0, width, height);
            }
        },
        [context],
    );

    const save = useCallback(() => {
        if (!nickname) {
            alert('please set a nickname');
            return;
        }

        if (target) {
            (async () => {
                await db.collection('forgeries').doc(`${Date.now()}`).set({
                    by: nickname,
                    target,
                    data: runningData.current,
                    forged_at: new Date(),
                });

                clear();
            })();
        } else {
            (async () => {
                await db.collection('individuals').doc(nickname).set({
                    nickname,
                    updated_at: new Date(),
                });

                await db
                    .collection('individuals')
                    .doc(nickname)
                    .collection('signatures')
                    .doc(`${Date.now()}`)
                    .set({
                        nickname,
                        data: runningData.current,
                    });

                clear();
            })();
        }
    }, [nickname, saved, clear, target]);

    const selectTarget = useCallback(
        (ev) => {
            setTarget(ev.target.value);
        },
        [setTarget],
    );

    const loadData = useCallback(
        async (target) => {
            const snapshot = await db
                .collection('individuals')
                .doc(target)
                .collection('signatures')
                .get();

            const data = [];

            snapshot.forEach((doc) => {
                data.push(doc.data());
            });

            return data.sort(() => Math.random() - 0.5);
        },
        [target],
    );

    const play = useCallback(() => {
        clear();

        (async () => {
            const data = await loadData(target);

            function animate(i) {
                if (i === data.length) {
                    return;
                }

                clear();

                const raw = data[i].data;

                const minTime = Math.min(...raw.map((step) => step.ti));
                const maxTime = Math.max(...raw.map((step) => step.ti));

                const minX = Math.min(...raw.map((step) => step.x));
                const maxX = Math.max(...raw.map((step) => step.x));
                const dX = maxX - minX;

                const minY = Math.min(...raw.map((step) => step.y));
                const maxY = Math.max(...raw.map((step) => step.y));
                const dY = maxY - minY;

                const normalized = raw.map((step) => ({
                    ty: step.ty,
                    x: (step.x - minX) / dX,
                    y: (step.y - minY) / dY,
                    ti: step.ti - minTime,
                }));

                const previewWidth = width / 5;
                const previewHeight = (dY / dX) * previewWidth;
                const previewOffset = previewWidth / 5;

                function makeX(x) {
                    return (
                        width - previewWidth - previewOffset + x * previewWidth
                    );
                }

                function makeY(y) {
                    return previewOffset + y * previewHeight;
                }

                let lx = 0;
                let ly = 0;

                function step(j) {
                    const current = normalized[j];

                    if (current.ty === 1) {
                        context.beginPath();

                        context.lineWidth = 1;
                        context.strokeStyle = 'pink';

                        context.moveTo(makeX(lx), makeY(ly));
                        context.lineTo(makeX(current.x), makeY(current.y));

                        context.stroke();

                        context.closePath();
                    }

                    lx = current.x;
                    ly = current.y;

                    const next = normalized[j + 1];

                    if (next) {
                        setTimeout(() => {
                            step(j + 1);
                        }, next - current);
                    } else {
                        setTimeout(() => {
                            animate(i + 1);
                        }, 1000);
                    }
                }

                step(0);
            }

            animate(0);
        })();
    }, [clear, target]);

    const display = useCallback(() => {
        clear();

        (async () => {
            const data = await loadData(target);

            function render(i) {
                if (i === data.length) {
                    return;
                }

                clear();

                const raw = data[i].data;

                const minTime = Math.min(...raw.map((step) => step.ti));
                const maxTime = Math.max(...raw.map((step) => step.ti));

                const minX = Math.min(...raw.map((step) => step.x));
                const maxX = Math.max(...raw.map((step) => step.x));
                const dX = maxX - minX;

                const minY = Math.min(...raw.map((step) => step.y));
                const maxY = Math.max(...raw.map((step) => step.y));
                const dY = maxY - minY;

                const normalized = raw.map((step) => ({
                    ty: step.ty,
                    x: (step.x - minX) / dX,
                    y: (step.y - minY) / dY,
                    ti: step.ti - minTime,
                }));

                const previewWidth = width / 5;
                const previewHeight = (dY / dX) * previewWidth;
                const previewOffset = previewWidth / 5;

                function makeX(x) {
                    return (
                        width - previewWidth - previewOffset + x * previewWidth
                    );
                }

                function makeY(y) {
                    return previewOffset + y * previewHeight;
                }

                let lx = 0;
                let ly = 0;

                for (let j = 0; j < normalized.length; j++) {
                    const current = normalized[j];

                    if (current.ty === 1) {
                        context.beginPath();

                        context.lineWidth = 1;
                        context.strokeStyle = 'pink';

                        context.moveTo(makeX(lx), makeY(ly));
                        context.lineTo(makeX(current.x), makeY(current.y));

                        context.stroke();

                        context.closePath();
                    }

                    lx = current.x;
                    ly = current.y;

                    const next = normalized[j + 1];

                    if (!next) {
                        setTimeout(() => {
                            render(i + 1);
                        }, 1000);
                    }
                }
            }

            render(0);
        })();
    }, [clear, target]);

    return preJoined ? (
        <div className="m-5">
            This session has already been joined, please contact Omran.
        </div>
    ) : (
        <div
            className="App"
            style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
            }}
            onTouchMove={touchMove}
            onTouchEnd={touchEnd}>
            <canvas
                ref={canvas}
                style={{position: 'absolute', top: '0', left: '0'}}
                width={width}
                height={height}
                onTouchStart={touchStart}
            />
            <div
                style={{
                    position: 'absolute',
                    top: '-50px',
                    left: '0',
                    transformOrigin: '0 100%',
                    transform: 'rotate(90deg)',
                    padding: '5px',
                    width: '100vh',
                    background: 'rgba(43, 10, 74, 0.2)',
                }}>
                <button
                    className={'btn btn-outline-danger btn-sm ms-auto me-0'}
                    onClick={clear}>
                    Clear
                </button>
                <input
                    type={'text'}
                    className={'form-control from-control-sm mx-2'}
                    style={{
                        display: 'inline',
                        width: '10em',
                    }}
                    placeholder={'NICKNAME'}
                    disabled={true}
                    onChange={updateNickname}
                    value={nickname}
                />
                <button className={'btn btn-primary btn-sm'} onClick={save}>
                    SAVE
                </button>
                <select
                    className={'form-control form-control-sm d-inline mx-2'}
                    style={{width: '10em'}}
                    onChange={selectTarget}
                    value={target}>
                    <option value={''}>SELECT TARGET</option>
                    {individuals.map((key) => (
                        <option key={key} value={key}>
                            {key}
                        </option>
                    ))}
                </select>
                {target.length ? (
                    renderMode === 'animate' ? (
                        <button
                            onClick={play}
                            className={'btn btn-sm btn-warning'}>
                            PLAY
                        </button>
                    ) : (
                        <button
                            onClick={display}
                            className={'btn btn-sm btn-info'}>
                            DISPLAY
                        </button>
                    )
                ) : null}
            </div>
        </div>
    );
}

export default App;
