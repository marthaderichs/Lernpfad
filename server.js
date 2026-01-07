// server.js - NEUE VERSION MIT SQLITE
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Datenbank-Import
import { db } from './server/db/index.js';
import { dashboardItems, userStats } from './server/db/schema.js';
import { eq } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Static files
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
}

// ============ COURSES API ============

// GET all courses/folders
app.get('/api/courses', async (req, res) => {
    try {
        const items = await db.select().from(dashboardItems);
        
        // Konvertiere JSON-Strings zurück zu Objekten
        const formatted = items.map(item => ({
            ...item,
            units: item.units ? JSON.parse(item.units) : undefined,
            courseProgress: item.courseProgress ? JSON.parse(item.courseProgress) : undefined,
        }));
        
        res.json({ success: true, data: formatted });
    } catch (error) {
        console.error('GET /api/courses error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST save all courses (Bulk-Update)
app.post('/api/courses', async (req, res) => {
    try {
        const items = req.body;
        
        // Transaction: Lösche alle und füge neu ein
        // ACHTUNG: Das ist ein Kompromiss für Kompatibilität mit dem alten Frontend
        await db.transaction(async (tx) => {
            await tx.delete(dashboardItems);
            
            for (const item of items) {
                await tx.insert(dashboardItems).values({
                    id: item.id,
                    type: item.type || 'course',
                    name: item.name || item.title,
                    themeColor: item.themeColor,
                    parentFolderId: item.parentFolderId,
                    units: item.units ? JSON.stringify(item.units) : null,
                    courseProgress: item.courseProgress ? JSON.stringify(item.courseProgress) : null,
                    sortOrder: item.sortOrder,
                });
            }
        });
        
        res.json({ success: true, message: 'Courses saved' });
    } catch (error) {
        console.error('POST /api/courses error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE a specific course
app.delete('/api/courses/:id', async (req, res) => {
    try {
        const courseId = req.params.id;
        await db.delete(dashboardItems).where(eq(dashboardItems.id, courseId));
        
        const remaining = await db.select().from(dashboardItems);
        // Formatieren für Rückgabe
        const formatted = remaining.map(item => ({
            ...item,
            units: item.units ? JSON.parse(item.units) : undefined,
            courseProgress: item.courseProgress ? JSON.parse(item.courseProgress) : undefined,
        }));

        res.json({ success: true, data: formatted, message: 'Course deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST add a new course
app.post('/api/courses/add', async (req, res) => {
    try {
        const newItem = req.body;
        
        await db.insert(dashboardItems).values({
            id: newItem.id,
            type: newItem.type || 'course',
            name: newItem.name || newItem.title,
            themeColor: newItem.themeColor,
            parentFolderId: newItem.parentFolderId,
            units: newItem.units ? JSON.stringify(newItem.units) : null,
            courseProgress: newItem.courseProgress ? JSON.stringify(newItem.courseProgress) : null,
            sortOrder: newItem.sortOrder,
        });
        
        const all = await db.select().from(dashboardItems);
        // Formatieren
        const formatted = all.map(item => ({
            ...item,
            units: item.units ? JSON.parse(item.units) : undefined,
            courseProgress: item.courseProgress ? JSON.parse(item.courseProgress) : undefined,
        }));

        res.json({ success: true, data: formatted, message: 'Course added' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST move items
app.post('/api/courses/move', async (req, res) => {
    try {
        const { itemIds, targetFolderId } = req.body;
        
        for (const id of itemIds) {
            await db.update(dashboardItems)
                .set({ parentFolderId: targetFolderId })
                .where(eq(dashboardItems.id, id));
        }
        
        const all = await db.select().from(dashboardItems);
        // Formatieren
        const formatted = all.map(item => ({
             ...item,
            units: item.units ? JSON.parse(item.units) : undefined,
            courseProgress: item.courseProgress ? JSON.parse(item.courseProgress) : undefined,
        }));

        res.json({ success: true, data: formatted, message: 'Items moved' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ USER STATS API ============

app.get('/api/stats', async (req, res) => {
    try {
        const stats = await db.select().from(userStats).limit(1);
        res.json({ success: true, data: stats[0] || null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/stats', async (req, res) => {
    try {
        const newStats = req.body;
        
        // Upsert: Update wenn existiert, sonst Insert
        const existing = await db.select().from(userStats).limit(1);
        
        if (existing.length > 0) {
            await db.update(userStats)
                .set({
                    stars: newStats.stars,
                    streak: newStats.streak,
                    lastActivity: newStats.lastActivity,
                    systemPrompt: newStats.systemPrompt,
                })
                .where(eq(userStats.id, 1));
        } else {
            await db.insert(userStats).values({
                stars: newStats.stars || 0,
                streak: newStats.streak || 0,
                lastActivity: newStats.lastActivity,
                systemPrompt: newStats.systemPrompt,
            });
        }
        
        res.json({ success: true, message: 'Stats saved' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

// ============ SPA FALLBACK ============
app.use((req, res) => {
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

// ============ START SERVER ============

// Migration beim Start ausführen (optional, aber sicher)
// import { execSync } from 'child_process';
// try {
//   console.log('Führe Datenbank-Migration aus...');
//   execSync('node server/db/migrate-from-json.js', { stdio: 'inherit' });
// } catch (e) {
//   console.error('Migration fehlgeschlagen, aber starte Server trotzdem:', e.message);
// }

app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 LernPfad Server gestartet! (SQLite Backend)');
    console.log(`   URL: http://localhost:${PORT}`);
});