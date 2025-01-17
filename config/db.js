import {MongoClient} from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

let client;

export async function connectToDb() {
    if (client) return client.db(dbName); // Return the cached client instance

    if (!uri) {
        throw new Error('MongoDB URI is not set');
    }

    try {
        client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        await client.connect();
        console.log('MongoDB connected');
        return client.db(dbName);
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw new Error('MongoDB connection failed');
    }
}