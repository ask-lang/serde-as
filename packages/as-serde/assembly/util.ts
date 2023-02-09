// @ts-nocheck

@inline
export function hasSerialize<T>(val: T): bool {
    
    return isDefined(val.serialize);
}

@inline
export function hasDeserialize<T>(val: T): bool {
    
    return isDefined(val.deserialize);
}
