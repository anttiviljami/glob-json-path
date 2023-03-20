import { globValues, globPaths } from "./glob";

describe("globValues", () => {
  it("should return matched values in an object by path", () => {
    expect(globValues("a", { a: 1, b: true, c: "3", d: [1, 2], f: { a: "b" } })).toEqual([1]);
    expect(globValues("b", { a: 1, b: true, c: "3", d: [1, 2], f: { a: "b" } })).toEqual([true]);
    expect(globValues("c", { a: 1, b: true, c: "3", d: [1, 2], f: { a: "b" } })).toEqual(["3"]);
    expect(globValues("d", { a: 1, b: true, c: "3", d: [1, 2], f: { a: "b" } })).toEqual([[1, 2]]);
    expect(globValues("f", { a: 1, b: true, c: "3", d: [1, 2], f: { a: "b" } })).toEqual([{ a: "b" }]);
  });

  it("should return matched values in an array by index", () => {
    expect(globValues("0", [1, true, "3", [1, 2], { a: "b" }])).toEqual([1]);
    expect(globValues("1", [1, true, "3", [1, 2], { a: "b" }])).toEqual([true]);
    expect(globValues("2", [1, true, "3", [1, 2], { a: "b" }])).toEqual(["3"]);
    expect(globValues("3", [1, true, "3", [1, 2], { a: "b" }])).toEqual([[1, 2]]);
    expect(globValues("4", [1, true, "3", [1, 2], { a: "b" }])).toEqual([{ a: "b" }]);
  });

  it("should return nested values by path", () => {
    expect(globValues("a", { a: "bc" })).toEqual(["bc"]);
    expect(globValues("a.b", { a: { b: 1 }, c: 2 })).toEqual([1]);
    expect(globValues("a.b.c", { a: { b: { c: "deeply nested" } }, c: 2 })).toEqual(["deeply nested"]);
  });

  it("should return matched object properties with wildcard", () => {
    expect(globValues("*", { a: 1, b: 2, c: 3 })).toEqual([1, 2, 3]);
  });

  it("should return matched array items with wildcard", () => {
    expect(globValues("*", [1, 2, 3])).toEqual([1, 2, 3]);
  });

  it("should return nested values with wildcard", () => {
    expect(globValues("a.*.d", { a: { b: { d: 1, f: 2 }, c: { d: 3, f: 4 } } })).toEqual([1, 3]);
    expect(globValues("a.*.f", { a: { b: { d: 1, f: 2 }, c: { d: 3, f: 4 } } })).toEqual([2, 4]);
    expect(globValues("a.b.*", { a: { b: { d: 1, f: 2 }, c: { d: 3, f: 4 } } })).toEqual([1, 2]);
    expect(globValues("a.c.*", { a: { b: { d: 1, f: 2 }, c: { d: 3, f: 4 } } })).toEqual([3, 4]);
  });

  it("should return deeply nested values with double wildcard", () => {
    expect(globValues("**.d", { a: { b: { d: 1, f: 2 }, c: { d: 3, f: 4 } } })).toEqual([1, 3]);
    expect(globValues("**.f", { a: { b: { d: 1, f: 2 }, c: { d: 3, f: 4 } } })).toEqual([2, 4]);
    expect(globValues("a.**.d", { a: { b: { d: 1, f: 2 }, c: { d: 3, f: { d: 4 } } } })).toEqual([1, 3, 4]);
    expect(globValues("z.**.f", { a: { b: { d: 1, f: 2 }, c: { d: 3, f: { d: 4 } } } })).toEqual([]);
  });

  it("should return values using wildcard attributes", () => {
    expect(globValues("a*", { ab: 7, ac: 8, ba: 9, bc: 10 })).toEqual([7, 8]);
    expect(globValues("b?", { ab: 7, ac: 8, ba: 9, bc: 10 })).toEqual([9, 10]);
  });
});

describe("globPaths", () => {
  it("should return matched object property names with wildcard", () => {
    expect(globPaths("*", { a: 1, b: 2, c: 3 })).toEqual(["a", "b", "c"]);
  });

  it("should return matched array indices with wildcard", () => {
    expect(globPaths("*", [1, 2, 3])).toEqual(["0", "1", "2"]);
  });

  it("should return nested values with wildcard", () => {
    expect(globPaths("a.*.d", { a: { b: { d: 1, f: 2 }, c: { d: 3, f: 4 } } })).toEqual(["a.b.d", "a.c.d"]);
    expect(globPaths("a.*.f", { a: { b: { d: 1, f: 2 }, c: { d: 3, f: 4 } } })).toEqual(["a.b.f", "a.c.f"]);
    expect(globPaths("a.b.*", { a: { b: { d: 1, f: 2 }, c: { d: 3, f: 4 } } })).toEqual(["a.b.d", "a.b.f"]);
    expect(globPaths("a.c.*", { a: { b: { d: 1, f: 2 }, c: { d: 3, f: 4 } } })).toEqual(["a.c.d", "a.c.f"]);
  });

  it("should return deeply nested values with double wildcard", () => {
    expect(globPaths("**.d", { a: { b: { d: 1, f: 2 }, c: { d: 3, f: 4 } } })).toEqual(["a.b.d", "a.c.d"]);
    expect(globPaths("**.f", { a: { b: { d: 1, f: 2 }, c: { d: 3, f: 4 } } })).toEqual(["a.b.f", "a.c.f"]);
    expect(globPaths("a.**.d", { a: { b: { d: 1, f: 2 }, c: { d: 3, f: { d: 4 } } } })).toEqual([
      "a.b.d",
      "a.c.d",
      "a.c.f.d",
    ]);
    expect(globPaths("z.**.f", { a: { b: { d: 1, f: 2 }, c: { d: 3, f: { d: 4 } } } })).toEqual([]);
  });

  it("should return values using wildcard attributes", () => {
    expect(globPaths("a*", { abc: 7, ab: 8, ba: 9, bc: 10 })).toEqual(["abc", "ab"]);
    expect(globPaths("b?", { abc: 7, ab: 8, ba: 9, bc: 10 })).toEqual(["ba", "bc"]);
  });
});
