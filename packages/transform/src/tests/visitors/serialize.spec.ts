import { ASTBuilder } from "visitor-as";
import { newProgram, newOptions, Parser, Node } from "visitor-as/as";
import { SerializeVisitor } from "../../visitors";
import { hasErrorMessage, hasWarningMessage } from "../../utils";

// Note: in tests we have to use two spaces as ident because of ASTBuilder.

function checkSerializeVisitor(
    code: string,
    expected: string,
    warn = false,
    error = false
): void {
    const visitor = new SerializeVisitor(newProgram(newOptions()));
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

describe("SerializeVisitor", () => {
    it("normal @serialize", () => {
        const code = `
@serialize
class Foo {
  s: string = "test";
  b: bool = false;
}
`.trim();
        const expected = `
@serialize
class Foo {
  s: string = "test";
  b: bool = false;
  serialize<__R, __S extends CoreSerializer<__R>>(serializer: __S): __R {
    serializer.startSerializeField();
    serializer.serializeNonNullField<string>("s", this.s);
    serializer.serializeNonNullLastField<bool>("b", this.b);
    return serializer.endSerializeField();
  }
}
`.trim();
        checkSerializeVisitor(code, expected);
    });

    it("@serialize with omitName", () => {
        const code = `
@serialize({ omitName: true })
class Foo {
  s: string = "test";
  b: bool = false;
}
`.trim();
        const expected = `
@serialize({
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
}
`.trim();
        checkSerializeVisitor(code, expected);
    });

    it("normal @serialize with super", () => {
        const code = `
@serialize
class Bar extends Foo {
  s: string = "test";
  b: bool = false;
}
`.trim();
        const expected = `
@serialize
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
}
`.trim();
        checkSerializeVisitor(code, expected);
    });

    it("@serialize with skipSuper", () => {
        const code = `
@serialize({ skipSuper: true })
class Bar extends Foo {
  s: string = "test";
  b: bool = false;
}
`.trim();
        const expected = `
@serialize({
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
}
`.trim();
        checkSerializeVisitor(code, expected);
    });

    it("empty @serialize with super", () => {
        const code = `
@serialize
class Bar extends Foo {}
`.trim();
        const expected = `
@serialize
class Bar extends Foo {
  serialize<__R, __S extends CoreSerializer<__R>>(serializer: __S): __R {
    serializer.startSerializeField();
    super.serialize<__R, __S>(serializer);
    return serializer.endSerializeField();
  }
}
`.trim();
        checkSerializeVisitor(code, expected);
    });
    it("empty @serialize without super", () => {
        const code = `
@serialize
class Bar {}
`.trim();
        const expected = `
@serialize
class Bar {
  serialize<__R, __S extends CoreSerializer<__R>>(serializer: __S): __R {
    serializer.startSerializeField();
    return serializer.endSerializeField();
  }
}
`.trim();
        checkSerializeVisitor(code, expected);
    });

    it("field missing type", () => {
        const code = `
@serialize
class Bar {
  b = false;
}
`.trim();
        checkSerializeVisitor(code, "", false, true);
    });
});
