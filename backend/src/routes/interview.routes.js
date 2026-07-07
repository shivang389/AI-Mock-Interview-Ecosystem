import { Router } from 'express';
import { startInterviewSession, handleInterviewResponse } from '../controllers/interview.controller.js';
import { getInterviewEvaluation } from '../controllers/evaluation.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

console.log("🛣️  [ROUTES ENGINE]: Registering interview endpoint protocols...");

/**
 * 1. START INTERVIEW SESSION
 * Endpoint: POST /api/v1/interview/start
 */
router.post('/start', verifyToken, startInterviewSession);

/**
 * 2. SUBMIT ROUND ANSWER
 * Endpoint: POST /api/v1/interview/respond
 */
router.post('/respond', verifyToken, handleInterviewResponse);

/**
 * 3. RETRIEVE METRICS PERFORMANCE REPORT
 * Endpoint: GET /api/v1/interview/evaluation/:sessionId
 */
router.get('/evaluation/:sessionId', verifyToken, getInterviewEvaluation);

// ----------------------------------------------------------------------------------
// CRITICAL FIX: Explicitly export the router instance to align with App.jsx imports
// ----------------------------------------------------------------------------------
export default router;