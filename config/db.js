import {MongoClient} from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

if (!uri) {
    throw new Error('MONGODB_URI environment variable is not defined');
}

if (!dbName) {
    throw new Error('DB_NAME environment variable is not defined');
}

let client;

export async function connectToDb() {
    if (client) return client.db(dbName);

    try {
        console.log('Attempting to connect with URI:', uri);
        client = new MongoClient(uri);
        await client.connect();
        console.log('Connected to MongoDB successfully');
        return client.db(dbName);
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw error;
    }
}