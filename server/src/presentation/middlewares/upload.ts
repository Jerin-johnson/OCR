import multer from "multer";
import path from "path";
import type { Request } from "express";
import { env } from "@core/config/env.js";
import { BadRequestError } from "@domain/exceptions/index.js";

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, env.UPLOAD_DIR);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
//     cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
//   },
// });

// File filter - Only allow images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new BadRequestError("Only .jpg, .jpeg, .png, and .webp files are allowed!"));
  }
};

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: Number(env.MAX_FILE_SIZE), // 5MB from env
    files: 2, // Max 2 files per request
  },
  fileFilter: fileFilter,
});

// Middleware for Aadhaar (Front + Back)
export const uploadAadhaar = upload.fields([
  { name: "front", maxCount: 1 },
  { name: "back", maxCount: 1 },
]);

// Optional: Single file upload
export const uploadSingle = upload.single("image");

export default upload;
