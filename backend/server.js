import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { connectDB } from './configs/database.js';
import userRouter from './routes/user.route.js';
import zoneRouter from './routes/zone.route.js';
import cycleRouter from './routes/cycle.route.js';
import cardRouter from './routes/card.route.js';
import adminRouter from './routes/admin.route.js';

// Configurations
dotenv.config();

const app = express();
app.set('trust proxy', 1);
const port = process.env.PORT || 3000;
const __dirname = path.resolve();

// Security Middleware
app.use(helmet());
app.disable('x-powered-by');

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting (API-only)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  validate: { 
    trustProxy: true
  }
});
app.use('/api/', apiLimiter);

// API Routes
app.use('/api/user', userRouter);
app.use('/api/zone', zoneRouter);
app.use('/api/cycle', cycleRouter);
app.use('/api/card', cardRouter);
app.use('/api/admin', adminRouter);

// Serve frontend from same port
app.use(express.static(path.join(__dirname, 'frontend', 'dist')));

// Catch-all route for frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  connectDB().catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });
});