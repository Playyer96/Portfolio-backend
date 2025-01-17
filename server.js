import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

let client;

export async function connectToDb() {
    if (client) return client.db(dbName);

    if (!uri) {
        throw new Error('MongoDB URI is not set');
    }

    let attempts = 0;
    const maxAttempts = 5;
    const delay = 3000; // 3 seconds

    while (attempts < maxAttempts) {
        try {
            console.log(`Attempt ${attempts + 1}: Connecting to MongoDB...`);
            client = new MongoClient(uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 30000,
            });

            await client.connect();
            console.log('MongoDB connected');
            return client.db(dbName);
        } catch (error) {
            attempts++;
            console.error(`MongoDB connection attempt ${attempts} failed: ${error.message}`);

            if (attempts >= maxAttempts) {
                throw new Error('MongoDB connection failed after several attempts');
            }

            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}