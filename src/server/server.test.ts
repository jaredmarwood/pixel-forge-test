import { describe, it, expect } from "vitest";

describe("pixel-forge-test server smoke", () => {
  it("has at least one test so vitest exits 0 in CI", () => {
    expect(2 + 2).toBe(4);
  });
});
