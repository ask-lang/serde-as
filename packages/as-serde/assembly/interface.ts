import { Variant } from 'as-variant/assembly';

export interface IEnumU8 {
    discriminant(): u8;
}

class Foo implements IEnumU8 {
    discriminant(): u8 {
        return 1;
    }
}

@serdeEnum()
class Bar {
    v: bool;
    constructor(v: bool) {
        this.v = v;
    }
}

@serdeEnum({ name: "Baz2" })
class Baz {}

@serdeEnum()
class Gen<T> {
    constructor(a: T, b: Gen<T>) {
        //
    }
}

// only support 256 enums. 
@serdeEnum({ 
    enums: ["Bar", null, "Baz2", "Gen2"],
    types: ["Bar", null, "Baz", "Gen<T>"],
})
class Enum<T> {}

// generate the followings:
class Enum2<T2> {
    private __enum: u8 = 0;
    private __val: Variant = changetype<Variant>(__new(offsetof<Variant>(), idof<Variant>()));
    constructor(
        __enum: u8 = 0,
    ) {
        this.__enum = __enum;
    }

    static Bar<T2>(p1: bool): Enum2<T2> {
        const res = new Enum2<T2>(0);
        return res;
    }

    // skip enum 1.

    static Baz2<T2>(): Enum2<T2> {
        const res = new Enum2<T2>(2);
        res.__val.set(new Baz());
        return res;
    }

    static Gen2<T2, T>(p1: T, p2: Gen<T>): Enum2<T2> {
        const res = new Enum2<T2>(3);
        res.__val.set(new Gen<T>(p1, p2));
        return res;
    }
}

let e1 = Enum2.Bar<string>(false);
let e2 = Enum2.Baz2<string>();
let e3 = Enum2.Gen2<bool, bool>(false, instantiateRaw());

function instantiateRaw(): Gen<bool> {
    throw new Error('Function not implemented.');
}
