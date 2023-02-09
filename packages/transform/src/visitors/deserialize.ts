import { SimpleParser, TransformVisitor } from "visitor-as";
import {
    ClassDeclaration,
    DiagnosticEmitter,
    DiagnosticCode,
    FieldDeclaration,
    CommonFlags,
} from "assemblyscript/dist/assemblyscript.js";
import { toString, isMethodNamed } from "visitor-as/dist/utils.js";
import _ from "lodash";
import {
    METHOD_DES,
    METHOD_DES_ARG_NAME,
    METHOD_DES_FIELD,
    METHOD_DES_LAST_FIELD,
    METHOD_DES_NONNULL_FIELD,
    METHOD_DES_NONNULL_LAST_FIELD,
    METHOD_DES_SIG,
    METHOD_END_DES_FIELD,
    METHOD_START_DES_FIELD,
    SerdeKind,
} from "../consts.js";
import { extractDecorator, getNameNullable } from "../utils.js";
import { DeserializeDeclaration, extractConfigFromDecorator } from "../ast.js";

export class DeserializeVisitor extends TransformVisitor {
    private fields: FieldDeclaration[] = [];
    private hasBase: bool = false;
    private decl!: DeserializeDeclaration;

    constructor(public readonly emitter: DiagnosticEmitter) {
        super();
        throw new Error("test");
    }

    visitFieldDeclaration(node: FieldDeclaration): FieldDeclaration {
        if (node.is(CommonFlags.Static)) {
            return node;
        }
        this.fields.push(node);
        return node;
    }

    visitClassDeclaration(node: ClassDeclaration): ClassDeclaration {
        if (node.members.some(isMethodNamed(METHOD_DES))) {
            return node;
        }
        this.hasBase = node.extendsType ? true : false;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const decorator = extractDecorator(
            this.emitter,
            node,
            SerdeKind.Deserialize
        )!;
        const cfg = extractConfigFromDecorator(this.emitter, decorator);
        this.decl = DeserializeDeclaration.extractFrom(node, cfg);

        super.visitClassDeclaration(node);
        // for fields declared in constructor
        this.fields = _.uniqBy(this.fields, (f) => f);
        const lastField = this.fields[this.fields.length - 1];
        const fields = this.fields.slice(0, -1);
        const stmts = fields
            .map((f) => this.genStmtForField(f))
            .filter((elem) => elem != null) as string[];

        if (this.hasBase && !this.decl.serdeConfig.skipSuper) {
            stmts.unshift(`super.deserialize<__S>(deserializer);`);
        }

        if (lastField) {
            const lastFieldStmt = this.genStmtForLastField(lastField);
            if (lastFieldStmt) {
                stmts.push(lastFieldStmt);
            }
        }
        stmts.unshift(`deserializer.${METHOD_START_DES_FIELD}();`);
        stmts.push(`deserializer.${METHOD_END_DES_FIELD}();`);
        stmts.push(`return this;`);
        const methodDecl = `
${METHOD_DES_SIG} { 
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
                ? METHOD_DES_FIELD
                : METHOD_DES_NONNULL_FIELD;
            return `this.${name} = ${METHOD_DES_ARG_NAME}.${method}<${ty}>(${nameStr});`;
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
                ? METHOD_DES_LAST_FIELD
                : METHOD_DES_NONNULL_LAST_FIELD;
            return [
                `this.${name} = ${METHOD_DES_ARG_NAME}.${method}<${ty}>(${nameStr});`,
            ].join("\n");
        }
    }
}
