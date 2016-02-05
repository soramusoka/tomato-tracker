/**
 * Created by artem.kolosovich on 23.01.2016.
 */

import {Component, Injectable} from "angular2/core";
import {Clock} from "./app.types";
import {NotificationService} from "./app.notification.service";

declare let moment;

@Injectable()
@Component({
    providers: [NotificationService]
})
export class ClockService {
    private clockStarted = false;
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

    startClock(): void {
        this.clockStarted = true;
        return this.clock.start();
    }

    stopClock(): void {
        this.clockStarted = false;
        return this.clock.stop();
    }

    getTime(): number {
        return this.clock.getTime();
    }

    getDuration(): number {
        return this.counter - this.getTime();
    }

    formatDurationAsHours(value: number, metric: string) {
        return moment.duration(value, metric).asHours().toFixed(2);
    }

    isClockStarted(): boolean {
        return this.clockStarted;
    }

    getDateTime(): {} {
        return moment();
    }

    getTimestamp(): string {
        return moment.now().toString();
    }
}