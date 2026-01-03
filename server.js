import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Helper functions
const readJSON = (filePath, defaultValue) => {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error(`Error reading ${filePath}:`, e);
    }
    return defaultValue;
};

const writeJSON = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    } catch (e) {
        console.error(`Error writing ${filePath}:`, e);
        return false;
    }
};

// ============ COURSES API ============

// GET all courses
app.get('/api/courses', (req, res) => {
    const courses = readJSON(COURSES_FILE, null);
    res.json({ success: true, data: courses });
});

// POST save all courses
app.post('/api/courses', (req, res) => {
    const courses = req.body;
    if (writeJSON(COURSES_FILE, courses)) {
        res.json({ success: true, message: 'Courses saved' });
    } else {
        res.status(500).json({ success: false, message: 'Failed to save courses' });
    }
});

// DELETE a specific course
app.delete('/api/courses/:id', (req, res) => {
    const courseId = req.params.id;
    const courses = readJSON(COURSES_FILE, []);
    const updated = courses.filter(c => c.id !== courseId);

    if (writeJSON(COURSES_FILE, updated)) {
        res.json({ success: true, data: updated, message: 'Course deleted' });
    } else {
        res.status(500).json({ success: false, message: 'Failed to delete course' });
    }
});

// POST add a new course
app.post('/api/courses/add', (req, res) => {
    const newCourse = req.body;
    const courses = readJSON(COURSES_FILE, []);
    courses.push(newCourse);

    if (writeJSON(COURSES_FILE, courses)) {
        res.json({ success: true, data: courses, message: 'Course added' });
    } else {
        res.status(500).json({ success: false, message: 'Failed to add course' });
    }
});

// ============ USER STATS API ============

// GET user stats
app.get('/api/stats', (req, res) => {
    const stats = readJSON(STATS_FILE, null);
    res.json({ success: true, data: stats });
});

// POST save user stats
app.post('/api/stats', (req, res) => {
    const stats = req.body;
    if (writeJSON(STATS_FILE, stats)) {
        res.json({ success: true, message: 'Stats saved' });
    } else {
        res.status(500).json({ success: false, message: 'Failed to save stats' });
    }
});

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

// ============ SPA FALLBACK ============
// For client-side routing - serve index.html for all non-API routes
// Using middleware instead of wildcard route for Express 5 compatibility
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
    console.log('');
    console.log(`   URL: http://localhost:${PORT}`);
    console.log('');
    console.log('📁 Daten werden gespeichert in:', DATA_DIR);
    console.log('');
});
