import { newProgram, newOptions } from "assemblyscript/dist/assemblyscript.js";
import { SerdeVisitor } from "../../visitors/index.js";
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
    const visitor = new SerdeVisitor(program, cfg);
    commnCheckVisitor(visitor, code, expected, warn, error);
}

describe("SerdeVisitor", () => {
    it("normal @serde", () => {
        const code = Case.Foo;
        const expected = `
class Foo {
  s: string = "test";
  b: bool = false;
  serialize<__R, __S extends Serializer<__R>>(serializer: __S): __R {
    serializer.startSerializeField();
    serializer.serializeField<string>("s", this.s);
    serializer.serializeLastField<bool>("b", this.b);
    return serializer.endSerializeField();
  }
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

    it("@serde with `omitName`", () => {
        const code = Case.Foo;
        const expected = `
class Foo {
  s: string = "test";
  b: bool = false;
  serialize<__R, __S extends Serializer<__R>>(serializer: __S): __R {
    serializer.startSerializeField();
    serializer.serializeField<string>("", this.s);
    serializer.serializeLastField<bool>("", this.b);
    return serializer.endSerializeField();
  }
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

    it("normal @serde with super", () => {
        const code = Case.BarExtendsFoo;
        const expected = `
class Bar extends Foo {
  s: string = "test";
  b: bool = false;
  serialize<__R, __S extends Serializer<__R>>(serializer: __S): __R {
    serializer.startSerializeField();
    super.serialize<__R, __S>(serializer);
    serializer.serializeField<string>("s", this.s);
    serializer.serializeLastField<bool>("b", this.b);
    return serializer.endSerializeField();
  }
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

    it("@serde with `skipSuper`", () => {
        const code = Case.BarExtendsFoo;
        const expected = `
class Bar extends Foo {
  s: string = "test";
  b: bool = false;
  serialize<__R, __S extends Serializer<__R>>(serializer: __S): __R {
    serializer.startSerializeField();
    serializer.serializeField<string>("s", this.s);
    serializer.serializeLastField<bool>("b", this.b);
    return serializer.endSerializeField();
  }
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

    it("empty @serde with super", () => {
        const code = Case.EmptyBarExtendsFoo;
        const expected = `
class Bar extends Foo {
  serialize<__R, __S extends Serializer<__R>>(serializer: __S): __R {
    serializer.startSerializeField();
    super.serialize<__R, __S>(serializer);
    return serializer.endSerializeField();
  }
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
    it("empty @serde with `skipSuper`", () => {
        const code = Case.EmptyBar;
        const expected = `
class Bar {
  serialize<__R, __S extends Serializer<__R>>(serializer: __S): __R {
    serializer.startSerializeField();
    return serializer.endSerializeField();
  }
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

    it("field missing type", () => {
        const code = Case.MissingField;
        const cfg = { omitName: false, skipSuper: false };
        checkVisitor(code, "", cfg, false, true);
    });
});
