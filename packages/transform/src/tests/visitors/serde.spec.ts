// import { newProgram, newOptions } from "assemblyscript/dist/assemblyscript.js";
// import { SerdeVisitor } from "../../visitors/index.js";
// import { Case, checkVisitor } from "./common.js";
// import { ClassSerdeKind } from "../../consts.js";
// import { SerdeConfig } from "../../ast.js";

// // Note: in tests we have to use two spaces as ident because of ASTBuilder.

// function checkSerdeVisitor(
//     code: string,
//     expected: string,
//     cfg: SerdeConfig,
//     warn = false,
//     error = false,
// ): void {
//     const program = newProgram(newOptions());
//     const visitor = new SerdeVisitor(program, cfg);
//     checkVisitor(visitor, code, expected, warn, error, ClassSerdeKind.Serde);
// }

// describe("SerdeVisitor", () => {
//     it("normal @serde", () => {
//         const code = `
// @serde
// ${Case.Foo}
// `.trim();
//         const expected = `
// @serde
// class Foo {
//   s: string = "test";
//   b: bool = false;
//   serialize<__R, __S extends Serializer<__R>>(serializer: __S): __R {
//     serializer.startSerializeField();
//     serializer.serializeField<string>("s", this.s);
//     serializer.serializeLastField<bool>("b", this.b);
//     return serializer.endSerializeField();
//   }
//   deserialize<__S extends Deserializer>(deserializer: __S): this {
//     deserializer.startDeserializeField();
//     this.s = deserializer.deserializeField<string>("s");
//     this.b = deserializer.deserializeLastField<bool>("b");
//     deserializer.endDeserializeField();
//     return this;
//   }
// }
//     `.trim();

//         const cfg = { omitName: false, skipSuper: false };
//         checkSerdeVisitor(code, expected, cfg);
//     });

//     it("@serde with omitName", () => {
//         const code = `
// @serde({
//   omitName: true
// })
// ${Case.Foo}
// `.trim();
//         const expected = `
// @serde({
//   omitName: true
// })
// class Foo {
//   s: string = "test";
//   b: bool = false;
//   serialize<__R, __S extends Serializer<__R>>(serializer: __S): __R {
//     serializer.startSerializeField();
//     serializer.serializeField<string>("", this.s);
//     serializer.serializeLastField<bool>("", this.b);
//     return serializer.endSerializeField();
//   }
//   deserialize<__S extends Deserializer>(deserializer: __S): this {
//     deserializer.startDeserializeField();
//     this.s = deserializer.deserializeField<string>("");
//     this.b = deserializer.deserializeLastField<bool>("");
//     deserializer.endDeserializeField();
//     return this;
//   }
// }
// `.trim();
//         const cfg = { omitName: true, skipSuper: false };
//         checkSerdeVisitor(code, expected, cfg);
//     });

//     it("normal @serde with super", () => {
//         const code = `
// @serde
// ${Case.BarExtendsFoo}
// `.trim();
//         const expected = `
// @serde
// class Bar extends Foo {
//   s: string = "test";
//   b: bool = false;
//   serialize<__R, __S extends Serializer<__R>>(serializer: __S): __R {
//     serializer.startSerializeField();
//     super.serialize<__R, __S>(serializer);
//     serializer.serializeField<string>("s", this.s);
//     serializer.serializeLastField<bool>("b", this.b);
//     return serializer.endSerializeField();
//   }
//   deserialize<__S extends Deserializer>(deserializer: __S): this {
//     deserializer.startDeserializeField();
//     super.deserialize<__S>(deserializer);
//     this.s = deserializer.deserializeField<string>("s");
//     this.b = deserializer.deserializeLastField<bool>("b");
//     deserializer.endDeserializeField();
//     return this;
//   }
// }
//     `.trim();
//         const cfg = { omitName: false, skipSuper: false };
//         checkSerdeVisitor(code, expected, cfg);
//     });

//     it("@serde with skipSuper", () => {
//         const code = `
// @serde({ skipSuper: true })
// ${Case.BarExtendsFoo}
// `.trim();
//         const expected = `
// @serde({
//   skipSuper: true
// })
// class Bar extends Foo {
//   s: string = "test";
//   b: bool = false;
//   serialize<__R, __S extends Serializer<__R>>(serializer: __S): __R {
//     serializer.startSerializeField();
//     serializer.serializeField<string>("s", this.s);
//     serializer.serializeLastField<bool>("b", this.b);
//     return serializer.endSerializeField();
//   }
//   deserialize<__S extends Deserializer>(deserializer: __S): this {
//     deserializer.startDeserializeField();
//     this.s = deserializer.deserializeField<string>("s");
//     this.b = deserializer.deserializeLastField<bool>("b");
//     deserializer.endDeserializeField();
//     return this;
//   }
// }
//     `.trim();
//         const cfg = { omitName: false, skipSuper: true };
//         checkSerdeVisitor(code, expected, cfg);
//     });

//     it("empty @serde with super", () => {
//         const code = `
// @serde
// ${Case.EmptyBarExtendsFoo}
// `.trim();
//         const expected = `
// @serde
// class Bar extends Foo {
//   serialize<__R, __S extends Serializer<__R>>(serializer: __S): __R {
//     serializer.startSerializeField();
//     super.serialize<__R, __S>(serializer);
//     return serializer.endSerializeField();
//   }
//   deserialize<__S extends Deserializer>(deserializer: __S): this {
//     deserializer.startDeserializeField();
//     super.deserialize<__S>(deserializer);
//     deserializer.endDeserializeField();
//     return this;
//   }
// }
// `.trim();
//         const cfg = { omitName: false, skipSuper: false };
//         checkSerdeVisitor(code, expected, cfg);
//     });
//     it("empty @serde without super", () => {
//         const code = `
// @serde
// ${Case.EmptyBar}
// `.trim();
//         const expected = `
// @serde
// class Bar {
//   serialize<__R, __S extends Serializer<__R>>(serializer: __S): __R {
//     serializer.startSerializeField();
//     return serializer.endSerializeField();
//   }
//   deserialize<__S extends Deserializer>(deserializer: __S): this {
//     deserializer.startDeserializeField();
//     deserializer.endDeserializeField();
//     return this;
//   }
// }
// `.trim();
//         const cfg = { omitName: false, skipSuper: true };
//         checkSerdeVisitor(code, expected, cfg);
//     });

//     it("field missing type", () => {
//         const code = `
// @serde
// class Bar {
//   b = false;
// }
// `.trim();
//         const cfg = { omitName: false, skipSuper: false };
//         checkSerdeVisitor(code, "", cfg, false, true);
//     });
// });
