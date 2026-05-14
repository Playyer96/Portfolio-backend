import express from 'express';
import { ObjectId } from 'mongodb';
import { connectToDb } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { upload, getUploadUrl } from '../middleware/upload.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = await connectToDb();
    const featured = req.query.featured === 'true' ? { featured: true } : {};
    const plugins = await db.collection('plugins').find(featured).sort({ name: 1 }).toArray();
    res.json(plugins);
  } catch (error) {
    console.error('Error fetching plugins:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const db = await connectToDb();
    const query = ObjectId.isValid(req.params.slug)
      ? { _id: new ObjectId(req.params.slug) }
      : { slug: req.params.slug };
    const plugin = await db.collection('plugins').findOne(query);
    if (!plugin) return res.status(404).json({ message: 'Plugin not found' });
    res.json(plugin);
  } catch (error) {
    console.error('Error fetching plugin:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', requireAuth, upload.array('images', 10), async (req, res) => {
  try {
    const { name, slug, description, storeType, unityStoreUrl, unrealStoreUrl, icon, price, version, technologies, featured } = req.body;
    if (!name || !slug) return res.status(400).json({ message: 'Name and slug required' });

    const db = await connectToDb();
    const existing = await db.collection('plugins').findOne({ slug });
    if (existing) return res.status(409).json({ message: 'Slug already exists' });

    const images = (req.files || []).map(f => ({
      url: getUploadUrl(f.filename), alt: `${name} screenshot`, width: null, height: null, type: 'screenshot',
    }));

    const plugin = {
      name, slug, description: description || '', storeType: storeType || 'unity',
      unityStoreUrl: unityStoreUrl || null, unrealStoreUrl: unrealStoreUrl || null,
      images, icon: icon || null, price: price || null, version: version || '1.0.0',
      technologies: technologies ? (Array.isArray(technologies) ? technologies : technologies.split(',').map(t => t.trim())) : [],
      featured: featured === 'true' || featured === true,
      createdAt: new Date(), updatedAt: new Date(),
    };

    const result = await db.collection('plugins').insertOne(plugin);
    res.status(201).json({ ...plugin, _id: result.insertedId });
  } catch (error) {
    console.error('Error creating plugin:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', requireAuth, upload.array('images', 10), async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Invalid ID' });

    const { name, slug, description, storeType, unityStoreUrl, unrealStoreUrl, icon, price, version, technologies, featured } = req.body;
    const db = await connectToDb();

    const update = { updatedAt: new Date() };
    if (name !== undefined) update.name = name;
    if (slug !== undefined) update.slug = slug;
    if (description !== undefined) update.description = description;
    if (storeType !== undefined) update.storeType = storeType;
    if (unityStoreUrl !== undefined) update.unityStoreUrl = unityStoreUrl;
    if (unrealStoreUrl !== undefined) update.unrealStoreUrl = unrealStoreUrl;
    if (icon !== undefined) update.icon = icon;
    if (price !== undefined) update.price = price;
    if (version !== undefined) update.version = version;
    if (technologies !== undefined) update.technologies = Array.isArray(technologies) ? technologies : technologies.split(',').map(t => t.trim());
    if (featured !== undefined) update.featured = featured === 'true' || featured === true;
    if (req.files?.length) {
      const newImages = req.files.map(f => ({
        url: getUploadUrl(f.filename), alt: `${name || 'Plugin'} screenshot`, width: null, height: null, type: 'screenshot',
      }));
      update.images = newImages;
    }

    await db.collection('plugins').updateOne({ _id: new ObjectId(req.params.id) }, { $set: update });
    const updated = await db.collection('plugins').findOne({ _id: new ObjectId(req.params.id) });
    res.json(updated);
  } catch (error) {
    console.error('Error updating plugin:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Invalid ID' });
    const db = await connectToDb();
    const result = await db.collection('plugins').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Plugin not found' });
    res.json({ message: 'Plugin deleted' });
  } catch (error) {
    console.error('Error deleting plugin:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
