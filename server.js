import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {connectToDb} from './config/db.js';
import projectRoutes from './routes/projectRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
    console.error('MongoDB URI is missing from the environment variables.');
    process.exit(1); // Exit the app if Mongo URI is not set
}

// Ensure DB connection on startup
connectToDb()
    .then(() => console.log('MongoDB connected successfully'))
    .catch((error) => {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1); // Exit the app if connection fails
    });

// Routes setup
app.use('/api/projects', projectRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.stack);
    res.status(500).json({message: 'Internal Server Error'});
});

export default app;