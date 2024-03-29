// @ts-nocheck

import { i128, u128 } from "../index";
import {
    IUnsafeInit,
    ISerdeTuple,
    ISerialize,
    IDeserialize,
    Serializer,
    Deserializer,
    FixedArray,
    Option,
    Result,
} from "as-serde";

export class TestData<T1, T2> {
    constructor(
        public readonly input: T1,
        public readonly output: T2,
    ) {}
}

@final
export class FixedArray8<T> extends FixedArray<T> {
    static SIZE: i32 = 8;

    constructor(inner: StaticArray<T> = new StaticArray<T>(FixedArray8.SIZE)) {
        super(inner);
    }
    clone(): this {
        return new FixedArray8<T>(this.inner.slice<StaticArray<T>>());
    }

    deserialize<__S extends Deserializer>(deserializer: __S): this {
        return super.deserialize<__S>(deserializer) as this;
    }
}

@final
export class Matrix8<T> implements ISerdeTuple, IUnsafeInit, IDeserialize, ISerialize {
    static SIZE: i32 = 8;
    inner: FixedArray8<FixedArray8<T>> | null = null;

    unsafeInit(): void {
        this.inner = new FixedArray8();
        for (let i = 0; i < Matrix8.SIZE; i++) {
            this[i] = new FixedArray8<T>();
        }
    }

    serialize<__R, __S extends Serializer<__R>>(serializer: __S): __R {
        serializer.startSerializeTuple(Matrix8.SIZE);
        for (let i = 0; i < Matrix8.SIZE - 1; i++) {
            serializer.serializeTupleElem<FixedArray8<T>>(this[i]);
        }
        serializer.serializeLastTupleElem<FixedArray8<T>>(this[Matrix8.SIZE - 1]);
        return serializer.endSerializeTuple();
    }

    deserialize<__S extends Deserializer>(deserializer: __S): this {
        deserializer.startDeserializeTuple(Matrix8.SIZE);
        for (let i = 0; i < Matrix8.SIZE - 1; i++) {
            this[i] = deserializer.deserializeTupleElem<FixedArray8<T>>();
        }
        this[Matrix8.SIZE - 1] = deserializer.deserializeLastTupleElem<FixedArray8<T>>();
        deserializer.endDeserializeTuple();

        return this;
    }

    @operator("[]") private __get(index: i32): FixedArray8<T> {
        return (this.inner as FixedArray8<FixedArray8<T>>)[index];
    }

    @operator("[]=") private __set(index: i32, value: FixedArray8<T>): void {
        (this.inner as FixedArray8<FixedArray8<T>>)[index] = value;
    }
}

export class Custom implements ISerialize, IDeserialize {
    v1: Empty = new Empty();
    serialize<__R, __S extends Serializer<__R>>(serializer: __S): __R {
        serializer.startSerializeField();
        serializer.serializeBool(true);
        serializer.serializeClass<Empty>(this.v1);
        return serializer.endSerializeField();
    }

    deserialize<__S extends Deserializer>(deserializer: __S): Custom {
        deserializer.startDeserializeField();
        const b = deserializer.deserializeBool();
        assert(b);
        this.v1 = deserializer.deserializeClass<Empty>();
        deserializer.endDeserializeField();

        return this;
    }
}

@serde()
export class Numbers {
    u8: u8 = 0;
    u16: u16 = 0;
    u32: u32 = 0;
    u64: u64 = 0;

    i8: i8 = 0;
    i16: i16 = 0;
    i32: i32 = 0;
    i64: i64 = 0;

    i128: i128 = i128.Zero;
    u128: u128 = u128.Zero;

    static test1(): Numbers {
        const res = new Numbers();
        res.u8 = 1;
        res.u16 = 2;
        res.u32 = 3;
        res.u64 = 4;
        res.i8 = -1;
        res.i16 = -2;
        res.i32 = -3;
        res.i64 = -4;
        res.i128 = i128.Max;
        res.u128 = u128.Max;
        return res;
    }

    static test2(): Numbers {
        const res = new Numbers();
        res.i128 = i128.Min;
        res.u128 = u128.Min;
        return res;
    }
}

@serde()
export class Bools implements ISerialize, IDeserialize {
    b1: bool = false;
    b2: bool = true;
}

@serde()
export class SuperBools extends Bools {
    b3: bool = false;
}

@serdeTuple()
export class TupleArrays implements ISerdeTuple {
    a1: Array<u8> = [];
    a2: Array<u8> = [1];
    a3: Array<u32> = [];
    a4: Array<u32> = [1];
    a5: Array<string> = ["233"];
}

@serde()
export class Arrays {
    a1: Array<u8> = [];
    a2: Array<u8> = [1];
    a3: Array<u32> = [];
    a4: Array<u32> = [1];
    a5: Array<string> = ["233"];
}

@serde()
export class OtherArrays {
    a0: ArrayBuffer = new ArrayBuffer(2);
    a1: StaticArray<u8> = [0, 0];
    a2: Uint8Array = new Uint8Array(2);
    a3: Uint16Array = new Uint16Array(2);
    a4: Uint32Array = new Uint32Array(2);
    a5: Uint64Array = new Uint64Array(2);

    a6: Int8Array = new Int8Array(2);
    a7: Int16Array = new Int16Array(2);
    a8: Int32Array = new Int32Array(2);
    a9: Int64Array = new Int64Array(2);
}

@serde()
export class Sets {
    constructor(
        public s1: Set<u8> = new Set(),
        public s2: Set<u8> = new Set(),
        public s3: Set<i32> = new Set(),
        public s4: Set<i32> = new Set(),
        public s5: Set<string> = new Set(),
    ) {}

    static test1(): Sets {
        const res = new Sets();
        res.s1;
        res.s2.add(1);
        res.s3.add(-1);
        res.s4.add(1);
        res.s4.add(0);
        res.s5.add("233");
        return res;
    }
}

@serde()
export class Maps {
    constructor(
        public m1: Map<u8, bool> = new Map(),
        public m2: Map<u8, i32> = new Map(),
        public m3: Map<i32, string> = new Map(),
        public m4: Map<string, string> = new Map(),
        public m5: Map<u8, Map<u8, u8>> = new Map(),
    ) {}

    static test1(): Maps {
        const res = new Maps();
        res.m1.set(1, false);
        res.m2.set(1, -1);
        res.m3.set(-1, "233");
        res.m4.set("hello", "world");
        res.m4.set("我的", "世界");

        const map = new Map<u8, u8>();
        map.set(1, 1);
        res.m5.set(1, map);
        return res;
    }
}

@serde()
export class Nulls {
    constructor(
        public n1: string | null = null,
        public n2: string[] | null = null,
        // self-ref
        public n3: Set<Nulls | null> | null = null,
        // self-ref
        public n4: Map<Nulls, string | null> | null = null,
        public n5: Array<u8> | null = null,
    ) {}

    static test1(): Nulls {
        let res = new Nulls();
        res.n4 = new Map();
        res.n5 = [0x02];
        return res;
    }
}

@serde()
export class Empty implements ISerialize, IDeserialize {
    static foo: bool = false;
}

@serde()
export class SuperEmpty extends Empty {}

@serde()
export class Options {
    constructor(
        public o1: Option<u8> = Option.None<u8>(),
        public o2: Option<u8> | null = Option.None<u8>(),
    ) {}

    static test1(): Options {
        let res = new Options();
        res.o2 = Option.Some<u8>(2);
        return res;
    }
}

@serde()
export class Results {
    constructor(
        public r1: Result<u8, string> = Result.Ok<u8, string>(1),
        public r2: Result<u8, string> | null = Result.Ok<u8, string>(2),
    ) {}

    static test1(): Results {
        let res = new Results();
        res.r1 = Result.Err<u8, string>("err");
        res.r2 = Result.Err<u8, string>("err");
        return res;
    }
}
