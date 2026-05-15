import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { connectToDb } from './config/db.js';
import projectRoutes from './routes/projectRoutes.js';
import aboutRoutes from './routes/aboutRoutes.js';
import experienceRoutes from './routes/experienceRoutes.js';
import technologiesRoutes from './routes/technologiesRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import pluginRoutes from './routes/pluginRoutes.js';
import appRoutes from './routes/appRoutes.js';
import authRoutes from './routes/authRoutes.js';
import techStackRoutes from './routes/techStackRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import homelabRoutes from './routes/homelabRoutes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config();

if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set.');
    process.exit(1);
}

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use((req, res, next) => {
    res.setHeader('Permissions-Policy', 'accelerometer=(), ambient-light-sensor=(), autoplay=(), camera=(), encrypted-media=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), speaker=(), usb=(), vr=()');
    next();
});

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3001').split(',').map(o => o.trim());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' },
});

app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(join(__dirname, 'uploads'), {
    setHeaders: (res) => {
        res.setHeader('Content-Disposition', 'attachment');
    },
}));

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
app.use('/api/blog', blogRoutes);
app.use('/api/plugins', pluginRoutes);
app.use('/api/apps', appRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/tech-stack', techStackRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/homelab', homelabRoutes);

app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
