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
    METHOD_DES,
    METHOD_DES_ARG_NAME,
    METHOD_DES_SIG,
    METHOD_END_DES_FIELD,
    METHOD_START_DES_FIELD,
    TARGET,
    deserializeField,
    superDeserialize,
} from "../consts.js";
import { getNameNullable } from "../utils.js";
import { SerdeConfig, DeserializeNode } from "../ast.js";

const log = debug("DeserializeVisitor");

export class DeserializeVisitor extends TransformVisitor {
    private fields: FieldDeclaration[] = [];
    private hasSuper: bool = false;
    private de!: DeserializeNode;
    // Use the externalDe to replace `de` if it exist.
    readonly externalDe: DeserializeNode | null = null;

    constructor(
        public readonly emitter: DiagnosticEmitter,
        externalCfg: SerdeConfig | null = null,
    ) {
        super();
        if (externalCfg != null) {
            this.externalDe = new DeserializeNode(externalCfg);
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
        // user customed
        if (node.members.some(isMethodNamed(METHOD_DES))) {
            return node;
        }
        this.hasSuper = node.extendsType ? true : false;
        if (this.externalDe) {
            this.de = this.externalDe;
        } else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.de = DeserializeNode.extractFromDecoratorNode(this.emitter, node)!;
        }
        this.visit(node.members);

        const methodNode = SimpleParser.parseClassMember(this.genMethodDecl(), node);
        node.members.push(methodNode);
        log(ASTBuilder.build(node));
        return node;
    }

    protected genMethodDecl(): string {
        // for fields declared in constructor
        this.fields = _.uniqBy(this.fields, (f) => f);
        const lastField = this.fields[this.fields.length - 1];
        const fields = this.fields.slice(0, -1);
        const stmts = fields
            .map((f) => this.genStmtForField(f))
            .filter((elem) => elem != null) as string[];

        const skipSuper = this.de.skipSuper || !this.hasSuper;
        if (!skipSuper) {
            stmts.unshift(`${superDeserialize()};`);
        }

        if (lastField) {
            const lastFieldStmt = this.genStmtForLastField(lastField);
            if (lastFieldStmt) {
                stmts.push(lastFieldStmt);
            }
        }
        // start
        stmts.unshift(`${METHOD_DES_ARG_NAME}.${METHOD_START_DES_FIELD}();`);
        // end
        stmts.push(`${METHOD_DES_ARG_NAME}.${METHOD_END_DES_FIELD}();`);
        stmts.push(`return this;`);
        const methodDecl = `
${METHOD_DES_SIG} { 
    ${stmts.join("\n")} 
}`;
        return methodDecl;
    }

    protected genStmtForField(node: FieldDeclaration): string | null {
        const name = toString(node.name);
        const nameStr = this.de.omitName ? `""` : `"${name}"`;
        if (!node.type) {
            this.emitter.error(
                DiagnosticCode.Transform_0_1,
                node.range,
                TARGET,
                `field '${name}' need a type declaration`,
            );
            return null;
        } else {
            const ty = getNameNullable(node.type);
            return [`this.${name} = ${deserializeField(ty, nameStr, false)};`].join("\n");
        }
    }

    protected genStmtForLastField(node: FieldDeclaration): string | null {
        const name = toString(node.name);
        const nameStr = this.de.omitName ? `""` : `"${name}"`;
        if (!node.type) {
            this.emitter.error(
                DiagnosticCode.Transform_0_1,
                node.range,
                TARGET,
                `field '${name}' need a type declaration`,
            );
            return null;
        } else {
            const ty = getNameNullable(node.type);
            return [`this.${name} = ${deserializeField(ty, nameStr, true)};`].join("\n");
        }
    }
}
