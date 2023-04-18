import { TransformVisitor } from "visitor-as";
import { ClassDeclaration, DiagnosticEmitter } from "assemblyscript/dist/assemblyscript.js";
import { DeserializeTupleVisitor, SerializeTupleVisitor } from "./index.js";
import { SerdeConfig } from "../ast.js";

export class SerdeTupleVisitor extends TransformVisitor {
    constructor(public readonly emitter: DiagnosticEmitter, private readonly cfg: SerdeConfig) {
        super();
    }

    visitClassDeclaration(node: ClassDeclaration): ClassDeclaration {
        {
            const visitor = new SerializeTupleVisitor(this.emitter, this.cfg);
            node = visitor.visitClassDeclaration(node);
        }

        {
            const visitor = new DeserializeTupleVisitor(this.emitter, this.cfg);
            node = visitor.visitClassDeclaration(node);
        }

        return node;
    }
}
