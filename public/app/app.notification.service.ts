/**
 * Created by artem.kolosovich on 23.01.2016.
 */

import {Injectable} from "angular2/core";

@Injectable()
export class NotificationService {
    private audio: { play: () => void; };
    private interval;

    constructor() {
        this.audio = new Audio('./assets/sound.mp3');
    }

    private playSound() {
        this.audio.play();
    }

    notify(): void {
        this.interval = setInterval(() => this.playSound(), 2000);
        // send notification via email, telegram, etc
    }

    stop() {
        clearInterval(this.interval);
        this.interval = null;
    }
}