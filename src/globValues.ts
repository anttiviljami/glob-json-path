import { globToRegExp } from "./deno-glob";


export function globValues(globPattern: string, obj: any): any[] {
  const matcher = globToRegExp(globPattern, { globstar: true });
  const globByDepth = new Map();

  const values: any[] = [];

  function traverse(obj: any, path: string[]) {
    for (const key of Object.keys(obj)) {
      const currentPath = [...path, key];
      const value = obj[key];
      if (matcher.test(currentPath.join("."))) {
        values.push(value);
      } else if (typeof value === "object") {
        if (globPattern.includes('**')) {
          // if the glob pattern contains **, we need to traverse all the way down
          traverse(value, currentPath);
          continue;
        } 

        // don't traverse if the path doesn't match partially
        let partialMatcher = globByDepth.get(path.length);
        if (!partialMatcher) {
          partialMatcher = globToRegExp(globPattern.split('.').slice(0, path.length + 1).join('.'));
          globByDepth.set(path.length, partialMatcher);
        }
        const isPartialMatch = partialMatcher.test(currentPath.join('.'));

        if (isPartialMatch) {
          traverse(value, currentPath);
        }
      }
    }
  }

  traverse(obj, []);

  return values;
}
