import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const dbName = process.env.MONGO_DB_NAME || "Project"; // Default to "Project"
        const db = mongoose.connection.useDb(dbName);
        const projectsCollection = db.collection("projects");

        const projects = await projectsCollection.find().toArray();
        res.status(200).json(projects);
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({message: "Server error", error: err.message});
    }
});

export default router;