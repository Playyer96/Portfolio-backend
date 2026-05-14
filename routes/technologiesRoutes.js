import express from 'express';
import { connectToDb } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

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

router.post('/', requireAuth, async (req, res) => {
    try {
        const { name, category, packages } = req.body;
        if (!name) return res.status(400).json({ message: 'Name required' });

        const db = await connectToDb();
        const entry = { name, category: category || 'tools', packages: packages || [] };

        await db.collection('technologies').updateOne(
            {},
            { $push: { technologies: entry } }
        );
        res.status(201).json(entry);
    } catch (error) {
        console.error('Error creating technology:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/:index', requireAuth, async (req, res) => {
    try {
        const index = parseInt(req.params.index);
        if (isNaN(index)) return res.status(400).json({ message: 'Invalid index' });

        const { name, category, packages } = req.body;
        const db = await connectToDb();
        const field = `technologies.${index}`;

        const setFields = {};
        if (name !== undefined) setFields[`${field}.name`] = name;
        if (category !== undefined) setFields[`${field}.category`] = category;
        if (packages !== undefined) setFields[`${field}.packages`] = packages;

        const result = await db.collection('technologies').updateOne({}, { $set: setFields });
        if (result.matchedCount === 0) return res.status(404).json({ message: 'Technologies wrapper not found' });

        const wrapper = await db.collection('technologies').findOne();
        res.json(wrapper.technologies[index] || null);
    } catch (error) {
        console.error('Error updating technology:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:index', requireAuth, async (req, res) => {
    try {
        const index = parseInt(req.params.index);
        if (isNaN(index)) return res.status(400).json({ message: 'Invalid index' });

        const db = await connectToDb();
        const wrapper = await db.collection('technologies').findOne();
        if (!wrapper || index >= wrapper.technologies.length) {
            return res.status(404).json({ message: 'Technology not found' });
        }

        const entries = [...wrapper.technologies];
        entries.splice(index, 1);
        await db.collection('technologies').updateOne({}, { $set: { technologies: entries } });
        res.json({ message: 'Technology deleted' });
    } catch (error) {
        console.error('Error deleting technology:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
