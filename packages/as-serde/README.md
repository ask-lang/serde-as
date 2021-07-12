# as-serde

> A simple (de)serialize library for AssemblyScript.

## Usage

### install

```sh
npm install --save-dev as-serde
```

Update your asconfig to include the transform:

```json
{
  "options": {
    ... // other options here
    "transform": ["as-serde-transform"]
  }
}
```

### APIs

This package defines four abstract classes: `CoreSerializer`/`Serializer`/`CoreDeserializer`/`Deserializer`.

All methods in `CoreSerializer`/`CoreDeserializer` are used by `as-serde-transform`. That is to say, the automatically generated code depends on these classes.

`Serializer`/`Deserializer` just simply expand `CoreSerializer`/`CoreDeserializer`, making it easier for serialization library authors to implement the required functions.

### Decorator Syntax

Use decorator just like this:

```ts
@serialize()
@deserialize()
class Person {
    name: string;
    gender: bool;
}
```

or like this:

```ts
@serialize({ omitName: true })
@deserialize({ omitName: true })
class Person {
    name: string;
    gender: bool;
}
```

There are two decorators used for class: `serialize` and `deserialize`. There is currently no decorator that supports any class field or methods yet.

Commonly supported configuration items are as follows:

-   `skipSuper: boolean`: default to false. `(de)serialize` method will ignore fields of super class if true.
-   `omitName: boolean`: default to false. `(de)serialize` method will pass null to `(de)serializeField` and other method instead of the field name. It can save many bytes in wasm code if you do not care about field names.

### TODO

Currently our decorator name `serialize` and `deserialize` occupies the global namespace.
I hope that all decorators in the follow-up can be changed to the `serde` namespace, which is a bit troublesome, so I haven’t implemented it yet.
Such as:

```ts
@serde.serialize()
@serde.deserialize()
class Person {
    name: string;
    gender: bool;
}
```

I hope to add some field and method decorators, such as `serde.skip/serde.get/serde.set` and others. Since I don't need these functions for the time being, and I haven't carefully considered the advantages and disadvantages of several implementation details, I still haven't implemented it.

At present, only the serialization of `json` has been implemented, and the deserialization has not been implemented because it is more troublesome. Subsequent implementations of json deserialization may redefine the interface of Deserialize according to the situation. I think the current interface is still not good enough.
