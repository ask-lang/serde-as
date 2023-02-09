import { Buffer } from "./buffer";
import { nextPowerOf2 } from "./util";

export class BytesBuffer extends Buffer {
    @lazy
    static readonly DEFAULT_BUFFER_SIZE: i32 = 16;
    protected _readOffset: i32 = 0;

    constructor(
        buffer: StaticArray<u8> = changetype<StaticArray<u8>>(
            __new(BytesBuffer.DEFAULT_BUFFER_SIZE, idof<StaticArray<u8>>())
        )
    ) {
        super(buffer, 0);
    }

    /**
     * Returns latest read offset.
     */
    @inline
    get readOffset(): i32 {
        return this._readOffset;
    }

    /**
     * Reset read offset to a position, default to 0.
     * @param offset
     */
    @inline
    resetReadOffset(offset: i32 = 0): void {
        this._readOffset = offset;
    }

    /**
     * This creates a view of the Uint8Array | StaticArray<u8> | ArrayBuffer without copying the underlying memory.
     * The offset will be set to the latest.
     * @param arr
     */
    @inline
    @unsafe
    // @ts-ignore
    static wrap<A>(arr: A): BytesBuffer {
        const id = idof<A>();
        if (id == idof<StaticArray<u8>>()) {
            let arr2 = changetype<StaticArray<u8>>(arr);
            const res = new BytesBuffer(arr2);
            res.resetOffset(arr2.length);
            return res;
        } else if (id == idof<ArrayBuffer>()) {
            let arr2 = changetype<StaticArray<u8>>(arr);
            const res = new BytesBuffer(arr2);
            res.resetOffset(arr2.length);
            return res;
        }
        // @ts-ignore
        else if (id == idof<Uint8Array>()) {
            // @ts-ignore
            let arr2 = changetype<StaticArray<u8>>(arr.buffer);
            const res = new BytesBuffer(arr2);
            res.resetOffset(arr2.length);
            return res;
        } else {
            // for compiler error
        }
    }

    /**
     * This creates a copy of the Uint8Array | StaticArray<u8> | ArrayBuffer with copying the underlying memory.
     * The offset will be set to the latest.
     * @param arr
     */
    @inline
    // @ts-ignore
    static from<A>(arr: A): BytesBuffer {
        // @ts-ignore
        const id = idof<A>();
        if (id == idof<StaticArray<u8>>()) {
            let arr2 = StaticArray.slice(changetype<StaticArray<u8>>(arr));
            const res = new BytesBuffer(arr2);
            res.resetOffset(arr2.length);
            return res;
        } else if (id == idof<ArrayBuffer>()) {
            let arr2 = StaticArray.slice(changetype<StaticArray<u8>>(arr));
            const res = new BytesBuffer(arr2);
            res.resetOffset(arr2.length);
            return res;
        }
        // @ts-ignore
        else if (id == idof<Uint8Array>()) {
            let arr2 = StaticArray.slice(
                // @ts-ignore
                changetype<StaticArray<u8>>(arr.buffer)
            );
            // @ts-ignore
            const res = new BytesBuffer(arr2);
            res.resetOffset(arr2.length);
            return res;
        } else {
            // for compiler error
        }
    }

    /**
     * Creates a BytesBuffer with init capacity.
     * @param capacity
     * @returns
     */
    @inline
    static withCapacity(capacity: i32): BytesBuffer {
        return new BytesBuffer(
            changetype<StaticArray<u8>>(
                __new(capacity, idof<StaticArray<u8>>())
            )
        );
    }

    slice(start: i32 = 0, end: i32 = this.offset): BytesBuffer {
        start = max(0, min(start, this.offset));
        end = max(0, min(end, this.offset));
        let size = end - start;
        if (size <= 0) {
            return new BytesBuffer();
        }
        let res = BytesBuffer.withCapacity(nextPowerOf2(end - start));
        res._writeUnsafe(
            changetype<usize>(this._buffer) + (start as usize),
            size
        );
        return res;
    }

    @inline
    private sliceLen(size: i32, start: i32 = 0, end: i32 = i32.MAX_VALUE): i32 {
        let len = size;
        if (start != 0 || end != i32.MAX_VALUE) {
            let from: i32;
            from = min<i32>(max(start, 0), len);
            end = min<i32>(max(end, 0), len);
            start = min<i32>(from, end);
            end = max<i32>(from, end);
            len = end - start;
        }
        return len;
    }

    @unsafe
    @inline
    writeBytesSlice<A extends ArrayLike<u8>>(
        src: A,
        start: i32 = 0,
        end: i32 = i32.MAX_VALUE
    ): void {
        const len = this.sliceLen(src.length, start, end);
        if (!len) return;
        this.reserve(len);
        this._writeUnsafe(changetype<usize>(src), len);
    }

    @unsafe
    @inline
    writeBytesSliceUnsafe<A extends ArrayLike<u8>>(
        src: A,
        start: i32 = 0,
        end: i32 = i32.MAX_VALUE
    ): void {
        const len = this.sliceLen(src.length, start, end);
        if (!len) return;
        this._writeUnsafe(changetype<usize>(src), len);
    }

    @inline
    clearBuffer(): void {
        this._offset = 0;
        this._buffer = changetype<StaticArray<u8>>(
            __renew(
                changetype<usize>(this._buffer),
                <i32>BytesBuffer.DEFAULT_BUFFER_SIZE
            )
        );
    }

    @inline
    shrink(): void {
        this._buffer = changetype<StaticArray<u8>>(
            __renew(
                changetype<usize>(this._buffer),
                <i32>max(this._offset, BytesBuffer.DEFAULT_BUFFER_SIZE)
            )
        );
    }

    toString(): string {
        return String.UTF16.decodeUnsafe(
            changetype<usize>(this._buffer),
            this._offset
        );
    }

    /**
     * Reads number from buffer at the specified offset.
     * Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - sizeof<T>. Default: the offset last read.
     * @param offset
     * @param isLittle default to false
     * @returns
     */
    @inline
    readNumber<T>(offset: i32 = this._readOffset, isLittle: bool = false): T {
        return isLittle
            ? this.readNumberLE<T>(offset)
            : this.readNumberBE<T>(offset);
    }

    /**
     * Writes value to buffer at the specified offset.
     *
     * @param val
     * @param isLittle default to false
     */
    @inline
    writeNumber<T>(val: T, isLittle: bool = false): void {
        isLittle ? this.writeNumberLE<T>(val) : this.writeNumberBE<T>(val);
    }

    /**
     * Reads big-endian number from buffer at the specified offset.
     * Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - sizeof<T>. Default: the offset last read.
     * @param offset read offset for reading data, default to the last offset.
     * @returns number T
     */
    @inline
    readNumberBE<T>(offset: i32 = this._readOffset): T {
        if (isFloat<T>()) {
            if (sizeof<T>() == 4) {
                // @ts-ignore
                return this.readF32BE(offset);
            } else {
                // sizeof<N>() == 8
                // @ts-ignore
                return this.readF64BE(offset);
            }
        } else if (isSigned<T>()) {
            if (sizeof<T>() == 1) {
                // @ts-ignore
                return this.readInt8(offset);
            } else if (sizeof<T>() == 2) {
                // @ts-ignore
                return this.readInt16BE(offset);
            } else if (sizeof<T>() == 4) {
                // @ts-ignore
                return this.readInt32BE(offset);
            } else {
                // sizeof<N>() == 8
                // @ts-ignore
                return this.readInt64BE(offset);
            }
        } else {
            if (sizeof<T>() == 1) {
                // @ts-ignore
                return this.readUInt8(offset);
            } else if (sizeof<T>() == 2) {
                // @ts-ignore
                return this.readUInt16BE(offset);
            } else if (sizeof<T>() == 4) {
                // @ts-ignore
                return this.readUInt32BE(offset);
            } else {
                // (sizeof<T>() == 8)
                // @ts-ignore
                return this.readUInt64BE(offset);
            }
        }
    }

    /**
     * Reads little-endian number from buffer at the specified offset.
     * Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - sizeof<T>. Default: the offset last written.
     * @param offset read offset for reading data, default to the last offset.
     * @returns number T
     */
    @inline
    readNumberLE<T>(offset: i32 = this._readOffset): T {
        if (isFloat<T>()) {
            if (sizeof<T>() == 4) {
                // @ts-ignore
                return this.readF32LE(offset);
            } else {
                // sizeof<N>() == 8
                // @ts-ignore
                return this.readF64LE(offset);
            }
        } else if (isSigned<T>()) {
            if (sizeof<T>() == 1) {
                // @ts-ignore
                return this.readInt8(offset);
            } else if (sizeof<T>() == 2) {
                // @ts-ignore
                return this.readInt16LE(offset);
            } else if (sizeof<T>() == 4) {
                // @ts-ignore
                return this.readInt32LE(offset);
            } else {
                // sizeof<N>() == 8
                // @ts-ignore
                return this.readInt64LE(offset);
            }
        } else {
            if (sizeof<T>() == 1) {
                // @ts-ignore
                return this.readUInt8(offset);
            } else if (sizeof<T>() == 2) {
                // @ts-ignore
                return this.readUInt16LE(offset);
            } else if (sizeof<T>() == 4) {
                // @ts-ignore
                return this.readUInt32LE(offset);
            } else {
                // (sizeof<T>() == 8)
                // @ts-ignore
                return this.readUInt64LE(offset);
            }
        }
    }

    /**
     * Writes value to buffer at the specified offset as big-endian.
     * @param val Number to be written to buffer.
     * @param offset Number of bytes to skip before starting to write. Must satisfy 0 <= offset <= buf.length - sizeof<T>. Default: the offset last written.
     */
    @inline
    writeNumberBE<T>(val: T, offset: i32 = this._offset): void {
        if (isFloat<T>()) {
            if (sizeof<T>() == 4) {
                // @ts-ignore
                this.writeF32BE(val, offset);
            } else {
                // sizeof<N>() == 8
                // @ts-ignore
                this.writeF64BE(val, offset);
            }
        } else if (isSigned<T>()) {
            if (sizeof<T>() == 1) {
                // @ts-ignore
                this.writeInt8(val, offset);
            } else if (sizeof<T>() == 2) {
                // @ts-ignore
                this.writeInt16BE(val, offset);
            } else if (sizeof<T>() == 4) {
                // @ts-ignore
                this.writeInt32BE(val, offset);
            } else {
                // sizeof<N>() == 8
                // @ts-ignore
                this.writeInt64BE(val, offset);
            }
        } else {
            if (sizeof<T>() == 1) {
                // @ts-ignore
                this.writeUInt8(val, offset);
            } else if (sizeof<T>() == 2) {
                // @ts-ignore
                this.writeUInt16BE(val, offset);
            } else if (sizeof<T>() == 4) {
                // @ts-ignore
                this.writeUInt32BE(val, offset);
            } else {
                // (sizeof<T>() == 8)
                // @ts-ignore
                this.writeUInt64BE(val, offset);
            }
        }
    }

    /**
     * Writes value to buffer at the specified offset as little-endian.
     * @param val Number to be written to buffer.
     * @param offset Number of bytes to skip before starting to write. Must satisfy 0 <= offset <= buf.length - 2. Default: the offset last written.
     */
    @inline
    writeNumberLE<T>(val: T, offset: i32 = this._offset): void {
        if (isFloat<T>()) {
            if (sizeof<T>() == 4) {
                // @ts-ignore
                this.writeF32LE(val, offset);
            } else {
                // sizeof<N>() == 8
                // @ts-ignore
                this.writeF64LE(val, offset);
            }
        } else if (isSigned<T>()) {
            if (sizeof<T>() == 1) {
                // @ts-ignore
                this.writeInt8(val, offset);
            } else if (sizeof<T>() == 2) {
                // @ts-ignore
                this.writeInt16LE(val, offset);
            } else if (sizeof<T>() == 4) {
                // @ts-ignore
                this.writeInt32LE(val, offset);
            } else {
                // sizeof<N>() == 8
                // @ts-ignore
                this.writeInt64LE(val, offset);
            }
        } else {
            if (sizeof<T>() == 1) {
                // @ts-ignore
                this.writeUInt8(val, offset);
            } else if (sizeof<T>() == 2) {
                // @ts-ignore
                this.writeUInt16LE(val, offset);
            } else if (sizeof<T>() == 4) {
                // @ts-ignore
                this.writeUInt32LE(val, offset);
            } else {
                // (sizeof<T>() == 8)
                // @ts-ignore
                this.writeUInt64LE(val, offset);
            }
        }
    }

    @inline
    readBool(offset: i32 = this._readOffset): bool {
        let b = this.readByte(offset);
        assert(b == 1 || b == 0, "readBool: not 0x0 or 0x1");
        return b == 1 ? true : false;
    }

    @inline
    readByte(offset: i32 = this._readOffset): u8 {
        return this.readUInt8(offset);
    }

    @inline
    readUInt8(offset: i32 = this._readOffset): u8 {
        const res = this.readByteUnsafe(offset++);
        this.resetReadOffset(offset);
        return res;
    }

    @inline
    readInt8(offset: i32 = this._readOffset): i8 {
        const res = this.readByteUnsafe(offset++) as i8;
        this.resetReadOffset(offset);
        return res;
    }

    @inline
    readInt16BE(offset: i32 = this._readOffset): i16 {
        const b1 = this.readByteUnsafe(offset++) as i16;
        const b2 = this.readByteUnsafe(offset++) as i16;
        this.resetReadOffset(offset);
        return (b1 << 8) | b2;
    }

    @inline
    readInt16LE(offset: i32 = this._readOffset): i16 {
        const b1 = this.readByteUnsafe(offset++) as i16;
        const b2 = this.readByteUnsafe(offset++) as i16;
        this.resetReadOffset(offset);
        return b1 | (b2 << 8);
    }

    @inline
    readUInt16BE(offset: i32 = this._readOffset): u16 {
        return this.readInt16BE(offset) as u16;
    }

    @inline
    readUInt16LE(offset: i32 = this._readOffset): u16 {
        return this.readInt16LE(offset) as u16;
    }

    @inline
    readInt32BE(offset: i32 = this._readOffset): i32 {
        const b1 = this.readByteUnsafe(offset++) as i32;
        const b2 = this.readByteUnsafe(offset++) as i32;
        const b3 = this.readByteUnsafe(offset++) as i32;
        const b4 = this.readByteUnsafe(offset++) as i32;
        this.resetReadOffset(offset);
        return (b1 << 24) | (b2 << 16) | (b3 << 8) | b4;
    }

    @inline
    readInt32LE(offset: i32 = this._readOffset): i32 {
        const b1 = this.readByteUnsafe(offset++) as i32;
        const b2 = this.readByteUnsafe(offset++) as i32;
        const b3 = this.readByteUnsafe(offset++) as i32;
        const b4 = this.readByteUnsafe(offset++) as i32;
        this.resetReadOffset(offset);
        return (b4 << 24) | (b3 << 16) | (b2 << 8) | b1;
    }

    @inline
    readUInt32BE(offset: i32 = this._readOffset): u32 {
        return this.readInt32BE(offset) as u32;
    }

    @inline
    readUInt32LE(offset: i32 = this._readOffset): u32 {
        return this.readInt32LE(offset) as u32;
    }

    @inline
    readInt64BE(offset: i32 = this._readOffset): i64 {
        const b1 = this.readByteUnsafe(offset++) as i64;
        const b2 = this.readByteUnsafe(offset++) as i64;
        const b3 = this.readByteUnsafe(offset++) as i64;
        const b4 = this.readByteUnsafe(offset++) as i64;
        const b5 = this.readByteUnsafe(offset++) as i64;
        const b6 = this.readByteUnsafe(offset++) as i64;
        const b7 = this.readByteUnsafe(offset++) as i64;
        const b8 = this.readByteUnsafe(offset++) as i64;
        this.resetReadOffset(offset);
        return (
            (b1 << 56) |
            (b2 << 48) |
            (b3 << 40) |
            (b4 << 32) |
            (b5 << 24) |
            (b6 << 16) |
            (b7 << 8) |
            b8
        );
    }

    @inline
    readInt64LE(offset: i32 = this._readOffset): i64 {
        const b1 = this.readByteUnsafe(offset++) as i64;
        const b2 = this.readByteUnsafe(offset++) as i64;
        const b3 = this.readByteUnsafe(offset++) as i64;
        const b4 = this.readByteUnsafe(offset++) as i64;
        const b5 = this.readByteUnsafe(offset++) as i64;
        const b6 = this.readByteUnsafe(offset++) as i64;
        const b7 = this.readByteUnsafe(offset++) as i64;
        const b8 = this.readByteUnsafe(offset++) as i64;
        this.resetReadOffset(offset);
        return (
            (b8 << 56) |
            (b7 << 48) |
            (b6 << 40) |
            (b5 << 32) |
            (b4 << 24) |
            (b3 << 16) |
            (b2 << 8) |
            b1
        );
    }

    @inline
    readUInt64BE(offset: i32 = this._readOffset): u64 {
        return this.readInt64BE(offset) as u64;
    }

    @inline
    readUInt64LE(offset: i32 = this._readOffset): u64 {
        return this.readInt64LE(offset) as u64;
    }

    @inline
    readF32BE(offset: i32 = this._readOffset): f32 {
        return reinterpret<f32>(this.readInt32BE(offset));
    }

    @inline
    readF32LE(offset: i32 = this._readOffset): f32 {
        return reinterpret<f32>(this.readInt32LE(offset));
    }

    @inline
    readF64BE(offset: i32 = this._readOffset): f64 {
        return reinterpret<f64>(this.readInt64BE(offset));
    }

    @inline
    readF64LE(offset: i32 = this._readOffset): f64 {
        return reinterpret<f64>(this.readInt64LE(offset));
    }

    @unsafe
    @inline
    readByteUnsafe(offset: i32 = this._offset): u8 {
        return this._buffer[offset];
    }

    @inline
    writeBool(b: bool, offset: i32 = this._offset): void {
        this.writeByte(b ? 0x01 : 0x00, offset);
    }

    @inline
    writeUInt8(b: u8, offset: i32 = this._offset): void {
        this.writeByte(b, offset);
    }

    @inline
    writeInt8(b: i8, offset: i32 = this._offset): void {
        this.writeByte(b, offset);
    }

    @inline
    writeInt16BE(val: i16, offset: i32 = this._offset): void {
        this.reserve(2);
        const b1 = (val >> 8) as u8;
        const b2 = val as u8;
        this.writeByteUnsafe(b1, offset++);
        this.writeByteUnsafe(b2, offset++);
        this._offset = offset;
    }

    @inline
    writeInt16LE(val: i16, offset: i32 = this._offset): void {
        this.reserve(2);
        const b1 = val as u8;
        const b2 = (val >> 8) as u8;
        this.writeByteUnsafe(b1, offset++);
        this.writeByteUnsafe(b2, offset++);
        this._offset = offset;
    }

    @inline
    writeUInt16BE(val: u16, offset: i32 = this._offset): void {
        this.writeInt16BE(val as u16, offset);
    }

    @inline
    writeUInt16LE(val: u16, offset: i32 = this._offset): void {
        this.writeInt16LE(val as u16, offset);
    }

    @inline
    writeInt32BE(val: i32, offset: i32 = this._offset): void {
        this.reserve(4);
        let off = 32;
        const b1 = (val >> (off -= 8)) as u8;
        const b2 = (val >> (off -= 8)) as u8;
        const b3 = (val >> (off -= 8)) as u8;
        const b4 = val as u8;
        this.writeByteUnsafe(b1, offset++);
        this.writeByteUnsafe(b2, offset++);
        this.writeByteUnsafe(b3, offset++);
        this.writeByteUnsafe(b4, offset++);
        this._offset = offset;
    }

    @inline
    writeInt32LE(val: i32, offset: i32 = this._offset): void {
        this.reserve(4);
        let off = 32;
        const b4 = (val >> (off -= 8)) as u8;
        const b3 = (val >> (off -= 8)) as u8;
        const b2 = (val >> (off -= 8)) as u8;
        const b1 = val as u8;
        this.writeByteUnsafe(b1, offset++);
        this.writeByteUnsafe(b2, offset++);
        this.writeByteUnsafe(b3, offset++);
        this.writeByteUnsafe(b4, offset++);
        this._offset = offset;
    }

    @inline
    writeUInt32BE(val: u32, offset: i32 = this._offset): void {
        this.writeInt32BE(val as i32, offset);
    }

    @inline
    writeUInt32LE(val: u32, offset: i32 = this._offset): void {
        this.writeInt32LE(val as i32, offset);
    }

    @inline
    writeF32BE(val: f32, offset: i32 = this._offset): void {
        this.writeInt32BE(reinterpret<i32>(val), offset);
    }

    @inline
    writeF32LE(val: f32, offset: i32 = this._offset): void {
        this.writeInt32LE(reinterpret<i32>(val), offset);
    }

    writeInt64BE(val: i64, offset: i32 = this._offset): void {
        const b = 8;
        this.reserve(b);
        let off = 64;
        const b1 = (val >> (off -= b)) as u8;
        const b2 = (val >> (off -= b)) as u8;
        const b3 = (val >> (off -= b)) as u8;
        const b4 = (val >> (off -= b)) as u8;
        const b5 = (val >> (off -= b)) as u8;
        const b6 = (val >> (off -= b)) as u8;
        const b7 = (val >> (off -= b)) as u8;
        const b8 = val as u8;
        this.writeByteUnsafe(b1, offset++);
        this.writeByteUnsafe(b2, offset++);
        this.writeByteUnsafe(b3, offset++);
        this.writeByteUnsafe(b4, offset++);
        this.writeByteUnsafe(b5, offset++);
        this.writeByteUnsafe(b6, offset++);
        this.writeByteUnsafe(b7, offset++);
        this.writeByteUnsafe(b8, offset++);
        this._offset = offset;
    }

    writeInt64LE(val: i64, offset: i32 = this._offset): void {
        const b = 8;
        this.reserve(b);
        let off = 64;
        const b8 = (val >> (off -= b)) as u8;
        const b7 = (val >> (off -= b)) as u8;
        const b6 = (val >> (off -= b)) as u8;
        const b5 = (val >> (off -= b)) as u8;
        const b4 = (val >> (off -= b)) as u8;
        const b3 = (val >> (off -= b)) as u8;
        const b2 = (val >> (off -= b)) as u8;
        const b1 = val as u8;
        this.writeByteUnsafe(b1, offset++);
        this.writeByteUnsafe(b2, offset++);
        this.writeByteUnsafe(b3, offset++);
        this.writeByteUnsafe(b4, offset++);
        this.writeByteUnsafe(b5, offset++);
        this.writeByteUnsafe(b6, offset++);
        this.writeByteUnsafe(b7, offset++);
        this.writeByteUnsafe(b8, offset++);
        this._offset = offset;
    }

    @inline
    writeUInt64BE(val: u64, offset: i32 = this._offset): void {
        this.writeInt64BE(val as i64, offset);
    }

    @inline
    writeUInt64LE(val: u64, offset: i32 = this._offset): void {
        this.writeInt64LE(val as i64, offset);
    }

    @inline
    writeF64BE(val: f64, offset: i32 = this._offset): void {
        this.writeInt64BE(reinterpret<i64>(val), offset);
    }

    @inline
    writeF64LE(val: f64, offset: i32 = this._offset): void {
        this.writeInt64LE(reinterpret<i64>(val), offset);
    }

    @inline
    writeByte(b: u8, offset: i32 = this._offset): void {
        this.reserve(1);
        this.writeByteUnsafe(b, offset++);
        this._offset = offset;
    }

    @unsafe
    @inline
    writeByteUnsafe(b: u8, offset: i32 = this._offset): void {
        this._buffer[offset] = b;
    }

    @inline
    writeBytes<A>(src: A): void {
        if (
            idof<A>() == idof<StaticArray<u8>>() ||
            idof<A>() == idof<Uint8Array>() ||
            idof<A>() == idof<Array<u8>>()
        ) {
            // @ts-ignore
            this.reserve(src.length);
            this.writeBytesUnsafe(src);
        } else if (idof<A>() == idof<ArrayBuffer>()) {
            // @ts-ignore
            this.reserve(src.byteLength);
            this.writeBytesUnsafe(src);
        } else {
            unreachable();
        }
    }

    @unsafe
    @inline
    writeBytesUnsafe<A>(src: A): void {
        if (idof<A>() == idof<StaticArray<u8>>()) {
            // @ts-ignore
            this._writeUnsafe(changetype<usize>(src), src.length);
        } else if (idof<A>() == idof<Uint8Array>()) {
            // @ts-ignore
            this._writeUnsafe(changetype<usize>(src.buffer), src.length);
        } else if (idof<A>() == idof<Array<u8>>()) {
            // @ts-ignore
            this._writeUnsafe(src.dataStart, src.length);
        } else if (idof<A>() == idof<ArrayBuffer>()) {
            // @ts-ignore
            this._writeUnsafe(changetype<usize>(src), src.byteLength);
        } else {
            unreachable();
        }
    }

    toArrayBuffer(): ArrayBuffer {
        const size = this._offset;
        if (!size) return new ArrayBuffer(0);
        const out = new ArrayBuffer(size);
        memory.copy(
            changetype<usize>(out),
            changetype<usize>(this._buffer),
            size
        );
        return out;
    }

    toUint8Array(): Uint8Array {
        const size = this._offset;
        if (!size) return new Uint8Array(0);
        const out = new Uint8Array(size);
        memory.copy(
            changetype<usize>(out.dataStart),
            changetype<usize>(this._buffer),
            size
        );
        return out;
    }

    toStaticArray(): StaticArray<u8> {
        const size = this._offset;
        if (!size) return new StaticArray<u8>(0);
        const out = new StaticArray<u8>(size);
        memory.copy(
            changetype<usize>(out),
            changetype<usize>(this._buffer),
            size
        );
        return out;
    }

    toArray(): Array<u8> {
        const size = this._offset;
        if (!size) return new Array<u8>(0);
        const out = new Array<u8>(size);
        memory.copy(
            changetype<usize>(out.dataStart),
            changetype<usize>(this._buffer),
            size
        );
        return out;
    }

    /**
     * Copy buffer data from inner and return a Array type.
     * @param arr
     */
    @inline
    as<A>(): A {
        if (idof<A>() == idof<ArrayBuffer>()) {
            // @ts-ignore
            return this.toArrayBuffer();
        } else if (idof<A>() == idof<Uint8Array>()) {
            // @ts-ignore
            return this.toUint8Array();
        } else if (idof<A>() == idof<StaticArray<u8>>()) {
            // @ts-ignore
            return this.toStaticArray();
        } else {
            // @ts-ignore
            return this.toArray();
        }
    }
}
