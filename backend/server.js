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

// ==========================================
// 1. SECURITY & MIDDLEWARE (Must be FIRST)
// ==========================================
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173", 
  credentials: true
}));

app.use(express.json()); // Allows your server to read JSON data

// ==========================================
// 2. FOLDER SETUP
// ==========================================
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// ==========================================
// 3. API ROUTES (Must come AFTER middleware)
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/groups', groupRoutes); 

// ==========================================
// 4. START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});