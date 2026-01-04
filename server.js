import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import writeFileAtomic from 'write-file-atomic';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Database file paths
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const COURSES_FILE = path.join(DATA_DIR, 'courses.json');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static files from the dist folder (production build)
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
}

// Helper functions (ASYNC)
const readJSON = async (filePath, defaultValue) => {
    try {
        const exists = await fs.promises.access(filePath).then(() => true).catch(() => false);
        if (exists) {
            const data = await fs.promises.readFile(filePath, 'utf-8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error(`Error reading ${filePath}:`, e);
    }
    return defaultValue;
};

const writeJSON = async (filePath, data) => {
    try {
        await writeFileAtomic(filePath, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    } catch (e) {
        console.error(`Error writing ${filePath}:`, e);
        return false;
    }
};

// ============ COURSES API ============

// GET all courses
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await readJSON(COURSES_FILE, null);
        res.json({ success: true, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST save all courses
app.post('/api/courses', async (req, res) => {
    try {
        const courses = req.body;
        if (await writeJSON(COURSES_FILE, courses)) {
            res.json({ success: true, message: 'Courses saved' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to save courses' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE a specific course
app.delete('/api/courses/:id', async (req, res) => {
    try {
        const courseId = req.params.id;
        const courses = await readJSON(COURSES_FILE, []);
        const updated = courses.filter(c => c.id !== courseId);

        if (await writeJSON(COURSES_FILE, updated)) {
            res.json({ success: true, data: updated, message: 'Course deleted' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to delete course' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST add a new course
app.post('/api/courses/add', async (req, res) => {
    try {
        const newCourse = req.body;
        const courses = await readJSON(COURSES_FILE, []);
        courses.push(newCourse);

        if (await writeJSON(COURSES_FILE, courses)) {
            res.json({ success: true, data: courses, message: 'Course added' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to add course' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ USER STATS API ============

// GET user stats
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await readJSON(STATS_FILE, null);
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST save user stats
app.post('/api/stats', async (req, res) => {
    try {
        const stats = req.body;
        if (await writeJSON(STATS_FILE, stats)) {
            res.json({ success: true, message: 'Stats saved' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to save stats' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

// ============ SPA FALLBACK ============
// For client-side routing - serve index.html for all non-API routes
app.use((req, res) => {
    // Skip API routes (they should already be handled)
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ success: false, message: 'API endpoint not found' });
    }

    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('App not built. Run npm run build first.');
    }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('🚀 LernPfad Server gestartet!');
    console.log('   (Async I/O enabled - Enterprise Grade)');
    console.log('');
    console.log(`   URL: http://localhost:${PORT}`);
    console.log('');
    console.log('📁 Daten werden gespeichert in:', DATA_DIR);
    console.log('');
});
