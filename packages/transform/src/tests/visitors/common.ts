import { ASTBuilder, TransformVisitor, utils } from "visitor-as";
import {
    Parser,
    DiagnosticEmitter,
    ClassDeclaration,
    Source,
} from "assemblyscript/dist/assemblyscript.js";
import { hasErrorMessage, hasWarningMessage } from "../../utils.js";
import * as assert from "assert";
import { ClassSerdeKind } from "../../consts.js";
import { NodeKind } from "types:assemblyscript/src/ast";

export function checkVisitor(
    visitor: TransformVisitor & { emitter: DiagnosticEmitter },
    code: string,
    expected: string,
    warn: boolean,
    error: boolean,
    serdeKind: ClassSerdeKind,
): void {
    const parser = new Parser();
    parser.parseFile(code, "index.ts", true);
    const source = visitor.visit(parser.sources[0]) as Source;
    assert.equal(hasWarningMessage(visitor.emitter), warn);
    assert.equal(hasErrorMessage(visitor.emitter), error);
    // when meet error, we don't check expected code

    let stmt = source.statements[0];
    assert.equal(stmt.kind, NodeKind.ClassDeclaration);
    assert.ok(utils.hasDecorator(stmt as ClassDeclaration, serdeKind));
    if (error == false) {
        const actual = ASTBuilder.build(source);
        assert.equal(actual.trim(), expected);
    }
}
