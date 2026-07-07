import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // FIX: Must match 'trackId' exactly to avoid validation mapping exceptions
    trackId: {
      type: String,
      required: true,
      default: 'core-cs'
    },
    currentRound: {
      type: Number,
      required: true,
      default: 1
    },
    totalRounds: {
      type: Number,
      required: true,
      default: 5
    },
    conversationHistory: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant', 'system'],
          required: true
        },
        content: {
          type: String,
          required: true
        },
        timestamp: {
          type: Date,
          default: Date.now
        }
      }
    ],
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;