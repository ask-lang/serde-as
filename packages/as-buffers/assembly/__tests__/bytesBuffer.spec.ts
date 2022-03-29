/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-loss-of-precision */
import { BytesBuffer } from "..";

// TODO:

describe("BytesBuffer Unsafe", () => {
    it("unsafe", () => {});
});

describe("BytesBuffer", () => {
    it("wrap Uint8Array", () => {
        {
            let arr = new ArrayBuffer(4);
            let arr2 = new Uint8Array(4);
            arr2[0] = 0x11;
            let buf = BytesBuffer.wrap(arr);
            buf.writeByte(0x11);
            expect(changetype<usize>(arr)).toBe(buf.dataStart);
            expect(buf.offset).toBe(5);
            expect(buf.capacity).toBe(8);
            expect(buf.remainCapacity).toBe(3);
            expect(arr).toHaveLength(8);
        }
    });

    it("wrap StaticArray<u8>", () => {
        {
            let arr = new StaticArray<u8>(4);
            let arr2 = new StaticArray<u8>(4);
            arr2[0] = 0x11;
            let buf = BytesBuffer.wrap(arr);
            buf.writeByte(0x11);
            expect(changetype<usize>(arr)).toBe(buf.dataStart);
            expect(buf.offset).toBe(5);
            expect(buf.capacity).toBe(8);
            expect(buf.remainCapacity).toBe(3);
            expect(arr).toHaveLength(8);
        }
    });

    it("wrap Uint8Array", () => {
        {
            // TODO: maybe it's unsafe to wrap Uint8Array
            let arr = new Uint8Array(4);
            let buf = BytesBuffer.wrap(arr);
            buf.writeByte(0x11);
            let arr2 = new Uint8Array(8);
            arr2[4] = 0x11;
            expect(changetype<ArrayBuffer>(buf.dataStart)).toStrictEqual(
                arr2.buffer
            );
            expect(changetype<usize>(arr.buffer)).toBe(buf.dataStart);
            expect(buf.offset).toBe(5);
            expect(buf.capacity).toBe(8);
            expect(buf.remainCapacity).toBe(3);
            expect(arr.buffer).toHaveLength(8);
            expect(arr).toHaveLength(4);
        }
    });

    it("from Uint8Array", () => {
        {
            let arr = new ArrayBuffer(4);
            let arr2 = new Uint8Array(4);
            arr2[0] = 0x11;
            let buf = BytesBuffer.from(arr);
            buf.writeByte(0x11);
            expect(buf.offset).toBe(5);
            expect(buf.capacity).toBe(8);
            expect(buf.remainCapacity).toBe(3);
            expect(arr).toHaveLength(4);
        }
    });

    it("from StaticArray<u8>", () => {
        {
            let arr = new StaticArray<u8>(4);
            let arr2 = new StaticArray<u8>(4);
            arr2[0] = 0x11;
            let buf = BytesBuffer.from(arr);
            buf.writeByte(0x11);
            expect(buf.offset).toBe(5);
            expect(buf.capacity).toBe(8);
            expect(buf.remainCapacity).toBe(3);
            expect(arr).toHaveLength(4);
        }
    });

    it("from Uint8Array", () => {
        {
            let arr = new Uint8Array(4);
            let buf = BytesBuffer.from(arr);
            buf.writeByte(0x11);
            let arr2 = new Uint8Array(8);
            arr2[4] = 0x11;
            expect(buf.offset).toBe(5);
            expect(buf.capacity).toBe(8);
            expect(buf.remainCapacity).toBe(3);
            expect(arr.buffer).toHaveLength(4);
            expect(arr).toHaveLength(4);
        }
    });

    it("slice", () => {
        let arr: StaticArray<u8> = [
            0x01, 0x02, 0x03, 0x04, 0x11, 0x12, 0x13, 0x14,
        ];
        let buf = BytesBuffer.wrap(arr);
        {
            let buf2 = buf.slice(4);
            expect(changetype<StaticArray<u8>>(buf2.dataStart)).toStrictEqual(
                StaticArray.slice(arr, 4)
            );
        }
        {
            let buf2 = buf.slice(4, 5);
            expect(changetype<StaticArray<u8>>(buf2.dataStart)).toStrictEqual(
                StaticArray.slice(arr, 4, 5)
            );
        }
        {
            let buf2 = buf.slice(-1, 100);
            expect(changetype<StaticArray<u8>>(buf2.dataStart)).toStrictEqual(
                StaticArray.slice(arr, -100)
            );
        }
    });

    it("readNumberBE", () => {
        {
            let arr: StaticArray<u8> = [
                0x01, 0x02, 0x03, 0x04, 0x11, 0x12, 0x13, 0x14,
            ];
            let buf = BytesBuffer.wrap(arr);
            let res = buf.readNumberBE<i8>(0);
            expect(res).toBe(0x01);
            res = buf.readNumberBE<u8>(0);
            expect(res).toBe(0x01);
            expect(buf.readOffset).toBe(1);
        }

        {
            let arr: StaticArray<u8> = [
                0x01, 0x02, 0x03, 0x04, 0x11, 0x12, 0x13, 0x14,
            ];
            let buf = BytesBuffer.wrap(arr);
            let res = buf.readNumberBE<i16>(0);
            expect(res).toBe(0x0102);
            res = buf.readNumberBE<u16>(0);
            expect(res).toBe(0x0102);
            expect(buf.readOffset).toBe(2);
        }

        {
            let arr: StaticArray<u8> = [
                0x01, 0x02, 0x03, 0x04, 0x11, 0x12, 0x13, 0x14,
            ];
            let buf = BytesBuffer.wrap(arr);
            let res = buf.readNumberBE<i32>(0);
            expect(res).toBe(0x01020304);
            res = buf.readNumberBE<u32>(0);
            expect(res).toBe(0x01020304);
            expect(buf.readOffset).toBe(4);
        }

        {
            let arr: StaticArray<u8> = [
                0x01, 0x02, 0x03, 0x04, 0x11, 0x12, 0x13, 0x14,
            ];
            let buf = BytesBuffer.wrap(arr);
            let res = buf.readNumberBE<i64>(0);
            expect(res).toBe(0x0102030411121314);
            res = buf.readNumberBE<u64>(0);
            expect(res).toBe(0x0102030411121314);
            expect(buf.readOffset).toBe(8);
        }

        {
            let arr: StaticArray<u8> = [
                0x01, 0x02, 0x03, 0x04, 0x11, 0x12, 0x13, 0x14,
            ];
            let buf = BytesBuffer.wrap(arr);
            let res = buf.readNumberBE<f32>(0);
            expect(res).toBe(reinterpret<f32>(0x01020304));
            expect(buf.readOffset).toBe(4);
        }

        {
            let arr: StaticArray<u8> = [
                0x01, 0x02, 0x03, 0x04, 0x11, 0x12, 0x13, 0x14,
            ];
            let buf = BytesBuffer.wrap(arr);
            let res = buf.readNumberBE<f64>(0);
            expect(res).toBe(reinterpret<f64>(0x0102030411121314));
            expect(buf.readOffset).toBe(8);
        }
    });

    it("readNumberLE", () => {
        {
            let arr: StaticArray<u8> = [
                0x01, 0x02, 0x03, 0x04, 0x11, 0x12, 0x13, 0x14,
            ];
            let buf = BytesBuffer.wrap(arr);
            let res = buf.readNumberLE<i8>(0);
            expect(res).toBe(0x01);
            res = buf.readNumberLE<u8>(0);
            expect(res).toBe(0x01);
            expect(buf.readOffset).toBe(1);
        }

        {
            let arr: StaticArray<u8> = [
                0x01, 0x02, 0x03, 0x04, 0x11, 0x12, 0x13, 0x14,
            ];
            let buf = BytesBuffer.wrap(arr);
            let res = buf.readNumberLE<i16>(0);
            expect(res).toBe(0x0201);
            res = buf.readNumberLE<u16>(0);
            expect(res).toBe(0x0201);
            expect(buf.readOffset).toBe(2);
        }

        {
            let arr: StaticArray<u8> = [
                0x01, 0x02, 0x03, 0x04, 0x11, 0x12, 0x13, 0x14,
            ];
            let buf = BytesBuffer.wrap(arr);
            let res = buf.readNumberLE<i32>(0);
            expect(res).toBe(0x04030201);
            res = buf.readNumberLE<u32>(0);
            expect(res).toBe(0x04030201);
            expect(buf.readOffset).toBe(4);
        }

        {
            let arr: StaticArray<u8> = [
                0x01, 0x02, 0x03, 0x04, 0x11, 0x12, 0x13, 0x14,
            ];
            let buf = BytesBuffer.wrap(arr);
            let res = buf.readNumberLE<i64>(0);
            expect(res).toBe(0x1413121104030201);
            res = buf.readNumberLE<u64>(0);
            expect(res).toBe(0x1413121104030201);
            expect(buf.readOffset).toBe(8);
        }

        {
            let arr: StaticArray<u8> = [
                0x01, 0x02, 0x03, 0x04, 0x11, 0x12, 0x13, 0x14,
            ];
            let buf = BytesBuffer.wrap(arr);
            let res = buf.readNumberLE<f32>(0);
            expect(res).toBe(reinterpret<f32>(0x04030201));
            expect(buf.readOffset).toBe(4);
        }

        {
            let arr: StaticArray<u8> = [
                0x01, 0x02, 0x03, 0x04, 0x11, 0x12, 0x13, 0x14,
            ];
            let buf = BytesBuffer.wrap(arr);
            let res = buf.readNumberLE<f64>(0);
            expect(res).toBe(reinterpret<f64>(0x1413121104030201));
            expect(buf.readOffset).toBe(8);
        }
    });

    it("readNumberLE/writeNumberLE", () => {
        {
            let buf = BytesBuffer.wrap(new ArrayBuffer(0));
            let val = 0x11 as i8;
            buf.writeNumberLE<i8>(val);
            let res = buf.readNumberLE<i8>(0);
            expect(res).toBe(val);
            res = buf.readNumberLE<u8>(0);
            expect(res).toBe(val);
        }

        {
            let buf = BytesBuffer.wrap(new ArrayBuffer(0));
            let val = 0x1211 as i16;
            buf.writeNumberLE<i16>(val);
            let res = buf.readNumberLE<i16>(0);
            expect(buf.readOffset).toBe(2);
            expect(res).toBe(val);
            res = buf.readNumberLE<u16>(0);
            expect(buf.readOffset).toBe(2);
            expect(res).toBe(val);
        }

        {
            let buf = BytesBuffer.wrap(new ArrayBuffer(0));
            let val = 0x14131211 as i32;
            buf.writeNumberLE<i32>(val);
            let res = buf.readNumberLE<i32>(0);
            expect(res).toBe(val);
            res = buf.readNumberLE<u32>(0);
            expect(res).toBe(val);
        }

        {
            let buf = BytesBuffer.wrap(new ArrayBuffer(0));
            let val = 0x1413121104030201 as i64;
            buf.writeNumberLE<i64>(val);
            let res = buf.readNumberLE<i64>(0);
            expect(res).toBe(val);
            res = buf.readNumberLE<u64>(0);
            expect(res).toBe(val);
        }

        {
            let buf = BytesBuffer.wrap(new ArrayBuffer(0));
            let val: f32 = 1e23;
            buf.writeNumberLE<f32>(val);
            let res = buf.readNumberLE<f32>(0);
            expect(res).toBe(val);
        }

        {
            let buf = BytesBuffer.wrap(new ArrayBuffer(0));
            let val: f64 = 1e23;
            buf.writeNumberLE<f64>(val);
            let res = buf.readNumberLE<f64>(0);
            expect(res).toBe(val);
        }
    });

    it("readNumberBE/writeNumberBE", () => {
        {
            let buf = BytesBuffer.wrap(new ArrayBuffer(0));
            let val = 0x11 as i8;
            buf.writeNumberBE<i8>(val);
            let res = buf.readNumberBE<i8>(0);
            expect(res).toBe(val);
            res = buf.readNumberBE<u8>(0);
            expect(res).toBe(val);
        }

        {
            let buf = BytesBuffer.wrap(new ArrayBuffer(0));
            let val = 0x1211 as i16;
            buf.writeNumberBE<i16>(val);
            let res = buf.readNumberBE<i16>(0);
            expect(res).toBe(val);
            res = buf.readNumberBE<u16>(0);
            expect(res).toBe(val);
        }

        {
            let buf = BytesBuffer.wrap(new ArrayBuffer(0));
            let val = 0x14131211 as i32;
            buf.writeNumberBE<i32>(val);
            let res = buf.readNumberBE<i32>(0);
            expect(res).toBe(val);
            res = buf.readNumberBE<u32>(0);
            expect(res).toBe(val);
        }

        {
            let buf = BytesBuffer.wrap(new ArrayBuffer(0));
            let val = 0x1413121104030201 as i64;
            buf.writeNumberBE<i64>(val);
            let res = buf.readNumberBE<i64>(0);
            expect(res).toBe(val);
            res = buf.readNumberBE<u64>(0);
            expect(res).toBe(val);
        }

        {
            let buf = BytesBuffer.wrap(new ArrayBuffer(0));
            let val: f32 = 1e23;
            buf.writeNumberBE<f32>(val);
            let res = buf.readNumberBE<f32>(0);
            expect(res).toBe(val);
        }

        {
            let buf = BytesBuffer.wrap(new ArrayBuffer(0));
            let val: f64 = 1e23;
            buf.writeNumberBE<f64>(val);
            let res = buf.readNumberBE<f64>(0);
            expect(res).toBe(val);
        }
    });

    itThrows("write one byte/read two bytes", () => {
        {
            let buf = BytesBuffer.wrap(new ArrayBuffer(0));
            let val = 0x11 as i8;
            buf.writeNumberBE<i8>(val);
            buf.readNumberBE<i8>();
            buf.readNumberBE<i8>();
        }
    });

    it("as", () => {
        {
            let arr: StaticArray<u8> = [0x01, 0x02, 0x03, 0x04];
            let buf = BytesBuffer.wrap(arr);
            let res = buf.as<ArrayBuffer>();
            expect(res).toStrictEqual(changetype<ArrayBuffer>(buf.dataStart));
        }

        {
            let arr: StaticArray<u8> = [0x01, 0x02, 0x03, 0x04];
            let arr2: StaticArray<u8> = [0x01, 0x02, 0x03, 0x04];
            let buf = BytesBuffer.wrap(arr);
            let res = buf.as<StaticArray<u8>>();
            expect(res).toStrictEqual(arr2);
        }

        {
            let arr: StaticArray<u8> = [0x01, 0x02, 0x03, 0x04];
            let arr2: Array<u8> = [0x01, 0x02, 0x03, 0x04];
            let buf = BytesBuffer.wrap(arr);
            let res = buf.as<Array<u8>>();
            expect(res).toStrictEqual(arr2);
        }

        {
            let arr: StaticArray<u8> = [0x01, 0x01];
            let arr2: Uint8Array = new Uint8Array(2);
            arr2.fill(0x01);
            let buf = BytesBuffer.wrap(arr);
            let res = buf.as<Uint8Array>();
            expect(res).toStrictEqual(arr2);
        }
    });

    it("writeBytes", () => {
        {
            let buf = BytesBuffer.withCapacity(4);
            let bytes: StaticArray<u8> = [0x01, 0x02];
            buf.writeBytes(bytes);
            buf.writeBytes(bytes);
            expect(buf.as<StaticArray<u8>>()).toStrictEqual([
                0x01, 0x02, 0x01, 0x02,
            ]);
        }

        {
            let buf = BytesBuffer.withCapacity(4);
            let bytes: Array<u8> = [0x01, 0x02];
            buf.writeBytes(bytes);
            buf.writeBytes(bytes);
            expect(buf.as<Array<u8>>()).toStrictEqual([0x01, 0x02, 0x01, 0x02]);
        }

        {
            let buf = BytesBuffer.withCapacity(4);
            let bytes: Uint8Array = new Uint8Array(2);
            bytes.fill(0x11);
            buf.writeBytes(bytes);
            buf.writeBytes(bytes);
            expect(buf.as<Array<u8>>()).toStrictEqual([0x11, 0x11, 0x11, 0x11]);
        }

        {
            let buf = BytesBuffer.withCapacity(4);
            let bytes: Uint8Array = new Uint8Array(2);
            bytes.fill(0x11);
            buf.writeBytes(bytes.buffer);
            buf.writeBytes(bytes.buffer);
            expect(buf.as<Array<u8>>()).toStrictEqual([0x11, 0x11, 0x11, 0x11]);
        }
    });

    it("toString", () => {
        {
            let s = "我的世界";
            expect(new BytesBuffer().toString()).toStrictEqual("");
            let buf = BytesBuffer.wrap(changetype<ArrayBuffer>(s));
            expect(buf.toString()).toStrictEqual(s);
            buf.writeBytes(changetype<StaticArray<u8>>("\nhello world"));
            expect(buf.toString()).toStrictEqual("我的世界\nhello world");
        }
    });
});
