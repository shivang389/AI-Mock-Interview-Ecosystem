import User from '../models/user.model.js';
import Interview from '../models/interview.model.js';
import { generateAdaptiveQuestion } from '../utils/ai.js';

/**
 * 1. START INTERVIEW SESSION
 * Initializes a track and creates a fresh tracking document index in MongoDB.
 */
export const startInterviewSession = async (req, res) => {
  console.log("🚀 [CONTROLLER START]: Received initial request to boot session.");
  
  try {
    const { trackId } = req.body;
    const userId = req.user?.id || req.user?._id || req.userId; 

    console.log(`📊 [PAYLOAD DATA]: User ID: ${userId} | Track: ${trackId}`);

    if (!userId) {
      console.warn("❌ [CONTROLLER REJECTION]: Missing user identification credentials.");
      return res.status(401).json({ success: false, error: { message: "Unauthorized profile context." } });
    }

    // Fetch user context layer
    console.log("🔍 [DB QUERY]: Fetching user profile parameters from MongoDB...");
    const user = await User.findById(userId);
    if (!user) {
      console.warn(`❌ [DB REJECTION]: No match found in collection for ID: ${userId}`);
      return res.status(404).json({ success: false, error: { message: "User profile context not found." } });
    }

    const resumeContext = user.resumeText || '';

    // Generate initial prompt based on the chosen track identifier
    console.log(`🧠 [AI INITIATION]: Booting prompt model matching for track: ${trackId}`);
    const initialQuestion = await generateAdaptiveQuestion(
      trackId || 'core-cs',
      [], 
      resumeContext
    );
    console.log("✅ [AI SUCCESS]: Question text layer generated smoothly.");

    // Create new interview tracking document record map inside collection
    console.log("💾 [DB WRITE]: Creating new interview session document tracking index...");
    const newSession = await Interview.create({
      userId,
      trackId,
      currentRound: 1,
      totalRounds: 10,
      conversationHistory: [
        { role: 'assistant', content: initialQuestion }
      ],
      status: 'active'
    });
    console.log(`✅ [DB WRITE SUCCESS]: Session document registered with ID: ${newSession._id}`);

    // Return complete initial parameters back to the client setup functions
    console.log("📦 [DISPATCH]: Sending complete JSON data back to frontend.");
    return res.status(201).json({
      success: true,
      data: {
        sessionId: newSession._id,
        currentRound: newSession.currentRound,
        totalRounds: newSession.totalRounds,
        nextQuestion: initialQuestion
      }
    });

  } catch (error) {
    console.error('❌ [CRITICAL CONTROLLER EXCEPTION ERROR]:', error);
    if (!res.headersSent) {
      return res.status(500).json({ 
        success: false, 
        error: { message: `Internal simulation server failure: ${error.message}` } 
      });
    }
  }
};

/**
 * 2. HANDLE INTERVIEW RESPONSE
 * Processes sequential candidate answers, evaluates parameters, 
 * and steps the round index tracker forward.
 */
export const handleInterviewResponse = async (req, res) => {
  console.log("📥 [RESPONSE CONTROLLER START]: Processing incoming candidate answer...");
  try {
    const { sessionId, answer } = req.body;

    if (!sessionId || !answer) {
      return res.status(400).json({ success: false, error: { message: "Session parameter or answer vector missing." } });
    }

    // Fetch active interview tracking record document
    console.log(`🔍 [DB QUERY]: Fetching interview session tracking ID -> ${sessionId}`);
    const interview = await Interview.findById(sessionId);
    
    if (!interview) {
      console.warn(`❌ [DB REJECTION]: Interview room session not found for ID: ${sessionId}`);
      return res.status(404).json({ success: false, error: { message: "Active interview room session context missing." } });
    }

    // Fetch user reference to retain resume metadata if available
    const user = await User.findById(interview.userId);
    const resumeText = user?.resumeText || '';

    // Append the user's new answer into the conversation history array locally
    interview.conversationHistory.push({ role: 'user', content: answer });

    // Determine session boundary lifecycle conditions (Stop at 5 rounds)
    if (interview.currentRound >= interview.totalRounds) {
      interview.status = 'completed';
      await interview.save();
      console.log("🏁 [SESSION LIFECYCLE COMPLETE]: Reached maximum evaluation curves.");
      
      return res.status(200).json({
        success: true,
        data: {
          status: 'completed',
          currentRound: interview.currentRound,
          totalRounds: interview.totalRounds,
          nextQuestion: "Assessment complete. Performance analytics metrics generated."
        }
      });
    }

    // Invoke AI generator using the explicit trackId metadata reference
    console.log(`🧠 [AI SUB-ROUTINE]: Generating question for round ${interview.currentRound + 1} on track: ${interview.trackId}`);
    const nextQuestion = await generateAdaptiveQuestion(
      interview.trackId || 'core-cs', 
      interview.conversationHistory,  
      resumeText
    );

    // Progress round indicators and save updated historical arrays to MongoDB
    interview.currentRound += 1;
    interview.conversationHistory.push({ role: 'assistant', content: nextQuestion });
    await interview.save();

    console.log("📦 [DISPATCH]: Sending next round parameters back to client wrapper.");
    return res.status(200).json({
      success: true,
      data: {
        status: 'active',
        sessionId: interview._id,
        currentRound: interview.currentRound,
        totalRounds: interview.totalRounds,
        nextQuestion: nextQuestion
      }
    });

  } catch (error) {
    console.error("❌ [RESPONSE LIFECYCLE CRASH]: Critical exception tripped ->", error);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: { message: `Server failed to analyze answer structure: ${error.message}` }
      });
    }
  }
};