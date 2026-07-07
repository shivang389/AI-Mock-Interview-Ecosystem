import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js'; 
import interviewRoutes from './routes/interview.routes.js';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://ai-mock-interview-ecosystem-p9eux08o9.vercel.app' 
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow server-to-server or Postman requests with no origin header
    if (!origin) return callback(null, true);
    
    // Check if the request is from a whitelisted origin or matches a Vercel deployment
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS configuration'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// 💡 EXPRESS 5 FIX: Use Regex /.*/ instead of string '*' to prevent path-to-regexp crash
app.options(/.*/, cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes Gateway
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/interview', interviewRoutes);

export default app;