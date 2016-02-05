/**
 * Created by artem.kolosovich on 21.01.2016.
 */

import {Component} from 'angular2/core';
import {ClockService} from "./app.clock.service";
import {Config, StringMap, Clock, Task, Template, Log} from "./app.types";
import {ConfigService} from "./app.config.service";
import {NotificationService} from "./app.notification.service";

@Component({
    selector: 'app',
    templateUrl: './app/template.html',
    providers: [ClockService, ConfigService, NotificationService]
})
export class ClockComponent {
    public config: Config;
    public durationSummary = 0;
    public logs: Array<Log> = [];
    public logText: string = '';
    public groupedTasks: { [key:string]: Task } = {};
    public tasks: Array<Task> = [];

    constructor(private clockService: ClockService,
                private configService: ConfigService) {

        this.config = configService.getConfig();
        clockService.createClock(this.config.counter);

        this.createTaskExample();
    }

    private clearState() {
        this.onResetTimer();
        this.logText = '';
    }

    private createTaskExample() {
        let text = 'Example, !tasks and #hashtags are highlighted.';
        let duration = 777;
        this.onSaveLog(text, duration);
    }

    private addOrUpdateTask(duration: number, words: Array<string>): void {
        words.forEach(s => {
            this.groupedTasks[s] = this.groupedTasks[s] || { value: 0, count: 0, name: null };
            this.groupedTasks[s].value += duration;
            this.groupedTasks[s].count++;
            this.groupedTasks[s].name = s;

            if (this.groupedTasks[s].value <= 0) {
                delete this.groupedTasks[s];
            }
        });
    }

    private createTemplate(source: string): Template {
        let symbolMap: StringMap<boolean> = {};
        let result: Template = { value: null, symbols: symbolMap };
        let delimiter = ' ';
        result.value = source
            .split(delimiter)
            .map((word: string) => {
                if (word.indexOf('#') == 0) {
                    return '<span class="tag">' + word + '</span>';
                }
                else if (word.indexOf('!') == 0) {
                    symbolMap[word] = true;
                    return '<span class="task">' + word + '</span>';
                }
                return word;
            }).join(delimiter);

        return result;
    }

    private updateDurationSummary(duration) {
        this.durationSummary += duration;
    }

    private updateTasks() {
        let keys = Object.keys(this.groupedTasks);
        this.tasks = keys.map(s => this.groupedTasks[s]);
    }

    private addLog(log: Log): void {
        this.logs.unshift(log);
    }

    onSaveLog(text?: string, duration?: number): void {
        if (this.logText || (text && duration)) {
            text = text || this.logText;
            duration = duration || this.clockService.getDuration();

            let id = this.clockService.getTimestamp();
            let template = this.createTemplate(text);
            let date = this.clockService.getDateTime();

            this.addLog({ id: id, date: date, duration: duration, text: text, template: template });
            this.addOrUpdateTask(duration, Object.keys(template.symbols));
            this.updateTasks();
            this.updateDurationSummary(duration);

            this.clearState();
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

        this.addOrUpdateTask(-log.duration, Object.keys(log.template.symbols));
        this.updateTasks();
        this.updateDurationSummary(-log.duration);
    }

    onCopyLogText(text: string): void {
        this.logText = text;
    }

    onGetTime(value: number, metric?: string): string {
        return this.clockService.formatDurationAsHours(value, metric || 'seconds');
    }

    onStartTimer(): void {
        if (!this.clockService.isClockStarted()) {
            this.clockService.startClock();
        }
    }

    onStopTimer(): void {
        if (this.clockService.isClockStarted()) {
            this.clockService.stopClock();
        }
    }

    onResetTimer(): void {
        this.onStopTimer();
        this.clockService.createClock(this.config.counter);
        if (this.config.sprint) {
            this.onStartTimer();
        }
    }
}