// server.js - NEUE VERSION MIT SQLITE
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Datenbank-Import
import { db } from './server/db/index.js';
import { dashboardItems, userStats } from './server/db/schema.js';
import { initDb } from './server/db/init.js'; // Import Init
import { eq } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize DB Tables on Startup
try {
    initDb();
} catch (e) {
    console.error("Failed to initialize database:", e);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Erhöhtes Limit für große Kurs-Daten

// Static files
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
}

// Logging Middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// HELPER: Format DB Items for Frontend
// Konvertiert DB-Felder zu Frontend-Interface (Course/Folder)
const formatItem = (item) => {
    const base = {
        id: item.id,
        type: item.type,
        title: item.name,  // DB hat 'name', Frontend erwartet 'title'
        icon: item.icon || '📚',
        themeColor: item.themeColor,
        parentFolderId: item.parentFolderId,
    };

    if (item.type === 'course') {
        return {
            ...base,
            titlePT: item.titlePt,
            professor: item.professor,
            totalProgress: item.totalProgress || 0,
            units: item.units ? JSON.parse(item.units) : [],
            courseProgress: item.courseProgress ? JSON.parse(item.courseProgress) : undefined,
        };
    }

    // Folder - keine course-spezifischen Felder
    return base;
};

// ============ COURSES API ============

// GET all courses/folders
app.get('/api/courses', async (req, res) => {
    try {
        const items = await db.select().from(dashboardItems);
        const formatted = items.map(formatItem);
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
        // ACHTUNG: better-sqlite3 Transaktionen müssen SYNCHRON sein!
        // Drizzle mit better-sqlite3 führt Queries synchron aus.
        db.transaction((tx) => {
            tx.delete(dashboardItems).run();

            for (const item of items) {
                tx.insert(dashboardItems).values({
                    id: item.id,
                    type: item.type || 'course',
                    name: item.name || item.title,
                    themeColor: item.themeColor,
                    parentFolderId: item.parentFolderId,
                    units: item.units ? JSON.stringify(item.units) : null,
                    courseProgress: item.courseProgress ? JSON.stringify(item.courseProgress) : null,
                    sortOrder: item.sortOrder,
                    updatedAt: new Date(), // Update timestamp
                }).run();
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
        res.json({ success: true, data: remaining.map(formatItem), message: 'Course deleted' });
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
            icon: newItem.icon || '📚',
            professor: newItem.professor,
            totalProgress: newItem.totalProgress || 0,
            titlePt: newItem.titlePT,
            units: newItem.units ? JSON.stringify(newItem.units) : null,
            courseProgress: newItem.courseProgress ? JSON.stringify(newItem.courseProgress) : null,
            sortOrder: newItem.sortOrder,
            updatedAt: new Date(),
        });

        const all = await db.select().from(dashboardItems);
        res.json({ success: true, data: all.map(formatItem), message: 'Course added' });
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
                .set({
                    parentFolderId: targetFolderId,
                    updatedAt: new Date(),
                })
                .where(eq(dashboardItems.id, id));
        }

        const all = await db.select().from(dashboardItems);
        res.json({ success: true, data: all.map(formatItem), message: 'Items moved' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ USER STATS API ============

app.get('/api/stats', async (req, res) => {
    try {
        const stats = await db.select().from(userStats).limit(1);
        const stat = stats[0] || null;

        if (stat) {
            // Map DB fields back to Frontend Interface (UserStats)
            const frontendStats = {
                ...stat,
                // DB has 'totalXp', 'currentStreak' etc via Drizzle camelCase mapping if defined, 
                // BUT better-sqlite3 returns raw rows if not careful? 
                // Drizzle handles the mapping from snake_case (DB) to camelCase (Schema).
                // We just need to parse JSON fields.
                purchasedItems: stat.purchasedItems ? JSON.parse(stat.purchasedItems) : [],
                // Map Renamed Fields just in case frontend expects old names?
                // No, frontend expects: totalXp, coins, currentStreak...
                // But wait, frontend MIGHT expect 'streak' if we didn't update frontend types?
                // Spec says: "Update user_stats table to match src/types/index.ts exactly."
                // So we return exactly what the schema defines (which matches types).

                // Legacy compatibility (optional, if frontend still uses 'streak')
                streak: stat.currentStreak,
                lastActivity: stat.lastStudyDate,
                stars: stat.totalXp, // Backwards compat
            };
            res.json({ success: true, data: frontendStats });
        } else {
            res.json({ success: true, data: null });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/stats', async (req, res) => {
    try {
        const newStats = req.body;

        // Map Frontend fields -> DB fields
        const values = {
            totalXp: newStats.totalXp ?? newStats.stars ?? 0,
            coins: newStats.coins ?? 0,
            currentStreak: newStats.currentStreak ?? newStats.streak ?? 0,
            lastStudyDate: newStats.lastStudyDate ?? newStats.lastActivity,
            purchasedItems: JSON.stringify(newStats.purchasedItems ?? []),
            activeAvatar: newStats.activeAvatar ?? '🦸',
            darkMode: newStats.darkMode ?? false,
            systemPrompt: newStats.systemPrompt,
            updatedAt: new Date(),
        };

        // Upsert Logic (SQLite does not support ON CONFLICT in Drizzle's `insert()` well for all drivers, 
        // sticking to robust check-then-update)
        const existing = await db.select().from(userStats).limit(1);

        if (existing.length > 0) {
            await db.update(userStats)
                .set(values)
                .where(eq(userStats.id, existing[0].id));
        } else {
            await db.insert(userStats).values(values);
        }

        res.json({ success: true, message: 'Stats saved' });
    } catch (error) {
        console.error('POST /api/stats error:', error);
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

app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 LernPfad Server gestartet! (SQLite Backend)');
    console.log(`   URL: http://localhost:${PORT}`);
});
