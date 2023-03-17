export const METHOD_SER = "serialize";
export const METHOD_START_SER_FIELD = "startSerializeField";
export const METHOD_END_SER_FIELD = "endSerializeField";
export const METHOD_SER_FIELD = "serializeField";
export const METHOD_SER_LAST_FIELD = "serializeLastField";
export const METHOD_SER_ARG_NAME = "serializer";
export const METHOD_SER_SIG = `${METHOD_SER}<__R, __S extends Serializer<__R>>(${METHOD_SER_ARG_NAME}: __S): __R`;

export const METHOD_DES = "deserialize";
export const METHOD_START_DES_FIELD = "startDeserializeField";
export const METHOD_END_DES_FIELD = "endDeserializeField";
export const METHOD_DES_FIELD = "deserializeField";
export const METHOD_DES_LAST_FIELD = "deserializeLastField";
export const METHOD_DES_ARG_NAME = "deserializer";
export const METHOD_DES_SIG = `${METHOD_DES}<__S extends Deserializer>(${METHOD_DES_ARG_NAME}: __S): this`;

// Crates a `deserializeField` or `deserializeLastField`.
export function deserializeField(ty: string, nameStr: string, isLast: boolean): string {
    return `${METHOD_DES_ARG_NAME}.${
        isLast ? METHOD_DES_LAST_FIELD : METHOD_DES_FIELD
    }<${ty}>(${nameStr})`;
}

// Crates a `serializeField` or `serializeLastField`.
export function serializeField(
    ty: string,
    nameStr: string,
    fieldName: string,
    isLast: boolean,
): string {
    return `${METHOD_SER_ARG_NAME}.${
        isLast ? METHOD_SER_LAST_FIELD : METHOD_SER_FIELD
    }<${ty}>(${nameStr}, this.${fieldName})`;
}

export function superSerialize(): string {
    return `super.${METHOD_SER}<__R, __S>(${METHOD_SER_ARG_NAME})`;
}

export function superDeserialize(): string {
    return `super.${METHOD_DES}<__S>(${METHOD_DES_ARG_NAME})`;
}

// Decorator key name.
export const CFG_OMIT_NAME = "omitName";
export const CFG_SKIP_SUPER = "skipSuper";

// TODO: AssemblyScript do not support namespace for decorator now.
export const NAMESPACE = "serde";

/**
 * The decorator for class.
 */
export enum ClassSerdeKind {
    // Repsents `Serialize` and `Deserialize`
    Serde = "serde",
    // Add serialize method to class.
    Serialize = "serialize",
    // Add deserialize method to class.
    Deserialize = "deserialize",

    // TODO: TBD
    RenameAll = "renameAll",
}

// TODO: TBD
/**
 * The decorator for class members.
 */
export enum MemberSerdeKind {
    // Repsents `SkipSerializing` and `SkipDeserializing`
    Skip = "skip",
    SkipSerializing = "skipSerializing",
    SkipDeserializing = "skipDeserializing",
    // Repsents `GetSerializing` and `GetSerializing`
    Get = "get",
    GetSerializing = "getSerializing",
    GetDeserializing = "getDeserializing",
    // Repsents `SetSerializing` and `SetSerializing`
    Set = "set",
    SetSerializing = "setSerializing",
    SetDeserializing = "setDeserializing",

    Rename = "rename",
}
