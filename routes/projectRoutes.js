import express from 'express';
import connectToDb from '../config/db.js'; // Default import now

const router = express.Router();

// Route to fetch projects
router.get('/projects', async (req, res) => {
    try {
        const db = await connectToDb();  // Get database instance
        const projectsCollection = db.collection('projects');
        const projects = await projectsCollection.find().toArray();
        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects', error);
        res.status(500).send('Server error');
    }
});

export default router;