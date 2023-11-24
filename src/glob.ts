const minimatch = require("minimatch");

export function globPaths(globPattern: string, obj: any): string[] {
  return glob(globPattern, obj, "path");
}

export function globValues(globPattern: string, obj: any): any[] {
  return glob(globPattern, obj, "value");
}

export function glob(globPattern: string, obj: any, mode: "path" | "value"): any[] {
  const objectPatchMatcher = toPathRegex(globPattern);
  
  const globPatternParts = globPattern.split(".");

  // cache partial matchers by depth
  const globByDepth = new Map();

  const result: any[] = [];

  function traverse(obj: any, path: string[]) {
    if (!obj) return result;

    for (const key of Object.keys(obj)) {
      const currentPath = [...path, key];
      const value = obj[key];
      if (objectPathMatches(objectPatchMatcher, currentPath)) {
        result.push(mode === "path" ? currentPath.join(".") : value);
      } else if (typeof value === "object" && value !== null) {
        // to avoid expensive string operations
        const globPatternAtDepth = globPatternParts.slice(0, currentPath.length);
        if (globPatternAtDepth.includes("**")) {
          // if the glob pattern contains the globstar **, we need to traverse all the way down
          traverse(value, currentPath);
          continue;
        }

        // don't traverse if the path doesn't match partially
        let partialMatcher = globByDepth.get(path.length);
        if (!partialMatcher) {
          partialMatcher = toPathRegex(globPatternAtDepth.join("."));
          globByDepth.set(path.length, partialMatcher);
        }
        const isPartialMatch = typeof partialMatcher !== "boolean" ? partialMatcher.test(currentPath.join("/")) : false;

        if (isPartialMatch) {
          traverse(value, currentPath);
        }
      }
    }
  }

  traverse(obj, []);

  return result;
}

const objectPathMatches = (pathGlob: RegExp | boolean, paths: string[]) => {
  const path = paths.join("/");

  return typeof pathGlob !== "boolean" ? pathGlob.test(path) : false;
};

const toPathRegex = (glob: string) => {
  const pathGlob = glob.split(".").join("/"); // replace all dots with slashes

  return minimatch.makeRe(pathGlob, { dot: true, noglobstar: false });
};
