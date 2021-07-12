import {
    DeclarationStatement,
    DecoratorNode,
    DiagnosticCategory,
    DiagnosticCode,
    DiagnosticEmitter,
    Node,
    Program,
    Range,
    Source,
    SourceKind,
    TypeNode,
} from "assemblyscript";
import { getName } from "visitor-as/dist/utils";

export function getNameNullable(type: TypeNode): string {
    let ty = getName(type);
    if (type.isNullable && !ty.endsWith("null")) {
        ty = `${ty} | null`;
    }
    return ty;
}

export function isUserEntry(node: Node): boolean {
    return node.range.source.sourceKind == SourceKind.USER_ENTRY;
}

export function isEntry(node: Node): boolean {
    return (
        isUserEntry(node) ||
        node.range.source.sourceKind == SourceKind.LIBRARY_ENTRY
    );
}

export function updateSource(program: Program, newSource: Source): void {
    const sources = program.sources;
    for (let i = 0, len = sources.length; i < len; i++) {
        if (sources[i].internalPath == newSource.internalPath) {
            sources[i] = newSource;
            break;
        }
    }
}

/**
 *
 * @param emitter DiagnosticEmitter
 * @returns return true if emitter have ERROR message
 */
export function hasErrorMessage(emitter: DiagnosticEmitter): boolean {
    return hasMessage(emitter, DiagnosticCategory.ERROR);
}

/**
 *
 * @param emitter DiagnosticEmitter
 * @returns return true if emitter have WARNING message
 */
export function hasWarningMessage(emitter: DiagnosticEmitter): boolean {
    return hasMessage(emitter, DiagnosticCategory.WARNING);
}

function hasMessage(
    emitter: DiagnosticEmitter,
    category: DiagnosticCategory
): boolean {
    const diagnostics = emitter.diagnostics ? emitter.diagnostics : [];
    for (const msg of diagnostics) {
        if (msg.category === category) {
            return true;
        }
    }
    return false;
}

/**
 * append `@inline` to a declaration
 * @param range node range
 * @param decl declaration node pending to be inlined
 */
export function addInlineDecorator(
    range: Range,
    decl: { decorators: DecoratorNode[] | null }
): void {
    addDecorator(decl, genInlineDecorator(range));
}

/**
 * append a decorator to a declaration
 * @param range node range
 * @param decl declaration node pending to be decorated
 */
export function addDecorator(
    decl: { decorators: DecoratorNode[] | null },
    decorator: DecoratorNode
): void {
    if (decl.decorators == null) {
        decl.decorators = [];
    }
    decl.decorators.push(decorator);
}

export function genInlineDecorator(range: Range): DecoratorNode {
    return Node.createDecorator(
        Node.createIdentifierExpression("inline", range),
        null,
        range
    );
}

/**
 *
 * @param decorators
 * @param pred a filter function for decorators
 * @returns
 */
export function filterDecorators(
    decorators: DecoratorNode[] | null,
    pred: (node: DecoratorNode) => bool
): DecoratorNode[] {
    const decs: DecoratorNode[] = [];
    if (decorators === null) return decs;
    for (const decorator of decorators) {
        if (pred(decorator)) decs.push(decorator);
    }
    return decs;
}

/**
 * return the last decorator of method or null if have not
 * @param node contract constructor method
 */
export function extractDecorator(
    emitter: DiagnosticEmitter,
    node: DeclarationStatement,
    kind: { toString: () => string }
): DecoratorNode | null {
    const decs = filterDecorators(
        node.decorators,
        (node) => node.name.range.toString() === "@" + kind
    );

    // cannot have duplicated decorator
    if (decs.length > 1) {
        emitter.warningRelated(
            DiagnosticCode.Duplicate_decorator,
            node.range,
            decs[0].range,
            kind.toString()
        );
    }

    let dec = decs[decs.length - 1];
    return dec ? dec : null;
}
