import fs from 'node:fs';
import path from 'node:path';
import multer, { type FileFilterCallback } from 'multer';
import type { Request } from 'express';

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const MAX_BANNER_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const ensureDir = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const getUploadRoot = (): string => path.resolve(process.cwd(), 'public', 'uploads', 'users');

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(new Error('Invalid file type. Allowed types: jpg, png, webp'));
    return;
  }

  cb(null, true);
};

const createStorage = (folder: 'avatar' | 'banner') =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      const destinationDir = path.join(getUploadRoot(), folder);
      ensureDir(destinationDir);
      cb(null, destinationDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, name);
    },
  });

export const avatarUpload = multer({
  storage: createStorage('avatar'),
  fileFilter,
  limits: { fileSize: MAX_AVATAR_SIZE },
});

export const bannerUpload = multer({
  storage: createStorage('banner'),
  fileFilter,
  limits: { fileSize: MAX_BANNER_SIZE },
});
