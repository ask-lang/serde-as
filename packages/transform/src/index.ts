/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TransformVisitor } from "visitor-as";
import {
    Parser,
    ClassDeclaration,
    Source,
    ASTBuilder,
    DiagnosticCode,
} from "assemblyscript/dist/assemblyscript.js";
import { utils } from "visitor-as";
import debug from "debug";
import { ClassSerdeKind, TARGET } from "./consts.js";
import {
    SerdeVisitor,
    DeserializeVisitor,
    SerializeVisitor,
    SerdeTupleVisitor,
} from "./visitors/index.js";
import { isEntry, updateSource } from "./utils.js";
import { DeserializeNode, SerdeNode, SerializeNode, extractMapFromDecoratorNode } from "./ast.js";

const log = debug("SerdeTransform");

class SerdeTransform extends TransformVisitor {
    private hasSerde = false;
    // set in `afterParse`.
    private parser!: Parser;

    visitClassDeclaration(node: ClassDeclaration, _isDefault?: boolean): ClassDeclaration {
        const serdeConfig = extractMapFromDecoratorNode(this.parser, node, ClassSerdeKind.Serde);
        const serdeTupleConfig = extractMapFromDecoratorNode(
            this.parser,
            node,
            ClassSerdeKind.SerdeTuple,
        );
        const serConfig = extractMapFromDecoratorNode(this.parser, node, ClassSerdeKind.Serialize);
        const deConfig = extractMapFromDecoratorNode(this.parser, node, ClassSerdeKind.Deserialize);

        if (serdeTupleConfig) {
            if(serdeConfig || serConfig || deConfig) {
                this.parser.error(DiagnosticCode.Transform_0_1, node.range, TARGET, "Duplicated serde decorator");
                return node;
            }

            this.hasSerde = true;
            const visitor = new SerdeTupleVisitor(this.parser, new SerdeNode(serdeTupleConfig));
            node = visitor.visitClassDeclaration(node);
        }

        if (serdeConfig) {
            if(serdeTupleConfig || serConfig || deConfig) {
                this.parser.error(DiagnosticCode.Transform_0_1, node.range, TARGET, "Duplicated serde decorator");
                return node;
            }
            this.hasSerde = true;
            const visitor = new SerdeVisitor(this.parser, new SerdeNode(serdeConfig));
            node = visitor.visitClassDeclaration(node);
        }

        if (serConfig) {
            if(serdeTupleConfig || serdeConfig) {
                this.parser.error(DiagnosticCode.Transform_0_1, node.range, TARGET, "Duplicated serde decorator");
                return node;
            }
            this.hasSerde = true;
            const visitor = new SerializeVisitor(this.parser, new SerializeNode(serConfig));
            node = visitor.visitClassDeclaration(node);
        }

        if (deConfig) {
            if(serdeTupleConfig || serdeConfig) {
                this.parser.error(DiagnosticCode.Transform_0_1, node.range, TARGET, "Duplicated serde decorator");
                return node;
            }
            this.hasSerde = true;
            const visitor = new DeserializeVisitor(this.parser, new DeserializeNode(deConfig));
            node = visitor.visitClassDeclaration(node);
        }

        return node;
    }

    afterParse(parser: Parser): void {
        log("Enter afterParse ...");
        this.parser = parser;

        const newSources = new Map<string, Source>();
        for (let source of parser.sources) {
            // don't alter the orignal code
            source = utils.cloneNode(source);
            this.hasSerde = false;
            source = this.visitSource(source);
            if (this.hasSerde) {
                newSources.set(source.internalPath, source);
            }
        }

        newSources.forEach((src) => {
            const newText = ASTBuilder.build(src);
            log(`${src.internalPath}:`);
            log("\n%s", newText);
            const newParser = new Parser(parser.diagnostics);
            newParser.parseFile(newText, src.normalizedPath, isEntry(src));
            const newSource = newParser.sources.pop()!;
            updateSource(this.program, newSource);
        });
        log("Exit afterParse ...");
    }
}

export default SerdeTransform;
