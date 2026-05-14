import express from 'express';
import { connectToDb } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

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

router.post('/', requireAuth, async (req, res) => {
    try {
        const { title, subtitle, date, icon, iconBackground, responsibilities } = req.body;
        if (!title) return res.status(400).json({ message: 'Title required' });

        const db = await connectToDb();
        const entry = {
            title, subtitle: subtitle || '', date: date || '', icon: icon || 'WorkIcon',
            iconBackground: iconBackground || '#f9004d',
            responsibilities: responsibilities || [],
        };

        await db.collection('experience').updateOne(
            {},
            { $push: { experience: entry } }
        );
        res.status(201).json(entry);
    } catch (error) {
        console.error('Error creating experience:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/:index', requireAuth, async (req, res) => {
    try {
        const index = parseInt(req.params.index);
        if (isNaN(index)) return res.status(400).json({ message: 'Invalid index' });

        const { title, subtitle, date, icon, iconBackground, responsibilities } = req.body;
        const db = await connectToDb();
        const field = `experience.${index}`;

        const setFields = {};
        if (title !== undefined) setFields[`${field}.title`] = title;
        if (subtitle !== undefined) setFields[`${field}.subtitle`] = subtitle;
        if (date !== undefined) setFields[`${field}.date`] = date;
        if (icon !== undefined) setFields[`${field}.icon`] = icon;
        if (iconBackground !== undefined) setFields[`${field}.iconBackground`] = iconBackground;
        if (responsibilities !== undefined) setFields[`${field}.responsibilities`] = responsibilities;

        const result = await db.collection('experience').updateOne({}, { $set: setFields });
        if (result.matchedCount === 0) return res.status(404).json({ message: 'Experience wrapper not found' });

        const wrapper = await db.collection('experience').findOne();
        res.json(wrapper.experience[index] || null);
    } catch (error) {
        console.error('Error updating experience:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:index', requireAuth, async (req, res) => {
    try {
        const index = parseInt(req.params.index);
        if (isNaN(index)) return res.status(400).json({ message: 'Invalid index' });

        const db = await connectToDb();
        const wrapper = await db.collection('experience').findOne();
        if (!wrapper || index >= wrapper.experience.length) {
            return res.status(404).json({ message: 'Experience entry not found' });
        }

        const entries = [...wrapper.experience];
        entries.splice(index, 1);
        await db.collection('experience').updateOne({}, { $set: { experience: entries } });
        res.json({ message: 'Experience entry deleted' });
    } catch (error) {
        console.error('Error deleting experience:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
