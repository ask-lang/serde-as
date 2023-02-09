import { nextPowerOf2 } from "./util";

export class Buffer {
    @lazy static readonly DEFAULT_BUFFER_SIZE: u32 = 64;

    constructor(
        /**
         * The inner buffer to be fulled, will be realloc when size is not enough.
         */
        protected _buffer: StaticArray<u8>,
        /**
         * The position of the data to be written in the buffer, default to 0.
         */
        protected _offset: i32 = 0
    ) {}

    /**
     * Returns a pointer about inner buffer.
     */
    @unsafe
    get dataStart(): usize {
        return changetype<usize>(this._buffer);
    }

    /**
     * Current offset of written data.
     */
    get offset(): i32 {
        return this._offset;
    }

    /**
     * Capacity of inner buffer in bytes.
     */
    @inline
    get capacity(): i32 {
        return this._buffer.length;
    }

    /**
     * Remained capacity of inner buffer in bytes.
     */
    @inline
    get remainCapacity(): i32 {
        return this._buffer.length - this._offset;
    }

    /**
     * Clear inner buffer and reset the offset to 0 and inner buffer size to default.
     */
    clearBuffer(): void {
        this.resetOffset();
        this._buffer = changetype<StaticArray<u8>>(
            __renew(
                changetype<usize>(this._buffer),
                <i32>Buffer.DEFAULT_BUFFER_SIZE
            )
        );
    }

    /**
     * Reset offset to a position, default to 0.
     * @param offset
     */
    @inline
    resetOffset(offset: i32 = 0): void {
        this._offset = offset;
    }

    /**
     * Shrink inner buffer size to default size or current offset.
     */
    shrink(): void {
        this._buffer = changetype<StaticArray<u8>>(
            __renew(
                changetype<usize>(this._buffer),
                <i32>max(this._offset, Buffer.DEFAULT_BUFFER_SIZE)
            )
        );
    }

    /**
     * When the current memory capacity is not enough, it is twice the capacity expansion.
     * @param additional additional bytes size
     */
    @inline
    reserve(additional: i32): void {
        const oldSize = this._offset;
        const newSize = oldSize + additional;
        if (newSize > this.capacity) {
            this._buffer = changetype<StaticArray<u8>>(
                __renew(
                    changetype<usize>(this._buffer),
                    <i32>nextPowerOf2(newSize)
                )
            );
        }
    }

    /**
     * Copy data from src. It's unsafe if capacity is not enough.
     * @param src data src to be copied
     * @param size data size
     */
    @unsafe
    @inline
    _writeUnsafe(src: usize, size: u32): void {
        const offset = this._offset;
        memory.copy(
            changetype<usize>(this._buffer) + offset,
            changetype<usize>(src),
            size
        );
        this.resetOffset(offset + size);
    }
}
