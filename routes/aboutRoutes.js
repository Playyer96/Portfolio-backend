import express from 'express';
import { ObjectId } from 'mongodb';
import { connectToDb } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

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

router.put('/:id', requireAuth, async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid ID' });
        }

        const allowed = [
            'heroText', 'name', 'title', 'subtitle', 'role', 'location', 'locationDisplay',
            'timezone', 'careerStartDate', 'projectFilename', 'availability', 'availabilityStart',
            'bio', 'values', 'email', 'socials', 'cv', 'marqueeItems',
        ];

        const db = await connectToDb();
        const update = {};
        for (const key of allowed) {
            if (req.body[key] !== undefined) update[key] = req.body[key];
        }
        update.updatedAt = new Date();

        if (Object.keys(update).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        await db.collection('about').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: update }
        );

        const updated = await db.collection('about').findOne({ _id: new ObjectId(req.params.id) });
        res.json(updated);
    } catch (error) {
        console.error('Error updating about information', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
