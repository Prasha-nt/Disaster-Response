import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { supabase } from './config/supabase.js';
import disasterRoutes from './routes/disasters.js';
import reportRoutes from './routes/reports.js';
import resourceRoutes from './routes/resources.js';
import socialMediaRoutes from './routes/socialMedia.js';
import geocodeRoutes from './routes/geocode.js';
import { setupRealTime } from './services/realTime.js';
import { errorHandler } from './middleware/errorHandler.js';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(cors({
  origin:true ,
  credentials: true
}));
app.use(express.json());
app.use(limiter);

// Setup real-time functionality
setupRealTime(io);

// Routes
app.use('/api/disasters', disasterRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/social-media', socialMediaRoutes);
app.use('/api/geocode', geocodeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.IO server active`);
  console.log(`🔄 Real-time monitoring enabled`);
});

export { io };