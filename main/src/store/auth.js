import {makeAutoObservable} from 'mobx';
import {auth} from '../firebase';

export default class AuthStore {
    preparing = true;

    user = null;

    constructor(parent) {
        makeAutoObservable(this, {}, {autoBind: true});
        this.parent = parent;
    }

    *resolveAuth() {
        this.user = auth.currentUser;
    }

    *login(email, password) {
        try {
            let e = null;

            yield this.resolveAuth();
        } catch (error) {
            console.error(error);
            throw new Error('401');
        }
    }

    *logout() {
        try {
            yield auth.signOut();
            yield this.resolveAuth();
        } catch (error) {
            console.error(error);
        }
    }

    get isLoggedIn() {
        return !!this.user;
    }

    authState(user) {
        this.user = user;
    }

    *prepare() {
        this.preparing = true;

        yield this.resolveAuth();
        auth.onAuthStateChanged(this.authState);

        this.preparing = false;
    }
}
