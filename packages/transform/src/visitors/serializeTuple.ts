import {
    ClassDeclaration,
    DiagnosticCode,
    FieldDeclaration,
} from "assemblyscript/dist/assemblyscript.js";
import {
    ClassSerdeKind,
    METHOD_END_SER_TUPLE,
    METHOD_SER_ARG_NAME,
    METHOD_START_SER_TUPLE,
    TARGET,
} from "../consts.js";
import { SerializeVisitor } from "./index.js";

export class SerializeTupleVisitor extends SerializeVisitor {
    protected genMethodDecl(node: ClassDeclaration): string {
        if (this.hasSuper) {
            this.emitter.error(
                DiagnosticCode.Transform_0_1,
                node.range,
                TARGET,
                `'${ClassSerdeKind.SerdeTuple}' not support 'extends'`,
            );
        }

        return super.genMethodDecl.bind(this)(node);
    }

    protected genStmtBeforeField(count: number): string {
        return `${METHOD_SER_ARG_NAME}.${METHOD_START_SER_TUPLE}(${count});`;
    }

    protected genReturnStmt(): string {
        return `return ${METHOD_SER_ARG_NAME}.${METHOD_END_SER_TUPLE}();`;
    }

    protected genStmtForField(node: FieldDeclaration, isLast: boolean): string | undefined {
        return this.collectFieldInfo(node, isLast)?.genSerializeTupleElem();
    }
}
