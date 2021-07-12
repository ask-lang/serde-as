export const SER_TYPE = "CoreSerializer";
export const METHOD_SER = "serialize";
export const METHOD_START_SER_FIELD = "startSerializeField";
export const METHOD_END_SER_FIELD = "endSerializeField";
export const METHOD_SER_FIELD = "serializeField";
export const METHOD_SER_NONNULL_FIELD = "serializeNonNullField";
export const METHOD_SER_LAST_FIELD = "serializeLastField";
export const METHOD_SER_NONNULL_LAST_FIELD = "serializeNonNullLastField";
export const METHOD_SER_ARG_NAME = "serializer";
export const METHOD_SER_SIG = `serialize<__R, __S extends CoreSerializer<__R>>(serializer: __S): __R`;

export const DES_TYPE = "CoreDeserializer";
export const METHOD_DES = "deserialize";
export const METHOD_START_DES_FIELD = "startDeserializeField";
export const METHOD_END_DES_FIELD = "endDeserializeField";
export const METHOD_DES_FIELD = "deserializeField";
export const METHOD_DES_NONNULL_FIELD = "deserializeNonNullField";
export const METHOD_DES_LAST_FIELD = "deserializeLastField";
export const METHOD_DES_NONNULL_LAST_FIELD = "deserializeNonNullLastField";
export const METHOD_DES_ARG_NAME = "deserializer";
export const METHOD_DES_SIG = `deserialize<__S extends CoreDeserializer>(deserializer: __S): this`;

export const NAMESPACE = "serde";

export enum SerdeKind {
    Serialize = "serialize",
    Deserialize = "deserialize",
    // TODO: add more decorators
    Skip = "skip",
    SkipSerializing = "skipSerializing",
    SkipDeserializing = "skipDeserializing",
    Get = "get",
    GetSerializing = "getSerializing",
    GetDeserializing = "getDeserializing",
    Set = "set",
    SetSerializing = "setSerializing",
    SetDeserializing = "setDeserializing",
    RenameAll = "renameAll",
    Rename = "rename",
}
