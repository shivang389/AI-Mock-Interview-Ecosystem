import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const aiSecretKey = process.env.GEMINI_API_KEY || '';
let aiInstance = null;

try {
  if (aiSecretKey) {
    aiInstance = new GoogleGenAI({ apiKey: aiSecretKey });
  }
} catch (initErr) {
  console.error("❌ [AI INITIALIZATION ERROR]: Failed to seed class instance constructor:", initErr.message);
}

/**
 * Generates an adaptive technical question depending on the evaluation track chosen.
 * Enforces a strict 10-round structural flow and definitive grading system.
 */
export const generateAdaptiveQuestion = async (trackId, history = [], resumeText = '') => {
  try {
    if (!aiSecretKey || !aiInstance) {
      throw new Error("Missing valid GEMINI_API_KEY context layer. Ensure .env is loaded.");
    }

    // Determine exact round positioning (1 to 10)
    const currentRoundNumber = history.length + 1;

    // 1. EXTRACT PAST QUESTIONS TO ABSOLUTELY ACCUMULATE EXCLUSIONS
    const previousQuestions = history
      .map((msg, idx) => msg.question ? `Round ${idx + 1}: ${msg.question}` : null)
      .filter(Boolean)
      .join('\n');

    const hasHistory = previousQuestions.length > 0;

    // 2. DEFINE SYSTEM INSTRUCTION WITH EXPLICIT EVALUATION MATRIX
    let systemPrompt = `You are a Principal Technical Interviewer conducting a highly structured, rigorous 10-question technical screening for a B.Tech Software Engineering candidate.
    
    CURRENT PROGRESSION: Question ${currentRoundNumber} of 10.
    
    EVALUATION CRITERIA PER ROUND:
    - Assess precision, technical depth, and real-world implementation edge-cases.
    - If the candidate's prior answer is shallow, cross-examine it aggressively.
    - If their answer is strong, seamlessly pivot to a deeper architectural or sub-domain challenge.
    - Never break character. Do not provide conversational filler, congratulations, or answers.`;

    if (trackId === 'core-cs') {
      systemPrompt += `\n\nTRACK PROFILE: CORE COMPUTER SCIENCE FUNDAMENTALS
      You must systematically distribute questions across these 5 core pillars over the 10 rounds:
      1. Data Structures & Algorithms (DSA)
      2. Design & Analysis of Algorithms (DAA) [DP, Greedy, Complexities]
      3. Operating Systems (OS) [Concurrency, Memory Management, Process Control Blocks]
      4. Computer Networks (CN) [Protocol stacks, routing mechanics, network security]
      5. Database Management Systems (DBMS) [Concurrency Control, Transactions, Indexing structures]`;
    } else {
      systemPrompt += `\n\nTRACK PROFILE: RESUME & FULL-STACK / ML ARCHITECTURE
      Evaluate the candidate strictly against their technical milestones, stack selections, and project layouts.
      
      CANDIDATE RESUME SOURCE:
      """
      ${resumeText || 'No resume context found. Conduct a comprehensive full-stack system architecture and architectural bottleneck examination.'}
      """`;
    }

    // 3. HARD REPETITION GUARD AND TOPIC ROTATION
    if (hasHistory) {
      systemPrompt += `\n\nSTRICT BOUNDARY INTERDICTION:\nYou have already asked these questions:\n${previousQuestions}\n\nCRITICAL CONSTRAINTS:\n1. Do NOT ask anything similar to the above questions.\n2. You MUST pick a completely different technical sub-topic or domain for this question to ensure a broad evaluation.`;
    } else {
      const domains = ['Data Structures', 'Algorithms', 'Operating Systems', 'Computer Networks', 'DBMS Architecture'];
      const randomDomain = domains[Math.floor(Math.random() * domains.length)];
      systemPrompt += `\n\nThis is Question 1. Initialize the interview by introducing a deep problem-solving challenge from the [${randomDomain}] spectrum.`;
    }

    // 4. CHAT HISTORY RECONSTRUCTION WITH STRICT TURN 0 USER REQUIREMENT
    // Crucial: Gemini API throws a 400 Bad Request if turn 0 is NOT a 'user' role.
    const contents = [
      {
        role: 'user',
        parts: [{ text: `Begin the ${trackId === 'core-cs' ? 'Core Computer Science' : 'Resume Deep-Dive'} technical screening session.` }]
      }
    ];

    history.forEach((roundData, index) => {
      if (roundData.question) {
        contents.push({
          role: 'model',
          parts: [{ text: roundData.question }]
        });
      }
      
      const answerText = roundData.answer || '[No answer provided by candidate]';
      const isLastItem = index === history.length - 1;
      let userText = `Candidate Response: ${answerText}`;
      
      if (isLastItem) {
        userText += `\n\n[SYSTEM DIRECTIVE]: Analyze my response. Then formulate Question ${currentRoundNumber} of 10. Focus on a fresh topic area. Output ONLY the next question.`;
      }

      contents.push({
        role: 'user',
        parts: [{ text: userText }]
      });
    });

    // If we are on Round 1 (history is empty), make sure the starter prompt asks for Question 1
    if (history.length === 0) {
      contents[0].parts[0].text += `\n\n[SYSTEM DIRECTIVE]: Formulate Question 1 of 10 based on your system instructions. Output ONLY the question.`;
    }

    // 5. INITIATE GEMINI DISPATCH WITH SAFE TIMEOUT
    const apiCallPromise = aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.75, // Keeps output adaptive but anchored to strict guidelines
        maxOutputTokens: 500,
      }
    });

    // 10-second window prevents premature fallback drops on slower connections
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("GATEWAY_TIMEOUT")), 10000)
    );

    const response = await Promise.race([apiCallPromise, timeoutPromise]);

    if (response?.text) {
      return response.text.trim();
    }
    
    throw new Error("Empty execution payload matrix.");

  } catch (error) {
    // --- X-RAY DEBUGGER: PRINT RAW ERROR METADATA ---
    console.error("\n=================== 🛑 GEMINI API ERROR X-RAY 🛑 ===================");
    console.error("📌 Error Message:", error.message);
    console.error("📌 HTTP Status Code:", error.status || error.statusCode || "N/A (Local/Network)");
    console.error("📌 Error Details:", JSON.stringify(error.errorDetails || error, null, 2));
    console.error("====================================================================\n");

    console.warn("⚠️ [GRADED SYSTEM FALLBACK ACTIVATED]: Serving hardcoded fallback...");
  }
};