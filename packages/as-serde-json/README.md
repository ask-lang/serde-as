# as-serde-json(WIP)

`as-serde-json` provides a `JSONSerializer` which implements serde-as `Serializer`.

`JSONDeserializer` class is currently not implemented.

## Example

```ts
@serialize()
@deserialize()
class Person {
    name: string;
    gender: bool;
}

let person = JSONSerializer.serialize(Person{name: "yjhmelody", gender: true});
```

See `__test__` for more examples.
