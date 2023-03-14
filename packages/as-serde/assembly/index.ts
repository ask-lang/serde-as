import { Deserializer } from "./deserializer";
import { Serializer } from "./serializer";

export * from "./serializer";
export * from "./deserializer";
export * from "./util";

export interface ISerialize {
    /**
     * Serialize this class value by `Serializer`.
     */
    serialize<__R, __S extends Serializer<__R>>(serializer: __S): __R;
}

export interface IDeserialize {
    /**
     * Deserialize this class value by `Deserializer`.
     */
    deserialize<__S extends Deserializer>(deserializer: __S): this;
}
