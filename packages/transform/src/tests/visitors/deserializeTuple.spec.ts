import { newProgram, newOptions } from "assemblyscript/dist/assemblyscript.js";
import { DeserializeTupleVisitor } from "../../visitors/index.js";
import { Case, commonCheckVisitor } from "./common.js";
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
    const visitor = new DeserializeTupleVisitor(program, cfg);
    commonCheckVisitor(visitor, code, expected, warn, error);
}
describe("DeserializeTupleVisitor", () => {
    it("normal @deserializeTuple", () => {
        const code = Case.Foo;
        const expected = `
class Foo {
  s: string = "test";
  b: bool = false;
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

    it("@deserializeTuple with `omitName`", () => {
        const code = Case.Foo;
        const expected = `
class Foo {
  s: string = "test";
  b: bool = false;
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

    it("@deserializeTuple do not support `extends`", () => {
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
        const code = Case.MissingFieldType;
        const cfg = { omitName: false, skipSuper: false };
        checkVisitor(code, "", cfg, false, true);
    });
});
