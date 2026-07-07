// Pre-loads environment variables during the module resolution phase
import 'dotenv/config'; 

import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to database before processing external web server interactions
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`📡 AMIE Server listening efficiently on port ${PORT}`);
  });
};

startServer();