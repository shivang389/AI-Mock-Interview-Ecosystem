import express from 'express';
import { registerUser, loginUser, uploadResume } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js'; // Synchronized with your actual middleware export
import { uploadMiddleware } from '../config/cloudinary.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// New Resume Upload Endpoint secured via verifyToken middleware context
router.post('/upload-resume', verifyToken, uploadMiddleware.single('resume'), uploadResume);

export default router;