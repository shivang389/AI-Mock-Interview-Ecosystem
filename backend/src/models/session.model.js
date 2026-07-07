import mongoose from 'mongoose';

// Subdocument for parsed metrics returned by the AI pipeline
const evaluationSchema = new mongoose.Schema(
  {
    score: { type: Number, min: 1, max: 10 },
    feedback: { type: String },
    technicalCorrectness: { type: String },
    communicationClarity: { type: String },
  },
  { _id: false } // Prevents Mongoose from spinning up internal sub-ObjectIDs
);

// Subdocument tracking active conversational history
const qaItemSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    questionText: { type: String, required: true },
    candidateAnswer: { type: String },
    evaluation: { type: evaluationSchema },
    generatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const interviewSessionSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewTemplate',
      required: true,
    },
    status: {
      type: String,
      enum: ['initialized', 'active', 'evaluating', 'completed'],
      default: 'initialized',
    },
    qaPairs: [qaItemSchema], // Tracks conversational flow in a single array
    currentRound: {
      type: Number,
      default: 1,
    },
  },
  { 
    timestamps: true 
  }
);

// High-Performance Compound Index for fetching active user history or dashboards
interviewSessionSchema.index({ candidateId: 1, status: 1 });

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);
export default InterviewSession;