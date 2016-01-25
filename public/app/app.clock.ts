/**
 * Created by artem.kolosovich on 23.01.2016.
 */

export interface Clock {
    start: () => void;
    stop: () => void;
    getTime: () => number;
}