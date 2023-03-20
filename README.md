# glob-json-path

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
