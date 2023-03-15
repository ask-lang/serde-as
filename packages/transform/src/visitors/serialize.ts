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
    METHOD_END_SER_FIELD,
    METHOD_SER,
    METHOD_SER_ARG_NAME,
    METHOD_SER_FIELD,
    METHOD_SER_LAST_FIELD,
    METHOD_SER_SIG,
    METHOD_START_SER_FIELD,
} from "../consts.js";
import { getNameNullable } from "../utils.js";
import { SerdeConfig, SerializeNode } from "../ast.js";
import debug from "debug";
import { ASTBuilder } from "assemblyscript/dist/assemblyscript.js";

const log = debug("SerializeVisitor");

export class SerializeVisitor extends TransformVisitor {
    private fields: FieldDeclaration[] = [];
    private hasBase: bool = false;
    private ser!: SerializeNode;
    // Use the externalSer to replace `ser` if it exist.
    private readonly externalSer: SerializeNode | null = null;

    constructor(
        public readonly emitter: DiagnosticEmitter,
        externalCfg: SerdeConfig | null = null,
    ) {
        super();
        if (externalCfg !== null) {
            this.externalSer = new SerializeNode(externalCfg);
        }
    }

    visitFieldDeclaration(node: FieldDeclaration): FieldDeclaration {
        if (node.is(CommonFlags.Static)) {
            return node;
        }
        this.fields.push(node);
        return node;
    }

    visitClassDeclaration(node: ClassDeclaration): ClassDeclaration {
        // console.log(hasDecorator(node, /^@[\s]*serde\.[\s]*serialize/));
        // user customed
        if (node.members.some(isMethodNamed(METHOD_SER))) {
            return node;
        }
        this.hasBase = node.extendsType ? true : false;
        if (this.externalSer) {
            this.ser = this.externalSer;
        } else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.ser = SerializeNode.extractFromDecoratorNode(this.emitter, node)!;
        }
        super.visitClassDeclaration(node);
        // for fields declared in constructor
        this.fields = _.uniqBy(this.fields, (f) => f);
        const lastField = this.fields[this.fields.length - 1];
        const fields = this.fields.slice(0, -1);
        const stmts = fields
            .map((f) => this.genStmtForField(f))
            .filter((elem) => elem != null) as string[];

        if (this.hasBase && !this.ser.skipSuper) {
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
        log(ASTBuilder.build(node));
        return node;
    }

    protected genStmtForField(node: FieldDeclaration): string | null {
        const name = toString(node.name);
        const nameStr = this.ser.omitName ? `""` : `"${name}"`;
        if (!node.type) {
            this.emitter.error(
                DiagnosticCode.User_defined_0,
                node.range,
                `serde-as: field '${name}' need a type declaration`,
            );
            return null;
        } else {
            const ty = getNameNullable(node.type);
            return `${METHOD_SER_ARG_NAME}.${METHOD_SER_FIELD}<${ty}>(${nameStr}, this.${name});`;
        }
    }

    protected genStmtForLastField(node: FieldDeclaration): string | null {
        const name = toString(node.name);
        const nameStr = this.ser.omitName ? `""` : `"${name}"`;
        if (!node.type) {
            this.emitter.error(
                DiagnosticCode.User_defined_0,
                node.range,
                `serde-as: field '${name}' need a type declaration`,
            );
            return null;
        } else {
            const ty = getNameNullable(node.type);
            return `${METHOD_SER_ARG_NAME}.${METHOD_SER_LAST_FIELD}<${ty}>(${nameStr}, this.${name});`;
        }
    }
}
