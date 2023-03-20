# glob-json-path

[![CI](https://github.com/anttiviljami/glob-json-path/workflows/CI/badge.svg)](https://github.com/anttiviljami/glob-json-path/actions?query=workflow%3ACI)
[![npm version](https://img.shields.io/npm/v/glob-json-path.svg)](https://www.npmjs.com/package/glob-json-path)
[![npm downloads](https://img.shields.io/npm/dw/glob-json-path)](https://www.npmjs.com/package/glob-json-path)
[![bundle size](https://img.shields.io/bundlephobia/minzip/glob-json-path?label=gzip%20bundle)](https://bundlephobia.com/package/glob-json-path)
[![License](http://img.shields.io/:license-mit-blue.svg)](https://github.com/anttiviljami/glob-json-path/blob/master/LICENSE)
[![Buy me a coffee](https://img.shields.io/badge/donate-buy%20me%20a%20coffee-orange)](https://buymeacoff.ee/anttiviljami)

Bash-like globbing for JSON objects.

```
npm i glob-json-path
```

```typescript
import { globValues } from "glob-json-path";

globValues("a.b", { a: { b: 1 }); // [1]
globValues("a.b.c", { a: { b: { c: 1 } }); // [1]
globValues("a.b", { a: { b: { c: 1 } }); // [{ c: 1 }]
globValues("a.*", { a: { b: 2, c: 3 } }); // [2, 3]
globValues("**.c", { a: { c: 4, b: { c: 5 } } }); // [4, 5]
globValues("a*", { ab: 7, abc: 8, ba: 9, bc: 10 } }); // [7, 8]
globValues("b?", { ab: 7, abc: 8, ba: 9, bc: 10 } }); // [9, 10]
```

## Features

- Zero dependencies. Tiny bundle size.
- Support for wildcards `*`, `?`
- Support for double wildcards `**` (deeply nesting)
- Support for arrays and all JSON primitives

## Examples

See [tests](https://github.com/anttiviljami/glob-json-path/blob/main/src/globValues.test.ts) for more use cases.

## Contributing

glob-json-path is Free and Open Source Software. Issues and pull requests are more than welcome!
