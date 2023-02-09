/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TransformVisitor } from "visitor-as";
import { Parser, ClassDeclaration, Source, ASTBuilder
} from "assemblyscript/dist/assemblyscript.js";
import { utils } from "visitor-as";
import debug from "debug";
import { SerdeKind } from "./consts.js";
import { DeserializeVisitor, SerializeVisitor } from "./visitors/index.js";
import { isEntry, updateSource } from "./utils.js";

const log = debug("SerdeTransform");

class SerdeTransform extends TransformVisitor {
    private hasSerde = false;
    private parser!: Parser;

    visitClassDeclaration(
        node: ClassDeclaration,
        _isDefault?: boolean
    ): ClassDeclaration {
        // TODO: fix hasDecorator and seem have no our class enter this function.
        log(utils.hasDecorator(node, SerdeKind.Serialize));
        log(node.name.text);
        if (utils.hasDecorator(node, SerdeKind.Serialize)) {
            log("new code:");
            this.hasSerde = true;
            const visitor = new SerializeVisitor(this.parser);
            node = visitor.visitClassDeclaration(node);
            let newCode = ASTBuilder.build(node);
            log("new code:", newCode);
        }

        if (utils.hasDecorator(node, SerdeKind.Deserialize)) {
            this.hasSerde = true;
            const visitor = new DeserializeVisitor(this.parser);
            node = visitor.visitClassDeclaration(node);
            let newCode = ASTBuilder.build(node);
            log("new code:", newCode);
        }

        return node;
    }

    afterParse(parser: Parser): void {
        log("Enter afterParse ...");
        this.parser = parser;

        const newSources = new Map<string, Source>();
        for (let source of parser.sources) {
            log("source:", source.normalizedPath);
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
