/**
 * Created by artem.kolosovich on 07.02.2016.
 */

export function Logger(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
    var originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
        console.group();
        console.info([target, propertyKey, 'INV'].concat(args.length ? args : ['none']));
        var result = originalMethod.apply(this, args);
        console.info([target, propertyKey, 'RES', result || 'void'])
        console.groupEnd();
        return result;
    };

    return descriptor;
}