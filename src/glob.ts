import globToRegExp from "glob-to-regexp";

// import { globToRegExp } from './deno-glob';

export function globPaths(globPattern: string, obj: any): string[] {
  return glob(globPattern, obj, "path");
}

export function globValues(globPattern: string, obj: any): any[] {
  return glob(globPattern, obj, "value");
}

export function glob(globPattern: string, obj: any, mode: "path" | "value"): any[] {
  const globPatternParts = globPattern.split(".");
  const objectPatchMatcher = toPathMatcher(globPatternParts);

  // cache partial matchers by depth
  const globByDepth = new Map();

  const result: any[] = [];

  // check for glob star depth
  const globStarDepth = globPatternParts.indexOf("**");

  function traverse(obj: any, path: string[]) {
    if (!obj) return result;

    for (const key in obj) {
      const currentPath = path.concat(key);

      if (objectPathMatches(objectPatchMatcher, currentPath)) {
        result.push(mode === "path" ? currentPath.join(".") : obj[key]);
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        // if the glob pattern contains the globstar **, we need to traverse all the way down from here
        if (globStarDepth !== -1 && currentPath.length >= globStarDepth) {
          traverse(obj[key], currentPath);
          continue;
        }

        // don't traverse if the path doesn't match partially
        let partialMatcher = globByDepth.get(path.length);
        if (!partialMatcher) {
          partialMatcher = toPathMatcher(globPatternParts.slice(0, currentPath.length));
          globByDepth.set(path.length, partialMatcher);
        }
        const isPartialMatch = objectPathMatches(partialMatcher, currentPath);

        if (isPartialMatch) {
          traverse(obj[key], currentPath);
        }
      }
    }
  }

  traverse(obj, []);

  return result;
}

const objectPathMatches = (matcher: PathMatcher, pathParts: string[]) => {
  if (matcher.precheck && !matcher.precheck(pathParts)) {
    return false;
  }

  const path = pathParts.join("/");

  return matcher.check.test(path);
};

interface PathMatcher {
  check: RegExp;
  precheck?: (pathParts: string[]) => boolean;
  globParts: string[];
}
const toPathMatcher = (globParts: string[]): PathMatcher => {
  const pathGlob = globParts.join("/");

  // optimization: check if last glob part is a primitive value and add a precheck
  let precheck: PathMatcher["precheck"];

  const lastGlobPart = globParts[globParts.length - 1];
  const lastGlobPartIsPrimitive = !lastGlobPart.includes("*") && !lastGlobPart.includes("?");
  if (lastGlobPartIsPrimitive) {
    precheck = (pathParts: string[]) => pathParts[pathParts.length - 1] === lastGlobPart;
  }

  return {
    check: globToRegExp(pathGlob, { extended: true, globstar: true }),
    globParts,
    precheck,
  };
};
