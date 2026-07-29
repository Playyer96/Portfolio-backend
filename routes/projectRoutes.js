import express from 'express';
import { ObjectId } from 'mongodb';
import { connectToDb } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = await connectToDb();
    const projects = await db.collection('projects').find().toArray();
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects', error);
    res.status(500).send('Server error');
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, year, role, descriptions, technologies, responsibilities, images, link, githubLink, liveLink, videoUrl, featured, visual, challenge, solution } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });

    const db = await connectToDb();
    const wrapper = await db.collection('projects').findOne();
    if (!wrapper) return res.status(500).json({ message: 'Projects wrapper not found' });

    const maxId = wrapper.projects.reduce((max, p) => Math.max(max, p.id || 0), 0);
    const newProject = {
      id: maxId + 1, name, year: year || new Date().getFullYear(), role: role || '',
      descriptions: descriptions || [], technologies: technologies || [],
      responsibilities: responsibilities || [], images: images || [],
      visual: visual || '', challenge: challenge || '', solution: solution || '',
      link: link || null, githubLink: githubLink || null, liveLink: liveLink || null,
      videoUrl: videoUrl || null, featured: featured === true,
    };

    await db.collection('projects').updateOne(
      {},
      { $push: { projects: newProject } }
    );
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const { name, year, role, descriptions, technologies, responsibilities, images, link, githubLink, liveLink, videoUrl, featured, visual, challenge, solution } = req.body;
    const db = await connectToDb();

    const setFields = {};
    if (name !== undefined) setFields['projects.$[elem].name'] = name;
    if (year !== undefined) setFields['projects.$[elem].year'] = year;
    if (role !== undefined) setFields['projects.$[elem].role'] = role;
    if (descriptions !== undefined) setFields['projects.$[elem].descriptions'] = descriptions;
    if (technologies !== undefined) setFields['projects.$[elem].technologies'] = technologies;
    if (responsibilities !== undefined) setFields['projects.$[elem].responsibilities'] = responsibilities;
    if (images !== undefined) setFields['projects.$[elem].images'] = images;
    if (link !== undefined) setFields['projects.$[elem].link'] = link;
    if (githubLink !== undefined) setFields['projects.$[elem].githubLink'] = githubLink;
    if (liveLink !== undefined) setFields['projects.$[elem].liveLink'] = liveLink;
    if (videoUrl !== undefined) setFields['projects.$[elem].videoUrl'] = videoUrl;
    if (featured !== undefined) setFields['projects.$[elem].featured'] = featured === true;
    if (visual !== undefined) setFields['projects.$[elem].visual'] = visual;
    if (challenge !== undefined) setFields['projects.$[elem].challenge'] = challenge;
    if (solution !== undefined) setFields['projects.$[elem].solution'] = solution;

    if (Object.keys(setFields).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const result = await db.collection('projects').updateOne(
      {},
      { $set: setFields },
      { arrayFilters: [{ 'elem.id': id }] }
    );

    if (result.matchedCount === 0) return res.status(404).json({ message: 'Project not found' });
    const wrapper = await db.collection('projects').findOne();
    const updated = wrapper.projects.find(p => p.id === id);
    res.json(updated);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const db = await connectToDb();
    const result = await db.collection('projects').updateOne(
      {},
      { $pull: { projects: { id } } }
    );
    if (result.modifiedCount === 0) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
