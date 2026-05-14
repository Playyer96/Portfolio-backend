import express from 'express';
import { connectToDb } from '../config/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = await connectToDb();
    const data = await db.collection('skills').findOne();
    if (!data) return res.status(404).json({ message: 'Skills data not found' });
    const { skills, skillCategories } = data;
    res.json({ skills: skills || {}, skillCategories: skillCategories || {} });
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
