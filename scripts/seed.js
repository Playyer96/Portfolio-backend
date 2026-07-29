import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const uri    = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

if (!uri || !dbName) {
    console.error('Missing MONGODB_URI or DB_NAME in .env');
    process.exit(1);
}

// ── About ─────────────────────────────────────────────────────────────────────

const aboutData = {
    heroText:          'Danilo Vanegas',
    name:              'Danilo Vanegas',
    title:             'Software Engineer & Creative Developer',
    subtitle:          'Software Engineer / Creative Developer',
    role:              'Engineer',
    location:          'Medellín, Antioquia, Colombia',
    locationDisplay:   'Medellín, Antioquia - Colombia',
    timezone:          'America/Bogota',
    careerStartDate:   '2019-03-01',
    projectFilename:   'danilo-vanegas.unityproj',
    availability:      'Available Now',
    availabilityStart: 'Immediately',
    availabilityRoles: 'Full-time, contract',
    availabilityFocus: 'Real problems, creative collaborations',
    contactIntro:      '{yearsExp}+ years across game dev, XR, and web. Looking for real problems to solve.',
    bio: [
        'Passionate full-stack developer & creative technologist building interactive experiences at the intersection of web, game development, and design. Expertise spans React, Three.js, game engines (Unity/Unreal), and XR platforms. I craft tools that empower teams and experiences that push boundaries.',
        'Started coding in 2017. Built production systems at companies like Optic Power, shipped indie games, and commercial tools. Focused on code quality, team velocity, and user impact.',
    ],
    values: [
        { title: 'Ship',             iconKey: 'FiZap',       desc: 'Bias toward shipping. Working code beats perfect plans.' },
        { title: 'Tools',            iconKey: 'FiTool',      desc: 'Build abstractions that multiply team productivity.' },
        { title: 'Cross-discipline', iconKey: 'FiRefreshCw', desc: 'Collaborate across domains. Best solutions emerge at boundaries.' },
        { title: 'Performance',      iconKey: 'FiBarChart2', desc: 'Measure impact. Optimize ruthlessly. Details compound.' },
    ],
    email: 'vanegasdanilo7@gmail.com',
    socials: [
        { name: 'GitHub',    handle: 'Playyer96',  url: 'https://github.com/Playyer96' },
        { name: 'LinkedIn',  handle: 'danisvs',    url: 'https://linkedin.com/in/danisvs' },
        { name: 'Instagram', handle: '_dani.svs',  url: 'https://instagram.com/_dani.svs' },
    ],
    cv: {
        path:  '/cv',
        year:  '2026',
        pages: '1',
        size:  null,
    },
    marqueeItems: ['React', 'TypeScript', 'Three.js', 'WebGL', 'Node.js', 'Game Dev', 'Creative Coding', 'UI/UX'],
};

// ── Projects ──────────────────────────────────────────────────────────────────

const projectsData = {
    projects: [
        {
            id:   1,
            name: 'AR Industrial Training Platform',
            year: 2022,
            role: 'Lead Developer',
            descriptions: [
                'HoloLens 2 spatial computing app for hands-free technician training, built with Unity and MRTK3.',
                'Reduced equipment onboarding time by 40% through real-world AR work instructions deployed at Optic Power.',
            ],
            technologies: [
                { name: 'Unity' }, { name: 'C#' }, { name: 'HoloLens 2' }, { name: 'MRTK3' }, { name: 'Azure' },
            ],
            responsibilities: [
                'Designed spatial anchor system for persistent AR equipment annotations',
                'Built gesture-driven MRTK3 UI panels overlaid on physical machinery',
                'Integrated with Azure Blob Storage for remote content management',
                'Reduced technician onboarding time by 40%',
            ],
            visual: 'studio',
            challenge: 'Making a technical service feel approachable while ensuring every inquiry receives a dependable, branded follow-up.',
            solution: 'Paired a simple inquiry path with purpose-built Resend templates for visitor confirmations and team notifications.',
            images: [], link: null, videoUrl: null, featured: true, githubLink: null, liveLink: null,
        },
        {
            id:   2,
            name: 'Real-Time Industrial Dashboard',
            year: 2023,
            role: 'Lead Developer',
            descriptions: [
                'SCADA-style web dashboard monitoring 50+ IoT devices in real time at industrial facilities.',
                'Built with React, WebSocket, and Node.js. Deployed internally at Optic Power production sites.',
            ],
            technologies: [
                { name: 'React' }, { name: 'Node.js' }, { name: 'WebSocket' }, { name: 'MongoDB' }, { name: 'Chart.js' },
            ],
            responsibilities: [
                'Built WebSocket server handling 50+ concurrent IoT device streams',
                'Designed real-time chart components updating at 60 fps without drops',
                'Implemented threshold-based alerting system for anomaly detection',
                'Reduced incident response time by 60%',
            ],
            visual: 'tasks',
            challenge: 'Most task tools expose too much structure before a person has decided what to do next.',
            solution: 'Reduced visible choices, kept the current priority prominent, and reserved automation for real follow-up work.',
            images: [], link: null, videoUrl: null, featured: true, githubLink: null, liveLink: null,
        },
        {
            id:   3,
            name: 'Multiplayer Arena Shooter',
            year: 2024,
            role: 'Solo Developer',
            descriptions: [
                'Online 4v4 arena shooter built with Unreal Engine 5 and C++ using the Gameplay Ability System.',
                'Shipped as a playable prototype with custom lag compensation and predictive client movement.',
            ],
            technologies: [
                { name: 'Unreal Engine 5' }, { name: 'C++' }, { name: 'Gameplay Ability System' },
                { name: 'Online Subsystem Steam' }, { name: 'Blueprints' },
            ],
            responsibilities: [
                'Implemented Gameplay Ability System for scalable ability design',
                'Built lag compensation for competitive feel on high-latency connections',
                'Designed modular weapon system with swappable projectile behaviors',
                'Shipped 3 playtest builds tested by 200+ players',
            ],
            images: [], link: null, videoUrl: null, featured: true, githubLink: null, liveLink: null,
        },
        {
            id:   4,
            name: 'Developer Portfolio',
            year: 2025,
            role: 'Designer & Developer',
            descriptions: [
                'Game-engine-styled personal portfolio with Unity Editor-inspired UI: Hierarchy, Inspector, Console, and Profiler panels with scene-based routing.',
                'React 19 frontend, Express/Node.js backend, MongoDB Atlas — deployed on Vercel with CI/CD.',
            ],
            technologies: [
                { name: 'React 19' }, { name: 'Node.js' }, { name: 'MongoDB' },
                { name: 'Framer Motion' }, { name: 'SCSS' }, { name: 'Vercel' },
            ],
            responsibilities: [
                'Designed Unity Editor-inspired layout with Hierarchy, Inspector, Console, and Profiler panels',
                'Built Express REST API with MongoDB Atlas for fully dynamic portfolio data',
                'Implemented scene-based routing with animated transitions',
                'Deployed with Vercel CI/CD on both frontend and backend',
            ],
            images: [], link: 'https://github.com/Playyer96', videoUrl: null,
            featured: true, githubLink: 'https://github.com/Playyer96', liveLink: null,
        },
        {
            id:   5,
            name: 'Unity Editor Toolkit',
            year: 2023,
            role: 'Lead Developer',
            descriptions: [
                'Suite of custom Unity Editor tools accelerating internal game dev workflows at Optic Power.',
                'Used daily by a 4-person team, reducing build iteration time by 30%.',
            ],
            technologies: [
                { name: 'Unity' }, { name: 'C#' }, { name: 'Editor Scripting' }, { name: 'Jenkins' }, { name: 'YAML' },
            ],
            responsibilities: [
                'Built custom Unity EditorWindows for scene and asset management',
                'Created automated Jenkins build pipeline triggered on git push',
                'Designed asset auditing system detecting unused and oversized assets',
                'Reduced team build iteration time by 30%',
            ],
            images: [], link: null, videoUrl: null, featured: false, githubLink: null, liveLink: null,
        },
        {
            id:   6,
            name: 'Idle Factory Tycoon',
            year: 2020,
            role: 'Solo Developer',
            descriptions: [
                'Mobile idle game published on Google Play, built with Unity for Android.',
                'Features offline progression, rewarded ads, and Firebase analytics — 250+ downloads.',
            ],
            technologies: [
                { name: 'Unity' }, { name: 'C#' }, { name: 'Firebase' }, { name: 'Unity Ads' }, { name: 'Addressables' },
            ],
            responsibilities: [
                'Designed idle progression system with economy balancing',
                'Implemented Unity Addressables for dynamic asset delivery',
                'Integrated Firebase Analytics, Crashlytics, and Remote Config',
                'Published to Google Play and managed post-launch live ops',
            ],
            images: [], link: null, videoUrl: null, featured: false, githubLink: null, liveLink: null,
        },
        {
            id: 7,
            name: 'Off The Shelf Studio',
            year: 2026,
            role: 'Full-stack developer',
            descriptions: [
                'Studio website and inquiry experience built to make services clear and follow-up dependable.',
                'Includes a Resend-powered email layer with branded confirmation and team-notification templates.',
            ],
            technologies: [{ name: 'Next.js' }, { name: 'React' }, { name: 'TypeScript' }, { name: 'Resend' }, { name: 'CSS' }],
            responsibilities: [
                'Translated services into plain-language pages and clear calls to action',
                'Built the inquiry flow and Resend transactional email delivery',
                'Created reusable confirmation and internal-notification email templates',
            ],
            images: [], link: null, videoUrl: null, featured: true, githubLink: null, liveLink: null,
        },
        {
            id: 8,
            name: 'WisprTasks',
            year: 2026,
            role: 'Product & app developer',
            descriptions: [
                'A focused task app that makes capture, priorities, and next actions easier to understand.',
                'Designed to reduce the setup burden common to task-management tools.',
            ],
            technologies: [{ name: 'React' }, { name: 'TypeScript' }, { name: 'Firebase' }, { name: 'Cloud Functions' }, { name: 'Resend' }],
            responsibilities: [
                'Designed quick capture, prioritization, and next-action workflows',
                'Built the application interface and cross-device data flows',
                'Used Resend templates for account and task-related communication',
            ],
            images: [], link: null, videoUrl: null, featured: true, githubLink: null, liveLink: null,
        },
    ],
};

// ── Experience ────────────────────────────────────────────────────────────────

const experienceData = {
    experience: [
        {
            title:          'Optic Power',
            subtitle:       'Unity / Unreal Developer & Software Engineer',
            date:           'Mar 2021 - Present',
            icon:           'WorkIcon',
            iconBackground: '#f9004d',
            technologies: ['Unity', 'C#', 'React', 'Node.js', 'WebSocket', 'HoloLens 2', 'MRTK3', 'Jenkins'],
            responsibilities: [
                'AR Industrial Training Platform (HoloLens 2 + Unity + MRTK3)',
                'Real-Time Industrial Dashboard (React + Node.js + WebSocket)',
                'Unity Editor Toolkit (Jenkins CI/CD + build automation)',
                'Medellín, Colombia',
            ],
        },
        {
            title:          'Freelance',
            subtitle:       'Unity Developer',
            date:           'Jun 2019 - Feb 2021',
            icon:           'WorkIcon',
            iconBackground: '#4158d0',
            technologies: ['Unity', 'C#', 'Firebase', 'Unity Ads', 'AR Foundation'],
            responsibilities: [
                'Idle Factory Tycoon (Unity + Firebase, Google Play)',
                'AR prototypes for marketing agencies',
                'Custom Unity tooling for indie studios',
                'Remote',
            ],
        },
        {
            title:          'Institución Universitaria ITM',
            subtitle:       'Systems Engineering',
            date:           '2017 - 2022',
            icon:           'SchoolIcon',
            iconBackground: '#2d7dd2',
            technologies: [],
            responsibilities: ['Medellín, Colombia'],
        },
        {
            title:          'SENA',
            subtitle:       'Software Analysis and Development',
            date:           '2017 - 2018',
            icon:           'SchoolIcon',
            iconBackground: '#198754',
            technologies: [],
            responsibilities: ['Medellín, Colombia'],
        },
    ],
};

// ── Technologies ──────────────────────────────────────────────────────────────
// Each entry: { name, category, packages }
// category ∈ engines | languages | web | xr3d | tools | hardware
// packages mirrors the old PACKAGES_MAP from SceneStack.js — now fully DB-driven

const technologiesData = {
    technologies: [
        // ── Engines ──────────────────────────────────────────────────────────
        {
            name: 'Unity', category: 'engines',
            packages: [
                'New Input System', 'Cinemachine', 'FMOD Studio', 'DOTween', 'UniTask',
                'Addressables', 'Netcode for GameObjects', 'Mirror Networking', 'ProBuilder',
                'Shader Graph', 'VFX Graph', 'TextMeshPro', 'Timeline', 'Universal RP (URP)',
                'High Definition RP (HDRP)', 'Odin Inspector', 'A* Pathfinding Project',
                'Zenject', 'PlayFab', 'Steamworks.NET', 'Spine 2D', 'LeanTween',
            ],
        },
        {
            name: 'Unreal Engine', category: 'engines',
            packages: [
                'Gameplay Ability System (GAS)', 'Enhanced Input System', 'FMOD Studio',
                'Common UI', 'Niagara VFX', 'MetaSound', 'Motion Warping', 'Control Rig',
                'IK Rig', 'Full Body IK', 'Online Subsystem Steam', 'Wwise',
                'Mass Entity (ECS)', 'PCG Framework', 'Chaos Vehicles', 'Water System',
                'Lyra Game Framework', 'GameplayTags',
            ],
        },
        {
            name: 'Custom engines', category: 'engines',
            packages: ['SDL2', 'SFML', 'OpenGL', 'Vulkan', 'DirectX 12', 'FMOD Core', 'PhysX', 'Bullet Physics', 'EnTT (ECS)', 'flecs (ECS)'],
        },

        // ── Languages ─────────────────────────────────────────────────────────
        {
            name: 'C#', category: 'languages',
            packages: [
                'LINQ', 'async/await & Task Parallel Library', 'Roslyn Analyzers',
                'NUnit', 'xUnit', 'Moq', 'BenchmarkDotNet', 'Newtonsoft.Json',
                'System.Text.Json', 'AutoMapper', 'Dapper',
            ],
        },
        {
            name: 'C++', category: 'languages',
            packages: ['STL', 'Boost', 'EASTL', 'CMake', 'vcpkg', 'Conan', 'Catch2', 'Google Test', 'spdlog', 'nlohmann/json', 'glm'],
        },
        {
            name: 'TypeScript', category: 'languages',
            packages: ['Zod', 'ts-morph', 'type-fest', 'tRPC', 'class-validator', 'fp-ts', 'io-ts'],
        },
        {
            name: 'JavaScript', category: 'languages',
            packages: ['ESLint', 'Prettier', 'Babel', 'Webpack', 'Vite', 'Rollup', 'esbuild'],
        },
        {
            name: 'Python', category: 'languages',
            packages: ['NumPy', 'Pandas', 'FastAPI', 'Pydantic', 'pytest', 'Typer', 'SQLAlchemy', 'Alembic', 'Celery', 'httpx'],
        },

        // ── Web ───────────────────────────────────────────────────────────────
        {
            name: 'React', category: 'web',
            packages: [
                'TanStack Query (React Query)', 'Redux Toolkit', 'Zustand', 'Jotai',
                'React Hook Form', 'Framer Motion', 'React Three Fiber', 'React Router',
                'React Testing Library', 'shadcn/ui', 'Radix UI', 'Headless UI',
                'React Spring', 'Recharts',
            ],
        },
        {
            name: 'Next.js', category: 'web',
            packages: ['tRPC', 'Prisma', 'Auth.js (NextAuth)', 'Vercel AI SDK', 'next-intl', 'next-sitemap'],
        },
        {
            name: 'Three.js', category: 'web',
            packages: ['Drei (@react-three/drei)', 'Rapier Physics', 'GSAP', 'Cannon.js', 'Postprocessing', 'Leva (controls)', 'Troika Text'],
        },
        {
            name: 'WebGL', category: 'web',
            packages: ['GLSL Shaders', 'WebGPU', 'TWGL', 'OGL'],
        },
        {
            name: 'Node.js', category: 'web',
            packages: ['Express', 'Fastify', 'Hono', 'Socket.io', 'Prisma', 'Drizzle ORM', 'BullMQ', 'Passport.js', 'Jest', 'Vitest', 'Pino (logging)'],
        },

        // ── XR / 3D ───────────────────────────────────────────────────────────
        {
            name: 'OpenXR', category: 'xr3d',
            packages: ['OpenXR Toolkit', 'Monado', 'OpenComposite'],
        },
        {
            name: 'Spatial Computing', category: 'xr3d',
            packages: ['visionOS (SwiftUI + RealityKit)', 'PolySpatial (Unity)', 'HoloLens 2 SDK (MRTK3)', 'Magic Leap SDK'],
        },
        {
            name: 'VR Platforms', category: 'xr3d',
            packages: ['SteamVR SDK', 'Meta XR SDK (Oculus)', 'VRTK 4', 'XR Interaction Toolkit', 'OpenVR', 'Varjo SDK'],
        },
        {
            name: 'AR', category: 'xr3d',
            packages: ['ARCore', 'ARKit', 'AR Foundation (Unity)', 'Vuforia', 'Immersal', 'Lightship ARDK'],
        },

        // ── Tools ─────────────────────────────────────────────────────────────
        {
            name: 'Git', category: 'tools',
            packages: ['GitHub Actions', 'Git LFS', 'GitFlow', 'Conventional Commits', 'Semantic Release', 'Husky + lint-staged'],
        },
        {
            name: 'Docker', category: 'tools',
            packages: ['Docker Compose', 'Kubernetes (k8s)', 'Helm', 'Docker Hub', 'Buildx (multi-platform)'],
        },
        {
            name: 'AWS', category: 'tools',
            packages: ['EC2', 'S3', 'Lambda', 'CloudFormation / CDK', 'ECS / Fargate', 'RDS', 'CloudFront', 'API Gateway', 'SQS / SNS'],
        },
        {
            name: 'Database Design', category: 'tools',
            packages: ['PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Supabase', 'Firebase / Firestore', 'PlanetScale', 'Neon'],
        },
        {
            name: 'CI/CD', category: 'tools',
            packages: ['GitHub Actions', 'Jenkins', 'CircleCI', 'GitLab CI', 'Vercel Deploy', 'Railway', 'Render'],
        },
        {
            name: 'Vercel', category: 'tools',
            packages: ['Serverless Functions', 'Edge Functions', 'Analytics', 'Speed Insights', 'Vercel AI SDK', 'Image Optimization'],
        },

        // ── Hardware ──────────────────────────────────────────────────────────
        {
            name: 'HoloLens 2', category: 'hardware',
            packages: ['Microsoft HoloLens 2', 'Hand Tracking', 'Eye Tracking', 'Spatial Mapping', 'Spatial Audio', 'Research Mode'],
        },
        {
            name: 'Meta Quest', category: 'hardware',
            packages: ['Meta Quest Pro', 'Meta Quest 3', 'Touch Controllers', 'Hand Tracking 2.0', 'Passthrough API', 'MR Utility Kit'],
        },
        {
            name: 'Apple Vision Pro', category: 'hardware',
            packages: ['visionOS', 'RealityKit', 'ARKit', 'Hand Tracking', 'Eye Tracking', 'Persona'],
        },
        {
            name: 'Magic Leap 2', category: 'hardware',
            packages: ['Magic Leap SDK', 'Spatial Computing', 'Segmented Dimming', 'Hand Tracking'],
        },
        {
            name: 'Leap Motion / Ultraleap', category: 'hardware',
            packages: ['Hand Tracking API', 'Interaction Engine', 'Mounting Kit', 'Stereo IR 170'],
        },
        {
            name: 'Varjo XR', category: 'hardware',
            packages: ['Varjo SDK', 'Human-eye Resolution', 'XR-4', 'Aero (VR)', 'Varjo Base'],
        },
        {
            name: 'Mobile & Embedded', category: 'hardware',
            packages: ['iPhone/iPad', 'Android Devices', 'Raspberry Pi', 'Arduino', 'NVIDIA Jetson', 'LiDAR Scanner'],
        },
    ],
};

// ── Blog ─────────────────────────────────────────────────────────────────────

const blogData = [
    {
        title: 'Building a Unity Editor Tool That Saved 30% Build Time',
        slug: 'unity-editor-tool-build-time',
        excerpt: 'How I built a custom Unity EditorWindow suite at Optic Power that automated builds, audited assets, and cut iteration time by nearly a third.',
        content: '## The Problem\n\nAt Optic Power, our 4-person engineering team was spending too much time on manual build processes and asset housekeeping. Every build required clicking through Unity menus, waiting for full rebuilds, and manually checking for unused assets.\n\n## The Solution\n\nI designed a suite of Unity Editor tools:\n\n- **Build Automation Window**: One-click builds with configurable scenes and platforms\n- **Asset Auditor**: Scanned the project for unused/oversized assets\n- **Jenkins Pipeline**: CI/CD triggered on git push\n\nThe result? Build iteration time dropped by 30% and the team shipped faster.\n\n## Technical Details\n\n- Custom EditorWindows with IMGUI\n- Jenkins pipeline with parameterized builds\n- Asset database scanning with EditorUtility.CollectDependencies',
        featuredImage: null,
        tags: ['Unity', 'C#', 'Tooling', 'DevOps'],
        published: true,
        publishDate: new Date('2024-06-15'),
    },
    {
        title: 'From Idea to Google Play: Shipping My First Mobile Game',
        slug: 'first-mobile-game-google-play',
        excerpt: 'The journey of building and publishing "Idle Factory Tycoon" — an idle game built with Unity, featuring offline progression and rewarded ads.',
        content: '## The Concept\n\nI wanted to build a mobile idle game that players could enjoy in short bursts. The factory tycoon theme fit perfectly — build machines, earn coins, upgrade, repeat.\n\n## Development\n\nBuilt with Unity and C#, the game features:\n- Offline progression system\n- Rewarded video ads for bonuses\n- Firebase Analytics and Crashlytics\n- Unity Addressables for dynamic content delivery\n\n## Launch\n\nPublished to Google Play and reached 250+ downloads in the first month. Learned a ton about mobile optimization, ad integration, and live operations.',
        featuredImage: null,
        tags: ['Unity', 'C#', 'Mobile', 'Game Dev', 'Firebase'],
        published: true,
        publishDate: new Date('2023-11-20'),
    },
];

// ── Plugins / Packages ──────────────────────────────────────────────────────

const pluginsData = [
    {
        name: 'Unity Build Automation Toolkit',
        slug: 'unity-build-automation-toolkit',
        description: 'One-click build window, asset auditor, and automated CI/CD pipeline for Unity projects.',
        storeType: 'unity',
        unityStoreUrl: null,
        unrealStoreUrl: null,
        images: [],
        icon: null,
        price: 'Free',
        version: '1.0.0',
        technologies: ['Unity', 'C#', 'Jenkins'],
        featured: true,
    },
    {
        name: 'Unreal Engine Lag Compensation Plugin',
        slug: 'unreal-lag-compensation',
        description: 'Client-side prediction and lag compensation for competitive multiplayer in Unreal Engine 5.',
        storeType: 'unreal',
        unityStoreUrl: null,
        unrealStoreUrl: null,
        images: [],
        icon: null,
        price: '$29.99',
        version: '0.5.0',
        technologies: ['Unreal Engine 5', 'C++', 'Gameplay Ability System'],
        featured: true,
    },
];

// ── Apps ────────────────────────────────────────────────────────────────────

const appsData = [
    {
        name: 'Idle Factory Tycoon',
        slug: 'idle-factory-tycoon',
        description: 'Build and manage your own factory empire. Idle gameplay with offline progression, upgrades, and rewarded ads.',
        platform: 'android',
        appStoreUrl: null,
        googlePlayUrl: null,
        images: [],
        icon: null,
        downloads: 250,
        rating: 4.2,
        featured: true,
    },
    {
        name: 'AR Industrial Training',
        slug: 'ar-industrial-training',
        description: 'HoloLens 2 spatial computing app for hands-free technician training at industrial facilities.',
        platform: 'desktop',
        appStoreUrl: null,
        googlePlayUrl: null,
        images: [],
        icon: null,
        downloads: 0,
        rating: 0,
        featured: false,
    },
    {
        name: 'WisprTasks',
        slug: 'wisprtasks',
        description: 'A focused task app that makes capturing and acting on priorities feel less overwhelming.',
        platform: 'web',
        appStoreUrl: null,
        googlePlayUrl: null,
        images: [],
        icon: null,
        downloads: 0,
        rating: 0,
        featured: true,
    },
];

// ── Users (dashboard auth) ──────────────────────────────────────────────────

const ADMIN_PASSWORD = 'admin123';

const usersData = [
    {
        username: 'admin',
        email: 'vanegasdanilo7@gmail.com',
        passwordHash: bcrypt.hashSync(ADMIN_PASSWORD, 10),
        role: 'admin',
        createdAt: new Date(),
    },
];

// ── Tech Stack Graph ─────────────────────────────────────────────────────────

const techStackData = {
    categories: [
        { key: 'softSkill',  label: 'Soft Skills',  color: '#00ff88' },
        { key: 'gamedev',    label: 'Game Dev',     color: '#fff34d' },
        { key: 'frontend',   label: 'Frontend',     color: '#61dafb' },
        { key: 'backend',    label: 'Backend',      color: '#68a063' },
        { key: 'database',   label: 'Database',     color: '#13aa52' },
        { key: 'tools',      label: 'Tools',        color: '#ff6b9d' },
    ],
    nodes: [
        { id: 'problem-solving',          label: 'Problem Solving',          category: 'softSkill', color: '#00ff88' },
        { id: 'leadership',               label: 'Leadership',               category: 'softSkill', color: '#00ff88' },
        { id: 'communication',            label: 'Communication',            category: 'softSkill', color: '#00ff88' },
        { id: 'collaboration',            label: 'Collaboration',            category: 'softSkill', color: '#00ff88' },
        { id: 'critical-thinking',        label: 'Critical Thinking',        category: 'softSkill', color: '#00ff88' },
        { id: 'unity',                    label: 'Unity',                    category: 'gamedev',   color: '#fff34d' },
        { id: 'unreal',                   label: 'Unreal Engine',            category: 'gamedev',   color: '#fff34d' },
        { id: 'c-sharp',                  label: 'C#',                       category: 'gamedev',   color: '#fff34d' },
        { id: 'c-plus',                   label: 'C++',                      category: 'gamedev',   color: '#fff34d' },
        { id: 'gameplay-ability-system',  label: 'Gameplay Ability System',  category: 'gamedev',   color: '#fff34d' },
        { id: 'unity-input-system',       label: 'Unity Input System',       category: 'gamedev',   color: '#fff34d' },
        { id: 'linq',                     label: 'LINQ',                     category: 'gamedev',   color: '#fff34d' },
        { id: 'fmod',                     label: 'FMOD',                     category: 'gamedev',   color: '#fff34d' },
        { id: 'react',                    label: 'React',                    category: 'frontend',  color: '#61dafb' },
        { id: 'javascript',               label: 'JavaScript',               category: 'frontend',  color: '#61dafb' },
        { id: 'html-css',                 label: 'HTML/CSS',                 category: 'frontend',  color: '#61dafb' },
        { id: 'nextjs',                   label: 'Next.js',                  category: 'frontend',  color: '#61dafb' },
        { id: 'nodejs',                   label: 'Node.js',                  category: 'backend',   color: '#68a063' },
        { id: 'firebase',                 label: 'Firebase',                 category: 'backend',   color: '#68a063' },
        { id: 'aws',                      label: 'AWS',                      category: 'backend',   color: '#68a063' },
        { id: 'prisma',                   label: 'Prisma',                   category: 'backend',   color: '#68a063' },
        { id: 'mongodb',                  label: 'MongoDB',                  category: 'database',  color: '#13aa52' },
        { id: 'postgres',                 label: 'PostgreSQL',               category: 'database',  color: '#13aa52' },
        { id: 'git',                      label: 'Git',                      category: 'tools',     color: '#ff6b9d' },
        { id: 'github-desktop',           label: 'GitHub Desktop',           category: 'tools',     color: '#ff6b9d' },
        { id: 'git-kraken',               label: 'GitKraken',                category: 'tools',     color: '#ff6b9d' },
        { id: 'gitea',                    label: 'Gitea',                    category: 'tools',     color: '#ff6b9d' },
        { id: 'jira',                     label: 'Jira',                     category: 'tools',     color: '#ff6b9d' },
        { id: 'confluence',               label: 'Confluence',               category: 'tools',     color: '#ff6b9d' },
        { id: 'bitbucket',                label: 'Bitbucket',                category: 'tools',     color: '#ff6b9d' },
        { id: 'optimization',             label: 'Performance Optimization',  category: 'tools',     color: '#ff6b9d' },
        { id: 'profiling',                label: 'Profiling & Debugging',    category: 'tools',     color: '#ff6b9d' },
    ],
    relationships: [
        { from: 'problem-solving', to: 'unity', type: 'dependency' },
        { from: 'problem-solving', to: 'unreal', type: 'dependency' },
        { from: 'problem-solving', to: 'react', type: 'dependency' },
        { from: 'problem-solving', to: 'optimization', type: 'dependency' },
        { from: 'leadership', to: 'communication', type: 'dependency' },
        { from: 'leadership', to: 'collaboration', type: 'dependency' },
        { from: 'communication', to: 'git', type: 'dependency' },
        { from: 'critical-thinking', to: 'problem-solving', type: 'dependency' },
        { from: 'unity', to: 'c-sharp', type: 'dependency' },
        { from: 'unity', to: 'gameplay-ability-system', type: 'stack', label: 'GAS' },
        { from: 'unity', to: 'unity-input-system', type: 'stack', label: 'Input' },
        { from: 'unity', to: 'fmod', type: 'dependency' },
        { from: 'unreal', to: 'c-plus', type: 'dependency' },
        { from: 'unreal', to: 'gameplay-ability-system', type: 'stack', label: 'GAS' },
        { from: 'c-sharp', to: 'linq', type: 'dependency' },
        { from: 'c-sharp', to: 'optimization', type: 'dependency' },
        { from: 'c-plus', to: 'optimization', type: 'dependency' },
        { from: 'c-plus', to: 'profiling', type: 'dependency' },
        { from: 'react', to: 'javascript', type: 'dependency' },
        { from: 'react', to: 'html-css', type: 'dependency' },
        { from: 'nextjs', to: 'react', type: 'dependency' },
        { from: 'nextjs', to: 'nodejs', type: 'stack', label: 'Full-Stack' },
        { from: 'react', to: 'firebase', type: 'stack', label: 'Frontend' },
        { from: 'nodejs', to: 'javascript', type: 'dependency' },
        { from: 'nodejs', to: 'git', type: 'dependency' },
        { from: 'nodejs', to: 'optimization', type: 'dependency' },
        { from: 'firebase', to: 'mongodb', type: 'stack', label: 'NoSQL' },
        { from: 'aws', to: 'optimization', type: 'dependency' },
        { from: 'prisma', to: 'nodejs', type: 'dependency' },
        { from: 'prisma', to: 'postgres', type: 'stack', label: 'ORM' },
        { from: 'prisma', to: 'mongodb', type: 'stack', label: 'ORM' },
        { from: 'mongodb', to: 'optimization', type: 'dependency' },
        { from: 'postgres', to: 'optimization', type: 'dependency' },
        { from: 'git', to: 'github-desktop', type: 'stack', label: 'Git GUI' },
        { from: 'git', to: 'git-kraken', type: 'stack', label: 'Git GUI' },
        { from: 'git', to: 'gitea', type: 'stack', label: 'Git Host' },
        { from: 'jira', to: 'confluence', type: 'stack', label: 'Atlassian' },
        { from: 'jira', to: 'collaboration', type: 'dependency' },
        { from: 'optimization', to: 'profiling', type: 'dependency' },
        { from: 'optimization', to: 'nodejs', type: 'dependency' },
        { from: 'profiling', to: 'critical-thinking', type: 'dependency' },
    ],
};

// ── Skills (skill-to-project mapping) ───────────────────────────────────────

const skillsData = {
    skillCategories: {
        'Game Engines': ['Unreal Engine', 'Unity'],
        'Programming Languages': ['C++', 'C#'],
        'Core Competencies': ['Gameplay Programming', 'Graphics Programming', 'Multiplayer Systems', 'Performance Optimization'],
        'Specializations': ['Game Design'],
    },
    skills: {
        'Unreal Engine': {
            color: '#00ff88',
            description: 'Build AAA-quality gameplay systems, multiplayer networking, and optimized graphics',
            focus: 'Game engines, systems, performance',
            projectKeywords: ['unreal', 'ue4', 'ue5', 'c++'],
            examples: ['Advanced multiplayer networking systems', 'High-performance gameplay mechanics', 'Custom shader and graphics pipelines'],
        },
        'Unity': {
            color: '#00d9ff',
            description: 'Create diverse games with robust gameplay, networking, and cross-platform support',
            focus: 'Cross-platform development, gameplay, optimization',
            projectKeywords: ['unity', 'c#', 'game'],
            examples: ['Multiplayer game systems', 'Mobile-optimized gameplay', 'Real-time networking solutions'],
        },
        'C++': {
            color: '#ff00ff',
            description: 'Write high-performance, systems-level code for games and engines',
            focus: 'Performance, systems programming, optimization',
            projectKeywords: ['c++', 'unreal', 'performance'],
            examples: ['Gameplay systems and frameworks', 'Performance-critical algorithms', 'Engine-level optimizations'],
        },
        'C#': {
            color: '#00ff88',
            description: 'Develop robust, maintainable game systems and mechanics',
            focus: 'Game systems, gameplay programming, architecture',
            projectKeywords: ['c#', 'unity', 'networking'],
            examples: ['Networking systems and protocols', 'Player mechanics and controllers', 'Game state management'],
        },
        'Gameplay Programming': {
            color: '#bd00ff',
            description: 'Design and implement core gameplay mechanics, player controllers, and game systems',
            focus: 'Mechanics, systems design, player experience',
            projectKeywords: ['gameplay', 'mechanics', 'player', 'controller', 'system'],
            examples: ['Player movement and interaction systems', 'Game mechanic implementations', 'State machine and behavior systems'],
        },
        'Game Design': {
            color: '#00d9ff',
            description: 'Design engaging mechanics, progression systems, and compelling gameplay loops',
            focus: 'Mechanics, progression, player experience',
            projectKeywords: ['game', 'mechanics', 'design'],
            examples: ['Game mechanics and systems design', 'Player progression systems', 'Engaging gameplay loops'],
        },
        'Graphics Programming': {
            color: '#ff00ff',
            description: 'Optimize rendering, create visual effects, and implement custom shaders',
            focus: 'Rendering optimization, visual effects, performance',
            projectKeywords: ['graphics', 'optimization', 'shader'],
            examples: ['Custom shader development', 'Rendering optimization techniques', 'Visual effect systems'],
        },
        'Multiplayer Systems': {
            color: '#39ff14',
            description: 'Build scalable networking architectures for real-time multiplayer games',
            focus: 'Networking, synchronization, scalability',
            projectKeywords: ['multiplayer', 'networking', 'replication'],
            examples: ['Custom networking protocols', 'Player synchronization systems', 'Scalable server architecture'],
        },
        'Performance Optimization': {
            color: '#00fff9',
            description: 'Profile, analyze, and optimize game code for maximum efficiency',
            focus: 'Profiling, optimization, memory management',
            projectKeywords: ['optimization', 'performance', 'profile'],
            examples: ['GPU optimization techniques', 'Memory management strategies', 'Frame rate optimization'],
        },
    },
};

// ── Category Metadata ───────────────────────────────────────────────────────

const categoriesData = {
    colors: {
        engines:   '#3b82f6',
        languages: '#f59e0b',
        web:       '#10b981',
        xr3d:      '#8b5cf6',
        tools:     '#ec4899',
        hardware:  '#ff6b9d',
    },
    labels: {
        engines:   'Engines',
        languages: 'Languages',
        web:       'Web',
        xr3d:      'XR/3D',
        tools:     'Tools',
        hardware:  'Hardware',
    },
    order: ['engines', 'languages', 'web', 'xr3d', 'tools', 'hardware'],
};

// ── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(dbName);

        const seedCollections = ['about', 'projects', 'experience', 'technologies', 'blog', 'plugins', 'apps', 'users', 'techstack', 'skills', 'categories'];
        for (const name of seedCollections) {
            await db.collection(name).deleteMany({});
            console.log(`  cleared: ${name}`);
        }

        await db.collection('about').insertOne(aboutData);
        console.log('  seeded: about');

        await db.collection('projects').insertOne(projectsData);
        console.log(`  seeded: projects (${projectsData.projects.length} entries)`);

        await db.collection('experience').insertOne(experienceData);
        console.log(`  seeded: experience (${experienceData.experience.length} entries)`);

        await db.collection('technologies').insertOne(technologiesData);
        console.log(`  seeded: technologies (${technologiesData.technologies.length} entries with packages)`);

        if (blogData.length) {
            await db.collection('blog').insertMany(blogData);
            console.log(`  seeded: blog (${blogData.length} posts)`);
        }

        if (pluginsData.length) {
            await db.collection('plugins').insertMany(pluginsData);
            console.log(`  seeded: plugins (${pluginsData.length} entries)`);
        }

        if (appsData.length) {
            await db.collection('apps').insertMany(appsData);
            console.log(`  seeded: apps (${appsData.length} entries)`);
        }

        if (usersData.length) {
            await db.collection('users').insertMany(usersData);
            console.log(`  seeded: users (${usersData.length} accounts)`);
        }

        await db.collection('techstack').insertOne(techStackData);
        console.log(`  seeded: techstack (${techStackData.nodes.length} nodes, ${techStackData.relationships.length} edges)`);

        await db.collection('skills').insertOne(skillsData);
        console.log(`  seeded: skills (${Object.keys(skillsData.skills).length} skills)`);

        await db.collection('categories').insertOne(categoriesData);
        console.log('  seeded: categories (colors, labels, order)');

        console.log('\nDone. Database is ready.');
    } catch (err) {
        console.error('Seed failed:', err.message);
        process.exit(1);
    } finally {
        await client.close();
    }
}

seed();
