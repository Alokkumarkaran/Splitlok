import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import connectDB from './config/db.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import groupRoutes from './routes/groupRoutes.js';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Create uploads folder if not exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Static folders
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/groups', groupRoutes); // Add this line

// ... existing imports (express, cors, etc.)
const PORT = process.env.PORT || 5000;

// Update your CORS to allow the Vercel URL
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173", // Use env var for security
  credentials: true
}));

// Listen on 0.0.0.0 for Render
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});