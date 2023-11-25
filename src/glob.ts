import * as minimatch from "minimatch";

export interface GlobOptions {
  /**
   * Safe mode is slower but prevents infinite recursions on circular references
   *
   * @default false
   */
  safeMode?: boolean;
}

/**
 * Glob for matching dot-notated paths in an object
 */
export function globPaths(
  /**
   * The glob pattern to use for matching
   */
  globPattern: string,
  /**
   * The object to search for matches
   */
  obj: any,
  /**
   * Additional options for globbing
   */
  opts: GlobOptions = {}
): string[] {
  return glob(globPattern, obj, "path", opts);
}

/**
 * Glob for matching values in an object
 */
export function globValues(
  /**
   * The glob pattern to use for matching
   */
  globPattern: string,
  /**
   * The object to search for matches
   */
  obj: any,
  /**
   * Additional options for globbing
   */
  opts: GlobOptions = {}
): any[] {
  return glob(globPattern, obj, "value", opts);
}

/**
 * Glob for matching paths or values in an object
 */
export function glob(
  /**
   * The glob pattern to use for matching
   */
  globPattern: string,
  /**
   * The object to search for matches
   */
  obj: any,
  /**
   * Whether to return the matched paths or values
   */
  mode: "path" | "value",
  /**
   * Additional options for globbing
   */
  opts: GlobOptions = {}
): any[] {
  const globPatternParts = globPattern.split(".");

  // cache partial matchers by depth
  let depthMatchers = globCache.get(globPattern);
  if (!depthMatchers) {
    depthMatchers = new Map();
    globCache.set(globPattern, depthMatchers);
  }

  // store the matcher for the full length glob pattern
  let objectPatchMatcher: PathMatcher = depthMatchers.get(globPatternParts.length);
  if (!objectPatchMatcher) {
    objectPatchMatcher = buildPathMatcher(globPatternParts);
    depthMatchers.set(globPatternParts.length, objectPatchMatcher);
  }

  // accumulate results
  const result: any[] = [];

  // safe mode: track visited nodes to avoid infinite recursion
  const visitedNodes = opts.safeMode ? new WeakSet() : null;

  // check for glob star depth
  const globStarDepth = globPatternParts.indexOf("**");

  function traverse(obj: any, path: string, depth: number) {
    if (!obj) return result;

    for (const key in obj) {
      const currentPath = path ? path + "." + key : key;

      // optimization:
      const matchIsPossible =
        globStarDepth === -1
          ? // with no globstar: we must be at the end of the glob pattern
            depth === globPatternParts.length - 1
          : // with globstar: depth must be greater than or equal to globstar depth
            depth >= globStarDepth;

      if (matchIsPossible && objectPathMatches(objectPatchMatcher, currentPath)) {
        result.push(mode === "path" ? currentPath : obj[key]);
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        // avoid infinite recursion
        if (opts.safeMode && visitedNodes!.has(obj)) return;
        opts.safeMode && visitedNodes!.add(obj);

        // if the glob pattern contains the globstar **, we need to traverse all the way down from here
        if (globStarDepth !== -1 && depth >= globStarDepth) {
          traverse(obj[key], currentPath, depth + 1);
          continue;
        }

        // don't traverse if the path doesn't match partially
        let partialMatcher = depthMatchers.get(Math.min(depth, globPatternParts.length));
        if (!partialMatcher) {
          partialMatcher = buildPathMatcher(globPatternParts.slice(0, depth + 1));
          depthMatchers.set(depth, partialMatcher);
        }
        const isPartialMatch = objectPathMatches(partialMatcher, currentPath);

        if (isPartialMatch) {
          traverse(obj[key], currentPath, depth + 1);
        }
      }
    }
  }

  traverse(obj, "", 0);

  return result;
}

const objectPathMatches = (matcher: PathMatcher, path: string) => {
  // use precheck if available to skip unnecessary regex checks
  if (matcher.precheck && !matcher.precheck(path)) {
    return false;
  }

  return typeof matcher.check !== "boolean" ? matcher.check.test(path) : false;
};

interface PathMatcher {
  check: minimatch.MMRegExp | false;
  precheck?: (path: string) => boolean;
  globParts: string[];
}
const buildPathMatcher = (globParts: string[]): PathMatcher => {
  const pathGlob = globParts.join(".");

  // optimization: check if last glob part is a primitive value and add a precheck
  let precheck: PathMatcher["precheck"];

  const lastGlobPart = globParts[globParts.length - 1];

  const lastGlobPartIsPrimitive = !lastGlobPart.includes("*") && !lastGlobPart.includes("?");
  if (lastGlobPartIsPrimitive) {
    precheck = (path: string) => path.endsWith(lastGlobPart);
  }

  return {
    check: minimatch.makeRe(pathGlob, { dot: true, noglobstar: false }),
    globParts,
    precheck,
  };
};

// cache matchers by glob pattern
const globCache = new Map();
