# as-buffers

`as-buffers` provides some Buffer types for reading/writing string/bytes efficiently and simply.

<!-- TODO: more docs -->

## Usage

There are 2 useful buffer classes here: `BytesBuffer` and `StringBuffer`.

-   `BytesBuffer` provides bytes related/endian related methods.
-   `StringBuffer`(is forked from [MaxGraey](https://github.com/MaxGraey/as-string-sink)) provides string (UTF16) related methods.

### Write/Read bytes

```ts
let buf = BytesBuffer.wrap(new ArrayBuffer(0));
let val = 0x11 as i8;
buf.writeNumberBE<i8>(val);
let res = buf.readNumberBE<i8>(0);
expect(res).toBe(val);
```

### Write/Read string

```ts
let buf = new StringBuffer();
buf.write("hello");
expect(buf.toString()).toBe("hello");
```

### More usages

In addition to some safe methods, they also have some unsafe methods to improve performance. You need to pay attention to the buffer capacity and read/write offset.

See unit tests and source comments.
