import { describe, expect, it } from "vitest";
import { formatFCFA } from "@shared/utils/format";

describe("formatFCFA", () => {
  it("formate un montant avec suffixe FCFA", () => {
    const s = formatFCFA(1500);
    expect(s).toContain("500");
    expect(s).toContain("FCFA");
  });
});
