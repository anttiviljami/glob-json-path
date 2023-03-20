// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

const regExpEscapeChars = ["!", "$", "(", ")", "*", "+", ".", "=", "?", "[", "\\", "^", "{", "|"];

/** Convert a glob string to a regular expression.
 *
 * Tries to match bash glob expansion as closely as possible.
 *
 * Basic glob syntax:
 * - `*` - Matches everything without leaving the path segment.
 * - `?` - Matches any single character.
 * - `\` - Escapes the next character
 *
 * Globstar syntax:
 * - `**` - Matches any number of any path segments.
 *     - Must comprise its entire path segment in the provided glob.
 * - See https://www.linuxjournal.com/content/globstar-new-bash-globbing-option.
 *
 * Note the following properties:
 * - The generated `RegExp` is anchored at both start and end.
 * - Repeating and trailing separators are tolerated. Trailing separators in the
 *   provided glob have no meaning and are discarded.
 * - Absolute globs will only match absolute paths, etc.
 * - Empty globs will match nothing.
 * - Any special glob syntax must be contained to one path segment. For example,
 *   `?(foo|bar/baz)` is invalid. The separator will take precedence and the
 *   first segment ends with an unclosed group.
 */
export function globToRegExp(glob: string): RegExp {
  if (glob == "") {
    return /(?!)/;
  }

  const sep = ".+";
  const sepMaybe = ".*";
  const seps = ["."];
  const globstar = "(?:[^.]*(?:.|$)+)*";
  const wildcard = "[^.]*";
  const escapePrefix = "\\";

  let regExpString = "";

  // Terminates correctly. Trust that `j` is incremented every iteration.
  for (let j = 0; j < glob.length; ) {
    let segment = "";
    const groupStack: string[] = [];
    let inEscape = false;
    let endsWithSep = false;
    let i = j;

    // Terminates with `i` at the non-inclusive end of the current segment.
    for (; i < glob.length && !seps.includes(glob[i]); i++) {
      if (inEscape) {
        inEscape = false;
        segment += regExpEscapeChars.includes(glob[i]) ? `\\${glob[i]}` : glob[i];
        continue;
      }

      if (glob[i] == escapePrefix) {
        inEscape = true;
        continue;
      }

      if (glob[i] == "?") {
        segment += ".";
        continue;
      }

      if (glob[i] == "*") {
        const prevChar = glob[i - 1];
        let numStars = 1;
        while (glob[i + 1] == "*") {
          i++;
          numStars++;
        }
        const nextChar = glob[i + 1];
        if (numStars == 2 && [...seps, undefined].includes(prevChar) && [...seps, undefined].includes(nextChar)) {
          segment += globstar;
          endsWithSep = true;
        } else {
          segment += wildcard;
        }
        continue;
      }

      segment += regExpEscapeChars.includes(glob[i]) ? `\\${glob[i]}` : glob[i];
    }

    // Check for unclosed groups or a dangling backslash.
    if (groupStack.length > 0 || inEscape) {
      // Parse failure. Take all characters from this segment literally.
      segment = "";
      // @ts-ignore
      for (const c of glob.slice(j, i)) {
        segment += regExpEscapeChars.includes(c) ? `\\${c}` : c;
        endsWithSep = false;
      }
    }

    regExpString += segment;
    if (!endsWithSep) {
      regExpString += i < glob.length ? sep : sepMaybe;
      endsWithSep = true;
    }

    // Terminates with `i` at the start of the next segment.
    while (seps.includes(glob[i])) i++;

    // Check that the next value of `j` is indeed higher than the current value.
    if (!(i > j)) {
      throw new Error("Assertion failure: i > j (potential infinite loop)");
    }
    j = i;
  }

  return new RegExp(`^${regExpString}$`);
}
