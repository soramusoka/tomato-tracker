/**
 * Created by artem.kolosovich on 23.01.2016.
 */

import {Injectable} from "angular2/core";
import {Clock} from "./app.types";

@Injectable()
export class ClockService {

    createClock(diff: number, fn?: (time: number) => void): Clock {
        return (<any>$('.clock')).FlipClock(diff, {
            autoStart: false,
            countdown: true,
            clockFace: 'MinuteCounter',
            callbacks: {
                interval: function () {
                    var time = this.factory.getTime().time;
                    fn && fn(time);
                }
            }
        });
    }
}