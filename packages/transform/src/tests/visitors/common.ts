import * as assert from "assert";
import { ASTBuilder, TransformVisitor } from "visitor-as";
import { Parser, DiagnosticEmitter, Source, NodeKind } from "assemblyscript/dist/assemblyscript.js";
import { hasErrorMessage, hasWarningMessage } from "../../utils.js";

export function commnCheckVisitor(
    visitor: TransformVisitor & { emitter: DiagnosticEmitter },
    code: string,
    expected: string,
    warn: boolean,
    error: boolean,
): void {
    const parser = new Parser();
    parser.parseFile(code, "index.ts", true);
    const source = visitor.visit(parser.sources[0]) as Source;

    let stmt = source.statements[0];
    assert.equal(stmt.kind, NodeKind.ClassDeclaration);
    // assert.ok(utils.hasDecorator(stmt as ClassDeclaration, serdeKind));
    // when meet error, we don't check expected code
    if (error == false) {
        const actual = ASTBuilder.build(source);
        assert.equal(actual.trim(), expected);
    }

    assert.equal(hasWarningMessage(visitor.emitter), warn);
    assert.equal(hasErrorMessage(visitor.emitter), error);
}

export enum Case {
    Foo = `class Foo {
        s: string = "test";
        b: bool = false;
    }`,
    BarExtendsFoo = `class Bar extends Foo {
        s: string = "test";
        b: bool = false;
    }`,
    EmptyBar = "class Bar {}",
    EmptyBarExtendsFoo = "class Bar extends Foo {}",
    MissingField = "class Bar { b = false; }",
}
