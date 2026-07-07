import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['candidate', 'recruiter', 'admin'],
      default: 'candidate'
    },
    resumeUrl: {
      type: String,
      default: ''
    },
    resumeText: {
      type: String,
      default: ''
    },
    recommendedRole: {
      type: String,
      enum: ['software_engineer', 'fullstack_developer', ''],
      default: ''
    },
    // NEW: Persists the calculated ATS Optimization Percentage Core Index
    atsScore: {
      type: Number,
      default: 0
    },
    // NEW: Stores granular strategic optimization points
    atsFeedback: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model('User', userSchema);
export default User;