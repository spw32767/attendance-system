import { describe, expect, it } from "vitest";
import { getFormStatus, isAnswerEmpty } from "../src/modules/admin/admin.data";

describe("isAnswerEmpty (drives required-field validation)", () => {
  it("treats blank/whitespace text as empty", () => {
    expect(isAnswerEmpty("short_text", "")).toBe(true);
    expect(isAnswerEmpty("short_text", "   ")).toBe(true);
    expect(isAnswerEmpty("long_text", "\n\t ")).toBe(true);
  });

  it("treats real text as filled", () => {
    expect(isAnswerEmpty("short_text", "hello")).toBe(false);
  });

  it("treats null/undefined as empty for any type", () => {
    expect(isAnswerEmpty("short_text", null)).toBe(true);
    expect(isAnswerEmpty("date", undefined)).toBe(true);
  });

  it("requires a non-empty array for checkboxes / file_upload", () => {
    expect(isAnswerEmpty("checkboxes", [])).toBe(true);
    expect(isAnswerEmpty("checkboxes", ["a"])).toBe(false);
    expect(isAnswerEmpty("file_upload", [])).toBe(true);
    expect(isAnswerEmpty("file_upload", "not-an-array")).toBe(true);
  });

  it("does not treat numeric 0 as empty (e.g. rating)", () => {
    expect(isAnswerEmpty("rating", 0)).toBe(false);
  });
});

describe("getFormStatus (controls whether a public form accepts submissions)", () => {
  const future = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const past = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  it("returns not_found when the form is missing", () => {
    expect(getFormStatus(null)).toBe("not_found");
  });

  it("returns closed for any non-published status", () => {
    expect(getFormStatus({ status: "draft" })).toBe("closed");
    expect(getFormStatus({ status: "closed" })).toBe("closed");
  });

  it("returns open for a published form within its window", () => {
    expect(getFormStatus({ status: "published" })).toBe("open");
    expect(getFormStatus({ status: "published", start_at: past, end_at: future })).toBe("open");
  });

  it("returns not_started before start_at and ended after end_at", () => {
    expect(getFormStatus({ status: "published", start_at: future })).toBe("not_started");
    expect(getFormStatus({ status: "published", end_at: past })).toBe("ended");
  });
});
