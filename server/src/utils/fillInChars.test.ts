import fillInChars from "./fillInChars";

describe("Fill in chars", () => {
    it("Can fill blanks will char if in actual", () => {
        const actual = "test";
        const current = "_es_";
        const char = "t";
        const resp = fillInChars(actual, current, char);
        expect(resp).toBe(actual);
    });
});
