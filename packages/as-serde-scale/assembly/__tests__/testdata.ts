// @ts-nocheck

import { i128, u128 } from "../index";
import { ISerialize, IDeserialize } from "as-serde";

export class TestData<T1, T2> {
    constructor(public readonly input: T1, public readonly output: T2) {}
}

@serialize({ omitName: true })
@deserialize({ omitName: true })
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


@serialize()

@deserialize()
export class Bools implements ISerialize, IDeserialize {
    b1: bool = false;
    b2: bool = true;
}

@serialize()
@deserialize()
export class SuperBools extends Bools {
    b3: bool = false;
}

@serialize()
@deserialize()
export class Arrays {
    a1: Array<u8> = [];
    a2: Array<u8> = [1];
    a3: Array<u32> = [];
    a4: Array<u32> = [1];
    a5: Array<string> = ["233"];
}

@serialize()
@deserialize()
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

@serialize()
@deserialize()
export class Sets {
    constructor(
        public s1: Set<u8> = new Set(),
        public s2: Set<u8> = new Set(),
        public s3: Set<i32> = new Set(),
        public s4: Set<i32> = new Set(),
        public s5: Set<string> = new Set()
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

@serialize()
@deserialize()
export class Maps {
    constructor(
        public m1: Map<u8, bool> = new Map(),
        public m2: Map<u8, i32> = new Map(),
        public m3: Map<i32, string> = new Map(),
        public m4: Map<string, string> = new Map(),
        public m5: Map<u8, Map<u8, u8>> = new Map()
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

@serialize()
@deserialize()
export class Nulls  {
    constructor(
        public n1: string | null = null,
        public n2: string[] | null = null,
        // self-ref
        public n3: Set<Nulls | null> | null = null,
        // self-ref
        public n4: Map<Nulls, string | null> | null = null,
        public n5: Array<u8> | null = null
    ) {}

    static test1(): Nulls {
        let res = new Nulls();
        res.n5 = [0x02];
        return res;
    }
}

@serialize()
@deserialize()
export class Empty implements ISerialize, IDeserialize {
    static foo: bool = false;
}

@serialize()
@deserialize()
export class SuperEmpty extends Empty {}
