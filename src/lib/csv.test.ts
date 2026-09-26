import { describe, it, expect } from "vitest";
import { buildCsv, escapeCsvCell } from "./csv";

describe("escapeCsvCell", () => {
  it("neutralises formula-leading characters", () => {
    for (const c of ["=1+1", "+1", "-1", "@SUM(A1)"]) expect(escapeCsvCell(c)).toBe(`'${c}`);
  });
  it("quotes commas, quotes and newlines", () => {
    expect(escapeCsvCell('a,"b"')).toBe('"a,""b"""');
    expect(escapeCsvCell("a\nb")).toBe('"a\nb"');
  });
  it("renders null as empty", () => {
    expect(escapeCsvCell(null)).toBe("");
  });
});

describe("buildCsv", () => {
  it("builds header and rows", () => {
    const csv = buildCsv([{ a: "x", b: 2 }], [
      { header: "A", value: (r) => r.a },
      { header: "B", value: (r) => r.b },
    ]);
    expect(csv).toBe("A,B\r\nx,2\r\n");
  });
});
