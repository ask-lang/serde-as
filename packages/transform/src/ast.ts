import {
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
import { CFG_OMIT_NAME, CFG_SKIP_SUPER, ClassSerdeKind } from "./consts.js";
import { extractDecorator } from "./utils.js";

/**
 * The parent of all serde decorator node.
 */
export interface ISerde {
    /** serde Kind of this node. */
    readonly serdeKind: ClassSerdeKind;
}

export interface ISerdeConfig {
    readonly skipSuper: boolean;
    readonly omitName: boolean;
}

/**
 * The key-value pair of config in a decorator.
 */
export type DecoratorConfigMap = Map<string, string>;

export type SerdeConfig = ISerdeConfig | DecoratorConfigMap;

/**
 * Extract the config map from decorator params
 * @param decorator
 * @returns
 */
export function extractConfigFromDecorator(
    emitter: DiagnosticEmitter,
    decorator: DecoratorNode,
): DecoratorConfigMap {
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
): DecoratorConfigMap {
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

export interface ISerdeConfig {
    readonly skipSuper: boolean;
    readonly omitName: boolean;
}

export class SerdeNode implements ISerde, ISerdeConfig {
    readonly serdeKind: ClassSerdeKind = ClassSerdeKind.Serde;
    readonly skipSuper: boolean;
    readonly omitName: boolean;

    /**
     *
     * @param map The kv map in a decorator.
     */
    constructor(cfg: SerdeConfig) {
        if (cfg instanceof Map) {
            this.skipSuper = getBoolConfigValue(cfg, CFG_SKIP_SUPER);
            this.omitName = getBoolConfigValue(cfg, CFG_OMIT_NAME);

        } else {
            this.skipSuper = cfg.skipSuper;
            this.omitName = cfg.omitName;
        }
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
        const map = extractConfigFromDecorator(emitter, decorator);

        return new SerdeNode(map);
    }
}

export class SerializeNode extends SerdeNode implements ISerde, ISerdeConfig {
    serdeKind: ClassSerdeKind = ClassSerdeKind.Serialize;

    /**
     *
     * @param cfg The kv map in a decorator.
     */
    constructor(cfg: SerdeConfig) {
        super(cfg);
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
        const map = extractConfigFromDecorator(emitter, decorator);

        return new SerializeNode(map);
    }
}

export class DeserializeNode extends SerdeNode implements ISerde, ISerdeConfig {
    serdeKind: ClassSerdeKind = ClassSerdeKind.Deserialize;

    /**
     *
     * @param cfg The kv map in a decorator.
     */
    constructor(cfg: SerdeConfig) {
        super(cfg);

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
        const map = extractConfigFromDecorator(emitter, decorator);

        return new DeserializeNode(map);
    }
}
