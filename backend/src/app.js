import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js'; 
import interviewRoutes from './routes/interview.routes.js'; // 1. Ensure this is imported!

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes Gateway
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/interview', interviewRoutes); // 2. Ensure this is explicitly mounted!

export default app;