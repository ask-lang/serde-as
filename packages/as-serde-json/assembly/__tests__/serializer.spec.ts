// @ts-nocheck
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { JSONSerializer, ISerialize } from "../index";
import {
    Arrays,
    Bools,
    Empty,
    Errors,
    Maps,
    Nulls,
    Numbers,
    OtherArrays,
    Sets,
    SkipSuperNumbers,
    Strings,
    SuperEmpty,
    SuperNumbers,
    TailCommas,
    TailCommas2,
    Tree,
} from "./testdata";

describe("JSONSerializer", () => {
    it("Empty Interface", () => {
        let res = JSONSerializer.serialize(new Empty() as ISerialize);
        const expected = `{}`;
        expect(res).toBe(expected);
    });

    it("Empty", () => {
        let res = JSONSerializer.serialize(new Empty());
        const expected = `{}`;
        expect(res).toBe(expected);
    });

    it("SuperEmpty", () => {
        let res = JSONSerializer.serialize(new SuperEmpty());
        const expected = `{}`;
        expect(res).toBe(expected);
    });

    it("Tree", () => {
        {
            let res = JSONSerializer.serialize(new Tree<i32>(1));
            const expected = `{"left":null,"right":null,"value":1}`;
            expect(res).toBe(expected);
        }
        {
            let tree = new Tree<i32>(1);
            tree.left = new Tree<i32>(2);
            tree.right = new Tree<i32>(3);
            let res = JSONSerializer.serialize(tree);
            const expected = `{"left":{"left":null,"right":null,"value":2},"right":{"left":null,"right":null,"value":3},"value":1}`;
            expect(res).toBe(expected);
        }
    });

    it("Tree Interface", () => {
        {
            let res = JSONSerializer.serialize(new Tree<i32>(1) as ISerialize);
            const expected = `{"left":null,"right":null,"value":1}`;
            expect(res).toBe(expected);
        }
        {
            let tree = new Tree<i32>(1);
            tree.left = new Tree<i32>(2);
            tree.right = new Tree<i32>(3);
            let res = JSONSerializer.serialize(tree as ISerialize);
            const expected = `{"left":{"left":null,"right":null,"value":2},"right":{"left":null,"right":null,"value":3},"value":1}`;
            expect(res).toBe(expected);
        }
    });

    it("TailCommas", () => {
        {
            let res = JSONSerializer.serialize<TailCommas>(new TailCommas());
            const expected = `{"a":null,"b":null}`;
            expect(res).toBe(expected);
        }
        {
            let res = JSONSerializer.serialize<TailCommas>(TailCommas.test1());
            const expected = `{"a":"","b":null}`;
            expect(res).toBe(expected);
        }
        {
            let res = JSONSerializer.serialize<TailCommas>(TailCommas.test2());
            const expected = `{"a":null,"b":""}`;
            expect(res).toBe(expected);
        }
        {
            let res = JSONSerializer.serialize<TailCommas2>(TailCommas2.test1());
            const expected = `{"t":{"a":"","b":null},"c":""}`;
            expect(res).toBe(expected);
        }
    });

    it("Numbers", () => {
        {
            let res = JSONSerializer.serialize(new Numbers());
            const expected =
                '{"u8":0,"u16":0,"u32":0,"u64":0,"i8":0,"i16":0,"i32":0,"i64":0,"f32":0.0,"f64":0.0}';
            expect(res).toBe(expected);
        }

        {
            let res = JSONSerializer.serialize(Numbers.test1());
            const expected =
                '{"u8":1,"u16":2,"u32":3,"u64":4,"i8":-1,"i16":-2,"i32":-3,"i64":-4,"f32":6.0,"f64":7.1}';
            expect(res).toBe(expected);
        }
    });

    it("SuperNumbers", () => {
        {
            let res = JSONSerializer.serialize(new SuperNumbers());
            const expected: string =
                '{"u8":0,"u16":0,"u32":0,"u64":0,"i8":0,"i16":0,"i32":0,"i64":0,"f32":0.0,"f64":0.0,"n":0}';
            expect(res).toBe(expected);
        }

        {
            let res = JSONSerializer.serialize(SuperNumbers.test1());
            const expected: string =
                '{"u8":1,"u16":2,"u32":3,"u64":4,"i8":-1,"i16":-2,"i32":-3,"i64":-4,"f32":6.0,"f64":7.1,"n":1}';
            expect(res).toBe(expected);
        }
    });

    it("SkipSuperNumbers", () => {
        {
            let res = JSONSerializer.serialize(new SkipSuperNumbers());
            const expected: string = '{"n":0}';
            expect(res).toBe(expected);
        }

        {
            let res = JSONSerializer.serialize(SkipSuperNumbers.test1());
            const expected: string = '{"n":1}';
            expect(res).toBe(expected);
        }
    });

    it("Strings", () => {
        let res = JSONSerializer.serialize(new Strings());
        const expected = `{"s1":"","s2":"\\"\\/","s3":"\\b\\f\\n\\r\\t"}`;
        expect(res).toBe(expected);
    });

    it("Errors", () => {
        let res = JSONSerializer.serialize(new Errors());
        const expected =
            '{"e1":"error","e2":"rangeError","e3":"syntaxError","e4":"uriError","e5":"typeError"}';
        expect(res).toBe(expected);
    });

    it("Bools", () => {
        let res = JSONSerializer.serialize(new Bools());
        const expected = '{"b1":false,"b2":true}';
        expect(res).toBe(expected);
    });

    it("Arrays", () => {
        let res = JSONSerializer.serialize(new Arrays());
        const expected = '{"a1":"","a2":"AQ==","a3":[],"a4":[1],"a5":["233"]}';
        expect(res).toBe(expected);
    });

    it("OtherArrays", () => {
        let res = JSONSerializer.serialize(new OtherArrays());
        const expected =
            '{"a0":"AAAAAA==","a1":"AAAAAA==","a2":"AAAAAA==","a3":[0,0,0,0],"a4":[0,0,0,0],"a5":[0,0,0,0],"a6":[0,0,0,0],"a7":[0,0,0,0],"a8":[0,0,0,0],"a9":[0,0,0,0],"a10":[0.0,0.0,0.0,0.0],"a11":[0.0,0.0,0.0,0.0]}';
        expect(res).toBe(expected);
    });

    it("Sets", () => {
        let res = JSONSerializer.serialize(Sets.test1());
        const expected = '{"s1":[],"s2":[1],"s3":[-1],"s4":[1,0],"s5":["233"]}';
        expect(res).toBe(expected);
    });

    it("Maps", () => {
        let res = JSONSerializer.serialize(Maps.test1());
        const expected =
            '{"m1":{"1":false},"m2":{"1":-1},"m3":{"-1":"233"},"m4":{"hello":"world","我的":"世界"}}';
        expect(res).toBe(expected);
    });

    it("Nulls", () => {
        {
            let res = JSONSerializer.serialize(new Nulls());
            const expected = `{"n1":null,"n2":null,"n3":null,"n4":null}`;
            expect(res).toBe(expected);
        }

        {
            const n = new Nulls();
            const json = new JSONSerializer();
            n.n1 = null;
            let res = json.serializeField<string | null>("n4", n.n1).toString();
            const expected = `"n4":null,`;
            expect(res).toBe(expected);
        }

        {
            let res = JSONSerializer.serialize(Nulls.test1());
            const expected =
                '{"n1":"233","n2":["233"],"n3":[null,"233"],"n4":{"233":"233","null":null}}';
            expect(res).toBe(expected);
        }
    });

    it("serialize twice", () => {
        {
            let res = JSONSerializer.serialize(Maps.test1());
            const expected =
                '{"m1":{"1":false},"m2":{"1":-1},"m3":{"-1":"233"},"m4":{"hello":"world","我的":"世界"}}';
            expect(res).toBe(expected);
        }
        {
            let res = JSONSerializer.serialize(Maps.test1());
            const expected =
                '{"m1":{"1":false},"m2":{"1":-1},"m3":{"-1":"233"},"m4":{"hello":"world","我的":"世界"}}';
            expect(res).toBe(expected);
        }
    });
});
