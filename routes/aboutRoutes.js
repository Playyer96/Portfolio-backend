import express from 'express';
import { connectToDb } from '../config/db.js';

const router = express.Router();

// Route to fetch about information
router.get('/', async (req, res) => {
    try {
        const db = await connectToDb();
        const aboutCollection = db.collection('about');
        const aboutInfo = await aboutCollection.find().toArray();
        res.json(aboutInfo);
    } catch (error) {
        console.error('Error fetching about information', error);
        res.status(500).send('Server error');
    }
});

export default router;