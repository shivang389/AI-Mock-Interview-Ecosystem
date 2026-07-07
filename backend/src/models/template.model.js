import mongoose from 'mongoose';

const interviewTemplateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    roleType: {
      type: String,
      required: true,
      index: true, // Speeds up search filtering when users select targeted roles
    },
    difficulty: {
      type: String,
      enum: ['Entry', 'Mid', 'Senior'],
      required: true,
    },
    topics: [{ 
      type: String 
    }], // e.g., ['DSA', 'System Design', 'Behavioral']
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { 
    timestamps: true 
  }
);

const InterviewTemplate = mongoose.model('InterviewTemplate', interviewTemplateSchema);
export default InterviewTemplate;