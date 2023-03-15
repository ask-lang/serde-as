import { newProgram, newOptions } from "assemblyscript/dist/assemblyscript.js";
import { SerializeVisitor } from "../../visitors/index.js";
import { Case, checkVisitor } from "./common.js";
import { ClassSerdeKind } from "../../consts.js";

// Note: in tests we have to use two spaces as ident because of ASTBuilder.

function checkSerializeVisitor(code: string, expected: string, warn = false, error = false): void {
    const visitor = new SerializeVisitor(newProgram(newOptions()), null);
    checkVisitor(visitor, code, expected, warn, error, ClassSerdeKind.Serialize);
}

describe("SerializeVisitor", () => {
    it("normal @serialize", () => {
        const code = `
@serialize
${Case.Foo}
`.trim();
        const expected = `
@serialize
class Foo {
  s: string = "test";
  b: bool = false;
  serialize<__R, __S extends Serializer<__R>>(serializer: __S): __R {
    serializer.startSerializeField();
    serializer.serializeField<string>("s", this.s);
    serializer.serializeLastField<bool>("b", this.b);
    return serializer.endSerializeField();
  }
}
`.trim();
        checkSerializeVisitor(code, expected);
    });

    it("@serialize with omitName", () => {
        const code = `
@serialize({ omitName: true })
${Case.Foo}
`.trim();
        const expected = `
@serialize({
  omitName: true
})
class Foo {
  s: string = "test";
  b: bool = false;
  serialize<__R, __S extends Serializer<__R>>(serializer: __S): __R {
    serializer.startSerializeField();
    serializer.serializeField<string>("", this.s);
    serializer.serializeLastField<bool>("", this.b);
    return serializer.endSerializeField();
  }
}
`.trim();
        checkSerializeVisitor(code, expected);
    });

    it("normal @serialize with super", () => {
        const code = `
@serialize
${Case.BarExtendsFoo}
`.trim();
        const expected = `
@serialize
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
}
`.trim();
        checkSerializeVisitor(code, expected);
    });

    it("@serialize with skipSuper", () => {
        const code = `
@serialize({ skipSuper: true })
${Case.BarExtendsFoo}
`.trim();
        const expected = `
@serialize({
  skipSuper: true
})
class Bar extends Foo {
  s: string = "test";
  b: bool = false;
  serialize<__R, __S extends Serializer<__R>>(serializer: __S): __R {
    serializer.startSerializeField();
    serializer.serializeField<string>("s", this.s);
    serializer.serializeLastField<bool>("b", this.b);
    return serializer.endSerializeField();
  }
}
`.trim();
        checkSerializeVisitor(code, expected);
    });

    it("empty @serialize with super", () => {
        const code = `
@serialize
${Case.EmptyBarExtendsFoo}
`.trim();
        const expected = `
@serialize
class Bar extends Foo {
  serialize<__R, __S extends Serializer<__R>>(serializer: __S): __R {
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
${Case.EmptyBar}
`.trim();
        const expected = `
@serialize
class Bar {
  serialize<__R, __S extends Serializer<__R>>(serializer: __S): __R {
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
