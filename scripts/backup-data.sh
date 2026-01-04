#!/bin/bash
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
# Check if files exist before copying to avoid errors
if [ -f "./data/courses.json" ]; then
    cp ./data/courses.json "$BACKUP_DIR/"
fi
if [ -f "./data/stats.json" ]; then
    cp ./data/stats.json "$BACKUP_DIR/"
fi
echo "✅ Backup erstellt: $BACKUP_DIR"
