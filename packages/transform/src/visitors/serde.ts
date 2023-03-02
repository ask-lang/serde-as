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
    METHOD_SER_NONNULL_FIELD,
    METHOD_SER_NONNULL_LAST_FIELD,
    METHOD_SER_SIG,
    METHOD_START_SER_FIELD,
    ClassSerdeKind,
} from "../consts.js";
import { extractDecorator, getNameNullable } from "../utils.js";
import { extractConfigFromDecorator, SerializeNode } from "../ast.js";
import debug from "debug";
import { ASTBuilder } from "assemblyscript/dist/assemblyscript.js";
import { SerializeVisitor } from "./serialize.js";
import { DeserializeNode } from "../ast";
import { DeserializeVisitor } from "./deserialize";

export class SerdeVisitor extends TransformVisitor {
    // private serVisitor!: SerializeVisitor;

    constructor(
        public readonly emitter: DiagnosticEmitter,
        private readonly serializeNode: SerializeNode,
        private readonly deserializeNode: DeserializeNode,
    ) {
        super();
    }

    visitClassDeclaration(node: ClassDeclaration): ClassDeclaration {
        {
            const visitor = new SerializeVisitor(this.emitter, this.serializeNode);
            node = visitor.visitClassDeclaration(node);
        }

        {
            const visitor = new DeserializeVisitor(this.emitter, this.deserializeNode);
            node = visitor.visitClassDeclaration(node);
        }
        
        return node;
    }
}
