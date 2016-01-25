/**
 * Created by artem.kolosovich on 24.01.2016.
 */

import {Injectable} from "angular2/core";

export interface Config {
    counter: number;
    sprint: boolean;
}

@Injectable()
export class ConfigService {
    getConfig(): Config {
        let params = this.parseUrl();

        return {
            counter: parseInt(params['counter']) || 1500,
            sprint: !!params['sprint']
        };
    }

    private parseUrl(): { [key:string]: any } {
        let urlParams: { [key:string]: any } = {};
        let match,
            pl = /\+/g,  // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            decode = (s) => decodeURIComponent(s.replace(pl, " ")),
            query = window.location.search.substring(1);

        while (match = search.exec(query))
            urlParams[decode(match[1])] = decode(match[2]);

        return urlParams;
    }
}