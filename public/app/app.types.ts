/**
 * Created by artem.kolosovich on 23.01.2016.
 */

export interface StringMap<T> {
    [key: string]: T;
}

export interface Template {
    value: string;
    symbols: StringMap<boolean>;
}

export interface Log {
    id: string,
    text: string;
    period: number;
    template: Template;
    date: Date
}

export interface Clock {
    start: () => void;
    stop: () => void;
    getTime: () => number;
}

export interface Task {
    name: string;
    value: number;
    count: number;
}

export interface Config {
    counter: number;
    sprint: boolean;
    showBar: boolean;
    day: string;
}