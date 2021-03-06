export abstract class CoreDeserializer {
    /**
     * startDeserializeField is called by a class `deserialize` method at the beginning.
     * This method does nothing by default
     */
    @inline
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    startDeserializeField(): void {}

    /**
     * endDeserializeField is called by a class `deserialize` method at the ending.
     * This method does nothing by default
     */
    @inline
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    endDeserializeField(): void {}

    /**
     * deserializeField is called by a class `deserialize` method for nullable type.
     * @param name field name
     * @returns field value
     */
    abstract deserializeField<T>(name: string | null): T;

    /**
     * deserializeNonNullField is called by a class `deserialize` method for non-null type.
     * @param name field name
     * @returns field value
     */
    abstract deserializeNonNullField<T>(name: string | null): nonnull<T>;

    /**
     * deserializeNonNullField is called by a class `deserialize` method at the end for nullable type.
     * @param name field name
     * @returns field value
     */
    abstract deserializeLastField<T>(name: string | null): T;
    /**
     * deserializeNonNullField is called by a class `deserialize` method at the end for non-null type.
     * @param name field name
     * @returns field value
     */
    abstract deserializeNonNullLastField<T>(name: string | null): nonnull<T>;

    // TODO: maybe we can remove `deserializeLastField` and `deserializeNonNullLastField`
}

export abstract class Deserializer extends CoreDeserializer {
    abstract deserializeBool(): bool;
    abstract deserializeU8(): u8;
    abstract deserializeI8(): i8;
    abstract deserializeU16(): u16;
    abstract deserializeI16(): i16;
    abstract deserializeU32(): u32;
    abstract deserializeI32(): i32;
    abstract deserializeU64(): u64;
    abstract deserializeI64(): i64;
    abstract deserializeF32(): f32;
    abstract deserializeF64(): f64;

    abstract deserializeError<E extends Error>(): E;
    abstract deserializeString(): string;
    abstract deserializeSet<K, T extends Set<K>>(): T;
    abstract deserializeMap<K, V, T extends Map<K, V> = Map<K, V>>(): T;

    @inline
    deserializeInt8Array<A extends Int8Array>(): A {
        return this.deserializeTypedArray<A>();
    }
    @inline
    deserializeInt16Array<A extends Int16Array>(): A {
        return this.deserializeTypedArray<A>();
    }
    @inline
    deserializeInt32Array<A extends Int32Array>(): A {
        return this.deserializeTypedArray<A>();
    }
    @inline
    deserializeInt64Array<A extends Int64Array>(): A {
        return this.deserializeTypedArray<A>();
    }

    @inline
    deserializeUint8Array<A extends Uint8Array>(): A {
        return this.deserializeTypedArray<A>();
    }
    @inline
    deserializeUint16Array<A extends Uint16Array>(): A {
        return this.deserializeTypedArray<A>();
    }
    @inline
    deserializeUint32Array<A extends Uint32Array>(): A {
        return this.deserializeTypedArray<A>();
    }
    @inline
    deserializeUint64Array<A extends Uint64Array>(): A {
        return this.deserializeTypedArray<A>();
    }

    @inline
    deserializeFloat32Array<A extends Float32Array>(): A {
        return this.deserializeTypedArray<A>();
    }
    @inline
    deserializeFloat64Array<A extends Float64Array>(): A {
        return this.deserializeTypedArray<A>();
    }

    @inline
    // @ts-ignore
    deserializeTypedArray<A extends TypedArray<valueof<A>>>(): A {
        return this.deserializeArrayLike<A>();
    }

    // @ts-ignore
    abstract deserializeArrayLike<A extends ArrayLike<valueof<A>>>(): A;

    abstract deserializeNullable<T>(): T;
    abstract deserializeClass<T>(): T;

    abstract startDeserializeTuple(len: u32): void;
    abstract endDeserializeTuple(): void;

    abstract deserializeTupleElem<T>(): T;
    abstract deserializeNonNullTupleElem<T>(): nonnull<T>;

    deserializeNonNullField<T>(name: string | null): nonnull<T> {
        return this.deserializeField<nonnull<T>>(name);
    }

    deserializeLastField<T>(name: string | null): T {
        return this.deserializeField<T>(name);
    }

    deserializeNonNullLastField<T>(name: string | null): nonnull<T> {
        return this.deserializeField<nonnull<T>>(name);
    }

    @inline
    deserializeArray<A extends Array<valueof<A>>>(): A {
        return this.deserializeArrayLike<A>();
    }
    @inline
    // @ts-ignore
    deserializeStaticArray<A extends StaticArray<valueof<A>>>(): A {
        return this.deserializeArrayLike<A>();
    }

    // @ts-ignore
    deserializeArrayBuffer(): ArrayBuffer {
        // ArrayBuffer's layout is same with StaticArray<u8>
        return changetype<ArrayBuffer>(this.deserializeStaticArray<StaticArray<u8>>());
    }

    @inline
    deserializeNumber<T extends number>(): T {
        if (isFloat<T>()) {
            if (sizeof<T>() == 4) {
                // @ts-ignore
                return this.deserializeF32();
            } else {
                // sizeof<N>() == 8
                // @ts-ignore
                return this.deserializeF64();
            }
        } else if (isSigned<T>()) {
            if (sizeof<T>() == 1) {
                // @ts-ignore
                return this.deserializeI8();
            } else if (sizeof<T>() == 2) {
                // @ts-ignore
                return this.deserializeI16();
            } else if (sizeof<T>() == 4) {
                // @ts-ignore
                return this.deserializeI32();
            } else {
                // sizeof<N>() == 8
                // @ts-ignore
                return this.deserializeI64();
            }
        } else {
            if (sizeof<T>() == 1) {
                // @ts-ignore
                return this.deserializeU8();
            } else if (sizeof<T>() == 2) {
                // @ts-ignore
                return this.deserializeU16();
            } else if (sizeof<T>() == 4) {
                // @ts-ignore
                return this.deserializeU32();
            } else if (sizeof<T>() == 8) {
                // @ts-ignore
                return this.deserializeU64();
            } else {
                unreachable();
            }
        }
    }

    @inline
    deserialize<T>(): T {
        let value: T;
        if (isNullable<T>()) {
            return this.deserializeNullable<T>();
        } else if (isBoolean<T>()) {
            // @ts-ignore
            return this.deserializeBool();
        } else if (isInteger<T>() || isFloat<T>()) {
            // @ts-ignore
            return this.deserializeNumber<T>();
        } else if (isString<T>()) {
            // @ts-ignore
            return this.deserializeString();
        }
        // try custom method first
        // @ts-ignore
        else if (isDefined(value.deserialize)) {
            return this.deserializeClass<T>();
        } else if (isArray<T>()) {
            // @ts-ignore
            return this.deserializeArray<T>();
        } else if (idof<T>() == idof<ArrayBuffer>()) {
            // @ts-ignore
            return this.deserializeArrayBuffer();
        }
        // opt for Int8Array
        else if (idof<T>() == idof<Int8Array>()) {
            // @ts-ignore
            return this.deserializeInt8Array<T>();
        }
        // opt for Int16Array
        else if (idof<T>() == idof<Int16Array>()) {
            // @ts-ignore
            return this.deserializeInt16Array<T>();
        } // opt for Int32Array
        else if (idof<T>() == idof<Int32Array>()) {
            // @ts-ignore
            return this.deserializeInt32Array<T>();
        } // opt for Int64Array
        else if (idof<T>() == idof<Int64Array>()) {
            // @ts-ignore
            return this.deserializeInt64Array<T>();
        }
        // opt for Uint8Array
        else if (idof<T>() == idof<Uint8Array>()) {
            // @ts-ignore
            return this.deserializeUint8Array<T>();
        }
        // opt for Uint16Array
        else if (idof<T>() == idof<Uint16Array>()) {
            // @ts-ignore
            return this.deserializeUint16Array<T>();
        } // opt for Uint32Array
        else if (idof<T>() == idof<Uint32Array>()) {
            // @ts-ignore
            return this.deserializeUint32Array<T>();
        } // opt for Uint64Array
        else if (idof<T>() == idof<Uint64Array>()) {
            // @ts-ignore
            return this.deserializeUint64Array<T>();
        }
        // opt for Float32Array
        else if (idof<T>() == idof<Float32Array>()) {
            // @ts-ignore
            return this.deserializeFloat32Array<T>();
        }
        // opt for Float64Array
        else if (idof<T>() == idof<Float64Array>()) {
            // @ts-ignore
            return this.deserializeFloat64Array<T>();
        } else if (isArrayLike<T>()) {
            // @ts-ignore
            return this.deserializeArrayLike<T>();
        } else {
            return this._deserializeDyn<T>();
        }
    }

    @inline
    protected _deserializeDyn<T>(): T {
        // for sub-class
        let value: T;
        // @ts-ignore
        if (value instanceof StaticArray) {
            // @ts-ignore
            return this.deserializeStaticArray<T>();
        }
        // for sub-class
        // @ts-ignore
        else if (value instanceof ArrayBuffer) {
            // @ts-ignore
            return this.deserializeArrayBuffer<T>();
        }
        // @ts-ignore
        else if (value instanceof Uint8Array) {
            // @ts-ignore
            return this.deserializeUint8Array<T>();
            // @ts-ignore
        } else if (value instanceof Uint16Array) {
            // @ts-ignore
            return this.deserializeUint16Array<T>();
            // @ts-ignore
        } else if (value instanceof Uint32Array) {
            // @ts-ignore
            return this.deserializeUint32Array<T>();
            // @ts-ignore
        } else if (value instanceof Uint64Array) {
            // @ts-ignore
            return this.deserializeUint64Array<T>();
            // @ts-ignore
        } else if (value instanceof Int8Array) {
            // @ts-ignore
            return this.deserializeInt8Array<T>();
            // @ts-ignore
        } else if (value instanceof Int16Array) {
            // @ts-ignore
            return this.deserializeInt16Array<T>();
            // @ts-ignore
        } else if (value instanceof Int32Array) {
            // @ts-ignore
            return this.deserializeInt32Array<T>();
            // @ts-ignore
        } else if (value instanceof Int64Array) {
            // @ts-ignore
            return this.deserializeInt64Array<T>();
            // @ts-ignore
        } else if (value instanceof Float32Array) {
            // @ts-ignore
            return this.deserializeFloat32Array<T>();
            // @ts-ignore
        } else if (value instanceof Float64Array) {
            // @ts-ignore
            return this.deserializeFloat64Array<T>();
        } else if (isArrayLike<T>()) {
            // @ts-ignore
            return this.deserializeArrayLike<T>();
            // @ts-ignore
        } else if (value instanceof Error) {
            // @ts-ignore
            return this.deserializeError();
            // @ts-ignore
        } else if (value instanceof Set) {
            // @ts-ignore
            return this.deserializeSet<indexof<T>, T>();
            // @ts-ignore
        } else if (value instanceof Map) {
            // @ts-ignore
            return this.deserializeMap<indexof<T>, valueof<T>, T>();
        } else {
            // for compile error
            return this.deserializeClass<T>();
        }
    }
}
