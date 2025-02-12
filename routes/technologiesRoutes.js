import express from 'express';
import { connectToDb } from '../config/db.js';

const router = express.Router();

// Route to fetch technologies information
router.get('/', async (req, res) => {
    try {
        const db = await connectToDb();
        const technologiesCollection = db.collection('technologies');
        const technologies = await technologiesCollection.find().toArray();
        res.json(technologies);
    } catch (error) {
        console.error('Error fetching technologies information', error);
        res.status(500).send('Server error');
    }
});

export default router;