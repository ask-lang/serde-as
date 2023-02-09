import {
    ClassDeclaration,
    DecoratorNode,
    DiagnosticCode,
    DiagnosticEmitter,
    LiteralExpression,
    LiteralKind,
    NodeKind,
    ObjectLiteralExpression,
} from "assemblyscript/dist/assemblyscript.js";
import { utils } from "visitor-as";
import { SerdeKind } from "./consts.js";

export interface SerdeNode {
    /** serde Kind of this node. */
    readonly serdeKind: SerdeKind;
}

const CFG_OMIT_NAME = "omitName";
const CFG_SKIP_SUPER = "skipSuper";

export class DecoratorConfig extends Map<string, string> {
    static extractFrom(
        emitter: DiagnosticEmitter,
        decorator: DecoratorNode
    ): DecoratorConfig {
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
    decorator: DecoratorNode
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
    decorator: DecoratorNode
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
                "Ask-lang: Arguments must be object literal"
            );
        }
        const literalArg = arg as LiteralExpression;
        if (!literalArg.isLiteralKind(LiteralKind.Object)) {
            emitter.errorRelated(
                DiagnosticCode.User_defined_0,
                decorator.range,
                arg.range,
                "Ask-lang: Arguments must be object literal"
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
    node: ObjectLiteralExpression | null
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
                "Ask-lang: Unspported decorator param syntax"
            );
        }
    }
    return map;
}

export interface SerdeConfig {
    readonly skipSuper: boolean;
    readonly omitName: boolean;
}

function serdeConfigFrom(cfg: DecoratorConfig): SerdeConfig {
    let skipSuper = false;
    const cfgSkipSuper = cfg.get(CFG_SKIP_SUPER);
    if (cfgSkipSuper) {
        if (cfgSkipSuper === "true") {
            skipSuper = true;
        } else {
            // TODO: warning
        }
    }

    let omitName = false;
    const cfgOmitName = cfg.get(CFG_OMIT_NAME);
    if (cfgOmitName) {
        if (cfgOmitName === "true") {
            omitName = true;
        } else {
            // TODO: warning
        }
    }

    return {
        skipSuper,
        omitName,
    };
}

export class SerializeDeclaration implements SerdeNode {
    serdeKind: SerdeKind = SerdeKind.Serialize;

    constructor(
        public readonly classDeclaration: ClassDeclaration,
        public readonly serdeConfig: SerdeConfig
    ) {}

    /**
     * Collect message method infos from config.
     * @param node
     * @param cfg
     * @returns
     */
    static extractFrom(
        node: ClassDeclaration,
        cfg: DecoratorConfig
    ): SerializeDeclaration {
        const serdeConfig = serdeConfigFrom(cfg);
        return new SerializeDeclaration(utils.cloneNode(node), serdeConfig);
    }
}

export class DeserializeDeclaration implements SerdeNode {
    serdeKind: SerdeKind = SerdeKind.Deserialize;

    constructor(
        public readonly classDeclaration: ClassDeclaration,
        public readonly serdeConfig: SerdeConfig
    ) {}

    /**
     * Collect message method infos from config.
     * @param node
     * @param cfg
     * @returns
     */
    static extractFrom(
        node: ClassDeclaration,
        cfg: DecoratorConfig
    ): DeserializeDeclaration {
        const serdeConfig = serdeConfigFrom(cfg);
        return new DeserializeDeclaration(utils.cloneNode(node), serdeConfig);
    }
}
