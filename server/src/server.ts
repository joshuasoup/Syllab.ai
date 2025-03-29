import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import syllabusRoutes from './routes/syllabusRoutes';
import chatRoutes from './routes/chatRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Routes that handle file uploads should come before body parsers
app.use('/api/syllabi', syllabusRoutes);

// Body parsers for other routes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Other routes
app.use('/api', chatRoutes);
app.use('/api', authRoutes);
app.use('/api', userRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
  const clientPort = 5173; // Updated to match your actual client port (Vite default)
  const serverUrl = `http://localhost:${port}`;
  const clientUrl = `http://localhost:${clientPort}`;
  
  console.log(`Server URL: ${serverUrl}`);
  // For terminals that support hyperlinks
  console.log(`\nOpen client: \x1b[34m\x1b[4m${clientUrl}\x1b[0m`);
});
