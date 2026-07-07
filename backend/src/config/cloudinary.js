import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import 'dotenv/config';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Store file as a buffer in memory temporarily before streaming to Cloudinary
const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Cap files at 5MB maximum
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Invalid document format. Please upload a PDF file.'), false);
    }
  }
});

export default cloudinary;