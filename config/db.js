import {MongoClient} from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

if (!uri) {
    throw new Error("MONGODB_URI is missing from environment variables.");
}

let client;

export async function connectToDb() {
    if (client) return client.db(dbName);

    try {
        client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
        await client.connect();
        console.log("Connected to MongoDB");
        return client.db(dbName);
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        throw error;
    }
}