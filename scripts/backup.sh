#!/bin/bash

# Backup Script for n8n Email Campaign System

BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="n8n_email_campaign_backup_$TIMESTAMP"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

echo "========================================="
echo "n8n Email Campaign System - Backup"
echo "========================================="
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"
mkdir -p "$BACKUP_PATH"

echo "Creating backup: $BACKUP_NAME"
echo ""

# Backup n8n data
if [ -d "$HOME/.n8n" ]; then
    echo "📦 Backing up n8n data..."
    cp -r "$HOME/.n8n" "$BACKUP_PATH/n8n_data"
    echo "✅ n8n data backed up"
else
    echo "⚠️  n8n data directory not found, skipping..."
fi

# Backup workflows
if [ -d "workflows" ]; then
    echo "📦 Backing up workflows..."
    cp -r workflows "$BACKUP_PATH/"
    echo "✅ Workflows backed up"
fi

# Backup templates
if [ -d "templates" ]; then
    echo "📦 Backing up templates..."
    cp -r templates "$BACKUP_PATH/"
    echo "✅ Templates backed up"
fi

# Backup configs
if [ -d "configs" ]; then
    echo "📦 Backing up configs..."
    cp -r configs "$BACKUP_PATH/"
    echo "✅ Configs backed up"
fi

# Backup data (logs and mailing lists)
if [ -d "data" ]; then
    echo "📦 Backing up data..."
    cp -r data "$BACKUP_PATH/"
    echo "✅ Data backed up"
fi

# Backup environment file (if exists)
if [ -f ".env" ]; then
    echo "📦 Backing up .env file..."
    cp .env "$BACKUP_PATH/"
    echo "✅ .env backed up"
fi

# Create compressed archive
echo ""
echo "📦 Creating compressed archive..."
cd "$BACKUP_DIR"
tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME"
rm -rf "$BACKUP_NAME"
cd ..

BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_NAME.tar.gz" | cut -f1)

echo "✅ Backup created successfully!"
echo ""
echo "========================================="
echo "Backup Details:"
echo "  File: $BACKUP_DIR/$BACKUP_NAME.tar.gz"
echo "  Size: $BACKUP_SIZE"
echo "  Date: $(date)"
echo "========================================="
echo ""

# Optional: Keep only last 5 backups
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.tar.gz 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt 5 ]; then
    echo "Cleaning up old backups (keeping last 5)..."
    ls -t "$BACKUP_DIR"/*.tar.gz | tail -n +6 | xargs rm -f
    echo "✅ Old backups cleaned up"
fi

echo ""
echo "To restore from this backup:"
echo "  tar -xzf $BACKUP_DIR/$BACKUP_NAME.tar.gz"
