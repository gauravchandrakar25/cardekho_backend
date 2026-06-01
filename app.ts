import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import router from './routes/routes';

// Load environment configurations
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Enable Cross-Origin Resource Sharing for Frontend App (NextJS default: http://localhost:3000)
app.use(cors({
  origin: '*', // open during local development for easy verification
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsing Middleware
app.use(express.json());

// Log incoming REST requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] 📢 ${req.method} ${req.url}`);
  next();
});

// Configure API Router
app.use('/api', router);

// Default Route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Cardekho AI Shortlist Builder Backend Server',
    endpoints: {
      health: '/api/health',
      cars: '/api/cars',
      recommend: '/api/recommend [POST]'
    }
  });
});

// Boot the Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Cardekho AI Shortlist Backend online!`);
  console.log(`⚡ Listening at http://localhost:${PORT}`);
  console.log(`📁 Local Health Check: http://localhost:${PORT}/api/health`);
  console.log(`==================================================`);
});
