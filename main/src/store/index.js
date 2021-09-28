import {computed, makeObservable} from 'mobx';

import AuthStore from './auth';
import AppStore from './app';

export class Store {
    constructor() {
        this.app = new AppStore(this);
        this.auth = new AuthStore(this);

        makeObservable(
            this,
            {
                isPrepared: computed,
            },
            {autoBind: true},
        );

        (async () => {
            await this.app?.prepare?.();
            await this.auth?.prepare?.();
        })();
    }

    get isPrepared() {
        return (
            [this.app, this.auth]
                .map((obj) => !!obj?.preparing)
                .findIndex((value) => value) < 0
        );
    }
}

const store = new Store();
export default store;
