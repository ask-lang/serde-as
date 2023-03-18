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

/// Return true if a class should work as a tuple.
@inline
export function isTuple<T extends ISerdeTuple>(val: T): bool {
    return (val instanceof ISerdeTuple);
}
