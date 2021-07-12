/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * The decorated class will automatically implement the serialize method.
 */
declare function serialize(cfg?: SerdeConfig): any;

/**
 * The decorated class will automatically implement the deserialize method.
 */
declare function deserialize(cfg?: SerdeConfig): any;

/**
 * A config for both `serialize` and `deserialize`.
 */
interface SerdeConfig {
    /**
     * Skip all fields of super class.
     */
    skipSuper?: boolean;
    /**
     * Omit all field names for a class when (de)serialize. It can save lots of bytes in wasm code if you do not need field names.
     */
    omitName?: boolean;
}

declare interface Object {
    serialize<__R, __S extends CoreSerializer<__R>>(serializer: __S): __R;
    deserialize<__S extends CoreDeserializer>(deserializer: __S): IDeserialize;
}
