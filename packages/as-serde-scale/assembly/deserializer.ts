// @ts-nocheck
import { Deserializer, IDeserialize } from "as-serde";
import { BytesBuffer } from "as-buffers";
import { i128, u128 } from "as-bignum/assembly";
import { Compact } from ".";
import { FLOAT_UNSPPORTED, instantiateRaw } from "./misc";

export class ScaleDeserializer extends Deserializer {
    /**
     * Deserialize a buffer to a value of type T.
     * It may not consumed all buffer data.
     * @param buffer
     * @returns
     */
    @inline
    static deserialize<T>(buffer: BytesBuffer): T {
        const scale = new ScaleDeserializer(buffer);
        return scale.deserialize<T>();
    }

    constructor(protected readonly _buffer: BytesBuffer) {
        super();
    }

    deserializeCompactInt<T extends number>(): Compact<T> {
        const compact = instantiate<Compact<T>>();
        return compact.deserialize<this>(this);
    }

    deserializeError<E extends Error>(): E {
        return instantiate<E>(this.deserializeString());
    }

    deserializeString(): string {
        return String.UTF8.decode(
            changetype<ArrayBuffer>(this.deserializeStaticArray<StaticArray<u8>>()),
        );
    }

    deserializeNullable<T>(): T {
        const b = this.deserializeBool();
        if (b === 0) {
            return null;
        } else {
            return this.deserialize<nonnull<T>>();
        }
    }

    deserializeArrayLike<A extends ArrayLike<valueof<A>>>(): A {
        const compact = this.deserializeCompactInt<u32>();
        const len = compact.unwrap();
        const arr = instantiate<A>(compact.unwrap());
        for (let i: u32 = 0; i < len; i++) {
            arr[i] = this.deserialize<valueof<A>>();
        }
        return arr;
    }

    deserializeSet<V, T extends Set<V>>(): T {
        const set: T = instantiate<T>();
        const compact = this.deserializeCompactInt<u32>();
        const len = compact.unwrap();
        for (let i: u32 = 0; i < len; i++) {
            set.add(this.deserialize<V>());
        }
        return set;
    }

    deserializeMap<K, V, T extends Map<K, V>>(): T {
        const map: T = instantiate<T>();
        const compact = this.deserializeCompactInt<u32>();
        const len = compact.unwrap();
        for (let i: u32 = 0; i < len; i++) {
            const k = this.deserialize<K>();
            const v = this.deserialize<V>();
            map.set(k, v);
        }
        return map;
    }

    @inline
    deserializeClass<T extends IDeserialize>(): T {
        const clz: T = instantiateRaw<T>();
        return clz.deserialize<this>(this);
    }

    deserializeIDeserialize<T extends IDeserialize>(): T {
        const clz: T = instantiateRaw<T>();
        return clz.deserialize<this>(this);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    startDeserializeTuple(len: u32): void {}
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    endDeserializeTuple(): void {}

    deserializeTupleElem<T>(): T {
        return this.deserialize<T>();
    }

    deserializeField<T>(_name: string): T {
        if (isNullable<T>()) {
            const b = this.deserializeBool();
            if (b == false) {
                return null;
            } else {
                return this.deserialize<nonnull<T>>();
            }
        } else {
            return this.deserialize<T>();
        }
    }

    @inline
    deserializeBool(): bool {
        return this._buffer.readBool();
    }

    @inline
    deserializeU8(): u8 {
        return this._buffer.readUInt8();
    }
    @inline
    deserializeI8(): i8 {
        return this._buffer.readInt8();
    }
    @inline
    deserializeU16(): u16 {
        return this._buffer.readUInt16LE();
    }
    @inline
    deserializeI16(): i16 {
        return this._buffer.readInt16LE();
    }
    @inline
    deserializeU32(): u32 {
        return this._buffer.readUInt32LE();
    }
    @inline
    deserializeI32(): i32 {
        return this._buffer.readInt32LE();
    }
    @inline
    deserializeU64(): u64 {
        return this._buffer.readUInt64LE();
    }
    @inline
    deserializeI64(): i64 {
        return this._buffer.readInt64LE();
    }
    deserializeF32(): f32 {
        assert(false, FLOAT_UNSPPORTED);
        return 0;
    }
    deserializeF64(): f64 {
        assert(false, FLOAT_UNSPPORTED);
        return 0;
    }

    @inline
    deserializeU128(): u128 {
        let b = this._buffer.readUInt64LE();
        let b2 = this._buffer.readUInt64LE();
        return new u128(b, b2);
    }

    @inline
    deserializeI128(): i128 {
        let b = this._buffer.readInt64LE();
        let b2 = this._buffer.readInt64LE();
        return new i128(b, b2);
    }

    @inline
    deserialize<T>(): T {
        if (isReference<T>()) {
            if (idof<T>() == idof<i128>()) {
                return this.deserializeI128();
            } else if (idof<T>() == idof<u128>()) {
                return this.deserializeU128();
            }
        }
        return super.deserialize<T>();
    }
}
