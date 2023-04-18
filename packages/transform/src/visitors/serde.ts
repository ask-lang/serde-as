import { TransformVisitor } from "visitor-as";
import { ClassDeclaration, DiagnosticEmitter } from "assemblyscript/dist/assemblyscript.js";
import { SerializeVisitor, DeserializeVisitor } from "./index.js";
import { SerdeConfig } from "../ast.js";

export class SerdeVisitor extends TransformVisitor {
    constructor(public readonly emitter: DiagnosticEmitter, private readonly cfg: SerdeConfig) {
        super();
    }

    visitClassDeclaration(node: ClassDeclaration): ClassDeclaration {
        {
            const visitor = new SerializeVisitor(this.emitter, this.cfg);
            node = visitor.visitClassDeclaration(node);
        }

        {
            const visitor = new DeserializeVisitor(this.emitter, this.cfg);
            node = visitor.visitClassDeclaration(node);
        }

        return node;
    }
}
