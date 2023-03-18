// @ts-nocheck
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { ISerdeTuple, ISerialize, Serializer } from "as-serde";

export class TupleType implements ISerialize, ISerdeTuple {
    s1: string = "";
    s2: string | null = '"';
    s3: string = "\r\n";

    public static readonly SERDE_TUPLE: bool = true;
    isTuple(): bool {
        return true;
    }
    serialize<__R, __S extends Serializer<__R>>(serializer: __S): __R {
        serializer.startSerializeTuple(3);
        serializer.serializeTupleElem<string>(this.s1);
        serializer.serializeTupleElem<string | null>(this.s2);
        serializer.serializeTupleLastElem<string>(this.s3);
        return serializer.endSerializeTuple();
    }
}

@serialize()
export class Numbers {
    u8: u8 = 0;
    u16: u16 = 0;
    u32: u32 = 0;
    u64: u64 = 0;

    i8: i8 = 0;
    i16: i16 = 0;
    i32: i32 = 0;
    i64: i64 = 0;

    f32: f32 = 0;
    f64: f64 = 0;

    static test1(): Numbers {
        const N = new Numbers();
        N.u8 = 1;
        N.u16 = 2;
        N.u32 = 3;
        N.u64 = 4;
        N.i8 = -1;
        N.i16 = -2;
        N.i32 = -3;
        N.i64 = -4;
        N.f32 = 6.0;
        N.f64 = 7.1;
        return N;
    }
}

@serialize()
export class SuperNumbers extends Numbers {
    n: i8;
    static test1(): SuperNumbers {
        const N = new SuperNumbers();
        N.u8 = 1;
        N.u16 = 2;
        N.u32 = 3;
        N.u64 = 4;
        N.i8 = -1;
        N.i16 = -2;
        N.i32 = -3;
        N.i64 = -4;
        N.f32 = 6.0;
        N.f64 = 7.1;
        N.n = 1;
        return N;
    }
}

@serialize({ skipSuper: true })
export class SkipSuperNumbers extends Numbers {
    n: i8;
    static test1(): SkipSuperNumbers {
        const N = new SkipSuperNumbers();
        N.u8 = 1;
        N.u16 = 2;
        N.u32 = 3;
        N.u64 = 4;
        N.i8 = -1;
        N.i16 = -2;
        N.i32 = -3;
        N.i64 = -4;
        N.f32 = 6.0;
        N.f64 = 7.1;
        N.n = 1;
        return N;
    }
}

@serialize()
export class Strings {
    s1: string = "";
    s2: string = '"';
    s3: string = "\r\n";
}

@serialize()
export class Errors {
    e1: Error = new Error("error");
    e2: RangeError = new RangeError("rangeError");
    e3: SyntaxError = new SyntaxError("syntaxError");
    e4: URIError = new URIError("uriError");
    e5: TypeError = new TypeError("typeError");
}

@serialize()
export class Bools {
    b1: bool = false;
    b2: bool = true;
}

@serialize()
export class Arrays {
    a1: Array<u8> = [];
    a2: Array<u8> = [1];
    a3: Array<u32> = [];
    a4: Array<u32> = [1];
    a5: Array<string> = ["233"];
}

@serialize()
export class OtherArrays {
    a0: ArrayBuffer = new ArrayBuffer(4);
    a1: StaticArray<u8> = [0, 0, 0, 0];
    a2: Uint8Array = new Uint8Array(4);
    a3: Uint16Array = new Uint16Array(4);
    a4: Uint32Array = new Uint32Array(4);
    a5: Uint64Array = new Uint64Array(4);

    a6: Int8Array = new Int8Array(4);
    a7: Int16Array = new Int16Array(4);
    a8: Int32Array = new Int32Array(4);
    a9: Int64Array = new Int64Array(4);

    a10: Float32Array = new Float32Array(4);
    a11: Float64Array = new Float64Array(4);
}

@serialize()
export class Sets {
    constructor(
        public s1: Set<u8> = new Set(),
        public s2: Set<u8> = new Set(),
        public s3: Set<i32> = new Set(),
        public s4: Set<i32> = new Set(),
        public s5: Set<string> = new Set(),
    ) {}

    static test1(): Sets {
        const s = new Sets();
        s.s1;
        s.s2.add(1);
        s.s3.add(-1);
        s.s4.add(1);
        s.s4.add(0);
        s.s5.add("233");
        return s;
    }
}

@serialize()
export class Maps {
    constructor(
        public m1: Map<u8, bool> = new Map(),
        public m2: Map<u8, i32> = new Map(),
        public m3: Map<i32, string> = new Map(),
        public m4: Map<string, string> = new Map(), // Should error // public m5: Map<string | null, string> = new Map()
    ) {}

    static test1(): Maps {
        const s = new Maps();
        s.m1.set(1, false);
        s.m2.set(1, -1);
        s.m3.set(-1, "233");
        s.m4.set("hello", "world");
        s.m4.set("我的", "世界");
        return s;
    }
}

@serialize()
export class Nulls {
    constructor(
        public n1: string | null = null,
        public n2: string[] | null = null,
        public n3: Set<string | null> | null = null,
        public n4: Map<string, string | null> | null = null,
    ) {}

    static test1(): Nulls {
        const n = new Nulls();
        n.n1 = "233";
        n.n2 = ["233"];
        n.n3 = new Set<string | null>() as Set<string | null> | null;
        n.n3!.add(null);
        n.n3!.add("233");
        n.n4 = new Map<string, string | null>() as Map<string, string | null> | null;
        n.n4!.set("233", "233");
        n.n4!.set("null", null);

        return n;
    }
}

@serialize()
export class TailCommas {
    a: string | null = null;
    b: string | null = null;

    static test1(): TailCommas {
        let res = new TailCommas();
        res.a = "";
        return res;
    }
    static test2(): TailCommas {
        let res = new TailCommas();
        res.b = "";
        return res;
    }
}

@serialize()
export class TailCommas2 {
    t: TailCommas = new TailCommas();
    c: string | null = "";

    static test1(): TailCommas2 {
        let res = new TailCommas2();
        res.t.a = "";
        return res;
    }
}

@serialize()
export class Empty implements ISerialize {}

@serialize()
export class SuperEmpty extends Empty {}

@serialize()
export class Tree<T> implements ISerialize {
    left: Tree<T> | null = null;
    right: Tree<T> | null = null;
    value: T;
    constructor(value: T) {
        this.value = value;
    }
}
