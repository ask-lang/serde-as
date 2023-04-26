/* eslint-disable @typescript-eslint/no-empty-interface */
import { Deserializer } from "./deserializer";
import { Serializer } from "./serializer";

export * from "./serializer";
export * from "./deserializer";
export * from "./util";

/**
 * A phantom inteface to hint a class as a tuple type when work with serde.
 *
 * Should always be implmented when you want a class type works like as tuple type.
 */
export interface ISerdeTuple {}

export interface ISerialize {
    /**
     * Serialize this class value by `Serializer`.
     */
    serialize<__R, __S extends Serializer<__R>>(serializer: __S): __R;
}

export interface IDeserialize {
    /**
     * Deserialize this class value by `Deserializer`.
     */
    deserialize<__S extends Deserializer>(deserializer: __S): this;
}

/**
 * FixedArray is regarded as a Tuple type for serde.
 *
 * # Note
 *
 * This is not a ArrayLike class.
 */
export abstract class FixedArray<T> implements ISerdeTuple, ISerialize, IDeserialize {
    [key: number]: T;
    /**
     * Creates a FixedArray by ref a StaticArray which should not be mutated outside.
     *
     * @param inner
     */
    constructor(protected inner: StaticArray<T>) {}

    /**
     *
     * @returns The inner StaticArray.
     */
    @inline
    unwrap(): StaticArray<T> {
        return this.inner;
    }

    /**
     * Return the tuple size.
     *
     * # Note
     *
     * Use `size` to replace `length` to avoid this class be a `ArrayLike` class.
     */
    @inline
    get size(): i32 {
        return this.inner.length;
    }

    serialize<__R, __S extends Serializer<__R>>(serializer: __S): __R {
        const size: i32 = this.size;
        serializer.startSerializeTuple(size);
        for (let i = 0; i < size - 1; i++) {
            serializer.serializeTupleElem<T>(this.inner[i]);
        }
        if (size != 0) {
            serializer.serializeLastTupleElem<T>(this.inner[size - 1]);
        }
        return serializer.endSerializeTuple();
    }

    deserialize<__S extends Deserializer>(deserializer: __S): this {
        const size = this.size;
        deserializer.startDeserializeTuple(size);
        this.inner = new StaticArray<T>(size);
        for (let i = 0; i < size - 1; i++) {
            this.inner[i] = deserializer.deserializeTupleElem<T>();
        }
        if (size != 0) {
            this.inner[size - 1] = deserializer.deserializeLastTupleElem<T>();
        }
        deserializer.endDeserializeTuple();
        return this;
    }

    @operator("[]") private __get(index: i32): T {
        return this.inner[index];
    }

    @operator("[]=") private __set(index: i32, value: T): void {
        this.inner[index] = value;
    }

    @operator("==")
    eq(other: this): bool {
        if (this.inner.length != other.size) {
            return false;
        }
        for (let i = 0; i < this.size; i++) {
            if (this.inner[i] != other.inner[i]) {
                return false;
            }
        }
        return true;
    }

    @operator("!=")
    notEq(other: this): bool {
        return !this.eq(other);
    }
}
