import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const { MONGODB_URI: uri, DB_NAME: dbName } = process.env;
if (!uri || !dbName) throw new Error('Missing MONGODB_URI or DB_NAME in Portfolio-backend/.env');

const projects = [
  {
    id: 7, name: 'Off The Shelf Studio', year: 2026, role: 'Full-stack developer', visual: 'studio', featured: true,
    descriptions: ['Studio website and inquiry experience built to make services clear and follow-up dependable.', 'Includes a Resend-powered email layer with branded confirmation and team-notification templates.'],
    technologies: [{ name: 'Next.js' }, { name: 'React' }, { name: 'TypeScript' }, { name: 'Resend' }, { name: 'CSS' }],
    responsibilities: ['Translated services into plain-language pages and clear calls to action', 'Built the inquiry flow and Resend transactional email delivery', 'Created reusable confirmation and internal-notification email templates'],
    challenge: 'Making a technical service feel approachable while ensuring every inquiry receives a dependable, branded follow-up.',
    solution: 'Paired a simple inquiry path with purpose-built Resend templates for visitor confirmations and team notifications.',
    images: [], link: null, githubLink: null, liveLink: null, videoUrl: null,
  },
  {
    id: 8, name: 'WisprTasks', year: 2026, role: 'Product & app developer', visual: 'tasks', featured: true,
    descriptions: ['A focused task app that makes capture, priorities, and next actions easier to understand.', 'Designed to reduce the setup burden common to task-management tools.'],
    technologies: [{ name: 'React' }, { name: 'TypeScript' }, { name: 'Firebase' }, { name: 'Cloud Functions' }, { name: 'Resend' }],
    responsibilities: ['Designed quick capture, prioritization, and next-action workflows', 'Built the application interface and cross-device data flows', 'Used Resend templates for account and task-related communication'],
    challenge: 'Most task tools expose too much structure before a person has decided what to do next.',
    solution: 'Reduced visible choices, kept the current priority prominent, and reserved automation for real follow-up work.',
    images: [], link: null, githubLink: null, liveLink: null, videoUrl: null,
  },
];

const app = { name: 'WisprTasks', slug: 'wisprtasks', description: 'A focused task app that makes capturing and acting on priorities feel less overwhelming.', platform: 'ios', appStoreUrl: null, googlePlayUrl: null, images: [], icon: null, downloads: 0, rating: 0, featured: true, updatedAt: new Date() };

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db(dbName);
  await db.collection('projects').updateOne({}, { $pull: { projects: { id: { $in: projects.map(project => project.id) } } } });
  await db.collection('projects').updateOne({}, { $push: { projects: { $each: projects.slice().reverse(), $position: 0 } } });
  await db.collection('apps').updateOne({ slug: app.slug }, { $set: app, $setOnInsert: { createdAt: new Date() } }, { upsert: true });
  console.log('Upserted 2 projects and 1 app.');
} finally {
  await client.close();
}
