/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * The decorated class will automatically implement the `serialize` and `deserialize` method.
 */
declare function serde(cfg?: SerdeConfig): any;

/**
 * The decorated class will automatically implement the `serialize` and `deserialize` method as tuple class.
 *
 * # Note
 *
 * User must implment `ISerdeTuple` for the tuple class.
 */
declare function serdeTuple(cfg?: SerdeConfig): any;

/**
 * The decorated class will automatically implement the `serialize` method.
 */
declare function serialize(cfg?: SerdeConfig): any;

/**
 * The decorated class will automatically implement the `deserialize` method.
 */
declare function deserialize(cfg?: SerdeConfig): any;

/**
 * The decorated class will be a enum type defined by serde.
 */
declare function serdeEnum(cfg?: {
    fields: Array<{
        /**
         * The enum tag name.
         * 
         * Will be a static method name.
         */
        tag: string,
        /**
         * The namespace the type stored in.
         */
        namespace: string,
        /**
         * The type of current enum field.
         */
        type: string | object,
        /**
         * Tell compiler that there is a type not a generic param.
         */
        noGeneric?: boolean,
    } |
    // Skip current index. 
    null |
    // Skip until the next index. 
    number
    >,
}): any;

/**
 * The decorated class will be a enum field defined by serde.
 * 
 */
declare function serdeEnumField(cfg?: {
    /**
     * Define the namespace for this enum field.
     */
    namespace: string
}): any;

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

// for hint all class types which are implmented implictly.
declare interface Object {
    /**
     * Serialize this class value by `Serializer`.
     */
    serialize<__R, __S extends Serializer<__R>>(serializer: __S): __R;
    /**
     * Deserialize this class value by `Deserializer`.
     */
    deserialize<__S extends Deserializer>(deserializer: __S): this;
}
