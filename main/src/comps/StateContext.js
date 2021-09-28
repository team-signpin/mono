import React, {createContext, useContext} from 'react';

const StateContext = createContext(null);

export function StateProvider({store, children}) {
    return (
        <StateContext.Provider value={store}>{children}</StateContext.Provider>
    );
}

export function useAppState(name) {
    const context = useContext(StateContext);

    if (name) {
        return context[name];
    } else {
        return context;
    }
}
