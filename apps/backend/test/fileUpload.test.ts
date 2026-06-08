import { describe, expect, it } from "vitest";
import { validateStagedFiles, type StagedFile } from "../src/lib/uploads";

const stage = (name: string, sizeBytes: number): StagedFile => ({
  originalName: name,
  buffer: Buffer.alloc(0),
  mimetype: "application/octet-stream",
  size: sizeBytes
});

describe("validateStagedFiles", () => {
  it("accepts a single allowed file within size (happy path)", () => {
    const files = [stage("resume.pdf", 2 * 1024 * 1024)];
    expect(validateStagedFiles(files)).toBeNull();
  });

  it("accepts up to max_file_count files", () => {
    const files = [stage("a.png", 1000), stage("b.jpg", 1000)];
    expect(validateStagedFiles(files, { max_file_count: 2 })).toBeNull();
  });

  it("rejects more files than allowed", () => {
    const files = [stage("a.pdf", 10), stage("b.pdf", 10)];
    expect(validateStagedFiles(files, { max_file_count: 1 })).toEqual({
      reason: "too_many_files",
      max: 1
    });
  });

  it("rejects a file over the size limit", () => {
    const files = [stage("big.pdf", 11 * 1024 * 1024)];
    const result = validateStagedFiles(files, { max_file_size_mb: 10 });
    expect(result?.reason).toBe("file_too_large");
  });

  it("rejects a disallowed extension", () => {
    const files = [stage("malware.exe", 10)];
    const result = validateStagedFiles(files, { allowed_file_types: "pdf,png" });
    expect(result).toMatchObject({ reason: "disallowed_type", extension: "exe" });
  });

  it("rejects a file with no extension", () => {
    const files = [stage("noext", 10)];
    const result = validateStagedFiles(files);
    expect(result?.reason).toBe("disallowed_type");
  });
});
