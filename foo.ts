import { instantiateZero } from "../../my/as-container/assembly/util";
export interface ISerialize {
    serialize<__R, __S extends CoreSerializer<__R>>(serializer: __S): __R;
}

export abstract class CoreSerializer<R> {
    // omit ..
}

export abstract class Serializer<R> extends CoreSerializer<R> {
    abstract serializeClass<C extends ISerialize>(value: C): R;
    // omit ..
}

export class ScaleSerializer extends Serializer<string> {
    // omit ..
    serializeClass<C extends ISerialize>(value: C): string {
        value.serialize<string, this>(this);
        return "";
    }
}

class Foo implements ISerialize {
    serialize<__R, __S extends CoreSerializer<__R>>(serializer: __S): __R {
        return instantiateZero<__R>();
    }
}

let s = new ScaleSerializer();
s.serializeClass<Foo>(new Foo());
