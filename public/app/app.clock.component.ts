/**
 * Created by artem.kolosovich on 21.01.2016.
 */

import {Component} from 'angular2/core';
import {ClockService} from "./app.clock.service";
import {Clock} from "./app.clock";
import {Log} from "./app.log";
import {ConfigService, Config} from "./app.config";
import {Task} from "./app.task";

declare let moment;

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

    public today = moment().format('YYYY-MM-DD');
    public clockStarted = false;
    public logs: Array<Log> = [
        {
            id: this.createId(),
            date: moment(),
            period: 777,
            text: '',
            template: `Example, <span class="task">!tasks</span> and <span class="tag">#hashtags</span> are highlighted.`
        }
    ];
    public logText: string = '';
    public groupedTasks: { [key:string]: Task } = {};
    public tasks: Array<Task> = [];
    public summary: number = 0;
    public moment = null;

    constructor(private clockService: ClockService, private configService: ConfigService) {
        this.audio = new Audio('./assets/sound.mp3');
        this.config = configService.getConfig();
        this.createClock();
        this.moment = moment;
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

    private addOrUpdateTask(period: number, words: Array<string>): void {
        words.forEach(s => {
            this.groupedTasks[s] = this.groupedTasks[s] || { value: 0, count: 0, name: null };
            this.groupedTasks[s].value += period;
            this.groupedTasks[s].count++;
            this.groupedTasks[s].name = s;
        });
    }

    private createTemplate(source: string): { value: string, symbols: { [key:string]: boolean } } {
        let symbols: { [key:string]: boolean } = {};
        let result = { value: null, symbols: symbols };
        let delimiter = ' ';
        result.value = source
            .split(delimiter)
            .map((word: string) => {
                if (word.indexOf('#') == 0) {
                    return '<span class="tag">' + word + '</span>';
                }
                else if (word.indexOf('!') == 0) {
                    symbols[word] = true;
                    return '<span class="task">' + word + '</span>';
                }
                return word;
            }).join(delimiter);

        return result;
    }

    private createId(): string {
        return Date.now().toString();
    }

    private updateSummary(period) {
        this.summary += period;
    }

    private getPeriod(): number {
        let time = this.clock.getTime();
        return this.config.counter - time;
    }

    updateTasks() {
        let keys = Object.keys(this.groupedTasks);
        let values = keys.map(s => this.groupedTasks[s].value);
        this.tasks = keys.map(s => this.groupedTasks[s]);
    }

    onSaveLog() {
        if (this.logText) {
            let id = this.createId();
            let template = this.createTemplate(this.logText);
            let period = this.getPeriod();
            let log = { id: id, date: moment(), period: period, text: this.logText, template: template.value };
            this.logs.unshift(log);
            this.logText = '';

            this.onResetTimer();
            this.updateSummary(period);
            this.addOrUpdateTask(period, Object.keys(template.symbols));
            this.updateTasks();
        }
    }

    onDeleteLog(log: Log): void {
        let index = -1;
        this.logs.forEach((x, i) => {
            if (x.id === log.id) {
                index = i;
            }
        });
        if (index !== -1) {
            this.logs.splice(index, 1);
        }
        this.updateTasks();
    }

    onCopyLog(text: string): void {
        this.logText = text;
    }

    onStartTimer(): void {
        if (!this.clockStarted) {
            this.clock.start();
            this.clockStarted = true;
        }
    }

    onStopTimer(): void {
        if (this.clockStarted) {
            this.clock.stop();
            this.clockStarted = false;
        }
    }

    onResetTimer(): void {
        this.onStopTimer();
        clearInterval(this.interval);
        this.interval = null;
        this.createClock();

        if (this.config.sprint) {
            this.onStartTimer();
        }
    }
}