import { globToRegExp } from "./deno-glob";

export function globValues(globPattern: string, obj: any): any[] {
  const paths = globToRegExp(globPattern, { extended: true, globstar: true });
  const values: any[] = [];

  function traverse(obj: any, path: string[]) {
    for (const key of Object.keys(obj)) {
      const currentPath = [...path, key];
      const value = obj[key];
      if (paths.test(currentPath.join("."))) {
        values.push(value);
      }
      if (typeof value === "object") {
        traverse(value, currentPath);
      }
    }
  }

  traverse(obj, []);

  return values;
}
