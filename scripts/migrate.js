import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

if (!uri || !dbName) {
  console.error('Missing MONGODB_URI or DB_NAME in .env');
  process.exit(1);
}

function normalizeImages(images) {
  if (!Array.isArray(images)) return [];
  return images.map(img => {
    if (typeof img === 'string') return { url: img, alt: '', width: null, height: null, type: 'screenshot' };
    if (img && img.url) return { url: img.url, alt: img.alt || '', width: img.width || null, height: img.height || null, type: img.type || 'screenshot' };
    if (img && img.image) return { url: img.image, alt: img.alt || '', width: null, height: null, type: 'screenshot' };
    return img;
  });
}

async function migrate() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB\n');

    const db = client.db(dbName);

    // ── 1. Projects: add new fields + normalize images ──────────────────
    const projectsCol = db.collection('projects');
    const projectsResult = await projectsCol.updateMany(
      { 'projects': { $exists: true } },
      [
        {
          $set: {
            'projects': {
              $map: {
                input: '$projects',
                as: 'p',
                in: {
                  $mergeObjects: [
                    '$$p',
                    {
                      featured: { $ifNull: ['$$p.featured', true] },
                      githubLink: { $ifNull: ['$$p.githubLink', null] },
                      liveLink: { $ifNull: ['$$p.liveLink', null] },
                    },
                  ],
                },
              },
            },
          },
        },
      ],
    );
    console.log(`  projects:   ${projectsResult.modifiedCount} doc(s) updated`);

    // ── 2. About: add updatedAt if missing ─────────────────────────────
    const aboutCol = db.collection('about');
    const aboutResult = await aboutCol.updateMany(
      { updatedAt: { $exists: false } },
      { $set: { updatedAt: new Date() } }
    );
    console.log(`  about:      ${aboutResult.modifiedCount} doc(s) updated`);

    // ── 3. Create blog collection if missing ───────────────────────────
    const blogCol = db.collection('blog');
    const blogExists = await blogCol.countDocuments({});
    if (blogExists === 0) {
      console.log('  blog:       collection empty (seed to populate)');
    } else {
      console.log(`  blog:       ${blogExists} existing doc(s)`);
    }

    // ── 4. Create plugins collection if missing ────────────────────────
    const pluginsCol = db.collection('plugins');
    const pluginsExists = await pluginsCol.countDocuments({});
    if (pluginsExists === 0) {
      console.log('  plugins:    collection empty (seed to populate)');
    } else {
      console.log(`  plugins:    ${pluginsExists} existing doc(s)`);
    }

    // ── 5. Create apps collection if missing ───────────────────────────
    const appsCol = db.collection('apps');
    const appsExists = await appsCol.countDocuments({});
    if (appsExists === 0) {
      console.log('  apps:       collection empty (seed to populate)');
    } else {
      console.log(`  apps:       ${appsExists} existing doc(s)`);
    }

    // ── 6. Create users collection if missing ──────────────────────────
    const usersCol = db.collection('users');
    const usersExists = await usersCol.countDocuments({});
    if (usersExists === 0) {
      console.log('  users:      collection empty (seed to populate)');
    } else {
      console.log(`  users:      ${usersExists} existing doc(s)`);
    }

    // ── Summary ────────────────────────────────────────────────────────
    console.log('\nMigration complete.');
    console.log('New collections: blog, plugins, apps, users');
    console.log('New project fields: featured, githubLink, liveLink');
    console.log('Run `npm run seed` to populate all collections with sample data.');
    console.log('\nAfter seeding, create an admin password:');
    console.log('  node -e "const b=require(\\'bcryptjs\\'); console.log(b.hashSync(\\'YOUR_PASSWORD\\',10))"');
    console.log('Then update the users collection with the hash.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

migrate();
