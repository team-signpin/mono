import React, {useState, useEffect, useMemo, useCallback, useRef} from 'react';

const width = window.innerWidth;
const height = window.innerHeight;

export const Pad = ({
    onSave = () => {},
    onBack = () => {},
    actionName = 'SAVE',
    ...props
}) => {
    const lastPos = useRef({x: 0, y: 0});
    const runningData = useRef([]);
    const pathData = useRef([]);
    const started = useRef(false);
    const moves = useRef(0);

    const [context, setContext] = useState(null);

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
        onSave([...runningData.current]);
        clear();
    }, [clear]);

    return (
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
                <button className={'btn btn-primary btn-sm'} onClick={save}>
                    {actionName}
                </button>
                <button className={'btn btn-danger btn-sm'} onClick={onBack}>
                    BACK
                </button>
            </div>
        </div>
    );
};

export default Pad;
