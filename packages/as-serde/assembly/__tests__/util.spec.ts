/* eslint-disable @typescript-eslint/no-empty-function */
import { hasDeserialize, hasSerialize } from "..";

class Foo {}

class Bar {
    serialize(): void {}
    deserialize(): void {}
}

describe("util", () => {
    it("hasSerialize", () => {
        expect(hasSerialize<bool>(false)).toBe(false);
        expect(hasSerialize<Foo>(new Foo())).toBe(false);
        expect(hasSerialize<Bar>(new Bar())).toBe(true);
    });

    it("hasDeserialize", () => {
        expect(hasDeserialize<bool>(false)).toBe(false);
        expect(hasDeserialize<Foo>(new Foo())).toBe(false);
        expect(hasDeserialize<Bar>(new Bar())).toBe(true);
    });
});
