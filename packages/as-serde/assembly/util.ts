// @ts-nocheck
import { ISerdeTuple } from './index';

/**
 * Return true if val have `serialize` method.
 * @param val
 * @returns 
 */
@inline
export function hasSerialize<T>(val: T): bool {
    return isDefined(val.serialize);
}

/**
 * Return true if val have `deserialize` method.
 * @param val 
 * @returns 
 */
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
 * # Note
 * 
 * It will be useful when the default zero param constructor do not work for a class.
 * 
 * But users should try to avoid using this interface, 
 * because users can always design default constructors to initialize instances, 
 * this interface is designed to avoid performance loss or code reuse
 */
export interface IUnsafeInit {
    /**
     * A unsafe init method will be called when creates a new instance of this type after `__new`.
     * 
     */
    unsafeInit(): void;
}


/**
 * Return a zero value for primitive type or return null for reference type.
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
        const res = unsafeNew<T>();
        res.unsafeInit();
        return res;
    } else {
        return instantiate<T>();
    }
}

/**
 * Allocate a heap for a type without instancing its fields.
 * @returns 
 */
@unsafe
@inline
export function unsafeNew<T>(): T {
    return changetype<T>(__new(offsetof<T>(), idof<T>()));
}

