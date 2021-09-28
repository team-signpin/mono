import {createContext, useContext, useMemo} from 'react';

export const ProvidedContext = createContext('ProvidedContext');

export function Provide({provide = {}, children}) {
    const provided = useProvided();

    const provideObject = useMemo(() => {
        return {...provided, ...provide};
    }, [provided, provide]);

    return (
        <ProvidedContext.Provider value={provideObject}>
            {children}
        </ProvidedContext.Provider>
    );
}

export function useProvided(need = null) {
    const provided = useContext(ProvidedContext);

    if (!need) {
        return provided;
    }

    return provided[need];
}
