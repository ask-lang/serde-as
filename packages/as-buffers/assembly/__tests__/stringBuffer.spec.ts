/* eslint-disable @typescript-eslint/no-empty-function */
import { StringBuffer } from "..";

describe("StringBuffer Unsafe", () => {
    it("unsafe", () => {});
});

describe("StringBuffer", () => {
    it("constructor", () => {
        let buf = new StringBuffer();
        expect(buf.length).toBe(0);
        // default
        expect(buf.capacity).toBe(64);
        expect(buf.toString()).toBe("");
    });

    it("withCapacity", () => {
        let buf = StringBuffer.withCapacity(32);
        expect(buf.length).toBe(0);
        expect(buf.capacity).toBe(32);
        expect(buf.toString()).toBe("");
    });

    it("remainCapacity", () => {
        let buf = StringBuffer.withCapacity(32);
        buf.writeCodePoint(0x63);
        expect(buf.length).toBe(1);
        expect(buf.remainCapacity).toBe(30);
        expect(buf.toString()).toBe("c");
        buf.reserve(32);
        expect(buf.remainCapacity).toBe(62);
    });

    it("clear", () => {
        let buf = StringBuffer.withCapacity(32);
        buf.writeCodePoint(0x63);
        expect(buf.length).toBe(1);
        expect(buf.remainCapacity).toBe(30);
        buf.clearBuffer();
        // default
        expect(buf.remainCapacity).toBe(64);
    });

    it("shrink", () => {
        {
            let buf = StringBuffer.withCapacity(64);
            buf.write("test");
            buf.shrink();
            expect(buf.length).toBe(4);
        }

        {
            let buf = StringBuffer.withCapacity(64);
            buf.shrink();
            expect(buf.length).toBe(0);
        }
    });

    it("slice", () => {
        let buf = new StringBuffer();
        buf.write("hello");
        expect(buf.slice()).toBe("hello");
    });

    it("write", () => {
        let buf = new StringBuffer();
        buf.write("hello");
        expect(buf.toString()).toBe("hello");
    });

    it("writeLn", () => {
        let buf = new StringBuffer();
        buf.writeLn("hello");
        expect(buf.toString()).toBe("hello\n");
    });

    it("writeSlice", () => {
        let buf = new StringBuffer();
        buf.writeSlice("hello", 0, 4);
        expect(buf.toString()).toBe("hell");
    });

    it("writeSliceLn", () => {
        let buf = new StringBuffer();
        buf.writeSliceLn("hello", 0, 4);
        expect(buf.toString()).toBe("hell\n");
    });
});
