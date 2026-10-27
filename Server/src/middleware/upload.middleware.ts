import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { env } from '../config/env';
import { Errors } from '../utils/response';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const MAX_BYTES = Number(env.MAX_FILE_SIZE_MB) * 1024 * 1024;

// Ensure upload directory exists
const uploadDir = path.resolve(env.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename(_req, file, cb) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext    = path.extname(file.originalname).toLowerCase();
    cb(null, `${unique}${ext}`);
  },
});

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(Errors.InvalidFileType() as unknown as null, false);
  }
}

function imageFileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void {
  if (ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(Errors.InvalidFileType() as unknown as null, false);
  }
}

export const kybUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_BYTES },
}).fields([
  { name: 'doc1', maxCount: 1 },  // Certificate of Incorporation
  { name: 'doc2', maxCount: 1 },  // Tax ID
  { name: 'doc3', maxCount: 1 },  // Owner ID
  { name: 'doc4', maxCount: 1 },  // Proof of address
]);

export const profileImageUpload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: MAX_BYTES },
});

/**
 * Helper to safely get uploaded files from req.files (multer fields)
 */
export function getUploadedFile(
  files: Express.Request['files'],
  field: string,
): Express.Multer.File | null {
  if (!files || Array.isArray(files)) return null;
  const fieldFiles = files[field];
  return fieldFiles?.[0] ?? null;
}
