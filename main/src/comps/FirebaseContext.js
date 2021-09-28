import React, {createContext, useContext} from 'react';

export const FirebaseContext = createContext('FirebaseContext');

export default function FirebaseProvider({services = {}, children}) {
    return (
        <FirebaseContext.Provider value={services}>
            {children}
        </FirebaseContext.Provider>
    );
}

export function useFirebase() {
    return useContext(FirebaseContext);
}
