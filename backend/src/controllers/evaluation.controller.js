import Interview from '../models/interview.model.js';
import { GoogleGenAI } from '@google/genai';

const aiSecretKey = process.env.GEMINI_API_KEY || '';
const aiInstance = aiSecretKey ? new GoogleGenAI({ apiKey: aiSecretKey }) : null;

export const getInterviewEvaluation = async (req, res) => {
  console.log("📊 [EVALUATION CONTROLLER]: Initiating score synthesis pipeline...");
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ success: false, error: { message: "Session ID parameter is required." } });
    }

    // 1. Fetch the completed interview history from MongoDB
    const interview = await Interview.findById(sessionId);
    if (!interview) {
      return res.status(404).json({ success: false, error: { message: "Interview session not found." } });
    }

    // 2. Feed the transcript to Gemini to compute granular placement scores
    let feedbackPayload = {
      overallScore: 70,
      technicalAccuracy: 70,
      communicationSkills: 75,
      problemSolving: 65,
      strengths: ["Demonstrated clear core awareness."],
      weaknesses: ["Needs deeper runtime complexity optimization analysis."]
    };

    if (aiInstance && interview.conversationHistory.length > 0) {
      try {
        const evaluationPrompt = `
          You are an expert technical interviewer compiling a performance scorecard for a candidate.
          Analyze this back-and-forth interview transcript history:
          
          Transcript Log:
          ${JSON.stringify(interview.conversationHistory)}

          Evaluate their performance and respond with a strictly valid JSON object ONLY. 
          Do not include markdown ticks (\`\`\`), labels, or explanations. 

          Expected Output JSON Schema Structure:
          {
            "overallScore": integer between 0 and 100,
            "technicalAccuracy": integer between 0 and 100,
            "communicationSkills": integer between 0 and 100,
            "problemSolving": integer between 0 and 100,
            "strengths": ["bullet point 1", "bullet point 2"],
            "weaknesses": ["bullet point 1", "bullet point 2"]
          }
        `;

        const aiResult = await aiInstance.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{ role: 'user', parts: [{ text: evaluationPrompt }] }]
        });

        let cleanJson = aiResult?.text?.trim() || "{}";
        
        // Cleaned and closed regular expression replacements
        cleanJson = cleanJson.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
        
        feedbackPayload = JSON.parse(cleanJson);
      } catch (aiErr) {
        console.warn("⚠️ [AI EVALUATION WARN]: Falling back to standard scorecard curves ->", aiErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      data: feedbackPayload
    });

  } catch (error) {
    console.error("❌ [EVALUATION CRASH]:", error);
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
};