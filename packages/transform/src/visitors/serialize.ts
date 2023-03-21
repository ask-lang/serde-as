import { SimpleParser, TransformVisitor } from "visitor-as";
import {
    ClassDeclaration,
    DiagnosticEmitter,
    DiagnosticCode,
    FieldDeclaration,
    CommonFlags,
    ASTBuilder,
} from "assemblyscript/dist/assemblyscript.js";
import { toString, isMethodNamed } from "visitor-as/dist/utils.js";
import _ from "lodash";
import debug from "debug";
import {
    METHOD_END_SER_FIELD,
    METHOD_SER,
    METHOD_SER_ARG_NAME,
    METHOD_SER_SIG,
    METHOD_START_SER_FIELD,
    TARGET,
    serializeField,
    superSerialize,
} from "../consts.js";
import { getNameNullable } from "../utils.js";
import { SerdeConfig, SerializeNode } from "../ast.js";

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

        const hasSuper = this.hasBase && !this.ser.skipSuper;
        if (hasSuper) {
            stmts.unshift(`${superSerialize()};`);
        }

        if (lastField) {
            const lastFieldStmt = this.genStmtForLastField(lastField);
            if (lastFieldStmt) {
                stmts.push(lastFieldStmt);
            }
        }
        // start
        stmts.unshift(`${METHOD_SER_ARG_NAME}.${METHOD_START_SER_FIELD}();`);
        // end
        stmts.push(`return ${METHOD_SER_ARG_NAME}.${METHOD_END_SER_FIELD}();`);
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
                DiagnosticCode.Transform_0_1,
                node.range,
                TARGET,
                `serde-as: field '${name}' need a type declaration`,
            );
            return null;
        } else {
            const ty = getNameNullable(node.type);
            return serializeField(ty, nameStr, name, false) + ";";
        }
    }

    protected genStmtForLastField(node: FieldDeclaration): string | null {
        const name = toString(node.name);
        const nameStr = this.ser.omitName ? `""` : `"${name}"`;
        if (!node.type) {
            this.emitter.error(
                DiagnosticCode.Transform_0_1,
                node.range,
                TARGET,
                `serde-as: field '${name}' need a type declaration`,
            );
            return null;
        } else {
            const ty = getNameNullable(node.type);
            return serializeField(ty, nameStr, name, true) + ";";
        }
    }
}
