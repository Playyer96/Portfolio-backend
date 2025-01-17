import {MongoClient} from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

let client;

export async function connectToDb() {
    if (client) return client.db(dbName);

    if (!uri) {
        throw new Error('MongoDB URI is not set');
    }

    try {
        console.log('Attempting to connect to MongoDB...');
        client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000,  // Timeout after 30 seconds
        });

        await client.connect();
        console.log('MongoDB connected');
        return client.db(dbName);
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        throw new Error('MongoDB connection failed');
    }
}