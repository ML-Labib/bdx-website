const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const firebaseAdmin = require('./config/firebase-admin');
// const { requireAuth } = require('./middleware/auth');
require('dotenv').config();

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
const tournamentRoutes = require('./routes/tournamentsRoutes');
app.use('/api/tournaments', tournamentRoutes);

const profileRoutes = require('./routes/pofileRoutes');
app.use('/api/profile', profileRoutes);

const teamRoutes = require('./routes/teamRoutes');
app.use('/api/teams', teamRoutes);


const invitationRoutes = require("./routes/invitationRoutes");
app.use("/api/invitations", invitationRoutes);

const notificationRoutes = require("./routes/notificationRoutes");
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

module.exports = app;