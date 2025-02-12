import express from 'express';
import { connectToDb } from '../config/db.js';

const router = express.Router();

// Route to fetch experience information
router.get('/', async (req, res) => {
    try {
        const db = await connectToDb();
        const experienceCollection = db.collection('experience');
        const experiences = await experienceCollection.find().toArray();
        res.json(experiences);
    } catch (error) {
        console.error('Error fetching experience information', error);
        res.status(500).send('Server error');
    }
});

export default router;