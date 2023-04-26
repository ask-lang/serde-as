// @ts-nocheck
import { ISerialize, isTuple } from "as-serde";
/**
 * All methods of` CoreSerializer` will be used in as-serde-transfrom
 */
abstract class CoreSerializer<R> {
    /**
     * startSerializeField is called by a normal class `serialize` method at the beginning.
     */
    abstract startSerializeField(): R;
    /**
     * endSerializeField is called by a normal class `serialize` method at the ending.
     */
    abstract endSerializeField(): R;
    /**
<<<<<<< HEAD
     * startSerializeEnum is called by a enum class `serialize` method at the beginning.
     */
    abstract startSerializeEnum(): R;

    /**
     * endSerializeEnum is called by a enum class `serialize` method at the ending.
     */
    abstract endSerializeEnum(): R;

    /**
     * serializeField is called by a class `serialize` method for nullable type.
=======
     * serializeField is called by a class `serialize` method for field of class.
>>>>>>> main
     * @param name field name
     * @param value field value
     */
    abstract serializeField<T>(name: string, value: T): R;
    /**
     * serializeLastField is called by a class `serialize` method for the last field of class.
     * @param name field name
     * @param value field value
     */
    @inline
    serializeLastField<T>(name: string, value: T): R {
        return this.serializeField<T>(name, value);
    }

    /**
     * Start to serialize a statically sized sequence whose length will be
     * known at deserialization time without looking at the serialized data.
     * This call must be followed by zero or more calls to `serializeTupleElem`,
     * then a call to `endSerializeTuple`
     * @param len
     */
    abstract startSerializeTuple(len: u32): R;
    /**
     * End to serialize a statically sized sequence.
     */
    abstract endSerializeTuple(): R;
    /**
     * This method should be used in after `startSerializeTuple` and before `endSerializeTuple`.
     * @param value
     */
    abstract serializeTupleElem<T>(value: T): R;
    /**
     * serializeLastTupleElem is called by a class `serialize` method for the last field of tuple class.
     * @param value
     */
    @inline
    serializeLastTupleElem<T>(value: T): R {
        return this.serializeTupleElem<T>(value);
    }
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

    /**
     * Serialize a value of nullable type.
     * @param value value could be nullable
     */
    abstract serializeNullable<T extends ISerialize>(value: T): R;
    /**
     * Serialize a value of nonull class.
     * @param value value could not be nullable
     */
    abstract serializeClass<T extends ISerialize>(value: nonnull<T>): R;

    /**
     * Serialize a value of nonull tuple class.
     *
     * # Note
     *
     * `extends` class is not supported for tuple class.
     * @param value value could not be nullable
     */
    abstract serializeTuple<T extends ISerialize>(value: nonnull<T>): R;

    abstract serializeIserialize(value: ISerialize): R;

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
        } else if (isTuple<T>(value)) {
            return this.serializeTuple<T>(value as nonnull<T>);
        } else {
            return this.serializeClass<T>(value as nonnull<T>);
        }
    }
}
