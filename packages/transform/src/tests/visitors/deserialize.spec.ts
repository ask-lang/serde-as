import { newProgram, newOptions } from "assemblyscript/dist/assemblyscript.js";
import { DeserializeVisitor } from "../../visitors/index.js";
import { Case, checkVisitor } from "./common.js";
import { ClassSerdeKind } from "../../consts.js";

// Note: in tests we have to use two spaces as ident because of ASTBuilder.

function checkDeserializeVisitor(
    code: string,
    expected: string,
    warn = false,
    error = false,
): void {
    const visitor = new DeserializeVisitor(newProgram(newOptions()), null);
    checkVisitor(visitor, code, expected, warn, error, ClassSerdeKind.Deserialize);
}

describe("DeserializeVisitor", () => {
    it("normal @deserialize", () => {
        const code = `
@deserialize
${Case.Foo}
`.trim();
        const expected = `
@deserialize
class Foo {
  s: string = "test";
  b: bool = false;
  deserialize<__S extends CoreDeserializer>(deserializer: __S): this {
    deserializer.startDeserializeField();
    this.s = deserializer.deserializeField<string>("s");
    this.b = deserializer.deserializeLastField<bool>("b");
    deserializer.endDeserializeField();
    return this;
  }
}
`.trim();

        checkDeserializeVisitor(code, expected);
    });

    it("@deserialize with omitName", () => {
        const code = `
@deserialize({ omitName: true })
${Case.Foo}
`.trim();
        const expected = `
@deserialize({
  omitName: true
})
class Foo {
  s: string = "test";
  b: bool = false;
  deserialize<__S extends CoreDeserializer>(deserializer: __S): this {
    deserializer.startDeserializeField();
    this.s = deserializer.deserializeField<string>(null);
    this.b = deserializer.deserializeLastField<bool>(null);
    deserializer.endDeserializeField();
    return this;
  }
}
`.trim();

        checkDeserializeVisitor(code, expected);
    });

    it("normal @deserialize with super", () => {
        const code = `
@deserialize
${Case.BarExtendsFoo}
`.trim();
        const expected = `
@deserialize
class Bar extends Foo {
  s: string = "test";
  b: bool = false;
  deserialize<__S extends CoreDeserializer>(deserializer: __S): this {
    deserializer.startDeserializeField();
    super.deserialize<__S>(deserializer);
    this.s = deserializer.deserializeField<string>("s");
    this.b = deserializer.deserializeLastField<bool>("b");
    deserializer.endDeserializeField();
    return this;
  }
}
`.trim();

        checkDeserializeVisitor(code, expected);
    });
    it("@deserialize with skipSuper", () => {
        const code = `
@deserialize({ skipSuper: true })
${Case.BarExtendsFoo}
`.trim();
        const expected = `
@deserialize({
  skipSuper: true
})
class Bar extends Foo {
  s: string = "test";
  b: bool = false;
  deserialize<__S extends CoreDeserializer>(deserializer: __S): this {
    deserializer.startDeserializeField();
    this.s = deserializer.deserializeField<string>("s");
    this.b = deserializer.deserializeLastField<bool>("b");
    deserializer.endDeserializeField();
    return this;
  }
}
`.trim();
        checkDeserializeVisitor(code, expected);
    });

    it("normal empty @deserialize with super", () => {
        const code = `
@deserialize
${Case.EmptyBarExtendsFoo}
`.trim();
        const expected = `
@deserialize
class Bar extends Foo {
  deserialize<__S extends CoreDeserializer>(deserializer: __S): this {
    deserializer.startDeserializeField();
    super.deserialize<__S>(deserializer);
    deserializer.endDeserializeField();
    return this;
  }
}
`.trim();

        checkDeserializeVisitor(code, expected);
    });

    it("empty @deserialize without super", () => {
        const code = `
@deserialize
${Case.EmptyBar}
`.trim();

        const expected = `
@deserialize
class Bar {
  deserialize<__S extends CoreDeserializer>(deserializer: __S): this {
    deserializer.startDeserializeField();
    deserializer.endDeserializeField();
    return this;
  }
}
`.trim();

        checkDeserializeVisitor(code, expected);
    });

    it("@deserialize with skipSuper", () => {
        const code = `
@deserialize({ skipSuper: true })
${Case.BarExtendsFoo}
`.trim();
        const expected = `
@deserialize({
  skipSuper: true
})
class Bar extends Foo {
  s: string = "test";
  b: bool = false;
  deserialize<__S extends CoreDeserializer>(deserializer: __S): this {
    deserializer.startDeserializeField();
    this.s = deserializer.deserializeField<string>("s");
    this.b = deserializer.deserializeLastField<bool>("b");
    deserializer.endDeserializeField();
    return this;
  }
}
`.trim();
        checkDeserializeVisitor(code, expected);
    });

    it("field missing type", () => {
        const code = `
@deserialize
class Bar {
  b = false;
}
`.trim();
        checkDeserializeVisitor(code, "", false, true);
    });
});
