import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {MongoClient} from 'mongodb';
import projectRoutes from './routes/projectRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

let client;

async function connectToDb() {
    if (client) return client.db(dbName);

    try {
        client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
        });
        await client.connect();
        console.log('Connected to MongoDB');
        return client.db(dbName);
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw new Error('MongoDB connection error');
    }
}

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
    console.error('MongoDB URI is missing from the environment variables.');
    process.exit(1);
}

connectToDb()
    .then(() => console.log('MongoDB connected successfully'))
    .catch((error) => {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    });

app.use('/api/projects', projectRoutes);

app.use((req, res, next) => {
    res.setHeader('Permissions-Policy', 'none');
    next();
});

app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack);
    res.status(500).json({message: 'Internal Server Error'});
});

// Start the Express Server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

export default app;