// @ts-nocheck
/* eslint-disable @typescript-eslint/no-inferrable-types */
import {
    IDeserialize,
    BytesBuffer,
    ScaleDeserializer,
    ScaleSerializer,
    ISerialize,
    ISerdeTuple,
} from "..";
import { Empty, SuperEmpty, Custom, FixedArray8, Matrix8 } from "./testdata";
import {
    Arrays,
    Bools,
    Maps,
    Nulls,
    Numbers,
    OtherArrays,
    Sets,
    SuperBools,
    TestData,
} from "./testdata";

describe("ScaleSerializer", () => {
    it("FixedArray8", () => {
        let case1 = new FixedArray8<u8>();
        case1[0] = 0x01;
        case1[1] = 0x02;
        case1[2] = 0x03;
        case1[3] = 0x04;
        let tests: Array<TestData<FixedArray8<u8>, StaticArray<u8>>> = [
            new TestData(case1, [0x01, 0x02, 0x03, 0x04, 0x00, 0x00, 0x00, 0x00]),
        ];
        for (let i = 0; i < tests.length; i++) {
            let test = tests[i];
            let serData = ScaleSerializer.serialize(test.input);
            expect(serData).toStrictEqual(test.output);
            let desData = ScaleDeserializer.deserialize<FixedArray8<u8>>(
                BytesBuffer.wrap(test.output),
            );
            expect(desData).toStrictEqual(test.input);
            expect(test.input instanceof ISerialize).toBeTruthy();
            expect(test.input instanceof IDeserialize).toBeTruthy();
            expect(test.input instanceof ISerdeTuple).toBeTruthy();
        }
    });

    it("Matrix8", () => {
        let array = new FixedArray8<u8>();
        array[0] = 0x01;
        array[1] = 0x02;
        array[2] = 0x03;
        array[3] = 0x04;

        let case1 = new Matrix8<u8>();
        case1.unsafeInit();
        case1[0] = array.clone();
        case1[1] = array.clone();
        case1[2] = array.clone();
        case1[3] = array.clone();
        let tests: Array<TestData<Matrix8<u8>, StaticArray<u8>>> = [
            new TestData(case1, [
                0x01, 0x02, 0x03, 0x04, 0x00, 0x00, 0x00, 0x00,
                0x01, 0x02, 0x03, 0x04, 0x00, 0x00, 0x00, 0x00,
                0x01, 0x02, 0x03, 0x04, 0x00, 0x00, 0x00, 0x00,
                0x01, 0x02, 0x03, 0x04, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            ]),
        ];
        for (let i = 0; i < tests.length; i++) {
            let test = tests[i];
            let serData = ScaleSerializer.serialize(test.input);
            expect(serData).toStrictEqual(test.output);
            // let desData = ScaleDeserializer.deserialize<Matrix8<u8>>(
            //     BytesBuffer.wrap(test.output),
            // );
            // expect(desData).toStrictEqual(test.input);
            // expect(test.input instanceof ISerialize).toBeTruthy();
            // expect(test.input instanceof IDeserialize).toBeTruthy();
            // expect(test.input instanceof ISerdeTuple).toBeTruthy();
        }
    });

    it("Custom", () => {
        let tests: Array<TestData<ISerialize, StaticArray<u8>>> = [
            new TestData(new Custom() as ISerialize, [0x01]),
        ];
        for (let i = 0; i < tests.length; i++) {
            let test = tests[i];
            let serData = ScaleSerializer.serialize(test.input);
            expect(serData).toStrictEqual(test.output);
            let desData = ScaleDeserializer.deserialize<Custom>(BytesBuffer.wrap(test.output));
            expect(desData).toStrictEqual(test.input as Custom);
            expect(test.input instanceof ISerialize).toBeTruthy();
        }
    });

    it("Empty Inteface", () => {
        let tests: Array<TestData<ISerialize, StaticArray<u8>>> = [
            new TestData(new Empty() as ISerialize, []),
        ];
        for (let i = 0; i < tests.length; i++) {
            let test = tests[i];
            let serData = ScaleSerializer.serialize(test.input);
            expect(serData).toStrictEqual(test.output);
            let desData = ScaleDeserializer.deserialize<Empty>(BytesBuffer.wrap(test.output));
            expect(desData).toStrictEqual(test.input as Empty);
            expect(test.input instanceof ISerialize).toBeTruthy();
        }
    });

    it("Bools Inteface", () => {
        let tests: Array<TestData<ISerialize, StaticArray<u8>>> = [
            new TestData(new Bools() as ISerialize, [0x00, 0x01]),
        ];
        for (let i = 0; i < tests.length; i++) {
            let test = tests[i];
            let serData = ScaleSerializer.serialize(test.input);
            expect(serData).toStrictEqual(test.output);
            let desData = ScaleDeserializer.deserialize<Bools>(BytesBuffer.wrap(test.output));
            expect(desData).toStrictEqual(test.input as Bools);
            expect(test.input instanceof ISerialize).toBeTruthy();
        }
    });

    it("Empty", () => {
        let tests: Array<TestData<Empty, StaticArray<u8>>> = [new TestData(new Empty(), [])];
        for (let i = 0; i < tests.length; i++) {
            let test = tests[i];
            let serData = ScaleSerializer.serialize(test.input);
            expect(serData).toStrictEqual(test.output);
            let desData = ScaleDeserializer.deserialize<Empty>(BytesBuffer.wrap(test.output));
            expect(desData).toStrictEqual(test.input);
        }
    });

    it("SuperEmpty", () => {
        let tests: Array<TestData<SuperEmpty, StaticArray<u8>>> = [
            new TestData(new SuperEmpty(), []),
        ];
        for (let i = 0; i < tests.length; i++) {
            let test = tests[i];
            let serData = ScaleSerializer.serialize(test.input);
            expect(serData).toStrictEqual(test.output);
            let desData = ScaleDeserializer.deserialize<SuperEmpty>(BytesBuffer.wrap(test.output));
            expect(desData).toStrictEqual(test.input);
        }
    });

    it("Bools", () => {
        let tests: Array<TestData<Bools, StaticArray<u8>>> = [
            new TestData(new Bools(), [0x00, 0x01]),
        ];
        for (let i = 0; i < tests.length; i++) {
            let test = tests[i];
            let serData = ScaleSerializer.serialize(test.input);
            expect(serData).toStrictEqual(test.output);
            let desData = ScaleDeserializer.deserialize<Bools>(BytesBuffer.wrap(test.output));
            expect(desData).toStrictEqual(test.input);
        }
    });

    it("SuperBools", () => {
        let tests: Array<TestData<SuperBools, StaticArray<u8>>> = [
            new TestData(new SuperBools(), [0x00, 0x01, 0x00]),
        ];
        for (let i = 0; i < tests.length; i++) {
            let test = tests[i];
            let serData = ScaleSerializer.serialize(test.input);
            expect(serData).toStrictEqual(test.output);
            let desData = ScaleDeserializer.deserialize<Bools>(BytesBuffer.wrap(test.output));
            expect(desData).toStrictEqual(test.input);
        }
    });

    it("Numbers", () => {
        let tests: Array<TestData<Numbers, StaticArray<u8>>> = [
            new TestData(
                Numbers.test1(),
                [
                    0x01, 0x02, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
                    0x00, 0x00, 0xff, 0xfe, 0xff, 0xfd, 0xff, 0xff, 0xff, 0xfc, 0xff, 0xff, 0xff,
                    0xff, 0xff, 0xff, 0xff,

                    // i128
                    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
                    0xff, 0xff, 0x7f,
                    // u128
                    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
                    0xff, 0xff, 0xff,
                ],
            ),

            new TestData(
                Numbers.test2(),
                [
                    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                    0x00, 0x00, 0x00, 0x00,

                    // i128
                    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                    0x00, 0x00, 0x80,
                    // u128
                    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                    0x00, 0x00, 0x00,
                ],
            ),
        ];
        for (let i = 0; i < tests.length; i++) {
            let test = tests[i];
            let serData = ScaleSerializer.serialize(test.input);
            expect(serData).toStrictEqual(test.output);
            expect(serData.length).toStrictEqual(test.output.length);
            let desData = ScaleDeserializer.deserialize<Numbers>(BytesBuffer.wrap(test.output));
            expect(desData).toStrictEqual(test.input);
        }
    });

    it("Strings", () => {
        let tests: Array<TestData<string, StaticArray<u8>>> = [
            new TestData(
                "Hello, World!",
                [
                    0x34, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x2c, 0x20, 0x57, 0x6f, 0x72, 0x6c, 0x64,
                    0x21,
                ],
            ),
            new TestData("Hamlet", [0x18, 0x48, 0x61, 0x6d, 0x6c, 0x65, 0x74]),
        ];
        for (let i = 0; i < tests.length; i++) {
            let test = tests[i];
            let serData = ScaleSerializer.serialize(test.input);
            expect(serData).toStrictEqual(test.output);
            let desData = ScaleDeserializer.deserialize<string>(BytesBuffer.wrap(test.output));
            expect(desData).toStrictEqual(test.input);
        }

        {
            let tests: Array<TestData<Array<string>, StaticArray<u8>>> = [
                new TestData(
                    ["Hamlet", "Война и мир", "三国演义", "أَلْف لَيْلَة وَلَيْلَة‎"],

                    [
                        0x10, 0x18, 0x48, 0x61, 0x6d, 0x6c, 0x65, 0x74, 0x50, 0xd0, 0x92, 0xd0,
                        0xbe, 0xd0, 0xb9, 0xd0, 0xbd, 0xd0, 0xb0, 0x20, 0xd0, 0xb8, 0x20, 0xd0,
                        0xbc, 0xd0, 0xb8, 0xd1, 0x80, 0x30, 0xe4, 0xb8, 0x89, 0xe5, 0x9b, 0xbd,
                        0xe6, 0xbc, 0x94, 0xe4, 0xb9, 0x89, 0xbc, 0xd8, 0xa3, 0xd9, 0x8e, 0xd9,
                        0x84, 0xd9, 0x92, 0xd9, 0x81, 0x20, 0xd9, 0x84, 0xd9, 0x8e, 0xd9, 0x8a,
                        0xd9, 0x92, 0xd9, 0x84, 0xd9, 0x8e, 0xd8, 0xa9, 0x20, 0xd9, 0x88, 0xd9,
                        0x8e, 0xd9, 0x84, 0xd9, 0x8e, 0xd9, 0x8a, 0xd9, 0x92, 0xd9, 0x84, 0xd9,
                        0x8e, 0xd8, 0xa9, 0xe2, 0x80, 0x8e,
                    ],
                ),
            ];
            for (let i = 0; i < tests.length; i++) {
                let test = tests[i];
                let serData = ScaleSerializer.serialize(test.input);
                expect(serData).toStrictEqual(test.output);
                let desData = ScaleDeserializer.deserialize<Array<string>>(
                    BytesBuffer.wrap(test.output),
                );
                expect(desData).toStrictEqual(test.input);
            }
        }
    });

    it("Errors", () => {
        let s = "Hello, World!";
        let expected: StaticArray<u8> = [
            0x34, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x2c, 0x20, 0x57, 0x6f, 0x72, 0x6c, 0x64, 0x21,
        ];
        {
            let res = ScaleSerializer.serialize(new Error(s));
            expect(res).toStrictEqual(expected);
        }

        {
            let res = ScaleSerializer.serialize(new SyntaxError(s));
            expect(res).toStrictEqual(expected);
        }

        {
            let res = ScaleSerializer.serialize(new RangeError(s));
            expect(res).toStrictEqual(expected);
        }
        {
            let res = ScaleSerializer.serialize(new URIError(s));
            expect(res).toStrictEqual(expected);
        }
        {
            let res = ScaleSerializer.serialize(new TypeError(s));
            expect(res).toStrictEqual(expected);
        }
    });

    it("Arrays", () => {
        let tests: Array<TestData<Arrays, StaticArray<u8>>> = [
            new TestData(new Arrays(), [0, 4, 1, 0, 4, 1, 0, 0, 0, 4, 12, 50, 51, 51]),
        ];
        for (let i = 0; i < tests.length; i++) {
            let test = tests[i];
            let serData = ScaleSerializer.serialize(test.input);
            expect(serData).toStrictEqual(test.output);
            let desData = ScaleDeserializer.deserialize<Arrays>(BytesBuffer.wrap(test.output));
            expect(desData).toStrictEqual(test.input);
        }
    });

    it("OtherArrays", () => {
        let tests: Array<TestData<OtherArrays, StaticArray<u8>>> = [
            new TestData(
                new OtherArrays(),
                [
                    8, 0, 0,

                    8, 0, 0,

                    8, 0, 0, 8, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0,

                    8, 0, 0, 8, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0,
                ],
            ),
        ];
        for (let i = 0; i < tests.length; i++) {
            let test = tests[i];
            let serData = ScaleSerializer.serialize(test.input);
            expect(serData).toStrictEqual(test.output);
            let desData = ScaleDeserializer.deserialize<OtherArrays>(BytesBuffer.wrap(test.output));
            expect(desData).toStrictEqual(test.input);
        }
    });

    it("Sets", () => {
        let tests: Array<TestData<Sets, StaticArray<u8>>> = [
            new TestData(new Sets(), [0, 0, 0, 0, 0]),
            new TestData(
                Sets.test1(),
                [0, 4, 1, 4, 255, 255, 255, 255, 8, 1, 0, 0, 0, 0, 0, 0, 0, 4, 12, 50, 51, 51],
            ),
        ];
        for (let i = 0; i < tests.length; i++) {
            let test = tests[i];
            let serData = ScaleSerializer.serialize(test.input);
            expect(serData).toStrictEqual(test.output);
            let desData = ScaleDeserializer.deserialize<Sets>(BytesBuffer.wrap(test.output));
            expect(desData).toStrictEqual(test.input);
        }
    });

    it("Maps", () => {
        let tests: Array<TestData<Maps, StaticArray<u8>>> = [
            new TestData(new Maps(), [0, 0, 0, 0, 0]),
            new TestData(
                Maps.test1(),
                [
                    4, 1, 0,

                    4, 1, 255, 255, 255, 255,

                    4, 255, 255, 255, 255, 12, 50, 51, 51, 8, 20, 104, 101, 108, 108, 111, 20, 119,
                    111, 114, 108, 100,

                    24, 230, 136, 145, 231, 154, 132, 24, 228, 184, 150, 231, 149, 140,

                    4, 1, 4, 1, 1,
                ],
            ),
        ];
        for (let i = 0; i < tests.length; i++) {
            let test = tests[i];
            let serData = ScaleSerializer.serialize(test.input);
            expect(serData).toStrictEqual(test.output);
            let desData = ScaleDeserializer.deserialize<Maps>(BytesBuffer.wrap(test.output));
            expect(desData).toStrictEqual(test.input);
        }

        {
            let map = new Map<string, string>();
            map.set("hello", "world");
            let tests: Array<TestData<Map<string, string>, StaticArray<u8>>> = [
                new TestData(
                    map,
                    [0x04, 0x14, 0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x14, 0x77, 0x6f, 0x72, 0x6c, 0x64],
                ),
            ];
            for (let i = 0; i < tests.length; i++) {
                let test = tests[i];
                let serData = ScaleSerializer.serialize(test.input);
                expect(serData).toStrictEqual(test.output);
                let desData = ScaleDeserializer.deserialize<Map<string, string>>(
                    BytesBuffer.wrap(test.output),
                );
                expect(desData).toStrictEqual(test.input);
            }
        }
    });

    it("Nulls", () => {
        let tests: Array<TestData<Nulls, StaticArray<u8>>> = [
            new TestData(new Nulls(), [0, 0, 0, 0, 0]),
            new TestData(Nulls.test1(), [0, 0, 0, 0x01, 0x00, 0x01, 0x04, 0x02]),
        ];
        for (let i = 0; i < tests.length; i++) {
            let test = tests[i];
            let serData = ScaleSerializer.serialize(test.input);
            expect(serData).toStrictEqual(test.output);
            let desData = ScaleDeserializer.deserialize<Nulls>(BytesBuffer.wrap(test.output));
            expect(desData).toStrictEqual(test.input);
        }
    });
});
