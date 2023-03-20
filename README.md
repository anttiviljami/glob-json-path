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

globValues("a.b", { a: { b: 1 }); // returns [1]
globValues("a.b.c", { a: { b: { c: 1 } }); // returns [1]
globValues("a.b", { a: { b: { c: 1 } }); // returns [{ c: 1 }]
globValues("a.*", { a: { b: 2, c: 3 } }); // returns [2, 3]
globValues("**.c", { a: { c: 4, b: { c: 5 } } }); // returns [4, 5]
globValues("a*", { ab: 7, ac: 8, ba: 9, bc: 10 } }); // returns [7, 8]
globValues("b?", { ab: 7, ac: 8, ba: 9, bc: 10 } }); // returns [9, 10]
```

Features:

- Zero dependencies. Tiny bundle size.
- Support for arrays
- Support for wildcards `*`, `?`
- Support for double wildcards `**` (deeply nesting)

## Contributing

glob-json-path is Free and Open Source Software. Issues and pull requests are more than welcome!
