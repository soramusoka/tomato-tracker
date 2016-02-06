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

    private updateDurationSummary(duration: number) {
        console.info('updateDurationSummary:', typeof duration, duration);
        this.durationSummary += duration;
        if (this.durationSummary < 0) {
            this.durationSummary = 0;
        }
    }

    private updateTasks() {
        let keys = Object.keys(this.groupedTasks);
        this.tasks = keys.map(s => this.groupedTasks[s]);
    }

    private addLog(log: Log): void {
        this.logs.unshift(log);
    }

    onSaveLog(text?: string, duration?: number): void {
        console.info('onSaveLog:', text, duration);
        if (this.logText || (text && duration)) {
            text = text || this.logText;
            duration = duration || this.clockService.getDuration();

            let id = this.clockService.getTimestamp();
            let date = this.clockService.getDateTime();
            let template = this.createTemplate(text);

            this.addLog({ id: id, date: date, durationOld: duration, duration: duration, text: text, template: template, mode: 'view' });
            this.addOrUpdateTask(duration, Object.keys(template.symbols));
            this.updateTasks();
            this.updateDurationSummary(duration);

            this.clearState();
        }
    }

    private deleteLog(id: string) {
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

    onDeleteLog(log: Log): void {
        console.info('onDeleteLog:', JSON.stringify(log));
        this.deleteLog(log.id);
        this.addOrUpdateTask(-log.durationOld, Object.keys(log.template.symbols));
        this.updateTasks();
        this.updateDurationSummary(-log.durationOld);
    }

    onCopyLogText(text: string): void {
        console.info('onCopyLogText:', text);
        this.logText = text;
    }

    onEditLog(log: Log): void {
        console.info('onEditLog:', JSON.stringify(log));
        log.mode = 'edit';
    }

    onUpdateLog(log: Log): void {
        console.info('onUpdateLog:', JSON.stringify(log));
        this.onDeleteLog(log);
        this.onSaveLog(log.text, log.duration);
    }

    onLogDurationChange(log) {
        console.info('onLogDurationChange:', JSON.stringify(log));
        log.duration = parseInt(log.duration);
        if (!log.duration) {
            log.duration = log.durationOld;
        }
    }

    onGetTime(duration: number, metric?: string): string {
        console.info('onGetTime:', duration, metric);
        return this.clockService.formatDurationAsHours(duration, metric || 'seconds');
    }

    onStartTimer(): void {
        console.info('onStartTimer');
        if (!this.clockService.isClockStarted()) {
            this.clockService.startClock();
        }
    }

    onStopTimer(): void {
        console.info('onStopTimer');
        if (this.clockService.isClockStarted()) {
            this.clockService.stopClock();
        }
    }

    onResetTimer(): void {
        console.info('onResetTimer');
        this.onStopTimer();
        this.clockService.createClock(this.config.counter);
        if (this.config.sprint) {
            this.onStartTimer();
        }
    }
}