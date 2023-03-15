// @ts-nocheck
import { ISerialize } from "as-serde";
/**
 * All methods of` CoreSerializer` will be used in as-serde-transfrom
 */
export abstract class CoreSerializer<R> {
    /**
     * startSerializeField is called by a class `serialize` method at the beginning.
     */
    abstract startSerializeField(): R;

    /**
     * endSerializeField is called by a class `serialize` method at the ending.
     */
    abstract endSerializeField(): R;

    /**
     * serializeField is called by a class `serialize` method for nullable type.
     * @param name field name
     * @param value field value
     */
    abstract serializeField<T>(name: string | null, value: T): R;

    /**
     * serializeLastField is called by a class `serialize` method at the end for nullable type.
     * @param name field name
     * @param value field value
     */
    abstract serializeLastField<T>(name: string | null, value: T): R;

    // TODO: maybe we can remove `serializeLastField`
}

/**
 * Serializer support most of builtin types of Assemblyscript
 */
export abstract class Serializer<R> extends CoreSerializer<R> {
    abstract serializeBool(value: bool): R;
    serializeU8(value: u8): R {
        return this.serializeU64(value as u64);
    }
    serializeI8(value: i8): R {
        return this.serializeI64(value as i64);
    }
    serializeU16(value: u16): R {
        return this.serializeU64(value as u64);
    }
    serializeI16(value: i16): R {
        return this.serializeI64(value as i64);
    }
    serializeU32(value: u32): R {
        return this.serializeU64(value as u64);
    }
    serializeI32(value: i32): R {
        return this.serializeI64(value as i64);
    }
    abstract serializeU64(value: u64): R;
    abstract serializeI64(value: i64): R;

    serializeF32(value: f32): R {
        return this.serializeF64(value as f64);
    }
    abstract serializeF64(value: f64): R;

    abstract serializeError<E extends Error>(value: E): R;
    abstract serializeString(value: string): R;
    abstract serializeSet<K, T extends Set<K>>(value: T): R;
    abstract serializeMap<K, V, T extends Map<K, V>>(value: T): R;

    abstract serializeClass<C extends ISerialize>(value: C): R;

    abstract serializeIserialize(value: ISerialize): R;

    abstract startSerializeTuple(): R;
    abstract endSerializeTuple(): R;
    abstract serializeTupleElem<T>(value: T): R;

    @inline
    serializeLastField<T>(name: string | null, value: T): R {
        return this.serializeField<T>(name, value);
    }

    /**
     * Serialize a value of nullable type.
     * @param value value could be nullable
     */
    abstract serializeNullable<V>(value: V): R;

    /**
     * This is the default method for all other types.
     * @param value array value
     */

    abstract serializeArrayLike<A extends ArrayLike<valueof<A>>>(value: A): R;

    @inline
    serializeArray<A extends Array<valueof<A>>>(value: A): R {
        return this.serializeArrayLike(value);
    }

    serializeStaticArray<A extends StaticArray<valueof<A>>>(value: A): R {
        return this.serializeArrayLike(value);
    }

    serializeArrayBuffer(value: ArrayBuffer): R {
        // ArrayBuffer's layout is same with StaticArray<u8>
        return this.serializeStaticArray<StaticArray<u8>>(changetype<StaticArray<u8>>(value));
    }

    @inline
    serializeInt8Array<A extends Int8Array>(value: A): R {
        return this.serializeTypedArray(value);
    }
    @inline
    serializeInt16Array<A extends Int16Array>(value: A): R {
        return this.serializeTypedArray(value);
    }
    @inline
    serializeInt32Array<A extends Int32Array>(value: A): R {
        return this.serializeTypedArray(value);
    }
    @inline
    serializeInt64Array<A extends Int64Array>(value: A): R {
        return this.serializeTypedArray(value);
    }

    @inline
    serializeUint8Array<A extends Uint8Array>(value: A): R {
        return this.serializeTypedArray(value);
    }
    @inline
    serializeUint16Array<A extends Uint16Array>(value: A): R {
        return this.serializeTypedArray(value);
    }
    @inline
    serializeUint32Array<A extends Uint32Array>(value: A): R {
        return this.serializeTypedArray(value);
    }
    @inline
    serializeUint64Array<A extends Uint64Array>(value: A): R {
        return this.serializeTypedArray(value);
    }

    @inline
    serializeFloat32Array<A extends Float32Array>(value: A): R {
        return this.serializeTypedArray(value);
    }
    @inline
    serializeFloat64Array<A extends Float64Array>(value: A): R {
        return this.serializeTypedArray(value);
    }
    @inline
    serializeTypedArray<A extends TypedArray<valueof<A>>>(value: A): R {
        return this.serializeArrayLike(value);
    }

    @inline
    serializeNumber<T extends number>(value: T): R {
        if (isFloat<T>()) {
            if (sizeof<T>() == 4) {
                return this.serializeF32(value);
            } else {
                // sizeof<N>() == 8
                return this.serializeF64(value);
            }
        } else if (isSigned<T>()) {
            if (sizeof<T>() == 1) {
                return this.serializeI8(value);
            } else if (sizeof<T>() == 2) {
                return this.serializeI16(value);
            } else if (sizeof<T>() == 4) {
                return this.serializeI32(value);
            } else {
                // sizeof<N>() == 8
                return this.serializeI64(value);
            }
        } else {
            if (sizeof<T>() == 1) {
                return this.serializeU8(value);
            } else if (sizeof<T>() == 2) {
                return this.serializeU16(value);
            } else if (sizeof<T>() == 4) {
                return this.serializeU32(value);
            } else {
                // sizeof<N>() == 8
                return this.serializeU64(value);
            }
        }
    }

    @inline
    serialize<T>(value: T): R {
        if (isNullable<T>()) {
            return this.serializeNullable<T>(value);
        } else if (isBoolean<T>()) {
            return this.serializeBool(value);
        } else if (isInteger<T>() || isFloat<T>()) {
            return this.serializeNumber<T>(value);
        } else if (isString<T>()) {
            return this.serializeString(value);
        } else if (isArray<T>()) {
            return this.serializeArray<T>(value);
        } else if (idof<T>() == idof<ArrayBuffer>()) {
            return this.serializeArrayBuffer(value);
        }
        // opt for Int8Array
        else if (idof<T>() == idof<Int8Array>()) {
            return this.serializeInt8Array<T>(value);
        }
        // opt for Int16Array
        else if (idof<T>() == idof<Int16Array>()) {
            return this.serializeInt16Array<T>(value);
        } // opt for Int32Array
        else if (idof<T>() == idof<Int32Array>()) {
            return this.serializeInt32Array<T>(value);
        } // opt for Int64Array
        else if (idof<T>() == idof<Int64Array>()) {
            return this.serializeInt64Array<T>(value);
        }
        // opt for Uint8Array
        else if (idof<T>() == idof<Uint8Array>()) {
            return this.serializeUint8Array<T>(value);
        }
        // opt for Uint16Array
        else if (idof<T>() == idof<Uint16Array>()) {
            return this.serializeUint16Array<T>(value);
        } // opt for Uint32Array
        else if (idof<T>() == idof<Uint32Array>()) {
            return this.serializeUint32Array<T>(value);
        } // opt for Uint64Array
        else if (idof<T>() == idof<Uint64Array>()) {
            return this.serializeUint64Array<T>(value);
        }
        // opt for Float32Array
        else if (idof<T>() == idof<Float32Array>()) {
            return this.serializeFloat32Array<T>(value);
        }
        // opt for Float64Array
        else if (idof<T>() == idof<Float64Array>()) {
            return this.serializeFloat64Array<T>(value);
        } else {
            return this._serializeDyn<T>(value);
        }
    }

    protected _serializeDyn<T>(value: T): R {
        if (value instanceof Array) {
            return this.serializeArray<T>(value);
        } else if (value instanceof StaticArray) {
            return this.serializeStaticArray<T>(value);
        } else if (value instanceof ArrayBuffer) {
            return this.serializeArrayBuffer<T>(value);
        } else if (value instanceof Uint8Array) {
            return this.serializeUint8Array<T>(value);
        } else if (value instanceof Uint16Array) {
            return this.serializeUint16Array<T>(value);
        } else if (value instanceof Uint32Array) {
            return this.serializeUint32Array<T>(value);
        } else if (value instanceof Uint64Array) {
            return this.serializeUint64Array<T>(value);
        } else if (value instanceof Int8Array) {
            return this.serializeInt8Array<T>(value);
        } else if (value instanceof Int16Array) {
            return this.serializeInt16Array<T>(value);
        } else if (value instanceof Int32Array) {
            return this.serializeInt32Array<T>(value);
        } else if (value instanceof Int64Array) {
            return this.serializeInt64Array<T>(value);
        } else if (value instanceof Float32Array) {
            return this.serializeFloat32Array<T>(value);
        } else if (value instanceof Float64Array) {
            return this.serializeFloat64Array<T>(value);
        } else if (isArrayLike<T>()) {
            return this.serializeArrayLike<T>(value);
        } else if (value instanceof Error) {
            return this.serializeError(value as Error);
        } else if (value instanceof Set) {
            return this.serializeSet<indexof<T>, T>(value);
        } else if (value instanceof Map) {
            return this.serializeMap<indexof<T>, valueof<T>, T>(value);
        } else {
            // for compile error
            return this.serializeClass(value);
        }
    }
}
