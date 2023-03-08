import { newProgram, newOptions } from "assemblyscript/dist/assemblyscript.js";
import { SerdeVisitor } from "../../visitors/index.js";
import { checkVisitor } from "./common.js";
import { ClassSerdeKind } from "../../consts.js";
import { SerdeConfig } from "../../ast.js";

// Note: in tests we have to use two spaces as ident because of ASTBuilder.

function checkSerdeVisitor(code: string, cfg: SerdeConfig, expected: string, warn = false, error = false): void {
    const program = newProgram(newOptions());
    const visitor = new SerdeVisitor(
        program,
        cfg,
    );
    checkVisitor(visitor, code, expected, warn, error, ClassSerdeKind.Serde);
}

describe("SerdeVisitor", () => {
//     it("normal @serde", () => {
//         const code = `
// @serialize
// class Foo {
//   s: string = "test";
//   b: bool = false;
// }
// `.trim();
//         const expected = `
// @serialize
// class Foo {
//   s: string = "test";
//   b: bool = false;
//   serialize<__R, __S extends CoreSerializer<__R>>(serializer: __S): __R {
//     serializer.startSerializeField();
//     serializer.serializeNonNullField<string>("s", this.s);
//     serializer.serializeNonNullLastField<bool>("b", this.b);
//     return serializer.endSerializeField();
//   }
// }
// `.trim();

//         const cfg = {omitName: false,skipSuper: false};
//         checkSerdeVisitor(code, cfg, expected);
//     });

//     it("@serialize with omitName", () => {
//         const code = `
// @serialize({ omitName: true })
// class Foo {
//   s: string = "test";
//   b: bool = false;
// }
// `.trim();
//         const expected = `
// @serialize({
//   omitName: true
// })
// class Foo {
//   s: string = "test";
//   b: bool = false;
//   serialize<__R, __S extends CoreSerializer<__R>>(serializer: __S): __R {
//     serializer.startSerializeField();
//     serializer.serializeNonNullField<string>(null, this.s);
//     serializer.serializeNonNullLastField<bool>(null, this.b);
//     return serializer.endSerializeField();
//   }
// }
// `.trim();
//         const cfg = {omitName: true,skipSuper: false};
//         checkSerdeVisitor(code, cfg, expected);
//     });

//     it("normal @serialize with super", () => {
//         const code = `
// @serialize
// class Bar extends Foo {
//   s: string = "test";
//   b: bool = false;
// }
// `.trim();
//         const expected = `
// @serialize
// class Bar extends Foo {
//   s: string = "test";
//   b: bool = false;
//   serialize<__R, __S extends CoreSerializer<__R>>(serializer: __S): __R {
//     serializer.startSerializeField();
//     super.serialize<__R, __S>(serializer);
//     serializer.serializeNonNullField<string>("s", this.s);
//     serializer.serializeNonNullLastField<bool>("b", this.b);
//     return serializer.endSerializeField();
//   }
// }
// `.trim();
//         const cfg = {omitName: false,skipSuper: true};
//         checkSerdeVisitor(code, cfg, expected);
//     });

//     it("@serialize with skipSuper", () => {
//         const code = `
// @serialize({ skipSuper: true })
// class Bar extends Foo {
//   s: string = "test";
//   b: bool = false;
// }
// `.trim();
//         const expected = `
// @serialize({
//   skipSuper: true
// })
// class Bar extends Foo {
//   s: string = "test";
//   b: bool = false;
//   serialize<__R, __S extends CoreSerializer<__R>>(serializer: __S): __R {
//     serializer.startSerializeField();
//     serializer.serializeNonNullField<string>("s", this.s);
//     serializer.serializeNonNullLastField<bool>("b", this.b);
//     return serializer.endSerializeField();
//   }
// }
// `.trim();
//         const cfg = {omitName: false,skipSuper: true};
//         checkSerdeVisitor(code, cfg, expected);
//     });

    it("empty @serde with super", () => {
        const code = `
@serialize
class Bar extends Foo {}
`.trim();
        const expected = `
@serde
class Bar extends Foo {
  serialize<__R, __S extends CoreSerializer<__R>>(serializer: __S): __R {
    serializer.startSerializeField();
    super.serialize<__R, __S>(serializer);
    return serializer.endSerializeField();
  }
}
`.trim();
        const cfg = {omitName: false,skipSuper: true};
        checkSerdeVisitor(code, cfg, expected);
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
        const cfg = {omitName: false,skipSuper: false};
        checkSerdeVisitor(code, cfg, expected);
    });

    it("field missing type", () => {
        const code = `
@serde
class Bar {
  b = false;
}
`.trim();
        const cfg = {omitName: false,skipSuper: false};
        checkSerdeVisitor(code, cfg, "", false, true);
    });
});
