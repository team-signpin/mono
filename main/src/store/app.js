import {makeAutoObservable} from 'mobx';

export default class AppStore {
    constructor(parent) {
        makeAutoObservable(this, {}, {autoBind: true});
        this.parent = parent;
    }
}
