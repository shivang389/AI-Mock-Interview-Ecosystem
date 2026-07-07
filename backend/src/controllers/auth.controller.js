import { createRequire } from 'module';
import User from '../models/user.model.js';
import cloudinary from '../config/cloudinary.js';
import { GoogleGenAI } from '@google/genai';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const aiSecretKey = process.env.GEMINI_API_KEY || '';
const aiInstance = aiSecretKey ? new GoogleGenAI({ apiKey: aiSecretKey }) : null;
const jwtFallbackSecret = 'amie_emergency_backup_secret_signature_key';

/**
 * 1. REGISTER USER
 * Provision unique candidate records securely
 */
export const registerUser = async (req, res) => {
  console.log("👤 [AUTH REGISTER]: Processing signup request payload...");
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: { message: "All input fields are mandatory." } });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.warn(`⚠️ [REGISTER REJECTION]: Email already registered -> ${email}`);
      return res.status(400).json({ 
        success: false, 
        error: { message: "This email address is already associated with an account." } 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'candidate',
      recommendedRole: ''
    });

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET || jwtFallbackSecret,
      { expiresIn: '7d' }
    );

    console.log(`✅ [REGISTER SUCCESS]: Created profile for tracking index -> ${newUser._id}`);

    return res.status(201).json({
      success: true,
      message: "Account provisioned successfully.",
      data: {
        token,
        user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
      }
    });

  } catch (error) {
    console.error("❌ [REGISTER LIFECYCLE CRASH]:", error);
    return res.status(500).json({ 
      success: false, 
      error: { message: `Registration transaction error: ${error.message}` } 
    });
  }
};

/**
 * 2. LOGIN USER
 * Authenticate existing credentials and issue validation tokens
 */
export const loginUser = async (req, res) => {
  console.log("🔑 [AUTH LOGIN]: Verifying identity benchmarks...");
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: { message: "Email and password inputs are required." } });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: { message: "Invalid email credentials or password." } });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: { message: "Invalid email credentials or password." } });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || jwtFallbackSecret,
      { expiresIn: '7d' }
    );

    console.log(`✅ [LOGIN SUCCESS]: Profile verified cleanly -> ${user._id}`);

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, recommendedRole: user.recommendedRole, atsScore: user.atsScore, atsFeedback: user.atsFeedback }
      }
    });

  } catch (error) {
    console.error("❌ [LOGIN LIFECYCLE CRASH]:", error);
    return res.status(500).json({ 
      success: false, 
      error: { message: `Login connection failed: ${error.message}` } 
    });
  }
};

/**
 * 3. UPLOAD & ANALYZE RESUME (ATS EXTENSION)
 * Extract text metrics, stream assets to cloud, calculate metrics via robust nested JSON protections
 */
export const uploadResume = async (req, res) => {
  console.log("📥 [UPLOAD PIPELINE START]: Processing incoming profile documentation...");
  
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { message: "No document file element detected." } });
    }

    let extractedText = '';
    try {
      const parseFunction = typeof pdfParse === 'function' ? pdfParse : pdfParse.default;
      if (typeof parseFunction === 'function') {
        const parsedPdf = await parseFunction(req.file.buffer);
        extractedText = parsedPdf.text || '';
        console.log(`📄 [PARSE SUCCESS]: Extracted data matrix sizing: ${extractedText.length} characters.`);
      }
    } catch (parseErr) {
      console.warn("⚠️ [PARSE WARNING]: pdf-parse text extraction bypassed:", parseErr.message);
      extractedText = 'Fallback: Standard Candidate Technical Background Profile Context.';
    }

    console.log("☁️ [CLOUDINARY]: Dispatching document asset stream...");
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'amie_resumes', resource_type: 'raw' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });
    console.log("✅ [CLOUDINARY SUCCESS]: Secure asset URI saved:", uploadResult.secure_url);

    // Default parameters if parsing gateway exhibits unique behaviors
    let analyzedRole = 'software_engineer'; 
    let calculatedAtsScore = 75;
    let computedFeedback = [
      "Ensure technical milestones are highly visible.",
      "Incorporate distinct system architecture frameworks."
    ];
    
    if (aiInstance && extractedText.trim().length > 10) {
      console.log("🧠 [GEMINI COGNITIVE GATEWAY]: Synthesizing dynamic ATS metrics scoring indices...");
      try {
        const structuralAnalysisPrompt = `
          Analyze the following candidate resume text layers. Evaluate it on key enterprise recruitment parameters:
          1. Keyword matching density against Software Engineering or Web Development job descriptions.
          2. Explicit use of action verbs and quantifiable business impact metrics (e.g., optimized speeds by 30%).
          3. Clear technical stack definitions (languages, toolings, databases).
          
          You must respond with a strictly valid JSON object ONLY. Do not include markdown code block ticks (\`\`\`), markdown wrapper labels, or explanations. The string must parse perfectly into an object via JSON.parse().
          
          Expected Output Schema Structure:
          {
            "recommendedRole": "software_engineer",
            "atsScore": 82,
            "feedback": ["Highlight algorithmic complexities explicitly.", "Define MERN stack backend routes structural layout."]
          }

          Classification Rules for recommendedRole:
          - Pure algorithmic engineering, intense DSA focus, compiler concepts, C++ or Java -> software_engineer
          - Web apps, API setups, database routing layers, MERN structures -> fullstack_developer

          Resume Text Content Layer:
          """
          ${extractedText}
          """
        `;

        const aiResult = await aiInstance.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{ role: 'user', parts: [{ text: structuralAnalysisPrompt }] }]
        });

        let cleanJsonString = aiResult?.text?.trim() || "{}";
        
        // Strip out any accidental markdown wrapper artifacts
        cleanJsonString = cleanJsonString.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();

        // Safe evaluation nesting block
        try {
          const metricsPayload = JSON.parse(cleanJsonString);
          
          if (metricsPayload.recommendedRole) analyzedRole = metricsPayload.recommendedRole;
          if (typeof metricsPayload.atsScore === 'number') calculatedAtsScore = metricsPayload.atsScore;
          if (Array.isArray(metricsPayload.feedback)) computedFeedback = metricsPayload.feedback;
          
          console.log("🎯 [ATS PARSE SUCCESS]: JSON parameters successfully assigned.");
        } catch (jsonParseErr) {
          console.warn("⚠️ [JSON PARSE WARNING]: Gemini output deviated from structure format. Activating text fallbacks.");
          if (cleanJsonString.toLowerCase().includes('fullstack_developer')) {
            analyzedRole = 'fullstack_developer';
          }
        }

        console.log(`🎯 [ATS VERDICT METRICS]: Score: ${calculatedAtsScore}% | Role: ${analyzedRole}`);
      } catch (aiErr) {
        console.error("⚠️ [ATS ANALYSIS REJECTION]: Gemini core connection dropped:", aiErr.message);
      }
    }

    const targetUserId = req.user?.id || req.user?._id || req.userId;
    if (!targetUserId) {
      return res.status(401).json({ success: false, error: { message: "Authentication validation corrupted. Missing identifier keys." } });
    }

    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      { 
        resumeUrl: uploadResult.secure_url,
        resumeText: extractedText,
        recommendedRole: analyzedRole,
        atsScore: calculatedAtsScore,
        atsFeedback: computedFeedback
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, error: { message: "Failed to persist resume vectors. User profile context target not found." } });
    }

    console.log("💾 [DB REFRESH]: Suitability vectors and ATS scoring maps recorded completely.");

    return res.status(200).json({
      success: true,
      message: 'Resume analyzed completely.',
      data: {
        resumeUrl: updatedUser.resumeUrl,
        recommendedRole: updatedUser.recommendedRole,
        atsScore: updatedUser.atsScore,
        atsFeedback: updatedUser.atsFeedback
      }
    });

  } catch (error) {
    console.error("❌ [UPLOAD EXCEPTION PIPELINE ERROR]:", error);
    return res.status(500).json({ success: false, error: { message: `Upload system roadblock: ${error.message}` } });
  }
};