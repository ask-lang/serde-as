import { Variant } from "as-variant/assembly";
import { Serializer, Deserializer, ISerialize, IDeserialize } from "./index";

/// The interface to represents a class is enum.
export interface IEnumU8 {
    discriminant(): u8;
}

// Make this type could be a enum field.
// The namespace design is used for better to reuse these enum types.
// The namespace should be unique just like npm package.
@serdeEnumField({ namespace: "example" })
class Bool {
    constructor(public readonly b: bool) {}
}

@serdeEnumField({ namespace: "example" })
@serdeEnum()
class Empty {}

@serdeEnumField({ namespace: "example" })
@serdeEnum()
class List<T> {
    constructor(
        public cur: T,
        public next: List<T> | null = null,
    ) {}
}

// The enum list, skip the index 1,2 since it's null.
@serdeEnum({
    fields: [
        {
            tag: "Bool",
            namespace: "example",
            type: "Bool",
        },
        null,
        null,
        {
            tag: "Empty",
            namespace: "example",
            type: "Empty",
        },
        {
            tag: "Bool",
            namespace: "example",
            type: "Bool<T>",
        },
    ],
})
class Enum<T> {}

@serdeEnum({
    fields: [
        {
            tag: "Bool",
            namespace: "example",
            type: "Bool",
        },
        2,
        // skip 1, 2 and start from 3.
        {
            tag: "Empty",
            namespace: "example",
            type: "Empty",
        },
        {
            tag: "Bool",
            namespace: "example",
            type: "Bool<T>",
        },
        {
            tag: "BoolList",
            namespace: "example",
            type: "List<boolean>",
            noGeneric: true,
        },
    ],
})
class Enum<T> {}

// The behavior is like the following rust enum type.
// struct Enum<T> {
//     Bool(Bool),
//     _Null1,
//     _Null2,
//     Empty(Empty),
//     List(List<T>),
//     BoolList(List<Bool>),
// }

// generate the followings code:

class Enum2<__T> implements IEnumU8, ISerialize, IDeserialize {
    private __enum: u8 = 0;
    private __val: Variant = changetype<Variant>(__new(offsetof<Variant>(), idof<Variant>()));
    constructor(__enum: u8 = 0) {
        this.__enum = __enum;
    }

    discriminant(): u8 {
        return this.__enum;
    }

    static Bool<T2>(p1: bool): Enum2<T2> {
        const res = new Enum2<T2>(0);
        return res;
    }

    // skip enum 1,2.

    static Empty<T2>(): Enum2<T2> {
        const res = new Enum2<T2>(3);
        res.__val.set(new Empty());
        return res;
    }

    static List<__T, T>(p1: T, p2: List<T> | null = null): Enum2<__T> {
        const res = new Enum2<__T>(5);
        res.__val.set(new List<T>(p1, p2));
        return res;
    }

    static BoolList<__T>(p1: boolean, p2: List<boolean> | null = null): Enum2<__T> {
        const res = new Enum2<__T>(5);
        res.__val.set(new List<boolean>(p1, p2));
        return res;
    }

    serialize<__R, __S extends Serializer<__R>>(serializer: __S): __R {
        serializer.startSerializeEnum();
        serializer.serializeU8(this.__enum);
        switch (this.__enum) {
            case 0:
                serializer.serialize(this.__val.get<Bool>());
                break;
            case 1:
                break;
            case 2:
                break;
            case 3:
                serializer.serialize(this.__val.get<Empty>());
                break;
            case 4:
                serializer.serialize(this.__val.get<List<__T>>());
                break;
            case 5:
                serializer.serialize(this.__val.get<List<boolean>>());
                break;
            default:
                assert(false, "Enum2 reached a unknown discriminant");
        }
        return serializer.endSerializeEnum();
    }

    deserialize<__S extends Deserializer>(deserializer: __S): this {
        this.__enum = deserializer.deserializeU8();
        switch (this.__enum) {
            case 0:
                this.__val.set(deserializer.deserialize<Bool>());
                break;
            case 1:
                break;
            case 2:
                break;
            case 3:
                this.__val.set(deserializer.deserialize<Empty>());
                break;
            case 4:
                this.__val.set(deserializer.deserialize<List<__T>>());
                break;
            case 5:
                this.__val.set(deserializer.deserialize<List<boolean>>());
                break;
            default:
                assert(false, "Enum2 reached a unknown discriminant");
        }
        return this;
    }
}

let e1 = Enum2.Bool<string>(false);
let e2 = Enum2.Empty<string>();
let e3 = Enum2.List<string, string>("first", null);
let e4 = Enum2.BoolList<string>(true, null);
