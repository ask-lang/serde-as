import { newProgram, newOptions } from "assemblyscript/dist/assemblyscript.js";
import { SerdeVisitor } from "../../visitors/index.js";
import { Case, checkVisitor } from "./common.js";
import { ClassSerdeKind } from "../../consts.js";
import { SerdeConfig } from "../../ast.js";

// Note: in tests we have to use two spaces as ident because of ASTBuilder.

function checkSerdeVisitor(
    code: string,
    expected: string,
    cfg: SerdeConfig,
    warn = false,
    error = false,
): void {
    const program = newProgram(newOptions());
    const visitor = new SerdeVisitor(program, cfg);
    checkVisitor(visitor, code, expected, warn, error, ClassSerdeKind.Serde);
}

describe("SerdeVisitor", () => {
    it("normal @serde", () => {
        const code = `
@serde
${Case.Foo}
`.trim();
        const expected = `
@serde
class Foo {
  s: string = "test";
  b: bool = false;
  serialize<__R, __S extends CoreSerializer<__R>>(serializer: __S): __R {
    serializer.startSerializeField();
    serializer.serializeNonNullField<string>("s", this.s);
    serializer.serializeNonNullLastField<bool>("b", this.b);
    return serializer.endSerializeField();
  }
  deserialize<__S extends CoreDeserializer>(deserializer: __S): this {
    deserializer.startDeserializeField();
    this.s = deserializer.deserializeNonNullField<string>("s");
    this.b = deserializer.deserializeNonNullLastField<bool>("b");
    deserializer.endDeserializeField();
    return this;
  }
}
    `.trim();

        const cfg = { omitName: false, skipSuper: false };
        checkSerdeVisitor(code, expected, cfg);
    });

    it("@serde with omitName", () => {
        const code = `
@serde({
  omitName: true
})
${Case.Foo}
`.trim();
        const expected = `
@serde({
  omitName: true
})
class Foo {
  s: string = "test";
  b: bool = false;
  serialize<__R, __S extends CoreSerializer<__R>>(serializer: __S): __R {
    serializer.startSerializeField();
    serializer.serializeNonNullField<string>(null, this.s);
    serializer.serializeNonNullLastField<bool>(null, this.b);
    return serializer.endSerializeField();
  }
  deserialize<__S extends CoreDeserializer>(deserializer: __S): this {
    deserializer.startDeserializeField();
    this.s = deserializer.deserializeNonNullField<string>(null);
    this.b = deserializer.deserializeNonNullLastField<bool>(null);
    deserializer.endDeserializeField();
    return this;
  }
}
`.trim();
        const cfg = { omitName: true, skipSuper: false };
        checkSerdeVisitor(code, expected, cfg);
    });

    it("normal @serde with super", () => {
        const code = `
@serde
${Case.BarExtendsFoo}
`.trim();
        const expected = `
@serde
class Bar extends Foo {
  s: string = "test";
  b: bool = false;
  serialize<__R, __S extends CoreSerializer<__R>>(serializer: __S): __R {
    serializer.startSerializeField();
    super.serialize<__R, __S>(serializer);
    serializer.serializeNonNullField<string>("s", this.s);
    serializer.serializeNonNullLastField<bool>("b", this.b);
    return serializer.endSerializeField();
  }
  deserialize<__S extends CoreDeserializer>(deserializer: __S): this {
    deserializer.startDeserializeField();
    super.deserialize<__S>(deserializer);
    this.s = deserializer.deserializeNonNullField<string>("s");
    this.b = deserializer.deserializeNonNullLastField<bool>("b");
    deserializer.endDeserializeField();
    return this;
  }
}
    `.trim();
        const cfg = { omitName: false, skipSuper: false };
        checkSerdeVisitor(code, expected, cfg);
    });

    it("@serde with skipSuper", () => {
        const code = `
@serde({ skipSuper: true })
${Case.BarExtendsFoo}
`.trim();
        const expected = `
@serde({
  skipSuper: true
})
class Bar extends Foo {
  s: string = "test";
  b: bool = false;
  serialize<__R, __S extends CoreSerializer<__R>>(serializer: __S): __R {
    serializer.startSerializeField();
    serializer.serializeNonNullField<string>("s", this.s);
    serializer.serializeNonNullLastField<bool>("b", this.b);
    return serializer.endSerializeField();
  }
  deserialize<__S extends CoreDeserializer>(deserializer: __S): this {
    deserializer.startDeserializeField();
    this.s = deserializer.deserializeNonNullField<string>("s");
    this.b = deserializer.deserializeNonNullLastField<bool>("b");
    deserializer.endDeserializeField();
    return this;
  }
}
    `.trim();
        const cfg = { omitName: false, skipSuper: true };
        checkSerdeVisitor(code, expected, cfg);
    });

    it("empty @serde with super", () => {
        const code = `
@serde
${Case.EmptyBarExtendsFoo}
`.trim();
        const expected = `
@serde
class Bar extends Foo {
  serialize<__R, __S extends CoreSerializer<__R>>(serializer: __S): __R {
    serializer.startSerializeField();
    super.serialize<__R, __S>(serializer);
    return serializer.endSerializeField();
  }
  deserialize<__S extends CoreDeserializer>(deserializer: __S): this {
    deserializer.startDeserializeField();
    super.deserialize<__S>(deserializer);
    deserializer.endDeserializeField();
    return this;
  }
}
`.trim();
        const cfg = { omitName: false, skipSuper: false };
        checkSerdeVisitor(code, expected, cfg);
    });
    it("empty @serde without super", () => {
        const code = `
@serde
${Case.EmptyBar}
`.trim();
        const expected = `
@serde
class Bar {
  serialize<__R, __S extends CoreSerializer<__R>>(serializer: __S): __R {
    serializer.startSerializeField();
    return serializer.endSerializeField();
  }
  deserialize<__S extends CoreDeserializer>(deserializer: __S): this {
    deserializer.startDeserializeField();
    deserializer.endDeserializeField();
    return this;
  }
}
`.trim();
        const cfg = { omitName: false, skipSuper: true };
        checkSerdeVisitor(code, expected, cfg);
    });

    it("field missing type", () => {
        const code = `
@serde
class Bar {
  b = false;
}
`.trim();
        const cfg = { omitName: false, skipSuper: false };
        checkSerdeVisitor(code, "", cfg, false, true);
    });
});
