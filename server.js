import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {connectToDb} from './config/db.js';
import projectRoutes from './routes/projectRoutes.js';
import aboutRoutes from './routes/aboutRoutes.js';
import experienceRoutes from './routes/experienceRoutes.js';
import technologiesRoutes from './routes/technologiesRoutes.js';

dotenv.config();

const app = express();

app.use((req, res, next) => {
    res.setHeader('Permissions-Policy', 'accelerometer=(), ambient-light-sensor=(), autoplay=(), camera=(), encrypted-media=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), speaker=(), usb=(), vr=()');
    next();
});

app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
    console.error("MongoDB URI is missing from the environment variables.");
    process.exit(1);
}

connectToDb()
    .then(() => console.log('MongoDB connected successfully'))
    .catch((error) => {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    });

app.use('/api/projects', projectRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/technologies', technologiesRoutes);

app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(500).json({message: "Server error", error: err.message});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;