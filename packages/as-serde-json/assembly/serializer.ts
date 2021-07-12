import { Serializer } from "as-serde";
import * as base64 from "as-base64";
import { StringBuffer } from "as-buffers";

// @ts-ignore
@lazy const NULL = "null";
@lazy const HAVE_NO_NAME = "field have no name";

/**
 * JSONSerializer can serialize a value to a json text.
 */
export class JSONSerializer extends Serializer<StringBuffer> {
    @lazy
    private static readonly json: JSONSerializer = new JSONSerializer();

    constructor(protected _buffer: StringBuffer = new StringBuffer()) {
        super();
    }

    /**
     * Serialize a value to a Array.
     * It reuse a global JSONSerializer.
     * @param value value to be serialized
     * @returns
     */
    @inline
    static serialize<C>(value: C): string {
        JSONSerializer.json.clear();
        return JSONSerializer.json.serialize<C>(value).toString();
    }

    @unsafe
    @inline
    buffer(): StringBuffer {
        return this._buffer;
    }

    @inline
    clearBuffer(): void {
        this._buffer.clearBuffer();
    }

    @inline
    clear(): void {
        this._buffer.resetOffset();
    }

    @inline
    serializeBool(value: bool): StringBuffer {
        this._buffer.write(value.toString());
        return this._buffer;
    }

    @inline
    serializeU8(value: u8): StringBuffer {
        this._buffer.write(value.toString());
        return this._buffer;
    }
    @inline
    serializeI8(value: i8): StringBuffer {
        this._buffer.write(value.toString());
        return this._buffer;
    }
    @inline
    serializeU16(value: u16): StringBuffer {
        this._buffer.write(value.toString());
        return this._buffer;
    }
    @inline
    serializeI16(value: i16): StringBuffer {
        this._buffer.write(value.toString());
        return this._buffer;
    }
    @inline
    serializeU32(value: u32): StringBuffer {
        this._buffer.write(value.toString());
        return this._buffer;
    }
    @inline
    serializeI32(value: i32): StringBuffer {
        this._buffer.write(value.toString());
        return this._buffer;
    }
    @inline
    serializeU64(value: u64): StringBuffer {
        this._buffer.write(value.toString());
        return this._buffer;
    }
    @inline
    serializeI64(value: i64): StringBuffer {
        this._buffer.write(value.toString());
        return this._buffer;
    }
    @inline
    serializeF32(value: f32): StringBuffer {
        this._buffer.write(value.toString());
        return this._buffer;
    }
    @inline
    serializeF64(value: f64): StringBuffer {
        this._buffer.write(value.toString());
        return this._buffer;
    }

    @inline
    serializeError<E extends Error>(value: E): StringBuffer {
        return this.serializeString(value.message);
    }

    @inline
    serializeString(value: string): StringBuffer {
        // TODO: escape
        value = value.replace('"', '\\"');
        this._buffer.write('"');
        this._buffer.write(value);
        this._buffer.write('"');
        return this._buffer;
    }

    serializeSet<K, T extends Set<K>>(value: T): StringBuffer {
        const len = value.size;
        if (len == 0) {
            this._buffer.write("[]");
            return this._buffer;
        }
        const values = value.values();
        this._buffer.write("[");
        for (let i = 0; i < len - 1; i++) {
            this.serialize<K>(values[i]);
            this._buffer.write(",");
        }
        this.serialize<K>(values[len - 1]);
        this._buffer.write("]");
        return this._buffer;
    }

    serializeMap<K, V, T extends Map<K, V>>(value: T): StringBuffer {
        const len = value.size;
        if (len == 0) {
            this._buffer.write("{}");
            return this._buffer;
        }
        this._buffer.write("{");
        let keys = value.keys();
        for (let i = 0; i < len - 1; i++) {
            // @ts-ignore
            if (isDefined(keys[i].toString)) {
                // @ts-ignore
                this.serializeString(keys[i].toString());
            } else {
                this._buffer.write('"');
                this.serialize(keys[i]);
                this._buffer.write('"');
            }
            this._buffer.write(":");
            this.serialize<V>(value.get(keys[i]));
            this._buffer.write(",");
        }
        // @ts-ignore
        if (isDefined(keys[len - 1].toString)) {
            // @ts-ignore
            this.serializeString(keys[len - 1].toString());
        } else {
            this._buffer.write('"');
            this.serialize(keys[len - 1]);
            this._buffer.write('"');
        }
        this._buffer.write(":");
        this.serialize<V>(value.get(keys[len - 1]));
        this._buffer.write("}");
        return this._buffer;
    }

    @inline
    serializeClass<C>(value: C): StringBuffer {
        this._buffer.write("{");
        if (!isNullable<C>()) {
            // @ts-ignore
            value.serialize<StringBuffer, this>(this);
        } else if (value !== null) {
            // @ts-ignore
            value.serialize<StringBuffer, this>(this);
        }
        if (this._buffer.slice(this._buffer.length - 1) != "{") {
            this._buffer.length = this._buffer.length - 1;
        }
        this._buffer.write("}");
        return this._buffer;
    }

    startSerializeTuple(): StringBuffer {
        throw new Error("Method not implemented.");
    }
    endSerializeTuple(): StringBuffer {
        throw new Error("Method not implemented.");
    }
    serializeTupleElem<T>(value: T): StringBuffer {
        throw new Error("Method not implemented.");
    }
    serializeNonNullTupleElem<T>(value: NonNullable<T>): StringBuffer {
        throw new Error("Method not implemented.");
    }

    @inline
    private _serializeField<T>(name: string, value: T): void {
        this._buffer.write('"');
        this._buffer.write(name);
        this._buffer.write('":');
        this.serialize<T>(value as T);
    }

    @inline
    startSerializeField(): StringBuffer {
        return this._buffer;
    }

    @inline
    endSerializeField(): StringBuffer {
        return this._buffer;
    }

    @inline
    serializeField<T>(name: string | null, value: T): StringBuffer {
        // TODO: should we omit null value?
        assert(name != null, HAVE_NO_NAME);
        this._serializeField(name as string, value);
        this._buffer.write(",");
        return this._buffer;
    }

    @inline
    serializeNonNullField<T>(
        name: string | null,
        value: nonnull<T>
    ): StringBuffer {
        return this.serializeField(name, value);
    }

    @inline
    serializeNullable<T>(t: T): StringBuffer {
        if (t == null) {
            this._buffer.write(NULL);
        } else {
            this.serialize(t as nonnull<T>);
        }
        return this._buffer;
    }

    @inline
    // @ts-ignore
    serializeStaticArray<A extends Array<valueof<A>>>(value: A): StringBuffer {
        if (
            // @ts-ignore
            sizeof<valueof<A>>() == 1 &&
            // @ts-ignore
            !isSigned<valueof<A>>()
        ) {
            this.writeBase64(Uint8Array.wrap(changetype<ArrayBuffer>(value)));
            return this._buffer;
        } else {
            return this._serializeArrayLike<A>(value);
        }
    }

    // @ts-ignore
    serializeArrayLike<A extends ArrayLike<valueof<A>>>(
        value: A
    ): StringBuffer {
        if (value instanceof Uint8Array) {
            this.writeBase64(value);
            return this._buffer;
        } else if (
            value instanceof Array &&
            // @ts-ignore
            sizeof<valueof<A>>() == 1 &&
            // @ts-ignore
            !isSigned<valueof<A>>()
        ) {
            this.writeBase64(
                Uint8Array.wrap(changetype<ArrayBuffer>(value.dataStart))
            );
            return this._buffer;
        }
        return this._serializeArrayLike<A>(value);
    }

    private writeBase64(arr: Uint8Array): void {
        this._buffer.write('"');
        this._buffer.write(base64.encode(arr));
        this._buffer.write('"');
    }

    // @ts-ignore
    private _serializeArrayLike<A extends ArrayLike<valueof<A>>>(
        value: A
    ): StringBuffer {
        const len = value.length;
        if (len == 0) {
            this._buffer.write("[]");
            return this._buffer;
        }

        this._buffer.write("[");
        for (let i = 0; i < len - 1; i++) {
            // @ts-ignore
            this.serialize<valueof<A>>(value[i]);
            this._buffer.write(",");
        }
        // @ts-ignore
        this.serialize<valueof<A>>(value[len - 1]);
        this._buffer.write("]");

        return this._buffer;
    }
}
