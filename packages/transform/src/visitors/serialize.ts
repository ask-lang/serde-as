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
    METHOD_END_SER_FIELD,
    METHOD_SER,
    METHOD_SER_ARG_NAME,
    METHOD_SER_SIG,
    METHOD_START_SER_FIELD,
    TARGET,
    superSerialize,
} from "../consts.js";
import { getNameNullable } from "../utils.js";
import { SerdeConfig, SerializeNode } from "../ast.js";

const log = debug("SerializeVisitor");

export class SerializeVisitor extends TransformVisitor {
    protected fields: FieldDeclaration[] = [];
    protected hasSuper: bool = false;
    protected readonly ser: SerializeNode;

    constructor(
        public readonly emitter: DiagnosticEmitter,
        cfg: SerdeConfig,
    ) {
        super();
        this.ser = new SerializeNode(cfg);
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

        const skipSuper = this.ser.skipSuper || !this.hasSuper;
        if (!skipSuper) {
            stmts.unshift(`${superSerialize()};`);
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
        stmts.push(this.genReturnStmt());
        const methodDecl = `
${METHOD_SER_SIG} {
    ${stmts.join("\n")} 
}`;
        return methodDecl;
    }

    protected genStmtBeforeField(_count: number): string {
        return `${METHOD_SER_ARG_NAME}.${METHOD_START_SER_FIELD}();`;
    }

    protected genReturnStmt(): string {
        return `return ${METHOD_SER_ARG_NAME}.${METHOD_END_SER_FIELD}();`;
    }

    protected genStmtForField(node: FieldDeclaration, isLast: boolean): string | undefined {
        return this.collectFieldInfo(node, isLast)?.genSerializeField();
    }

    protected collectFieldInfo(node: FieldDeclaration, isLast: boolean): FieldInfo | null {
        const name = toString(node.name);
        const nameStr = this.ser.omitName ? `""` : `"${name}"`;
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
