// @ts-nocheck
import { ISerdeTuple } from './index';

@inline
export function hasSerialize<T>(val: T): bool {
    return isDefined(val.serialize);
}

@inline
export function hasDeserialize<T>(val: T): bool {
    return isDefined(val.deserialize);
}

/**
 * Return true if this value class should work as a tuple.
 * @param val 
 * @returns 
 */
@inline
export function isTuple<T extends ISerdeTuple>(val: T): bool {
    return (val instanceof ISerdeTuple);
}

/**
 * A inteface for init a value correctly after `__new`.
 * 
 * It will be useful when the default zero param constructor do not work for a class.
 */
export interface IUnsafeInit {
    /**
     * A unsafe init method will be called when creates a new instance of this type after `__new`.
     * 
     */
    unsafeInit(): void;
}

/**
 * 
 * @returns 
 */
@unsafe
@inline
export function instantiateRaw<T>(): T {
    if (!isReference<T>()) {
        return 0 as T;
    }
    else if (isString<T>()) {
        return "";
    } else if (changetype<T>(0) instanceof IUnsafeInit) {
        const res = changetype<T>(__new(offsetof<T>(), idof<T>()));            
        res.unsafeInit();
        return res;
    } else {
        return instantiate<T>();
    }
}

