@inline
export function hasSerialize<T>(val: T): bool {
    // @ts-ignore
    return isDefined(val.serialize);
}

@inline
export function hasDeserialize<T>(val: T): bool {
    // @ts-ignore
    return isDefined(val.deserialize);
}
