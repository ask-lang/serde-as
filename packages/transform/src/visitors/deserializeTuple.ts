import {
    ClassDeclaration,
    DiagnosticCode,
    FieldDeclaration,
} from "assemblyscript/dist/assemblyscript.js";
import {
    ClassSerdeKind,
    METHOD_DES_ARG_NAME,
    METHOD_END_DES_TUPLE,
    METHOD_START_DES_TUPLE,
    TARGET,
} from "../consts.js";
import { DeserializeVisitor } from "./index.js";

export class DeserializeTupleVisitor extends DeserializeVisitor {
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
        return `${METHOD_DES_ARG_NAME}.${METHOD_START_DES_TUPLE}(${count});`;
    }

    protected genStmtBeforeReturn(): string {
        return `${METHOD_DES_ARG_NAME}.${METHOD_END_DES_TUPLE}();`;
    }

    protected genStmtForField(node: FieldDeclaration, isLast: boolean): string | undefined {
        return this.collectFieldInfo(node, isLast)?.genDeserializeTupleElem();
    }
}
