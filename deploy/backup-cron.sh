#!/usr/bin/env bash
# ==============================================================================
# AICTE IDEA LAB - KUMARAGURU COLLEGE OF TECHNOLOGY (KCT)
# AUTOMATED DISASTER RECOVERY & BACKUP SCRIPT
# ==============================================================================
# Schedule via crontab: 0 2 * * * /var/www/idealab/deploy/backup-cron.sh

set -euo pipefail

BACKUP_DIR="/var/backups/idealab"
DATE=$(date +%Y%m%d_%H%M%S)
PROJECT_DIR="/var/www/idealab"
UPLOADS_DIR="/var/data/idealab_uploads"

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting AICTE IDEA Lab automated institutional backup..."

# 1. Database Backup
if [ -f "${PROJECT_DIR}/database_multi_hackathon.sqlite" ]; then
    echo "Backing up SQLite database..."
    sqlite3 "${PROJECT_DIR}/database_multi_hackathon.sqlite" ".backup '${BACKUP_DIR}/db_backup_${DATE}.sqlite'"
fi

# 2. Student Submissions & Uploads Tarball
if [ -d "${UPLOADS_DIR}" ]; then
    echo "Archiving submission uploads..."
    tar -czf "${BACKUP_DIR}/uploads_backup_${DATE}.tar.gz" -C "${UPLOADS_DIR}" .
fi

# 3. Retention Policy: Prune backups older than 14 days
echo "Applying 14-day retention pruning..."
find "${BACKUP_DIR}" -type f -mtime +14 -name "*backup*" -delete

echo "[$(date)] Institutional backup completed successfully."
