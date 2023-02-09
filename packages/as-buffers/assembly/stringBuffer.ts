// @ts-nocheck
import { Buffer } from "./buffer";


@lazy const NEW_LINE_CHAR: u16 = 0x0a; // \n

export class StringBuffer extends Buffer {
    @lazy static readonly DEFAULT_BUFFER_SIZE: u32 = 64;

    constructor(capacity: i32 = StringBuffer.DEFAULT_BUFFER_SIZE) {
        super(
            changetype<StaticArray<u8>>(
                __new(capacity, idof<StaticArray<u8>>())
            ),
            0
        );
    }

    /**
     * Creates a StringBuffer with init capacity.
     * @param capacity
     * @returns
     */
    @inline
    static withCapacity(capacity: i32): StringBuffer {
        return new StringBuffer(capacity);
    }

    /**
     * UTF-16 string length.
     */
    @inline
    get length(): i32 {
        return this._offset >> 1;
    }

    /**
     * UTF-16 string length.
     */
    
    @inline
    set length(len: i32) {
        this._offset = len << 1;
    }

    slice(start: i32 = 0, end: i32 = this.length): string {
        let len = end - start;
        start = start << 1;
        if (!len) return "";
        const byteSize = len << 1;
        const out = changetype<string>(__new(byteSize, idof<string>()));
        memory.copy(
            changetype<usize>(out),
            changetype<usize>(this._buffer) + start,
            byteSize
        );
        return out;
    }

    /**
     * Write a string to the buffer.
     * @param src a string
     * @returns
     */
    write(src: string): void {
        const len = src.length as u32;
        if (!len) return;
        const size = len << 1;
        this.reserve(size);
        this._writeUnsafe(changetype<usize>(src), size);
    }

    /**
     * Write a string to the buffer. Need to pay attention to buffer capacity.
     * @param src a string
     * @returns
     */
    @unsafe
    writeUnsafe(src: string): void {
        const len = src.length as u32;
        if (!len) return;
        const size = len << 1;
        this._writeUnsafe(changetype<usize>(src), size);
    }

    writeSlice(src: string, start: i32 = 0, end: i32 = i32.MAX_VALUE): void {
        let len = src.length;

        if (start != 0 || end != i32.MAX_VALUE) {
            let from: i32;
            from = min<i32>(max(start, 0), len);
            end = min<i32>(max(end, 0), len);
            start = min<i32>(from, end);
            end = max<i32>(from, end);
            len = end - start;
        }

        if (!len) return;

        const size = len << 1;
        this.reserve(size);
        this._writeUnsafe(changetype<usize>(src) + ((<usize>start) << 1), size);
    }

    @unsafe
    writeSliceUnsafe(
        src: string,
        start: i32 = 0,
        end: i32 = i32.MAX_VALUE
    ): void {
        let len = src.length as u32;

        if (start != 0 || end != i32.MAX_VALUE) {
            let from: i32;
            from = min<i32>(max(start, 0), len);
            end = min<i32>(max(end, 0), len);
            start = min<i32>(from, end);
            end = max<i32>(from, end);
            len = end - start;
        }

        if (!len) return;

        const size = len << 1;
        this._writeUnsafe(changetype<usize>(src) + ((<usize>start) << 1), size);
    }

    writeLn(src: string): void {
        const len = src.length as u32;
        const size = len << 1;
        this.reserve(size + 2);

        const offset = this._offset;
        const dest = changetype<usize>(this._buffer) + offset;

        memory.copy(dest, changetype<usize>(src), size);
        store<u16>(dest + size, NEW_LINE_CHAR);
        this._offset = offset + (size + 2);
    }

    writeSliceLn(src: string, start: i32 = 0, end: i32 = i32.MAX_VALUE): void {
        let len = src.length as u32;

        if (start != 0 || end != i32.MAX_VALUE) {
            let from: i32;
            from = min<i32>(max(start, 0), len);
            end = min<i32>(max(end, 0), len);
            start = min<i32>(from, end);
            end = max<i32>(from, end);
            len = end - start;
        }

        const size = len << 1;
        this.reserve(size + 2);

        const offset = this._offset;
        const dest = changetype<usize>(this._buffer) + offset;

        memory.copy(dest, changetype<usize>(src) + ((<usize>start) << 1), size);
        store<u16>(dest + size, NEW_LINE_CHAR);
        this._offset = offset + (size + 2);
    }

    writeCodePoint(code: i32): void {
        const hasSur = <u32>code > 0xffff;
        this.reserve(2 << i32(hasSur));

        const offset = this._offset;
        const dest = changetype<usize>(this._buffer) + offset;

        if (!hasSur) {
            store<u16>(dest, <u16>code);
            this._offset = offset + 2;
        } else {
            assert(<u32>code <= 0x10ffff);
            code -= 0x10000;
            const hi = (code & 0x03ff) | 0xdc00;
            const lo = (code >>> 10) | 0xd800;
            store<u32>(dest, lo | (hi << 16));
            this._offset = offset + 4;
        }
    }

    @inline
    toString(): string {
        const size = this._offset;
        if (!size) return "";
        const out = changetype<string>(__new(size, idof<string>()));
        memory.copy(
            changetype<usize>(out),
            changetype<usize>(this._buffer),
            size
        );
        return out;
    }
}
