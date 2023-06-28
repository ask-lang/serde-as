// @ts-nocheck
import { isTuple, IDeserialize } from ".";

/**
 * All methods of `CoreDeserializer` will be used in as-serde-transfrom
 */
abstract class CoreDeserializer {
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
     * deserializeField is called by a class `deserialize` method for field of class.
     * @param name field name
     * @returns field value
     */
    abstract deserializeField<T>(name: string): T;
    /**
     * deserializeLastField is called by a class `deserialize` method for the last field of class.
     * @param name field name
     * @returns field value
     */
    deserializeLastField<T>(name: string): T {
        return this.deserializeField<T>(name);
    }

    /**
     * Start to deserialize a statically sized sequence without looking at the serialized data.
     * This call must be followed by zero or more calls to `deserializeTupleElem`,
     * then a call to `endDeserializeTuple`
     * @param len
     */
    abstract startDeserializeTuple(len: u32): void;
    /**
     * End to serialize a statically sized sequence.
     */
    abstract endDeserializeTuple(): void;
    /**
     * This method should be used in after `startSerializeTuple` and before `endSerializeTuple`.
     * @param value
     */
    abstract deserializeTupleElem<T>(): T;
    /**
     * deserializeLastTupleElem is called by a class `deserialize` method for the last field of tuple class.
     * @returns value
     */
    deserializeLastTupleElem<T>(): T {
        return this.deserializeTupleElem<T>();
    }
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
    deserializeTypedArray<A extends TypedArray<valueof<A>>>(): A {
        return this.deserializeArrayLike<A>();
    }

    abstract deserializeArrayLike<A extends ArrayLike<valueof<A>>>(): A;

    /**
     * Deserialize a value of nullable type.
     * @param value value could be nullable
     */
    abstract deserializeNullable<T extends ISerialize>(): T;
    /**
     * Deserialize a value of nonull class.
     * @param value value could not be nullable
     */
    abstract deserializeClass<T extends ISerialize>(): nonnull<T>;

    /**
     * Deserialize a value of nonull tuple class.
     *
     * # Note
     *
     * `extends` class is not supported for tuple class.
     * @param value value could not be nullable
     */
    abstract deserializeTuple<T extends ISerialize>(): nonnull<T>;

    abstract deserializeIDeserialize<T extends IDeserialize>(): T;

    @inline
    deserializeArray<A extends Array<valueof<A>>>(): A {
        return this.deserializeArrayLike<A>();
    }
    @inline
    deserializeStaticArray<A extends StaticArray<valueof<A>>>(): A {
        return this.deserializeArrayLike<A>();
    }

    deserializeArrayBuffer(): ArrayBuffer {
        // ArrayBuffer's layout is same with StaticArray<u8>
        return changetype<ArrayBuffer>(this.deserializeStaticArray<StaticArray<u8>>());
    }

    @inline
    deserializeNumber<T extends number>(): T {
        if (isFloat<T>()) {
            if (sizeof<T>() == 4) {
                return this.deserializeF32();
            } else {
                // sizeof<N>() == 8
                return this.deserializeF64();
            }
        } else if (isSigned<T>()) {
            if (sizeof<T>() == 1) {
                return this.deserializeI8();
            } else if (sizeof<T>() == 2) {
                return this.deserializeI16();
            } else if (sizeof<T>() == 4) {
                return this.deserializeI32();
            } else {
                // sizeof<N>() == 8
                return this.deserializeI64();
            }
        } else {
            if (sizeof<T>() == 1) {
                return this.deserializeU8();
            } else if (sizeof<T>() == 2) {
                return this.deserializeU16();
            } else if (sizeof<T>() == 4) {
                return this.deserializeU32();
            } else if (sizeof<T>() == 8) {
                return this.deserializeU64();
            } else {
                unreachable();
            }
        }
    }

    @inline
    deserialize<T>(): T {
        if (isNullable<T>()) {
            return this.deserializeNullable<T>();
        } else if (isBoolean<T>()) {
            return this.deserializeBool();
        } else if (isInteger<T>() || isFloat<T>()) {
            return this.deserializeNumber<T>();
        } else if (isString<T>()) {
            return this.deserializeString();
        } else if (isArray<T>()) {
            return this.deserializeArray<T>();
        } else if (idof<T>() == idof<ArrayBuffer>()) {
            return this.deserializeArrayBuffer();
        }
        // opt for Int8Array
        else if (idof<T>() == idof<Int8Array>()) {
            return this.deserializeInt8Array<T>();
        }
        // opt for Int16Array
        else if (idof<T>() == idof<Int16Array>()) {
            return this.deserializeInt16Array<T>();
        } // opt for Int32Array
        else if (idof<T>() == idof<Int32Array>()) {
            return this.deserializeInt32Array<T>();
        } // opt for Int64Array
        else if (idof<T>() == idof<Int64Array>()) {
            return this.deserializeInt64Array<T>();
        }
        // opt for Uint8Array
        else if (idof<T>() == idof<Uint8Array>()) {
            return this.deserializeUint8Array<T>();
        }
        // opt for Uint16Array
        else if (idof<T>() == idof<Uint16Array>()) {
            return this.deserializeUint16Array<T>();
        } // opt for Uint32Array
        else if (idof<T>() == idof<Uint32Array>()) {
            return this.deserializeUint32Array<T>();
        } // opt for Uint64Array
        else if (idof<T>() == idof<Uint64Array>()) {
            return this.deserializeUint64Array<T>();
        }
        // opt for Float32Array
        else if (idof<T>() == idof<Float32Array>()) {
            return this.deserializeFloat32Array<T>();
        }
        // opt for Float64Array
        else if (idof<T>() == idof<Float64Array>()) {
            return this.deserializeFloat64Array<T>();
        } else if (isArrayLike<T>()) {
            return this.deserializeArrayLike<T>();
        } else {
            return this._deserializeDyn<T>();
        }
    }

    @inline
    protected _deserializeDyn<T>(): T {
        let value: T = changetype<T>(0);
        // for sub-class
        if (value instanceof StaticArray) {
            return this.deserializeStaticArray<T>();
        }
        // for sub-class
        else if (value instanceof ArrayBuffer) {
            return this.deserializeArrayBuffer();
        } else if (value instanceof Uint8Array) {
            return this.deserializeUint8Array<T>();
        } else if (value instanceof Uint16Array) {
            return this.deserializeUint16Array<T>();
        } else if (value instanceof Uint32Array) {
            return this.deserializeUint32Array<T>();
        } else if (value instanceof Uint64Array) {
            return this.deserializeUint64Array<T>();
        } else if (value instanceof Int8Array) {
            return this.deserializeInt8Array<T>();
        } else if (value instanceof Int16Array) {
            return this.deserializeInt16Array<T>();
        } else if (value instanceof Int32Array) {
            return this.deserializeInt32Array<T>();
        } else if (value instanceof Int64Array) {
            return this.deserializeInt64Array<T>();
        } else if (value instanceof Float32Array) {
            return this.deserializeFloat32Array<T>();
        } else if (value instanceof Float64Array) {
            return this.deserializeFloat64Array<T>();
        } else if (isArrayLike<T>()) {
            return this.deserializeArrayLike<T>();
        } else if (value instanceof Error) {
            return this.deserializeError();
        } else if (value instanceof Set) {
            return this.deserializeSet<indexof<T>, T>();
        } else if (value instanceof Map) {
            return this.deserializeMap<indexof<T>, valueof<T>, T>();
        } else if (isTuple<T>(value)) {
            return this.deserializeTuple<T>();
        } else {
            return this.deserializeClass<T>();
        }
    }
}
