import { ASTBuilder } from "visitor-as";
import { newProgram, newOptions, Parser, Node } from "visitor-as/as";
import { hasErrorMessage, hasWarningMessage } from "../../utils";
import { DeserializeVisitor } from "../../visitors";

// Note: in tests we have to use two spaces as ident because of ASTBuilder.

function checkDeserializeVisitor(
    code: string,
    expected: string,
    warn = false,
    error = false
): void {
    const visitor = new DeserializeVisitor(newProgram(newOptions()));
    const parser = new Parser();
    parser.parseFile(code, "index.ts", true);
    const res = visitor.visit(parser.sources[0]);
    expect(hasWarningMessage(visitor.emitter)).toBe(warn);
    expect(hasErrorMessage(visitor.emitter)).toBe(error);
    // when meet error, we don't check expected code
    if (error == false) {
        const actual = ASTBuilder.build(res as Node);
        expect(actual.trim()).toBe(expected);
    }
}

describe("DeserializeVisitor", () => {
    it("normal @deserialize", () => {
        const code = `
@deserialize
class Foo {
  s: string = "test";
  b: bool = false;
}
`.trim();
        const expected = `
@deserialize
class Foo {
  s: string = "test";
  b: bool = false;
  deserialize<__S extends CoreDeserializer>(deserializer: __S): this {
    deserializer.startDeserializeField();
    this.s = deserializer.deserializeNonNullField<string>("s");
    this.b = deserializer.deserializeNonNullLastField<bool>("b");
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
class Foo {
s: string = "test";
b: bool = false;
}
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
    this.s = deserializer.deserializeNonNullField<string>(null);
    this.b = deserializer.deserializeNonNullLastField<bool>(null);
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
class Bar extends Foo {
  s: string = "test";
  b: bool = false;
}
`.trim();
        const expected = `
@deserialize
class Bar extends Foo {
  s: string = "test";
  b: bool = false;
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

        checkDeserializeVisitor(code, expected);
    });

    it("normal empty @deserialize with super", () => {
        const code = `
@deserialize
class Bar extends Foo {
}
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
class Bar {}
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
class Bar extends Foo {
  s: string = "test";
  b: bool = false;
}
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
    this.s = deserializer.deserializeNonNullField<string>("s");
    this.b = deserializer.deserializeNonNullLastField<bool>("b");
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
