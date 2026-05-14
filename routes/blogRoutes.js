import express from 'express';
import { ObjectId } from 'mongodb';
import { connectToDb } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { upload, getUploadUrl } from '../middleware/upload.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = await connectToDb();
    let isAdmin = false;
    if (req.query.published === 'false') {
      const header = req.headers.authorization;
      if (header?.startsWith('Bearer ')) {
        try { jwt.verify(header.split(' ')[1], process.env.JWT_SECRET); isAdmin = true; } catch {}
      }
    }
    const published = isAdmin ? {} : { published: true };
    const posts = await db.collection('blog').find(published)
      .sort({ publishDate: -1 })
      .toArray();
    res.json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const db = await connectToDb();
    const query = ObjectId.isValid(req.params.slug)
      ? { _id: new ObjectId(req.params.slug) }
      : { slug: req.params.slug };
    const post = await db.collection('blog').findOne(query);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', requireAuth, upload.single('featuredImage'), async (req, res) => {
  try {
    const { title, slug, excerpt, content, tags, published, publishDate } = req.body;
    if (!title || !slug || !content) {
      return res.status(400).json({ message: 'Title, slug, and content required' });
    }

    const db = await connectToDb();
    const existing = await db.collection('blog').findOne({ slug });
    if (existing) return res.status(409).json({ message: 'Slug already exists' });

    const post = {
      title, slug, excerpt: excerpt || '', content,
      featuredImage: req.file ? { url: getUploadUrl(req.file.filename), alt: title, width: null, height: null, type: 'hero' } : null,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      published: published === 'true' || published === true,
      publishDate: publishDate ? new Date(publishDate) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('blog').insertOne(post);
    res.status(201).json({ ...post, _id: result.insertedId });
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', requireAuth, upload.single('featuredImage'), async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const { title, slug, excerpt, content, tags, published, publishDate } = req.body;
    const db = await connectToDb();

    const update = { updatedAt: new Date() };
    if (title !== undefined) update.title = title;
    if (slug !== undefined) update.slug = slug;
    if (excerpt !== undefined) update.excerpt = excerpt;
    if (content !== undefined) update.content = content;
    if (tags !== undefined) update.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    if (published !== undefined) update.published = published === 'true' || published === true;
    if (publishDate !== undefined) update.publishDate = publishDate ? new Date(publishDate) : null;
    if (req.file) {
      update.featuredImage = { url: getUploadUrl(req.file.filename), alt: title || 'Featured image', width: null, height: null, type: 'hero' };
    }

    await db.collection('blog').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: update }
    );

    const updated = await db.collection('blog').findOne({ _id: new ObjectId(req.params.id) });
    res.json(updated);
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }
    const db = await connectToDb();
    const result = await db.collection('blog').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
