#!/bin/bash

# Health check and backup script for max.kozyura.space
# Runs daily at 8 AM MSK (5 AM UTC)

set -e

COMPOSE_DIR="/opt/station-maksim"
LOG_FILE="/var/log/station-maksim-health.log"
BACKUP_DIR="/opt/station-maksim/backups"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
BACKUP_DATE=$(date '+%Y%m%d')

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Log function
log_msg() {
    echo "[${TIMESTAMP}] $1" >> "$LOG_FILE"
}

log_msg "========== HEALTH CHECK START =========="

# Function to check website availability
check_website() {
    local http_code=$(curl -s -o /dev/null -w "%{http_code}" -m 10 "https://max.kozyura.space/" 2>/dev/null)
    echo "$http_code"
}

# Function to backup database
backup_database() {
    log_msg "Starting database backup..."

    cd "$COMPOSE_DIR"

    # Export postgres connection
    POSTGRES_CONTAINER="station-maksim_postgres_1"
    BACKUP_FILE="$BACKUP_DIR/postgres_backup_${BACKUP_DATE}.sql.gz"

    # Check if container exists and is running
    if ! docker ps | grep -q "$POSTGRES_CONTAINER"; then
        log_msg "ERROR: PostgreSQL container not running!"
        return 1
    fi

    # Create backup
    docker exec "$POSTGRES_CONTAINER" pg_dump -U postgres 2>/dev/null | gzip > "$BACKUP_FILE"

    if [ $? -eq 0 ]; then
        log_msg "Database backup completed: $BACKUP_FILE"
        # Keep only last 14 days of backups
        find "$BACKUP_DIR" -name "postgres_backup_*.sql.gz" -mtime +14 -delete
        log_msg "Cleanup: removed backups older than 14 days"
        return 0
    else
        log_msg "ERROR: Database backup failed!"
        return 1
    fi
}

# Function to restore services
restore_services() {
    log_msg "WARNING: Website unavailable! Attempting restore..."

    cd "$COMPOSE_DIR"

    # Check container status
    docker-compose ps

    log_msg "Stopping containers..."
    docker-compose down 2>&1 | head -5

    sleep 3

    log_msg "Starting containers..."
    docker-compose up -d 2>&1 | tail -5

    sleep 5

    # Check if postgres is healthy
    if docker-compose ps | grep -q "postgres.*healthy"; then
        log_msg "PostgreSQL is healthy"
    else
        log_msg "WARNING: PostgreSQL not yet healthy, waiting..."
        sleep 10
    fi

    return 0
}

# Main checks
HTTP_CODE=$(check_website)
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

if [ "$HTTP_CODE" = "200" ]; then
    log_msg "Website is UP (HTTP $HTTP_CODE)"
    backup_database
    BACKUP_STATUS=$?
    if [ $BACKUP_STATUS -eq 0 ]; then
        log_msg "Backup successful"
    else
        log_msg "Backup failed (but website is working)"
    fi
else
    log_msg "Website DOWN (HTTP $HTTP_CODE) - RESTORING"
    restore_services

    sleep 5

    # Recheck after restore
    HTTP_CODE=$(check_website)
    if [ "$HTTP_CODE" = "200" ]; then
        log_msg "Restore successful, website is back UP"
        backup_database
    else
        log_msg "Restore failed - website still unavailable (HTTP $HTTP_CODE)"
        log_msg "Manual intervention required!"
    fi
fi

log_msg "========== HEALTH CHECK END =========="
