/**
 * Created by artem.kolosovich on 21.01.2016.
 */

import {Component} from 'angular2/core';
import {ClockService} from "./app.clock.service";
import {Clock} from "./app.clock";
import {Log} from "./app.log";
import {ConfigService, Config} from "./app.config";

@Component({
    selector: 'app',
    templateUrl: './app/template.html',
    providers: [ClockService, ConfigService]
})
export class ClockComponent {
    private clock: Clock;
    private audio: { play: () => void; };
    private interval = null;
    private config: Config;

    public clockStarted = false;
    public logs: Array<Log> = [
        {
            id: this.createId(),
            date: new Date(),
            text: 'Example, you can highlight something !important or use #hashtag in your messages',
            template: `Example, you can highlight something <span class="important">!important</span> or use <span class="tag">#hashtag</span> in your messages`
        }
    ];
    public logText: string = '';

    constructor(private clockService: ClockService, private configService: ConfigService) {
        this.audio = new Audio('./assets/sound.mp3');
        this.config = configService.getConfig();
        this.createClock();
    }

    private createClock() {
        let onEachSecond = (time: number) => {
            if (time == 0) this.notify();
        };
        this.clock = this.clockService.createClock(this.config.counter, onEachSecond);
    }

    private notify(): void {
        this.interval = setInterval(() => this.playSound(), 2000);
        // send notification
    }

    private playSound() {
        this.audio.play();
    }

    private createTemplate(source: string): string {
        let delimiter = ' ';
        return source
            .split(delimiter)
            .map((word: string) => {
                if (word.indexOf('#') == 0) {
                    return '<span class="tag">' + word + '</span>';
                }
                else if (word.indexOf('!') == 0) {
                    return '<span class="important">' + word + '</span>';
                }
                return word;
            }).join(delimiter);
    }

    private createId(): string {
        return Date.now().toString();
    }

    onSaveLog() {
        if (this.logText) {
            let id = this.createId();
            let template = this.createTemplate(this.logText);
            let log = { id: id, date: new Date(), text: this.logText, template: template };
            this.logs.unshift(log);
            this.logText = '';

            if (this.interval !== null) {
                this.onResetTimer();
            }
        }
    }

    onDeleteLog(id: string) {
        let index = -1;
        this.logs.forEach((x, i) => {
            if (x.id === id) {
                index = i;
            }
        });
        if (index !== -1) {
            this.logs.splice(index, 1);
        }
    }

    onStartTimer() {
        if (!this.clockStarted) {
            this.clock.start();
            this.clockStarted = true;
        }
    }

    onStopTimer() {
        if (this.clockStarted) {
            this.clock.stop();
            this.clockStarted = false;
        }
    }

    onResetTimer() {
        this.onStopTimer();
        clearInterval(this.interval);
        this.interval = null;
        this.createClock();

        if (this.config.sprint) {
            this.onStartTimer();
        }
    }
}