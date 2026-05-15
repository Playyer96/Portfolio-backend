import express from 'express';
import { ObjectId } from 'mongodb';
import https from 'node:https';
import http from 'node:http';
import { connectToDb } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

function pingUrl(rawUrl, timeoutMs = 5000) {
  return new Promise((resolve) => {
    let u;
    try { u = new URL(rawUrl); } catch { return resolve('unreachable'); }
    const mod = u.protocol === 'https:' ? https : http;
    const req = mod.request(
      { hostname: u.hostname, port: u.port || (u.protocol === 'https:' ? 443 : 80), path: u.pathname || '/', method: 'HEAD' },
      (res) => { resolve(res.statusCode < 500 ? 'online' : 'degraded'); res.resume(); }
    );
    req.on('error', () => resolve('unreachable'));
    req.setTimeout(timeoutMs, () => { req.destroy(); resolve('unreachable'); });
    req.end();
  });
}

router.get('/ping', async (req, res) => {
  try {
    const db = await connectToDb();
    const services = await db.collection('homelab').find({}).toArray();

    const checks = await Promise.all(
      services.map(async (svc) => {
        const id = svc._id.toString();
        if (!svc.isPublic || !svc.url) return { id, live: 'local' };
        const live = await pingUrl(svc.url);
        return { id, live };
      })
    );

    const result = {};
    checks.forEach(c => { result[c.id] = c.live; });
    res.json(result);
  } catch (error) {
    console.error('Ping error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const db = await connectToDb();
    const filter = {};
    if (req.query.featured === 'true') filter.featured = true;
    const services = await db.collection('homelab').find(filter).sort({ order: 1, name: 1 }).toArray();
    res.json(services);
  } catch (error) {
    console.error('Error fetching homelab:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = await connectToDb();
    const query = ObjectId.isValid(req.params.id)
      ? { _id: new ObjectId(req.params.id) }
      : { slug: req.params.id };
    const service = await db.collection('homelab').findOne(query);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (error) {
    console.error('Error fetching homelab service:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      name, slug, subdomain, isPublic, url, localUrl, icon, color,
      status, description, category, images, learned, tags, uptime, since, order, featured,
    } = req.body;
    if (!name || !slug) return res.status(400).json({ message: 'Name and slug required' });

    const db = await connectToDb();
    const existing = await db.collection('homelab').findOne({ slug });
    if (existing) return res.status(409).json({ message: 'Slug already exists' });

    const doc = {
      name,
      slug,
      subdomain:   subdomain || '',
      isPublic:    isPublic !== false && isPublic !== 'false',
      url:         url       || null,
      localUrl:    localUrl  || null,
      icon:        icon      || '🖥',
      color:       color     || '#888888',
      status:      status    || 'online',
      description: description || '',
      category:    category  || 'Infrastructure',
      images:      Array.isArray(images) ? images : (images ? String(images).split(',').map(s => s.trim()).filter(Boolean) : []),
      learned:     Array.isArray(learned) ? learned : (learned ? String(learned).split('\n').map(s => s.trim()).filter(Boolean) : []),
      tags:        Array.isArray(tags)    ? tags    : (tags    ? String(tags).split(',').map(s => s.trim()).filter(Boolean) : []),
      uptime:      uptime || null,
      since:       since  || null,
      order:       parseInt(order) || 0,
      featured:    featured === true || featured === 'true',
      createdAt:   new Date(),
      updatedAt:   new Date(),
    };

    const result = await db.collection('homelab').insertOne(doc);
    res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (error) {
    console.error('Error creating homelab service:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Invalid ID' });
    const db = await connectToDb();
    const update = { updatedAt: new Date() };

    const scalar = ['name','slug','subdomain','url','localUrl','icon','color','status','description','category','uptime','since'];
    scalar.forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });

    if (req.body.isPublic !== undefined) update.isPublic = req.body.isPublic !== false && req.body.isPublic !== 'false';
    if (req.body.order    !== undefined) update.order    = parseInt(req.body.order) || 0;
    if (req.body.featured !== undefined) update.featured = req.body.featured === true || req.body.featured === 'true';

    if (req.body.images  !== undefined) update.images  = Array.isArray(req.body.images)  ? req.body.images  : String(req.body.images).split(',').map(s => s.trim()).filter(Boolean);
    if (req.body.learned !== undefined) update.learned = Array.isArray(req.body.learned) ? req.body.learned : String(req.body.learned).split('\n').map(s => s.trim()).filter(Boolean);
    if (req.body.tags    !== undefined) update.tags    = Array.isArray(req.body.tags)    ? req.body.tags    : String(req.body.tags).split(',').map(s => s.trim()).filter(Boolean);

    await db.collection('homelab').updateOne({ _id: new ObjectId(req.params.id) }, { $set: update });
    const updated = await db.collection('homelab').findOne({ _id: new ObjectId(req.params.id) });
    res.json(updated);
  } catch (error) {
    console.error('Error updating homelab service:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Invalid ID' });
    const db = await connectToDb();
    const result = await db.collection('homelab').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Service not found' });
    res.json({ message: 'Service deleted' });
  } catch (error) {
    console.error('Error deleting homelab service:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
