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
    FieldInfo,
    METHOD_DES,
    METHOD_DES_ARG_NAME,
    METHOD_DES_SIG,
    METHOD_END_DES_FIELD,
    METHOD_START_DES_FIELD,
    TARGET,
    superDeserialize,
} from "../consts.js";
import { getNameNullable } from "../utils.js";
import { SerdeConfig, DeserializeNode } from "../ast.js";

const log = debug("DeserializeVisitor");

export class DeserializeVisitor extends TransformVisitor {
    protected fields: FieldDeclaration[] = [];
    protected hasSuper: bool = false;
    protected readonly de: DeserializeNode;

    constructor(
        public readonly emitter: DiagnosticEmitter,
        cfg: SerdeConfig,
    ) {
        super();
        this.de = new DeserializeNode(cfg);
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
        this.visit(node.members);

        const methodNode = SimpleParser.parseClassMember(this.genMethodDecl(node), node);
        node.members.push(methodNode);
        log(ASTBuilder.build(node));
        return node;
    }

    protected genMethodDecl(_node: ClassDeclaration): string {
        // for fields declared in constructor
        this.fields = _.uniqBy(this.fields, (f) => f);
        const lastField = this.fields[this.fields.length - 1];
        const fields = this.fields.slice(0, -1);
        const stmts = fields
            .map((f) => this.genStmtForField(f, false))
            .filter((elem) => elem != null) as string[];

        const skipSuper = this.de.skipSuper || !this.hasSuper;
        if (!skipSuper) {
            stmts.unshift(`${superDeserialize()};`);
        }

        if (lastField) {
            const lastFieldStmt = this.genStmtForField(lastField, true);
            if (lastFieldStmt) {
                stmts.push(lastFieldStmt);
            }
        }
        // start
        stmts.unshift(this.genStmtBeforeField(this.fields.length));
        // end
        stmts.push(this.genStmtBeforeReturn());
        stmts.push(this.genReturnStmt());
        const methodDecl = `
${METHOD_DES_SIG} { 
    ${stmts.join("\n")} 
}`;
        return methodDecl;
    }

    protected genStmtBeforeField(_count: number): string {
        return `${METHOD_DES_ARG_NAME}.${METHOD_START_DES_FIELD}();`;
    }

    protected genStmtBeforeReturn(): string {
        return `${METHOD_DES_ARG_NAME}.${METHOD_END_DES_FIELD}();`;
    }

    protected genReturnStmt(): string {
        return `return this;`;
    }

    protected genStmtForField(node: FieldDeclaration, isLast: boolean): string | undefined {
        return this.collectFieldInfo(node, isLast)?.genDeserializeField();
    }

    protected collectFieldInfo(node: FieldDeclaration, isLast: boolean): FieldInfo | null {
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
            return new FieldInfo(ty, name, nameStr, isLast);
        }
    }
}
