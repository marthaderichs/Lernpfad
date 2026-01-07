// Migration Script: Restore icons and professors from backup JSON
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to DB
const DATA_DIR = process.env.DATA_DIR || './data';
const DB_PATH = path.join(DATA_DIR, 'lernpfad.db');

// Read backup JSON (from courses.json in project root or passed as argument)
const backupPath = process.argv[2] || './courses.json';

console.log('📂 Database path:', DB_PATH);
console.log('📄 Backup path:', backupPath);

try {
    // Read backup
    const backupRaw = fs.readFileSync(backupPath, 'utf-8');
    const backup = JSON.parse(backupRaw);

    // Handle both formats: direct array or { success, data } wrapper
    const items = Array.isArray(backup) ? backup : (backup.data || []);

    console.log(`\n📊 Found ${items.length} items in backup\n`);

    // Connect to DB
    const db = new Database(DB_PATH);

    // Prepare update statement
    const updateStmt = db.prepare(`
        UPDATE dashboard_items 
        SET icon = ?, professor = ?, total_progress = ?
        WHERE id = ?
    `);

    let updated = 0;
    let notFound = 0;

    for (const item of items) {
        const icon = item.icon || null;
        const professor = item.professor || null;
        const progress = item.totalProgress || 0;

        const result = updateStmt.run(icon, professor, progress, item.id);

        if (result.changes > 0) {
            console.log(`✅ ${item.id}: icon=${icon}, professor=${professor?.substring(0, 20) || 'N/A'}`);
            updated++;
        } else {
            console.log(`⚠️  ${item.id}: Not found in DB`);
            notFound++;
        }
    }

    console.log(`\n📈 Summary:`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⚠️  Not found: ${notFound}`);

    db.close();
    console.log('\n✨ Migration complete!');

} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
