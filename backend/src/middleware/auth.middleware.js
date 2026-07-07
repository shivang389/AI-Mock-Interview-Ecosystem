import jwt from 'jsonwebtoken';

const jwtFallbackSecret = 'amie_emergency_backup_secret_signature_key';

/**
 * Express Middleware to intercept incoming route traffic,
 * decode JWT authorization payload structures, and enforce authentication gates.
 */
export const verifyToken = (req, res, next) => {
  console.log("🔒 [AUTH MIDDLEWARE]: Intercepting incoming request context signature...");
  
  try {
    // 1. Extract bearer token from headers
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn("❌ [AUTH MIDDLEWARE REJECTION]: Missing or unformatted Authorization bearer token.");
      return res.status(401).json({ 
        success: false, 
        error: { message: "Access denied. Authentication token missing or invalid." } 
      });
    }

    const token = authHeader.split(' ')[1];

    // 2. Decode and verify the cryptographic signature structure
    const secretKey = process.env.JWT_SECRET || jwtFallbackSecret;
    const decoded = jwt.verify(token, secretKey);

    console.log("✅ [AUTH MIDDLEWARE SUCCESS]: Token verified cleanly. Decoded parameters:", decoded);

    /**
     * 3. CRITICAL ALIGNMENT MATRIX FIX:
     * We map the user identifier explicitly into all common variations.
     * This guarantees that req.user.id, req.user._id, and req.userId are populated 
     * simultaneously, removing all controller-level undefined errors.
     */
    req.userId = decoded.id;
    req.user = {
      id: decoded.id,
      _id: decoded.id,
      role: decoded.role
    };

    // Move along cleanly to your controller execution layer
    return next();

  } catch (error) {
    console.error("❌ [AUTH MIDDLEWARE EXCEPTION]: Token verification failed ->", error.message);
    
    let userMessage = "Session expired or authentication signature corrupted.";
    if (error.name === 'TokenExpiredError') {
      userMessage = "Your active login session has expired. Please sign out and sign in again.";
    }

    return res.status(403).json({ 
      success: false, 
      error: { message: userMessage } 
    });
  }
};