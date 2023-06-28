import * as container from "as-container";
import { Deserializer, IDeserialize, ISerialize, Serializer, instantiateRaw, unsafeNew } from "..";
import { instantiateZero } from "as-container/assembly/util";

// export { Option, Result } from "as-container";
export * from "./fixedArray";

@final
export class Option<T> extends container.Option<T> implements ISerialize, IDeserialize {
    @inline
    static Some<T>(val: T): Option<T> {
        return new Option<T>(val, false);
    }

    @inline
    static None<T>(): Option<T> {
        return new Option<T>();
    }

    serialize<__R, __S extends Serializer<__R>>(serializer: __S): __R {
        if (this._isNone) {
            return serializer.serializeBool(false);
        } else {
            serializer.serializeBool(true);
            return serializer.serialize<T>(this._val);
        }
    }

    deserialize<__S extends Deserializer>(deserializer: __S): this {
        let opt = instantiate<this>();
        let b = deserializer.deserializeBool();
        if (b) {
            let val = deserializer.deserialize<T>();
            opt._isNone = false;
            opt._val = val;
        }

        return opt;
    }
}

@final
export class Result<O, E> extends container.Result<O, E> implements ISerialize, IDeserialize {
    @unsafe
    constructor (
        isOk: bool = false,
        ok: O = instantiateZero<O>(),
        err: E = instantiateZero<E>(),
    ) {
        super(isOk, ok, err);
    }
    
    @inline
    static Ok<O, E>(ok: O): Result<O, E> {
        return new Result<O, E>(true, ok);
    }

    @inline
    static Err<O, E>(err: E): Result<O, E> {
        return new Result<O, E>(false, instantiateZero<O>(), err);
    }

    serialize<__R, __S extends Serializer<__R>>(serializer: __S): __R {
        if (this._isOk) {
            serializer.serializeBool(true);
            return serializer.serialize<O>(this._ok);
        } else {
            serializer.serializeBool(false);
            return serializer.serialize<E>(this._err);
        }
    }

    deserialize<__S extends Deserializer>(deserializer: __S): this {
        let res = instantiateRaw<this>();
        let b = deserializer.deserializeBool();
        if (b) {
            let ok = deserializer.deserialize<O>();
            res._isOk = true;
            res._ok = ok;
        } else {
            let err = deserializer.deserialize<E>();
            res._isOk = false;
            res._err = err;
        }

        return res;
        // unreachable();
    }
}

// function __new(arg0: number, arg1: number): any {
//     throw new Error("Function not implemented.");
// }
