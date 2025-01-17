import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import projectRoutes from './routes/projectRoutes.js';

dotenv.config();

const app = express();

app.use((req, res, next) => {
    res.setHeader('Permissions-Policy', 'accelerometer=(), ambient-light-sensor=(), autoplay=(), camera=(), encrypted-media=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), speaker=(), usb=(), vr=()');
    next();
});

app.use(cors());
app.use(express.json());

// MongoDB connection
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
    console.error("MongoDB URI is missing from the environment variables.");
    process.exit(1);
}

connectDB()
    .then(() => console.log('MongoDB connected successfully'))
    .catch((error) => {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    });

app.use('/api/projects', projectRoutes);

app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack);
    res.status(500).json({message: "Internal Server Error"});
});

export default app;