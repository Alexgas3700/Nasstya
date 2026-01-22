#!/bin/bash

# Setup Script for n8n Email Campaign System

echo "========================================="
echo "n8n Email Campaign System - Setup"
echo "========================================="
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo "⚠️  Warning: Running as root is not recommended"
    echo ""
fi

# Create necessary directories
echo "📁 Creating directory structure..."
mkdir -p data/logs
mkdir -p data/mailing_lists
mkdir -p backups
touch data/mailing_lists/.gitkeep
echo "✅ Directories created"
echo ""

# Copy example files
echo "📄 Setting up example files..."
if [ ! -f "data/mailing_lists/mailing_list_example.csv" ]; then
    cp configs/mailing_list_example.csv data/mailing_lists/
    echo "✅ Example mailing list copied"
fi

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ .env file created from example"
    echo "⚠️  Please edit .env file with your settings!"
else
    echo "ℹ️  .env file already exists, skipping..."
fi
echo ""

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x scripts/*.sh
echo "✅ Scripts are now executable"
echo ""

# Check for Docker
echo "🐳 Checking for Docker..."
if command -v docker &> /dev/null; then
    echo "✅ Docker is installed"
    DOCKER_VERSION=$(docker --version)
    echo "   $DOCKER_VERSION"
    
    if command -v docker-compose &> /dev/null; then
        echo "✅ Docker Compose is installed"
        COMPOSE_VERSION=$(docker-compose --version)
        echo "   $COMPOSE_VERSION"
    else
        echo "⚠️  Docker Compose is not installed"
        echo "   Install it from: https://docs.docker.com/compose/install/"
    fi
else
    echo "⚠️  Docker is not installed"
    echo "   Install it from: https://docs.docker.com/get-docker/"
fi
echo ""

# Check for Node.js
echo "📦 Checking for Node.js..."
if command -v node &> /dev/null; then
    echo "✅ Node.js is installed"
    NODE_VERSION=$(node --version)
    echo "   $NODE_VERSION"
    
    # Check if n8n is installed
    if command -v n8n &> /dev/null; then
        echo "✅ n8n is installed"
        N8N_VERSION=$(n8n --version)
        echo "   n8n version: $N8N_VERSION"
    else
        echo "⚠️  n8n is not installed"
        echo "   Install it with: npm install -g n8n"
    fi
else
    echo "⚠️  Node.js is not installed"
    echo "   Install it from: https://nodejs.org/"
fi
echo ""

# Check for required tools
echo "🔧 Checking for required tools..."
TOOLS=("curl" "jq" "git")
for tool in "${TOOLS[@]}"; do
    if command -v "$tool" &> /dev/null; then
        echo "✅ $tool is installed"
    else
        echo "⚠️  $tool is not installed (optional but recommended)"
    fi
done
echo ""

# Summary
echo "========================================="
echo "Setup Summary"
echo "========================================="
echo ""
echo "✅ Directory structure created"
echo "✅ Example files copied"
echo "✅ Scripts made executable"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Choose installation method:"
echo "   - Docker: docker-compose up -d"
echo "   - npm: n8n start"
echo "3. Import workflow from workflows/email_campaign.json"
echo "4. Configure email service credentials in n8n"
echo "5. Read documentation/user_guide.md for detailed instructions"
echo ""
echo "========================================="
echo "Setup complete! 🎉"
echo "========================================="
