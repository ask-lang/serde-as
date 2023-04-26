// @ts-nocheck
import { ISerialize, Serializer } from "as-serde";
import { BytesBuffer } from "as-buffers";
import { Compact } from "./compactInt";
import { FLOAT_UNSPPORTED } from "./misc";
import { i128, u128 } from "./index";

export class ScaleSerializer extends Serializer<BytesBuffer> {
    @lazy
    private static readonly scale: ScaleSerializer = new ScaleSerializer();

    constructor(protected _buffer: BytesBuffer = new BytesBuffer()) {
        super();
    }

    /**
     * Serialize a value to a StaticArray.
     *
     * It reuse a global ScaleSerializer.
     * @param value value to be serialized
     * @returns
     */
    @inline
    static serialize<C>(value: C): StaticArray<u8> {
        ScaleSerializer.scale.clear();
        return ScaleSerializer.scale.serialize<C>(value).toStaticArray();
    }

    /**
     *
     * @returns Return the underline buffer.
     */
    @unsafe
    @inline
    buffer(): BytesBuffer {
        return this._buffer;
    }

    @inline
    clear(): void {
        this._buffer.resetOffset();
    }

    @inline
    serializeBool(value: bool): BytesBuffer {
        this._buffer.writeBool(value);
        return this._buffer;
    }

    @inline
    serializeU8(value: u8): BytesBuffer {
        this._buffer.writeUInt8(value);
        return this._buffer;
    }
    @inline
    serializeI8(value: i8): BytesBuffer {
        this._buffer.writeInt8(value);
        return this._buffer;
    }
    @inline
    serializeU16(value: u16): BytesBuffer {
        this._buffer.writeUInt16LE(value);
        return this._buffer;
    }
    @inline
    serializeI16(value: i16): BytesBuffer {
        this._buffer.writeInt16LE(value);
        return this._buffer;
    }
    @inline
    serializeU32(value: u32): BytesBuffer {
        this._buffer.writeUInt32LE(value);
        return this._buffer;
    }
    @inline
    serializeI32(value: i32): BytesBuffer {
        this._buffer.writeInt32LE(value);
        return this._buffer;
    }
    @inline
    serializeU64(value: u64): BytesBuffer {
        this._buffer.writeUInt64LE(value);
        return this._buffer;
    }
    @inline
    serializeI64(value: i64): BytesBuffer {
        this._buffer.writeInt64LE(value);
        return this._buffer;
    }

    @inline
    serializeI128(value: i128): BytesBuffer {
        this._buffer.writeBytes(value.toStaticBytes());
        return this._buffer;
    }

    @inline
    serializeU128(value: u128): BytesBuffer {
        this._buffer.writeBytes(value.toStaticBytes());
        return this._buffer;
    }

    serializeF32(_value: f32): BytesBuffer {
        assert(false, FLOAT_UNSPPORTED);
        return this._buffer;
    }

    serializeF64(_value: f64): BytesBuffer {
        assert(false, FLOAT_UNSPPORTED);
        return this._buffer;
    }

    @inline
    serializeCompactInt<T extends number>(value: T): BytesBuffer {
        const num = new Compact<T>(value);
        return num.serialize<BytesBuffer, this>(this);
    }

    @inline
    serializeError<E extends Error>(value: E): BytesBuffer {
        return this.serializeString(value.message);
    }

    @inline
    serializeString(value: string): BytesBuffer {
        const bytes = String.UTF8.encode(value);
        this.serializeCompactInt<u32>(bytes.byteLength);
        this._buffer.writeBytes(bytes);
        return this._buffer;
    }

    serializeSet<K, T extends Set<K>>(value: T): BytesBuffer {
        const len = value.size;
        this.serializeCompactInt<u32>(len);
        const values = value.values();
        for (let i = 0; i < len; i++) {
            this.serialize<K>(values[i]);
        }
        return this._buffer;
    }

    serializeMap<K, V, T extends Map<K, V>>(value: T): BytesBuffer {
        const len = value.size;
        this.serializeCompactInt<u32>(len);
        let keys = value.keys();
        for (let i = 0; i < len; i++) {
            this.serialize<K>(keys[i]);
            this.serialize<V>(value.get(keys[i]));
        }
        return this._buffer;
    }

    @inline
    serializeClass<T extends ISerialize>(value: nonnull<T>): BytesBuffer {
        return value.serialize<BytesBuffer, this>(this);
    }

    @inline
    serializeTuple<T extends ISerialize>(value: nonnull<T>): BytesBuffer {
        return value.serialize<BytesBuffer, this>(this);
    }

    serializeIserialize(s: ISerialize): BytesBuffer {
        return s.serialize<BytesBuffer, this>(this);
    }

    @inline
    startSerializeField(): BytesBuffer {
        return this._buffer;
    }

    @inline
    endSerializeField(): BytesBuffer {
        return this._buffer;
    }

    @inline
    serializeField<T>(_name: string, value: T): BytesBuffer {
        return this.serialize<T>(value as T);
    }

    @inline
    startSerializeTuple(_len: u32): BytesBuffer {
        return this._buffer;
    }

    @inline
    endSerializeTuple(): BytesBuffer {
        return this._buffer;
    }

    @inline
    serializeTupleElem<T>(value: T): BytesBuffer {
        return this.serialize<T>(value);
    }

    @inline
    serializeNullable<T>(t: T): BytesBuffer {
        // check null
        if (changetype<usize>(t) == 0) {
            this._buffer.writeByte(0x00);
        } else {
            this._buffer.writeByte(0x01);
            this.serialize(t as nonnull<T>);
        }
        return this._buffer;
    }

    serializeArrayLike<A extends ArrayLike<valueof<A>>>(value: A): BytesBuffer {
        this.serializeCompactInt<u32>(value.length);
        const len = value.length;
        for (let i = 0; i < len; i++) {
            this.serialize<valueof<A>>(value[i]);
        }
        return this._buffer;
    }

    @inline
    serialize<T>(value: T): BytesBuffer {
        if (isReference<T>()) {
            if (idof<T>() == idof<i128>()) {
                return this.serializeI128(value);
            } else if (idof<T>() == idof<u128>()) {
                return this.serializeU128(value);
            }
        }
        return super.serialize<T>(value);
    }
}
