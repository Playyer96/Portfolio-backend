import express from 'express';
import { ObjectId } from 'mongodb';
import { connectToDb } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { upload, getUploadUrl } from '../middleware/upload.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = await connectToDb();
    const filter = {};
    if (req.query.platform) filter.platform = req.query.platform;
    if (req.query.featured === 'true') filter.featured = true;
    const apps = await db.collection('apps').find(filter).sort({ name: 1 }).toArray();
    res.json(apps);
  } catch (error) {
    console.error('Error fetching apps:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const db = await connectToDb();
    const query = ObjectId.isValid(req.params.slug)
      ? { _id: new ObjectId(req.params.slug) }
      : { slug: req.params.slug };
    const app = await db.collection('apps').findOne(query);
    if (!app) return res.status(404).json({ message: 'App not found' });
    res.json(app);
  } catch (error) {
    console.error('Error fetching app:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', requireAuth, upload.array('images', 10), async (req, res) => {
  try {
    const { name, slug, description, platform, appStoreUrl, googlePlayUrl, icon, downloads, rating, featured } = req.body;
    if (!name || !slug) return res.status(400).json({ message: 'Name and slug required' });

    const db = await connectToDb();
    const existing = await db.collection('apps').findOne({ slug });
    if (existing) return res.status(409).json({ message: 'Slug already exists' });

    const images = (req.files || []).map(f => ({
      url: getUploadUrl(f.filename), alt: `${name} screenshot`, width: null, height: null, type: 'screenshot',
    }));

    const appDoc = {
      name, slug, description: description || '', platform: platform || 'android',
      appStoreUrl: appStoreUrl || null, googlePlayUrl: googlePlayUrl || null,
      images, icon: icon || null,
      downloads: parseInt(downloads) || 0, rating: parseFloat(rating) || 0,
      featured: featured === 'true' || featured === true,
      createdAt: new Date(), updatedAt: new Date(),
    };

    const result = await db.collection('apps').insertOne(appDoc);
    res.status(201).json({ ...appDoc, _id: result.insertedId });
  } catch (error) {
    console.error('Error creating app:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', requireAuth, upload.array('images', 10), async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Invalid ID' });

    const { name, slug, description, platform, appStoreUrl, googlePlayUrl, icon, downloads, rating, featured } = req.body;
    const db = await connectToDb();

    const update = { updatedAt: new Date() };
    if (name !== undefined) update.name = name;
    if (slug !== undefined) update.slug = slug;
    if (description !== undefined) update.description = description;
    if (platform !== undefined) update.platform = platform;
    if (appStoreUrl !== undefined) update.appStoreUrl = appStoreUrl;
    if (googlePlayUrl !== undefined) update.googlePlayUrl = googlePlayUrl;
    if (icon !== undefined) update.icon = icon;
    if (downloads !== undefined) update.downloads = parseInt(downloads);
    if (rating !== undefined) update.rating = parseFloat(rating);
    if (featured !== undefined) update.featured = featured === 'true' || featured === true;
    if (req.files?.length) {
      update.images = req.files.map(f => ({
        url: getUploadUrl(f.filename), alt: `${name || 'App'} screenshot`, width: null, height: null, type: 'screenshot',
      }));
    }

    await db.collection('apps').updateOne({ _id: new ObjectId(req.params.id) }, { $set: update });
    const updated = await db.collection('apps').findOne({ _id: new ObjectId(req.params.id) });
    res.json(updated);
  } catch (error) {
    console.error('Error updating app:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Invalid ID' });
    const db = await connectToDb();
    const result = await db.collection('apps').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'App not found' });
    res.json({ message: 'App deleted' });
  } catch (error) {
    console.error('Error deleting app:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
