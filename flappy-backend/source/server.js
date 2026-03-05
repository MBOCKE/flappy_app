require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const scoreRoutes = require('./routes/score.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Flappy backend running' });
});

const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    // Also allow localhost and live server for development
    const allowedOrigins = [
      'https://flappy-frontend.onrender.com',
      'http://localhost:3000',
      'http://localhost:5500',
      'http://127.0.0.1:5500',
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type',
    'Accept',
    'Authorization'
  ],
  credentials: true,
};
app.use(cors(corsOptions));

// Mount routes
app.use('/api', authRoutes);         // /api/register, /api/login, /api/me
app.use('/api', scoreRoutes);        // /api/score
app.use('/api', leaderboardRoutes);  // /api/leaderboard

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
