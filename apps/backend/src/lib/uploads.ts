/**
 * Local-disk storage for form file_upload field uploads.
 *
 * Files land under apps/backend/uploads/forms/<public_path>/<sub_code>/.
 * Path is gitignored. Filenames are sanitized + prefixed with a timestamp
 * to avoid collisions when the same person uploads same-named files twice.
 *
 * Per-field limits come from form_fields.settings_json:
 *   max_file_size_mb     (default 10)
 *   max_file_count       (default 1)
 *   allowed_file_types   (comma-separated extensions, default 'pdf,jpg,jpeg,png')
 */
import { promises as fs } from "node:fs";
import * as path from "node:path";

export const UPLOADS_ROOT = path.resolve(process.cwd(), "uploads");
const FORMS_DIR = "forms";

export type StagedFile = {
  originalName: string;
  buffer: Buffer;
  mimetype: string;
  size: number;
};

export type StoredFile = {
  originalName: string;
  storedName: string;
  storagePath: string; // relative to UPLOADS_ROOT
  extension: string | null;
  size: number;
};

const MAX_FILENAME_LEN = 120;
const DEFAULT_ALLOWED = "pdf,jpg,jpeg,png";

const sanitizeFilenameSegment = (input: string): string => {
  const trimmed = input.replace(/\\/g, "/").split("/").pop() || "file";
  // Allow safe ascii + Thai characters; replace the rest with _.
  return trimmed
    .replace(/[^A-Za-z0-9._\-฀-๿]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, MAX_FILENAME_LEN) || "file";
};

const getExtension = (name: string): string | null => {
  const idx = name.lastIndexOf(".");
  if (idx <= 0) {
    return null;
  }
  const ext = name.slice(idx + 1).toLowerCase();
  return /^[a-z0-9]+$/.test(ext) ? ext : null;
};

const parseAllowedTypes = (raw: unknown): Set<string> => {
  const value = typeof raw === "string" && raw.trim() ? raw : DEFAULT_ALLOWED;
  return new Set(
    value
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
};

export type FileValidationError =
  | { reason: "too_many_files"; max: number }
  | { reason: "file_too_large"; maxMb: number; filename: string }
  | { reason: "disallowed_type"; filename: string; extension: string | null };

export const validateStagedFiles = (
  files: StagedFile[],
  settings: Record<string, unknown> = {}
): FileValidationError | null => {
  const maxCount = Math.max(1, Math.min(Number(settings.max_file_count) || 1, 10));
  const maxSizeMb = Math.max(1, Math.min(Number(settings.max_file_size_mb) || 10, 50));
  const maxBytes = maxSizeMb * 1024 * 1024;
  const allowed = parseAllowedTypes(settings.allowed_file_types);

  if (files.length > maxCount) {
    return { reason: "too_many_files", max: maxCount };
  }
  for (const file of files) {
    if (file.size > maxBytes) {
      return { reason: "file_too_large", maxMb: maxSizeMb, filename: file.originalName };
    }
    const ext = getExtension(file.originalName);
    if (!ext || !allowed.has(ext)) {
      return { reason: "disallowed_type", filename: file.originalName, extension: ext };
    }
  }
  return null;
};

const formatFileError = (err: FileValidationError): string => {
  if (err.reason === "too_many_files") {
    return `อัปโหลดได้ไม่เกิน ${err.max} ไฟล์`;
  }
  if (err.reason === "file_too_large") {
    return `ไฟล์ "${err.filename}" เกิน ${err.maxMb}MB`;
  }
  return `ไฟล์ "${err.filename}" เป็นชนิดที่ไม่อนุญาต`;
};

export const validateAndFormatFileError = (
  files: StagedFile[],
  settings: Record<string, unknown> = {}
): string | null => {
  const err = validateStagedFiles(files, settings);
  return err ? formatFileError(err) : null;
};

/**
 * Persist staged files to disk under `forms/<publicPath>/<subCode>/`.
 * Resolves to the metadata to record in entry_submission_files.
 */
export const writeFilesForSubmission = async (
  publicPath: string,
  subCode: string,
  files: StagedFile[]
): Promise<StoredFile[]> => {
  const safePublicPath = sanitizeFilenameSegment(publicPath);
  const safeSubCode = sanitizeFilenameSegment(subCode);
  const dir = path.join(UPLOADS_ROOT, FORMS_DIR, safePublicPath, safeSubCode);
  await fs.mkdir(dir, { recursive: true });

  const stored: StoredFile[] = [];
  const now = Date.now();
  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    const safeOriginal = sanitizeFilenameSegment(file.originalName);
    const storedName = `${now}_${i + 1}_${safeOriginal}`;
    const fullPath = path.join(dir, storedName);
    await fs.writeFile(fullPath, file.buffer);
    stored.push({
      originalName: file.originalName.slice(0, 255),
      storedName,
      storagePath: path
        .join(FORMS_DIR, safePublicPath, safeSubCode, storedName)
        .replace(/\\/g, "/"),
      extension: getExtension(file.originalName),
      size: file.size
    });
  }
  return stored;
};

/** Read a stored file back. Returns null if missing on disk. */
export const readStoredFile = async (
  storagePath: string
): Promise<Buffer | null> => {
  // Defence-in-depth: path traversal check.
  const safe = path.normalize(storagePath);
  if (safe.startsWith("..") || path.isAbsolute(safe)) {
    return null;
  }
  const full = path.join(UPLOADS_ROOT, safe);
  try {
    return await fs.readFile(full);
  } catch {
    return null;
  }
};
