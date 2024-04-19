import { Request } from "express";
import { existsSync, mkdirSync } from "fs";
import { FileFilterCallback, MulterError } from "multer";
import { join } from "path";

export const publicMulterDir = join(__dirname, "..", "/public/uploads");
export const privateMuterDir = join(__dirname, "..", "/private/uploads");

// Function to ensure directories exist
export function ensureDirectories() {
  if (!existsSync(publicMulterDir)) {
    mkdirSync(publicMulterDir, { recursive: true });
  }
  if (!existsSync(privateMuterDir)) {
    mkdirSync(privateMuterDir, { recursive: true });
  }
}

export const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const filetypes = {
    "image/jpeg": { maxSize: 5 * 1024 * 1024 }, // 5 MB
    "image/png": { maxSize: 5 * 1024 * 1024 }, // 5 MB
    "application/pdf": { maxSize: 10 * 1024 * 1024 }, // 10 MB
    "application/msword": { maxSize: 10 * 1024 * 1024 }, // DOC files
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxSize: 10 * 1024 * 1024,
    }, // DOCX files
  };
};
