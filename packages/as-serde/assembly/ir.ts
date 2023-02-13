

export enum SerdeValueType {
    Void,
    Bool,
    I8,
    I16,
    I32,
    I64,
    I128,
    U8,
    U16,
    U32,
    U64,
    U128,
    F32,
    F64,
    String,
    ByteArray,
    Seq,
    Tuple,
    Map,
    Class,
}

export interface ISerdeValue {
    valueType(): SerdeValueType;
}


export interface IVisitor {
    visitorType(): SerdeValueType;

    expecting(msg: string): void;
}

export interface CoreVisitor<T> {
    expecting(msg: string): void;

    visitBool(v: boolean): T;

    visitI8(v: i8): T;
    visitI16(v: i16): T;
    visitI32(v: i32): T;
    visitI64(v: i64): T;
    visitU8(v: u8): T;
    visitU16(v: u16): T;
    visitU32(v: u32): T;
    visitU64(v: u64): T;

    visitF32(v: f32): T;
    visitF64(v: f64): T;

    visitString(v: string): T;

    visitBytesArray(v: ArrayBuffer): T;
    visitMap<M extends MapAccess>(v: M): T;
}

export interface MapAccess {
    nextKeySeed<K, V>(seed: K): V;
    nextValueSeed<K, V>(seed: K): V;
    nextEntrySeed<K, V>(kSeed: K, vSeed: V): Entry<K, V>;
    nextKey<K>(): K;
    nextValue<V>(): V;
    nextEntry<K, V>(): Entry<K, V>;
    sizeHint(): i32;
}

export class Entry<K, V> {
    constructor(public readonly key: K, public readonly value: V) {

    }
}

export class IgnoredAny implements CoreVisitor<IgnoredAny>  {
    expecting(msg: string): void {
        throw new Error("anything at all");
    }
    visitBool(v: boolean): IgnoredAny {
        return new IgnoredAny;
    }
    visitString(v: string): IgnoredAny {
        return new IgnoredAny;
    }
    visitI8(v: i8): IgnoredAny {
        return new IgnoredAny;
    }
    visitI16(v: i16): IgnoredAny {
        return new IgnoredAny;
    }
    visitI32(v: i32): IgnoredAny {
        return new IgnoredAny;
    }
    visitI64(v: i64): IgnoredAny {
        return new IgnoredAny;
    }
    visitU8(v: u8): IgnoredAny {
        return new IgnoredAny;
    }
    visitU16(v: u16): IgnoredAny {
        return new IgnoredAny;
    }
    visitU32(v: u32): IgnoredAny {
        return new IgnoredAny;
    }
    visitU64(v: u64): IgnoredAny {
        return new IgnoredAny;
    }
    visitF32(v: f32): IgnoredAny {
        return new IgnoredAny;
    }
    visitF64(v: f64): IgnoredAny {
        return new IgnoredAny;
    }
    visitBytesArray(v: ArrayBuffer): IgnoredAny {
        return new IgnoredAny;
    }
    visitMap<M extends MapAccess>(v: M): IgnoredAny {
        return new IgnoredAny;
    }
}

let a: IgnoredAny = new IgnoredAny();