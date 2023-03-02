import {
    ClassDeclaration,
    DecoratorNode,
    DiagnosticCode,
    DiagnosticEmitter,
    LiteralExpression,
    LiteralKind,
    NodeKind,
    ObjectLiteralExpression,
    DeclarationStatement,
} from "assemblyscript/dist/assemblyscript.js";
import { utils } from "visitor-as";
import { ClassSerdeKind } from "./consts.js";
import { extractDecorator } from "./utils.js";

export interface SerdeAST {
    /** serde Kind of this node. */
    readonly serdeKind: ClassSerdeKind;
}

const CFG_OMIT_NAME = "omitName";
const CFG_SKIP_SUPER = "skipSuper";

export class DecoratorConfig extends Map<string, string> {
    static extractFrom(emitter: DiagnosticEmitter, decorator: DecoratorNode): DecoratorConfig {
        return extractConfigFromDecorator(emitter, decorator);
    }
}

/**
 * Extract the config map from decorator params
 * @param decorator
 * @returns
 */
export function extractConfigFromDecorator(
    emitter: DiagnosticEmitter,
    decorator: DecoratorNode,
): DecoratorConfig {
    const obj = extractLiteralObject(emitter, decorator);
    const cfg = extractConfigFromLiteral(emitter, obj);

    return cfg;
}

/**
 * return the first literal object for decorator or null if have not
 * @param emitter
 * @param decorator
 * @returns
 */
export function extractLiteralObject(
    emitter: DiagnosticEmitter,
    decorator: DecoratorNode,
): ObjectLiteralExpression | null {
    const args = decorator.args ? decorator.args : [];
    const literals: ObjectLiteralExpression[] = [];
    for (const arg of args) {
        if (arg.kind !== NodeKind.Literal) {
            // TODO: define error type
            emitter.errorRelated(
                DiagnosticCode.User_defined_0,
                decorator.range,
                arg.range,
                "Ask-lang: Arguments must be object literal",
            );
        }
        const literalArg = arg as LiteralExpression;
        if (!literalArg.isLiteralKind(LiteralKind.Object)) {
            emitter.errorRelated(
                DiagnosticCode.User_defined_0,
                decorator.range,
                arg.range,
                "Ask-lang: Arguments must be object literal",
            );
        }
        literals.push(literalArg as ObjectLiteralExpression);
    }

    let literal = literals[literals.length - 1];
    return literal ? literal : null;
}

/**
 * Extract a config map from JS object literal.
 * @param emitter
 * @param node
 * @returns
 */
export function extractConfigFromLiteral(
    emitter: DiagnosticEmitter,
    node: ObjectLiteralExpression | null,
): DecoratorConfig {
    const map = new Map();
    if (node == null) {
        return map;
    }
    for (let i = 0; i < node.names.length; i++) {
        const key = node.names[i].text;
        const value = node.values[i];
        // we only support the folllowing literals
        if (
            value.isLiteralKind(LiteralKind.Integer) ||
            value.isLiteralKind(LiteralKind.String) ||
            value.kind === NodeKind.True ||
            value.kind === NodeKind.False
        ) {
            map.set(key, value.range.toString());
        } else {
            emitter.error(
                DiagnosticCode.User_defined_0,
                node.range,
                "Ask-lang: Unspported decorator param syntax",
            );
        }
    }
    return map;
}

export interface SerdeConfig {
    readonly skipSuper: boolean;
    readonly omitName: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SerializeConfig extends SerdeConfig {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DeserializeConfig extends SerdeConfig {}

function getBoolConfigValue(map: Map<string, string>, key: string): boolean {
    const val = map.get(key);
    if (val) {
        if (val === "true") {
            return true;
        } else if (val === "false") {
            return false;
        }
    }
    // TODO: warning
    return false;
}

function serdeConfigFrom(cfg: DecoratorConfig): SerdeConfig {
    const skipSuper = getBoolConfigValue(cfg, CFG_SKIP_SUPER);
    const omitName = getBoolConfigValue(cfg, CFG_OMIT_NAME);

    return {
        skipSuper,
        omitName,
    };
}

export class SerdeNode implements SerdeAST {
    serdeKind: ClassSerdeKind = ClassSerdeKind.Serde;

    constructor(public readonly config: SerdeConfig) {}

    /**
     * Collect message method infos from config.
     * @param node
     * @param cfg
     * @returns
     */
    static extractFrom(cfg: DecoratorConfig): SerdeNode {
        const serdeConfig = serdeConfigFrom(cfg);
        return new SerdeNode(serdeConfig);
    }

    /**
     * Return the SerializeDeclaration if has decorator `@serialize`, else panic.
     * @param emitter
     * @param node
     * @returns
     */
    static extractFromDecoratorNode(
        emitter: DiagnosticEmitter,
        node: DeclarationStatement,
    ): SerdeNode | null {
        if (!utils.hasDecorator(node, ClassSerdeKind.Serde)) {
            return null;
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const decorator = extractDecorator(emitter, node, ClassSerdeKind.Serde)!;
        const cfg = extractConfigFromDecorator(emitter, decorator);

        return SerdeNode.extractFrom(cfg);
    }
}

export class SerializeNode implements SerdeAST {
    serdeKind: ClassSerdeKind = ClassSerdeKind.Serialize;

    constructor(public readonly config: SerializeConfig) {}

    /**
     * Collect message method infos from config.
     * @param node
     * @param cfg
     * @returns
     */
    static extractFrom(cfg: DecoratorConfig): SerializeNode {
        const serdeConfig = serdeConfigFrom(cfg);
        return new SerializeNode(serdeConfig);
    }

    /**
     * Return the SerializeDeclaration if has decorator `@serialize`, else panic.
     * @param emitter
     * @param node
     * @returns
     */
    static extractFromDecoratorNode(
        emitter: DiagnosticEmitter,
        node: DeclarationStatement,
    ): SerializeNode | null {
        if (!utils.hasDecorator(node, ClassSerdeKind.Serialize)) {
            return null;
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const decorator = extractDecorator(emitter, node, ClassSerdeKind.Serialize)!;
        const cfg = extractConfigFromDecorator(emitter, decorator);

        return SerializeNode.extractFrom(cfg);
    }
}

export class DeserializeNode implements SerdeAST {
    serdeKind: ClassSerdeKind = ClassSerdeKind.Deserialize;

    constructor(public readonly config: SerdeConfig) {}

    /**
     * Collect message method infos from config.
     * @param node
     * @param cfg
     * @returns
     */
    static extractFrom(cfg: DecoratorConfig): DeserializeNode {
        const serdeConfig = serdeConfigFrom(cfg);
        return new DeserializeNode(serdeConfig);
    }

    /**
     * Return the SerializeDeclaration if has decorator `@serialize`, else panic.
     * @param emitter
     * @param node
     * @returns
     */
    static extractFromDecoratorNode(
        emitter: DiagnosticEmitter,
        node: DeclarationStatement,
    ): DeserializeNode | null {
        if (!utils.hasDecorator(node, ClassSerdeKind.Deserialize)) {
            return null;
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const decorator = extractDecorator(emitter, node, ClassSerdeKind.Deserialize)!;
        const cfg = extractConfigFromDecorator(emitter, decorator);

        return DeserializeNode.extractFrom(cfg);
    }
}
