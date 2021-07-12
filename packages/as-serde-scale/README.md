# as-serde-scale

`as-serde-scale` provides `ScaleSerializer` class which implements `Serializer` and `ScaleDeserializer` class which implements `Deserializer`.


## Supported Types

In addition to the types supported by as-serde, as-serde-scale also supports `i128/u128` and `Compact<T>` types.

More detailed information about the SCALE codec [specification](https://substrate.dev/docs/en/knowledgebase/advanced/codec).

## Example

```ts
@serialize({ omitName: true })
@deserialize({ omitName: true })
class Person {
    name: string;
    gender: bool;
}

let person = ScaleSerializer.serialize(Person{name: "yjhmelody", gender: true});
```

See `__test__` for more examples.
