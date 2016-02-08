/**
 * Created by artem.kolosovich on 08.02.2016.
 */

import {Logger} from "./app.logger";
import {Injectable} from "angular2/core";

@Injectable()
export class AppStorage {

    @Logger
    save(key: string, obj: any): void {
        window.localStorage.setItem(key, JSON.stringify(obj));
    }

    @Logger
    load(key: string): any {
        let str = window.localStorage.getItem(key);
        if (!str) return null;

        try {
            return JSON.parse(str);
        } catch (e) {
            return null;
        }
    }
}