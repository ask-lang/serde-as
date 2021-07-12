import { SimpleParser, TransformVisitor } from "visitor-as";
import {
    ClassDeclaration,
    DiagnosticEmitter,
    DiagnosticCode,
    FieldDeclaration,
    CommonFlags,
} from "assemblyscript";
import { toString, isMethodNamed } from "visitor-as/dist/utils";

import {
    METHOD_END_SER_FIELD,
    METHOD_SER,
    METHOD_SER_ARG_NAME,
    METHOD_SER_FIELD,
    METHOD_SER_LAST_FIELD,
    METHOD_SER_NONNULL_FIELD,
    METHOD_SER_NONNULL_LAST_FIELD,
    METHOD_SER_SIG,
    METHOD_START_SER_FIELD,
} from "../consts";
import { uniqBy } from "lodash";
import { extractDecorator, getNameNullable } from "../utils";
import { extractConfigFromDecorator, SerializeDeclaration } from "../ast";
import { SerdeKind } from "../consts";

export class SerializeVisitor extends TransformVisitor {
    private fields: FieldDeclaration[] = [];
    private hasBase: bool = false;
    private decl!: SerializeDeclaration;

    constructor(public readonly emitter: DiagnosticEmitter) {
        super();
    }

    visitFieldDeclaration(node: FieldDeclaration): FieldDeclaration {
        if (node.is(CommonFlags.STATIC)) {
            return node;
        }
        this.fields.push(node);
        return node;
    }

    visitClassDeclaration(node: ClassDeclaration): ClassDeclaration {
        // console.log(hasDecorator(node, /^@[\s]*serde\.[\s]*serialize/));

        if (node.members.some(isMethodNamed(METHOD_SER))) {
            return node;
        }
        this.hasBase = node.extendsType ? true : false;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const decorator = extractDecorator(
            this.emitter,
            node,
            SerdeKind.Serialize
        )!;
        const cfg = extractConfigFromDecorator(this.emitter, decorator);
        this.decl = SerializeDeclaration.extractFrom(node, cfg);

        super.visitClassDeclaration(node);
        // for fields declared in constructor
        this.fields = uniqBy(this.fields, (f) => f);
        const lastField = this.fields[this.fields.length - 1];
        const fields = this.fields.slice(0, -1);
        const stmts = fields
            .map((f) => this.genStmtForField(f))
            .filter((elem) => elem != null) as string[];

        if (this.hasBase && !this.decl.serdeConfig.skipSuper) {
            stmts.unshift(`super.serialize<__R, __S>(serializer);`);
        }

        if (lastField) {
            const lastFieldStmt = this.genStmtForLastField(lastField);
            if (lastFieldStmt) {
                stmts.push(lastFieldStmt);
            }
        }
        stmts.unshift(`serializer.${METHOD_START_SER_FIELD}();`);
        stmts.push(`return serializer.${METHOD_END_SER_FIELD}();`);
        const methodDecl = `
${METHOD_SER_SIG} {
    ${stmts.join("\n")} 
}`;

        const methodNode = SimpleParser.parseClassMember(methodDecl, node);
        node.members.push(methodNode);
        return node;
    }

    protected genStmtForField(node: FieldDeclaration): string | null {
        const name = toString(node.name);
        const nameStr = this.decl.serdeConfig.omitName ? "null" : `"${name}"`;
        if (!node.type) {
            this.emitter.error(
                DiagnosticCode.User_defined_0,
                node.range,
                `serde-as: field '${name}' need a type declaration`
            );
            return null;
        } else {
            const ty = getNameNullable(node.type);
            const method = node.type.isNullable
                ? METHOD_SER_FIELD
                : METHOD_SER_NONNULL_FIELD;
            return `${METHOD_SER_ARG_NAME}.${method}<${ty}>(${nameStr}, this.${name});`;
        }
    }

    protected genStmtForLastField(node: FieldDeclaration): string | null {
        const name = toString(node.name);
        const nameStr = this.decl.serdeConfig.omitName ? "null" : `"${name}"`;
        if (!node.type) {
            this.emitter.error(
                DiagnosticCode.User_defined_0,
                node.range,
                `serde-as: field '${name}' need a type declaration`
            );
            return null;
        } else {
            const ty = getNameNullable(node.type);
            const method = node.type.isNullable
                ? METHOD_SER_LAST_FIELD
                : METHOD_SER_NONNULL_LAST_FIELD;
            return `${METHOD_SER_ARG_NAME}.${method}<${ty}>(${nameStr}, this.${name});`;
        }
    }
}
