import mongoose from 'mongoose';
import dotenv from 'dotenv';
import InterviewTemplate from '../models/template.model.js';

dotenv.config();

const templates = [
  {
    _id: new mongoose.Types.ObjectId('65f1a2b3c4d5e6f7a8b9c001'),
    title: 'Amazon SDE Mock Interview',
    roleType: 'Software Engineer',
    difficulty: 'Entry',
    topics: ['DSA', 'Complexity Analysis'],
    createdBy: new mongoose.Types.ObjectId('65f1a2b3c4d5e6f7a8b9c000') // Dummy Admin ID
  },
  {
    _id: new mongoose.Types.ObjectId('65f1a2b3c4d5e6f7a8b9c002'),
    title: 'Machine Learning Domain Assessment',
    roleType: 'ML Engineer',
    difficulty: 'Mid',
    topics: ['Neural Networks', 'Feature Scaling'],
    createdBy: new mongoose.Types.ObjectId('65f1a2b3c4d5e6f7a8b9c000')
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/amie_db');
    console.log('🔄 Connected to MongoDB for seeding data...');

    // Clear old versions of these templates to prevent duplicates
    await InterviewTemplate.deleteMany({
      _id: { $in: templates.map(t => t._id) }
    });

    // Insert the pristine templates
    await InterviewTemplate.insertMany(templates);
    console.log('✅ Placement templates seeded successfully into MongoDB!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();