// config/db.js
import pkg from 'mongodb';

const {MongoClient} = pkg;

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

let client;

export async function connectToDb() {
    if (client) return client.db(dbName);

    try {
        client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
        await client.connect();
        console.log('Connected to MongoDB');
        return client.db(dbName);
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw error;
    }
}