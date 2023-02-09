// @ts-nocheck
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Deserializer, Serializer } from "as-serde";

/**
 * CompactLen returns encoded length for compact integer.
 */
export interface CompactLen {
    compactLen(): i32;
}


@lazy const U8_OUT_OF_RANGE: string = "out of range decoding Compact<u8>";

@lazy const U16_OUT_OF_RANGE: string = "out of range decoding Compact<u16>";

@lazy const U32_OUT_OF_RANGE: string = "out of range decoding Compact<u32>";

@lazy const U64_OUT_OF_RANGE: string = "out of range decoding Compact<u64>";
// @lazy const U128_OUT_OF_RANGE: string = "out of range decoding Compact<u128>";

/**
 * Compact wraps a unsigned integer into a compaction mode.
 */
export class Compact<T extends number> implements CompactLen {
    
    constructor(protected _value: T = 0) {
        if (!isInteger<T>() || isSigned<T>()) {
            unreachable();
        }
    }

    @inline
    unwrap(): T {
        return this._value;
    }

    @inline
    compactLen(): i32 {
        return Compact.computeCompactLen(this._value as u64);
    }

    @inline
    static computeCompactLen(val: u64): i32 {
        if (val <= 0b0011_1111) return 1;
        else if (val <= 0b0011_1111_1111_1111) return 2;
        else if (val <= 0b0011_1111_1111_1111_1111_1111_1111_1111) return 4;
        else {
            return ((8 - clz(val) / 8) as i32) + 1;
        }
    }

    serialize<R, S extends Serializer<R>>(serializer: S): R {
        const len = this.compactLen();
        switch (len) {
            case 1: {
                return serializer.serialize<u8>((this._value as u8) << 2);
            }

            case 2: {
                return serializer.serialize<u16>(
                    ((this._value as u16) << 2) | 0b01
                );
            }
            case 4: {
                return serializer.serialize<u32>(
                    ((this._value as u32) << 2) | 0b10
                );
            }

            default: {
                // TODO: meet the wasm-validator error
                let bytesNeeded = 8 - clz(this._value as u64) / 8;
                assert(
                    bytesNeeded >= 4,
                    "Previous match arm matches anyting less than 2^30; qed"
                );
                let ret = serializer.serializeU8(
                    (0b11 + ((bytesNeeded - 4) << 2)) as u8
                );
                let v = this._value;
                for (let i: u8 = 0; i < u8(bytesNeeded); i++) {
                    ret = serializer.serializeU8(v as u8);
                    
                    v >>= 8;
                }
                
                assert(
                    v == 0,
                    "shifted sufficient bits right to lead only leading zeros; qed"
                );
                return ret;
            }
        }
    }

    @inline
    deserialize<S extends Deserializer>(deserializer: S): this {
        if (sizeof<T>() == 1) {
            
            return this.deserializeU8(deserializer);
        } else if (sizeof<T>() == 2) {
            
            return this.deserializeU16(deserializer);
        } else if (sizeof<T>() == 4) {
            
            return this.deserializeU32(deserializer);
        } else {
            // sizeof<N>() == 8
            
            return this.deserializeU64(deserializer);
        }
    }

    deserializeU8<S extends Deserializer>(deserializer: S): Compact<u8> {
        let b1 = deserializer.deserializeU8() as u32;
        switch (b1 & 0b0000_0011) {
            case 0b00: {
                return instantiate<this>((b1 >> 2) as u8);
            }

            case 0b01: {
                let b2 = deserializer.deserializeU8() as u32;
                return instantiate<this>((((b2 << 8) + b1) >> 2) as u8);
            }

            default: {
                assert(false, U8_OUT_OF_RANGE);
                return instantiate<this>();
            }
        }
    }

    deserializeU16<S extends Deserializer>(deserializer: S): Compact<u16> {
        let b1 = deserializer.deserializeU8() as u32;
        switch (b1 & 0b0000_0011) {
            case 0b00: {
                return instantiate<this>((b1 >> 2) as u16);
            }

            case 0b01: {
                let b2 = deserializer.deserializeU8() as u32;
                return instantiate<this>((((b2 << 8) + b1) >> 2) as u16);
            }

            case 0b10: {
                let b2 = deserializer.deserializeU8() as u32;
                let b3 = deserializer.deserializeU8() as u32;
                let b4 = deserializer.deserializeU8() as u32;

                return instantiate<this>(
                    (((b4 << 24) + (b3 << 16) + (b2 << 8) + b1) >> 2) as u16
                );
            }

            default: {
                assert(false, U16_OUT_OF_RANGE);
                return instantiate<this>();
            }
        }
    }

    deserializeU32<S extends Deserializer>(deserializer: S): Compact<u32> {
        let b1 = deserializer.deserializeU8() as u32;
        switch (b1 & 0b0000_0011) {
            case 0b00: {
                return instantiate<this>(b1 >> 2);
            }

            case 0b01: {
                let b2 = deserializer.deserializeU8() as u32;
                return instantiate<this>(((b2 << 8) + b1) >> 2);
            }

            case 0b10: {
                let b2 = deserializer.deserializeU8() as u32;
                let b3 = deserializer.deserializeU8() as u32;
                let b4 = deserializer.deserializeU8() as u32;

                return instantiate<this>(
                    ((b4 << 24) + (b3 << 16) + (b2 << 8) + b1) >> 2
                );
            }

            default: {
                assert(b1 >> 2 == 0, U32_OUT_OF_RANGE);
                // just 4 bytes. ok.
                let b4 = deserializer.deserializeU32();
                return instantiate<this>(b4);
            }
        }
    }

    deserializeU64<S extends Deserializer>(deserializer: S): Compact<u64> {
        let b1 = deserializer.deserializeU8() as u32;
        switch (b1 & 0b0000_0011) {
            case 0b00: {
                return instantiate<this>(b1 >> 2);
            }

            case 0b01: {
                let b2 = deserializer.deserializeU8() as u32;
                return instantiate<this>(((b2 << 8) + b1) >> 2);
            }

            case 0b10: {
                let b2 = deserializer.deserializeU8() as u32;
                let b3 = deserializer.deserializeU8() as u32;
                let b4 = deserializer.deserializeU8() as u32;

                return instantiate<this>(
                    (((b4 << 24) + (b3 << 16) + (b2 << 8) + b1) >> 2) as u64
                );
            }

            default: {
                const bytesNeeded = (b1 >> 2) + 4;
                switch (bytesNeeded) {
                    case 4: {
                        // just 4 bytes. ok.
                        let b4 = deserializer.deserializeU32();
                        assert(b4 > u32.MAX_VALUE >> 2, U64_OUT_OF_RANGE);
                        return instantiate<this>(b4 as u64);
                    }

                    case 8: {
                        let b8 = deserializer.deserializeU64();
                        assert(b8 > u64.MAX_VALUE >> 8, U64_OUT_OF_RANGE);
                        return instantiate<this>(b8);
                    }

                    default: {
                        assert(bytesNeeded < 8, U64_OUT_OF_RANGE);
                        let res: u64 = 0;
                        for (let i: u32 = 0; i < bytesNeeded; i++) {
                            res |=
                                (deserializer.deserializeU8() as u64) <<
                                (i * 8);
                        }
                        let t =
                            res > u64.MAX_VALUE >> ((8 - bytesNeeded + 1) * 8);
                        assert(t, U64_OUT_OF_RANGE);
                        return instantiate<this>(res);
                    }
                }
            }
        }
    }
}
