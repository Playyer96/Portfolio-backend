import express from 'express';
import { connectToDb } from '../config/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = await connectToDb();
    const data = await db.collection('categories').findOne();
    if (!data) return res.status(404).json({ message: 'Category metadata not found' });
    res.json({
      colors: data.colors || {},
      labels: data.labels || {},
      order: data.order || [],
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
