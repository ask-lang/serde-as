import { TransformVisitor } from "visitor-as";
import { ClassDeclaration, DiagnosticEmitter } from "assemblyscript/dist/assemblyscript.js";
// import _ from "lodash";
// import debug from "debug";
import { SerializeVisitor } from "./serialize.js";
import { DeserializeVisitor } from "./deserialize.js";
import { SerdeConfig } from "../ast.js";

// const log = debug("SerdeTupleVisitor");

export class SerdeTupleVisitor extends TransformVisitor {
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
