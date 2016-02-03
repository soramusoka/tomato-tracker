/**
 * Created by artem.kolosovich on 23.01.2016.
 */

import {Injectable} from "angular2/core";
import {Clock} from "./app.types";
import {Component} from "angular2/core";
import {NotificationService} from "./app.notification.service";

@Injectable()
@Component({
    providers: [NotificationService]
})
export class ClockService {
    private clock: Clock;
    private counter = 0;

    constructor(private notificationService: NotificationService) {
    }

    createClock(diff: number): void {
        this.counter = diff;
        this.notificationService.stop();
        let onEachSecond = (time: number) => {
            if (time == 0) this.notificationService.notify();
        };
        this.clock = (<any>$('.clock')).FlipClock(diff, {
            autoStart: false,
            countdown: true,
            clockFace: 'MinuteCounter',
            callbacks: {
                interval: function () {
                    var time = this.factory.getTime().time;
                    onEachSecond(time);
                }
            }
        });
    }

    startClock() {
        return this.clock.start();
    }

    stopClock() {
        return this.clock.stop();
    }

    getTime(): number {
        return this.clock.getTime();
    }

    getPeriod(): number {
        let time = this.clock.getTime();
        return this.counter - time;
    }
}