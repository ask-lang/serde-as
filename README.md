# Serde-as

![CI](https://github.com/yjhmelody/serde-as/workflows/CI/badge.svg)

![as-serde](https://img.shields.io/npm/v/as-serde?color=light-green&label=as-serde)
![as-serde-transform](https://img.shields.io/npm/v/as-serde-transform?color=light-green&label=as-serde-transform)
![as-buffers](https://img.shields.io/npm/v/as-serde?color=light-green&label=as-buffers)
![as-serde-json](https://img.shields.io/npm/v/as-serde?color=light-green&label=as-serde-json)
![as-serde-scale](https://img.shields.io/npm/v/as-serde?color=light-green&label=as-serde-scale)

`Serde-as` is a framework for serializing and deserializing AssemblyScript data structures efficiently and simply.

See the main [document](./packages/as-serde/README.md).

This repo contains many sub packages. See the documentation of each package for details.

The [`as-buffers`](./packages/as-buffers/README.md) is a relatively independent library, which is used to implement serde internally, but it is useful and generic to handle bytes.
