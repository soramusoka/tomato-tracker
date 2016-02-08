/**
 * Created by artem.kolosovich on 21.01.2016.
 */

import {Component} from 'angular2/core';
import {ClockService} from "./app.clock.service";
import {Config, StringMap, Clock, Task, Template, Log} from "./app.types";
import {ConfigService} from "./app.config.service";
import {Logger} from "./app.logger";
import {AppStorage} from "./app.storage";
import {NotificationService} from "./app.notification.service";

@Component({
    selector: 'app',
    templateUrl: './app/template.html',
    providers: [ClockService, ConfigService, AppStorage, NotificationService]
})
export class ClockComponent {
    public config: Config;
    public durationSummary = 0;
    public logs: Array<Log> = [];
    public logText: string = '';
    public groupedTasks: { [key:string]: Task } = {};
    public tasks: Array<Task> = [];

    constructor(private clockService: ClockService,
                private configService: ConfigService,
                private appStorage: AppStorage) {

        this.config = configService.getConfig();
        this.clockService.createClock(this.config.counter);
        this.loadStorageData();
    }

    private loadStorageData() {
        let data = this.appStorage.load(this.config.day);
        if (data) {
            data.forEach(x => {
                x.date = this.clockService.getDateTime(x.date);
                this.addLog(x);
                this.addOrUpdateTask(x.duration, Object.keys(x.template.symbols));
                this.updateDurationSummary(x.duration);
            });
            this.updateTasks();
        } else {
            this.createTaskExample();
        }
    }

    private updateStorageData() {
        this.appStorage.save(this.config.day, this.logs);
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

    @Logger
    onSaveLog(text?: string, duration?: number): void {
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
            this.updateStorageData();

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

    @Logger
    onDeleteLog(log: Log): void {
        this.deleteLog(log.id);
        this.addOrUpdateTask(-log.durationOld, Object.keys(log.template.symbols));
        this.updateTasks();
        this.updateDurationSummary(-log.durationOld);
        this.updateStorageData();
    }

    @Logger
    onCopyLogText(text: string): void {
        this.logText = text;
    }

    @Logger
    onEditLog(log: Log): void {
        log.mode = 'edit';
    }

    @Logger
    onUpdateLog(log: Log): void {
        this.onDeleteLog(log);
        this.onSaveLog(log.text, log.duration);
    }

    @Logger
    onLogDurationChange(log) {
        log.duration = parseInt(log.duration);
        if (!log.duration) {
            log.duration = log.durationOld;
        }
    }

    @Logger
    onGetTime(duration: number, metric?: string): string {
        return this.clockService.formatDurationAsHours(duration, metric || 'seconds');
    }

    @Logger
    onStartTimer(): void {
        if (!this.clockService.isClockStarted()) {
            this.clockService.startClock();
        }
    }

    @Logger
    onStopTimer(): void {
        if (this.clockService.isClockStarted()) {
            this.clockService.stopClock();
        }
    }

    @Logger
    onResetTimer(): void {
        this.onStopTimer();
        this.clockService.createClock(this.config.counter);
        if (this.config.sprint) {
            this.onStartTimer();
        }
    }
}