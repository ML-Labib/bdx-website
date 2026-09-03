import express from "express";
import cors from "cors";
import connectDB from './config/db.js';
import firebaseAdmin from './config/firebase-admin.js';
import 'dotenv/config';
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
// Dynamic CORS configuration
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'http://localhost:8080', // Backend server
  process.env.FRONTEND_URL
].filter(Boolean);

const isPrivateNetworkHost = (hostname) => {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
};

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    try {
      const url = new URL(origin);
      if (isPrivateNetworkHost(url.hostname)) {
        callback(null, true);
        return;
      }
    } catch {
      // fall through to rejection
    }

    if (process.env.NODE_ENV !== 'production') {
      callback(null, true);
      return;
    }

    callback(new Error('CORS restriction: Origin not allowed'));
  },
  credentials: true
}));
app.use(express.json());
// app.use(requireAuth);

// Connect to MongoDB
connectDB();

// Routes
import leaderboardRoutes from './routes/leaderboardRoutes.js';
app.use('/api/leaderboard', leaderboardRoutes);

import profileRoutes from './routes/profileRoutes.js';
app.use('/api/profile', profileRoutes);

import tornamentRoutes from './routes/tournamentsRoutes.js';
app.use('/api/tournaments', tornamentRoutes);


import teamRoutes from './routes/teamRoutes.js';
app.use('/api/teams', teamRoutes);

import invitationRoutes from './routes/invitationRoutes.js';
app.use("/api/invitations", invitationRoutes);

import notificationRoutes from './routes/notificationRoutes.js';
app.use("/api/notifications", notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

export default app;