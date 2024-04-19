import multer from "multer";
import { extname } from "path";
import { fileFilter, privateMuterDir, publicMulterDir } from "./setup";

const getPublicStorage = () =>
  multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, publicMulterDir); // use the public directory path
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + "-" + Date.now() + extname(file.originalname));
    },
  });

const getPrivateStorage = () =>
  multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, privateMuterDir); // use the private directory path
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + "-" + Date.now() + extname(file.originalname));
    },
  });

// Multer upload objects
export const uploadPublic = multer({
  storage: getPublicStorage(),
  fileFilter: fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // General size limit (e.g., 20MB) as a fallback
});
export const uploadPrivate = multer({
  storage: getPrivateStorage(),
  fileFilter: fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // General size limit (e.g., 20MB) as a fallback
});
