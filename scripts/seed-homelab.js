/**
 * Seed script for homelab services.
 * Run: node scripts/seed-homelab.js
 *
 * Edit the SERVICES array below to match your actual setup,
 * then update images/learned from the dashboard.
 */
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { connectToDb } from '../config/db.js';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../.env') });

const SERVICES = [
  {
    name:        'Gitea',
    slug:        'gitea',
    subdomain:   'git',
    isPublic:    true,
    url:         'https://git.yourdomain.com',
    localUrl:    null,
    icon:        '🐙',
    color:       '#629755',
    status:      'online',
    category:    'Dev Tools',
    description: 'Self-hosted Git service. Full GitHub-like experience — repos, issues, wikis, CI runners — running on my own hardware.',
    images:      [],
    learned: [
      'Configuring Caddy as a reverse proxy with automatic HTTPS via ACME',
      'Setting up SSH key-based auth and GPG commit signing server-side',
      'Running Gitea Actions (compatible with GitHub Actions syntax) for CI/CD',
      'Repository mirroring from GitHub to keep public work in sync',
      'OAuth2 integration so all homelab services share a single login',
    ],
    tags:    ['Docker', 'Git', 'Caddy', 'CI/CD'],
    uptime:  '99.8%',
    since:   '2023-09',
    order:   0,
    featured: true,
  },
  {
    name:        'Jellyfin',
    slug:        'jellyfin',
    subdomain:   'jelly',
    isPublic:    true,
    url:         'https://jelly.yourdomain.com',
    localUrl:    null,
    icon:        '🎬',
    color:       '#00a4dc',
    status:      'online',
    category:    'Media',
    description: 'Open-source media server. Streams movies, series and music to any device — browser, phone, TV — without subscriptions or licensing fees.',
    images:      [],
    learned: [
      'Hardware transcoding with Intel Quick Sync — massive CPU savings on 4K streams',
      'NFO/XML metadata standards and folder naming conventions for clean libraries',
      'DLNA/UPnP for casting to smart TVs and Chromecast without the app',
      'Tailscale as a zero-config VPN so Jellyfin is reachable outside home safely',
      'Docker bind mounts vs named volumes and their performance tradeoffs',
    ],
    tags:    ['Docker', 'Streaming', 'Tailscale', 'Intel QSV'],
    uptime:  '99.5%',
    since:   '2023-11',
    order:   1,
    featured: true,
  },
  {
    name:        'Servarr Stack',
    slug:        'servarr',
    subdomain:   'serr',
    isPublic:    true,
    url:         'https://serr.yourdomain.com',
    localUrl:    null,
    icon:        '📡',
    color:       '#2e86de',
    status:      'online',
    category:    'Media Automation',
    description: 'Sonarr + Radarr + Prowlarr + qBittorrent. Fully automated media pipeline — grabs, renames, and drops content into Jellyfin without touching a thing.',
    images:      [],
    learned: [
      'Prowlarr as a unified indexer manager — one config, all *arr apps synced',
      'Quality profiles and custom formats to prefer remux/HEVC over bloated encodes',
      'Docker networking: isolated bridge so download clients talk only to *arr apps',
      'Hardlinks vs copy for media movement — hardlinks avoid doubling disk usage',
      'Recyclarr for syncing TRaSH Guides quality profiles declaratively via YAML',
    ],
    tags:    ['Sonarr', 'Radarr', 'Prowlarr', 'Docker', 'Automation'],
    uptime:  '99.2%',
    since:   '2024-01',
    order:   2,
    featured: true,
  },
  {
    name:        'Portainer',
    slug:        'portainer',
    subdomain:   '',
    isPublic:    false,
    url:         null,
    localUrl:    'http://192.168.1.x:9000',
    icon:        '🐳',
    color:       '#13BEF9',
    status:      'local',
    category:    'Monitoring',
    description: 'Docker management UI. Local-only — exposes container logs, resource usage, and quick shell access to any running container from the browser.',
    images:      [],
    learned: [
      'Docker Compose stacks vs standalone containers and when each makes sense',
      'Resource limits (CPU/memory cgroups) to prevent one container from starving others',
      'Container health checks and restart policies for zero-babysit uptime',
      'Portainer Stacks as a simple GitOps-lite approach before moving to Kubernetes',
      'Why production should never expose a Docker socket to the internet',
    ],
    tags:    ['Docker', 'Local', 'DevOps', 'Monitoring'],
    uptime:  null,
    since:   '2023-09',
    order:   3,
    featured: false,
  },
];

async function seed() {
  try {
    const db = await connectToDb();
    const col = db.collection('homelab');

    const existing = await col.countDocuments();
    if (existing > 0) {
      console.log(`[homelab] Collection already has ${existing} document(s). Skipping seed.`);
      console.log('[homelab] To reseed, drop the collection first: db.homelab.drop()');
      process.exit(0);
    }

    const docs = SERVICES.map(s => ({ ...s, createdAt: new Date(), updatedAt: new Date() }));
    const result = await col.insertMany(docs);
    console.log(`[homelab] Seeded ${result.insertedCount} services.`);
    console.log('[homelab] Update images and content from the dashboard at /dashboard → Homelab.');
    process.exit(0);
  } catch (err) {
    console.error('[homelab] Seed failed:', err);
    process.exit(1);
  }
}

seed();
