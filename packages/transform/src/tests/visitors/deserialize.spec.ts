import { newProgram, newOptions } from "assemblyscript/dist/assemblyscript.js";
import { DeserializeVisitor } from "../../visitors/index.js";
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
    const visitor = new DeserializeVisitor(newProgram(newOptions()), cfg);
    commnCheckVisitor(visitor, code, expected, warn, error);
}

describe("DeserializeVisitor", () => {
    it("normal @deserialize", () => {
        const code = Case.Foo;
        const expected = `
class Foo {
  s: string = "test";
  b: bool = false;
  deserialize<__S extends Deserializer>(deserializer: __S): this {
    deserializer.startDeserializeField();
    this.s = deserializer.deserializeField<string>("s");
    this.b = deserializer.deserializeLastField<bool>("b");
    deserializer.endDeserializeField();
    return this;
  }
}
`.trim();

        const cfg = { omitName: false, skipSuper: false };
        checkVisitor(code, expected, cfg);
    });

    it("@deserialize with `omitName`", () => {
        const code = Case.Foo;
        const expected = `
class Foo {
  s: string = "test";
  b: bool = false;
  deserialize<__S extends Deserializer>(deserializer: __S): this {
    deserializer.startDeserializeField();
    this.s = deserializer.deserializeField<string>("");
    this.b = deserializer.deserializeLastField<bool>("");
    deserializer.endDeserializeField();
    return this;
  }
}
`.trim();

        const cfg = { omitName: true, skipSuper: false };
        checkVisitor(code, expected, cfg);
    });

    it("normal @deserialize with super", () => {
        const code = Case.BarExtendsFoo;
        const expected = `
class Bar extends Foo {
  s: string = "test";
  b: bool = false;
  deserialize<__S extends Deserializer>(deserializer: __S): this {
    deserializer.startDeserializeField();
    super.deserialize<__S>(deserializer);
    this.s = deserializer.deserializeField<string>("s");
    this.b = deserializer.deserializeLastField<bool>("b");
    deserializer.endDeserializeField();
    return this;
  }
}
`.trim();
        const cfg = { omitName: false, skipSuper: false };
        checkVisitor(code, expected, cfg);
    });
    it("@deserialize with `skipSuper`", () => {
        const code = Case.BarExtendsFoo;
        const expected = `
class Bar extends Foo {
  s: string = "test";
  b: bool = false;
  deserialize<__S extends Deserializer>(deserializer: __S): this {
    deserializer.startDeserializeField();
    this.s = deserializer.deserializeField<string>("s");
    this.b = deserializer.deserializeLastField<bool>("b");
    deserializer.endDeserializeField();
    return this;
  }
}
`.trim();
        const cfg = { omitName: false, skipSuper: true };
        checkVisitor(code, expected, cfg);
    });

    it("normal empty @deserialize with super", () => {
        const code = Case.EmptyBarExtendsFoo;
        const expected = `
class Bar extends Foo {
  deserialize<__S extends Deserializer>(deserializer: __S): this {
    deserializer.startDeserializeField();
    super.deserialize<__S>(deserializer);
    deserializer.endDeserializeField();
    return this;
  }
}
`.trim();

        const cfg = { omitName: false, skipSuper: false };
        checkVisitor(code, expected, cfg);
    });

    it("empty @deserialize with `skipSuper`", () => {
        const code = Case.EmptyBar;
        const expected = `
class Bar {
  deserialize<__S extends Deserializer>(deserializer: __S): this {
    deserializer.startDeserializeField();
    deserializer.endDeserializeField();
    return this;
  }
}
`.trim();
        const cfg = { omitName: false, skipSuper: true };
        checkVisitor(code, expected, cfg);
    });

    it("@deserialize with `skipSuper`", () => {
        const code = Case.BarExtendsFoo;
        const expected = `
class Bar extends Foo {
  s: string = "test";
  b: bool = false;
  deserialize<__S extends Deserializer>(deserializer: __S): this {
    deserializer.startDeserializeField();
    this.s = deserializer.deserializeField<string>("s");
    this.b = deserializer.deserializeLastField<bool>("b");
    deserializer.endDeserializeField();
    return this;
  }
}
`.trim();
        const cfg = { omitName: false, skipSuper: true };
        checkVisitor(code, expected, cfg);
    });

    it("field missing type", () => {
        const code = Case.MissingField;
        const cfg = { omitName: false, skipSuper: false };
        checkVisitor(code, "", cfg, false, true);
    });
});
