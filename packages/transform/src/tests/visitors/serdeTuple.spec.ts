import { newProgram, newOptions } from "assemblyscript/dist/assemblyscript.js";
import { SerdeTupleVisitor } from "../../visitors/index.js";
import { Case, commnCheckVisitor } from "./common.js";
import { SerdeConfig } from "../../ast.js";

// Note: in tests we have to use two spaces as ident because of ASTBuilder.

function checkVisitor(
    code: string,
    expected: string,
    cfg: SerdeConfig,
    warn = false,
    error = false,
): void {
    const program = newProgram(newOptions());
    const visitor = new SerdeTupleVisitor(program, cfg);
    commnCheckVisitor(visitor, code, expected, warn, error);
}
describe("SerdeTupleVisitor", () => {
    it("normal @serdeTuple", () => {
        const code = Case.Foo;
        const expected = `
class Foo {
  s: string = "test";
  b: bool = false;
  serialize<__R, __S extends Serializer<__R>>(serializer: __S): __R {
    serializer.startSerializeTuple(2);
    serializer.serializeTupleElem<string>(this.s);
    serializer.serializeLastTupleElem<bool>(this.b);
    return serializer.endSerializeTuple();
  }
  deserialize<__S extends Deserializer>(deserializer: __S): this {
    deserializer.startDeserializeTuple(2);
    this.s = deserializer.deserializeTupleElem<string>();
    this.b = deserializer.deserializeLastTupleElem<bool>();
    deserializer.endDeserializeTuple();
    return this;
  }
}
`.trim();
        const cfg = { omitName: false, skipSuper: false };
        checkVisitor(code, expected, cfg);
    });

    it("@serdeTuple with `omitName`", () => {
        const code = Case.Foo;
        const expected = `
class Foo {
  s: string = "test";
  b: bool = false;
  serialize<__R, __S extends Serializer<__R>>(serializer: __S): __R {
    serializer.startSerializeTuple(2);
    serializer.serializeTupleElem<string>(this.s);
    serializer.serializeLastTupleElem<bool>(this.b);
    return serializer.endSerializeTuple();
  }
  deserialize<__S extends Deserializer>(deserializer: __S): this {
    deserializer.startDeserializeTuple(2);
    this.s = deserializer.deserializeTupleElem<string>();
    this.b = deserializer.deserializeLastTupleElem<bool>();
    deserializer.endDeserializeTuple();
    return this;
  }
}
`.trim();
        const cfg = { omitName: true, skipSuper: false };
        checkVisitor(code, expected, cfg);
    });

    it("@serdeTuple do not support `extends`", () => {
        const code = Case.BarExtendsFoo;
        {
            const cfg = { omitName: false, skipSuper: false };
            checkVisitor(code, "", cfg, false, true);
        }
        {
            const cfg = { omitName: false, skipSuper: true };
            checkVisitor(code, "", cfg, false, true);
        }
    });
    it("field missing type", () => {
        const code = Case.MissingField;
        const cfg = { omitName: false, skipSuper: false };
        checkVisitor(code, "", cfg, false, true);
    });
});
