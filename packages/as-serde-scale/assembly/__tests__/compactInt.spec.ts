import { BytesBuffer } from "as-buffers";
import { ScaleDeserializer, ScaleSerializer, Compact } from "..";
import { TestData } from "./testdata";

// Note: test data is copied from https://github.com/paritytech/parity-scale-codec/blob/master/src/compact.rs

let tests: Array<TestData<u64, StaticArray<u8>>> = [
    new TestData(0, [0x00]),
    new TestData(63, [0xfc]),
    new TestData(16383, [0xfd, 0xff]),
    new TestData(16384, [0x02, 0x00, 0x01, 0x00]),
    new TestData(1073741823, [0xfe, 0xff, 0xff, 0xff]),
    new TestData(1073741824, [0x03, 0x00, 0x00, 0x00, 0x40]),
    new TestData((1 << 32) - 1, [0x03, 0xff, 0xff, 0xff, 0xff]),
    new TestData((1 << 32), [0x07, 0x00, 0x00, 0x00, 0x00, 0x01]),
    new TestData((1 << 40), [0x0b, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]),
    new TestData((1 << 48), [0x0f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]),
    new TestData((1 << 56) - 1, [0x0f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]),
    new TestData((1 << 56), [0x13, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]),
    new TestData(u64.MAX_VALUE, [0x13, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]),
];


describe("Compact", () => {
    it("deserialize", () => {
        for (let i = 0; i < tests.length; i++) {
            let test = tests[i];
            if (test.input <= (u8.MAX_VALUE as u64)) {
                let num = new Compact<u8>(test.input as u8);
                let des = new ScaleDeserializer(BytesBuffer.wrap(StaticArray.slice(test.output)));
                let compactNum = num.deserialize<ScaleDeserializer>(des);
                expect(compactNum.unwrap()).toBe(test.input as u8);
            }

            if (test.input <= (u16.MAX_VALUE as u64)) {
                let num = new Compact<u16>(test.input as u16);
                let des = new ScaleDeserializer(BytesBuffer.wrap(StaticArray.slice(test.output)));
                let compactNum = num.deserialize<ScaleDeserializer>(des);
                expect(compactNum.unwrap()).toBe(test.input as u16);
            }

            if (test.input <= (u32.MAX_VALUE as u64)) {
                let num = new Compact<u32>(test.input as u32);
                let des = new ScaleDeserializer(BytesBuffer.wrap(StaticArray.slice(test.output)));
                let compactNum = num.deserialize<ScaleDeserializer>(des);
                expect(compactNum.unwrap()).toBe(test.input as u32);
            }

            let num = new Compact<u64>(test.input as u64);
            let des = new ScaleDeserializer(BytesBuffer.from(StaticArray.slice(test.output)));
            let compactNum = num.deserialize<ScaleDeserializer>(des);
            expect(compactNum.unwrap()).toBe(test.input as u64);
        }
    });
    it("serialize", () => {
        let ser = new ScaleSerializer();

        for (let i = 0; i < tests.length; i++) {
            let test = tests[i];
            let num = new Compact<u64>(test.input);
            ser.clear();
            let res = num.serialize<BytesBuffer, ScaleSerializer>(ser).toStaticArray();
            expect(res).toStrictEqual(test.output);

            // TODO: meet the wasm-validator error
            if (test.input <= (u8.MAX_VALUE as u64)) {
                let num = new Compact<u8>(test.input as u8);
                ser.clear();
                let res = num.serialize<BytesBuffer, ScaleSerializer>(ser).toStaticArray();
                expect(res).toStrictEqual(test.output);
            }

            // TODO: meet the wasm-validator error
            if (test.input <= (u16.MAX_VALUE as u64)) {
                let num = new Compact<u16>(test.input as u16);
                ser.clear();
                let res = num.serialize<BytesBuffer, ScaleSerializer>(ser).toStaticArray();
                expect(res).toStrictEqual(test.output);
            }

            // It's ok
            if (test.input <= (u32.MAX_VALUE as u64)) {
                let num = new Compact<u32>(test.input as u32);
                ser.clear();
                let res = num.serialize<BytesBuffer, ScaleSerializer>(ser).toStaticArray();
                expect(res).toStrictEqual(test.output);
            }
        }
    });
});
