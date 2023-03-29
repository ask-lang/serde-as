// TODO: AssemblyScript do not support namespace for decorator now.
export const NAMESPACE = "serde";
export const TARGET = "serde-as";

export const METHOD_SER = "serialize";
export const METHOD_START_SER_FIELD = "startSerializeField";
export const METHOD_END_SER_FIELD = "endSerializeField";
export const METHOD_SER_FIELD = "serializeField";
export const METHOD_SER_LAST_FIELD = "serializeLastField";

export const METHOD_START_SER_TUPLE = "startSerializeTuple";
export const METHOD_END_SER_TUPLE = "endSerializeTuple";
export const METHOD_SER_TUPLE_ELEM = "serializeTupleElem";
export const METHOD_SER_LAST_TUPLE_ELEM = "serializeLastTupleElem";

export const METHOD_SER_ARG_NAME = "serializer";
export const METHOD_SER_SIG = `${METHOD_SER}<__R, __S extends Serializer<__R>>(${METHOD_SER_ARG_NAME}: __S): __R`;

export const METHOD_DES = "deserialize";
export const METHOD_START_DES_FIELD = "startDeserializeField";
export const METHOD_END_DES_FIELD = "endDeserializeField";
export const METHOD_DES_FIELD = "deserializeField";
export const METHOD_DES_LAST_FIELD = "deserializeLastField";

export const METHOD_START_DES_TUPLE = "startDeserializeTuple";
export const METHOD_END_DES_TUPLE = "endDeserializeTuple";
export const METHOD_DES_TUPLE_ELEM = "deserializeTupleElem";
export const METHOD_DES_LAST_TUPLE_ELEM = "deserializeLastTupleElem";

export const METHOD_DES_ARG_NAME = "deserializer";
export const METHOD_DES_SIG = `${METHOD_DES}<__S extends Deserializer>(${METHOD_DES_ARG_NAME}: __S): this`;

/**
 * Crates a `deserializeField` or `deserializeLastField`.
 * @param ty
 * @param nameStr
 * @param isLast
 * @returns
 */
export function deserializeField(ty: string, nameStr: string, isLast: boolean): string {
    return `${METHOD_DES_ARG_NAME}.${
        isLast ? METHOD_DES_LAST_FIELD : METHOD_DES_FIELD
    }<${ty}>(${nameStr})`;
}

/**
 * Crates a `serializeField` or `serializeLastField`.
 * @param ty
 * @param nameStr
 * @param fieldName
 * @param isLast
 * @returns
 */
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

/**
 * Crates a `deserializeTupleElem` or `deserializeLastTupleElem`.
 * @param ty
 * @param isLast
 * @returns
 */
export function deserializeTupleElem(ty: string, isLast: boolean): string {
    return `${METHOD_DES_ARG_NAME}.${
        isLast ? METHOD_DES_LAST_TUPLE_ELEM : METHOD_DES_TUPLE_ELEM
    }<${ty}>()`;
}

/**
 * Crates a `serializeTupleElem` or `serializeLastTupleElem`.
 * @param ty
 * @param fieldName
 * @param isLast
 * @returns
 */
export function serializeTupleElem(ty: string, fieldName: string, isLast: boolean): string {
    return `${METHOD_SER_ARG_NAME}.${
        isLast ? METHOD_SER_LAST_TUPLE_ELEM : METHOD_SER_TUPLE_ELEM
    }<${ty}>(this.${fieldName})`;
}

export function superSerialize(): string {
    return `super.${METHOD_SER}<__R, __S>(${METHOD_SER_ARG_NAME})`;
}

export function superDeserialize(): string {
    return `super.${METHOD_DES}<__S>(${METHOD_DES_ARG_NAME})`;
}

/**
 * This class contains a typical info about serde class field.ss
 */
export class FieldInfo {
    constructor(
        public readonly typeName: string,
        public readonly fieldOriginName: string,
        public readonly fieldName: string,
        public readonly isLast: boolean,
    ) {}

    /**
     * Crates a `serializeTupleElem` or `serializeLastTupleElem`.
     * @returns
     */
    genSerializeTupleElem(): string {
        return `${METHOD_SER_ARG_NAME}.${
            this.isLast ? METHOD_SER_LAST_TUPLE_ELEM : METHOD_SER_TUPLE_ELEM
        }<${this.typeName}>(this.${this.fieldOriginName})`;
    }

    /**
     * Crates a `deserializeTupleElem` or `deserializeLastTupleElem`.
     * @returns
     */
    genDeserializeTupleElem(): string {
        return `${METHOD_DES_ARG_NAME}.${
            this.isLast ? METHOD_DES_LAST_TUPLE_ELEM : METHOD_DES_TUPLE_ELEM
        }<${this.typeName}>()`;
    }

    /**
     * Crates a `serializeField` or `serializeLastField`.
     * @returns
     */
    genSerializeField(): string {
        return `${METHOD_SER_ARG_NAME}.${this.isLast ? METHOD_SER_LAST_FIELD : METHOD_SER_FIELD}<${
            this.typeName
        }>(${this.fieldName}, this.${this.fieldOriginName})`;
    }

    /**
     * Crates a `deserializeField` or `deserializeLastField`.
     * @returns
     */
    genDeserializeField(): string {
        return `${METHOD_DES_ARG_NAME}.${this.isLast ? METHOD_DES_LAST_FIELD : METHOD_DES_FIELD}<${
            this.typeName
        }>(${this.fieldName})`;
    }
}

// Decorator key name.
export const CFG_OMIT_NAME = "omitName";
export const CFG_SKIP_SUPER = "skipSuper";
// TODO:
export const CFG_RENAME_ALL = "renameAll";

/**
 * The decorator for class.
 */
export enum ClassSerdeKind {
    /**
     * Repsents `Serialize` and `Deserialize`.
     */
    Serde = "serde",
    /**
     * Same with `Serde`, but also decorate a class to be a tuple type.
     *
     * It's more friendly for downstream usage that choose a new decorator rather than a decorator config for tuple class.
     */
    SerdeTuple = "serdeTuple",
    /*
     * Add serialize method to class.
     */
    Serialize = "serialize",
    /**
     * Add deserialize method to class.
     */
    Deserialize = "deserialize",
}

// TODO: TBD
/**
 * The decorator for class members.
 */
export enum MemberSerdeKind {
    /**
     * Repsents `SkipSerializing` and `SkipDeserializing`.
     */
    Skip = "skip",
    SkipSerializing = "skipSerializing",
    SkipDeserializing = "skipDeserializing",
    /**
     * Repsents `GetSerializing` and `GetSerializing`.
     */
    Get = "get",
    GetSerializing = "getSerializing",
    GetDeserializing = "getDeserializing",
    /**
     * Repsents `SetSerializing` and `SetSerializing`
     */
    Set = "set",
    SetSerializing = "setSerializing",
    SetDeserializing = "setDeserializing",

    Rename = "rename",
}
