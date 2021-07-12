import { CoreDeserializer } from "./deserializer";
import { CoreSerializer } from "./serializer";

export * from "./serializer";
export * from "./deserializer";
export * from "./util";

export interface ISerialize {
    serialize<__R, __S extends CoreSerializer<__R>>(serializer: __S): __R;
}

export interface IDeserialize {
    deserialize<__S extends CoreDeserializer>(deserializer: __S): IDeserialize;
}
