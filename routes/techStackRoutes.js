import express from 'express';
import { connectToDb } from '../config/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = await connectToDb();
    const data = await db.collection('techstack').findOne();
    if (!data) return res.status(404).json({ message: 'Tech stack data not found' });
    const { nodes, relationships, categories } = data;
    res.json({ categories: categories || [], nodes: nodes || [], relationships: relationships || [] });
  } catch (error) {
    console.error('Error fetching tech stack:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
