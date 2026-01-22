#!/bin/bash

# Test Email Script
# This script tests the email campaign workflow by sending a test email

echo "========================================="
echo "Email Campaign System - Test Script"
echo "========================================="
echo ""

# Check if n8n is running
if ! curl -s http://localhost:5678/healthz > /dev/null; then
    echo "❌ Error: n8n is not running!"
    echo "Please start n8n first:"
    echo "  - npm: n8n start"
    echo "  - docker: docker-compose up -d"
    exit 1
fi

echo "✅ n8n is running"
echo ""

# Get webhook URL (you need to replace this with your actual webhook URL)
WEBHOOK_URL="http://localhost:5678/webhook/email-campaign"

# Test data
TEST_EMAIL="${1:-test@example.com}"
TEST_FIRSTNAME="${2:-Test}"
TEST_LASTNAME="${3:-User}"

echo "Sending test email to: $TEST_EMAIL"
echo "Name: $TEST_FIRSTNAME $TEST_LASTNAME"
echo ""

# Send test request
RESPONSE=$(curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"campaign_name\": \"Test Campaign\",
    \"template_name\": \"template_example\",
    \"sender_email\": \"noreply@example.com\",
    \"sender_name\": \"Test Sender\",
    \"test_mode\": true,
    \"recipients\": [
      {
        \"email\": \"$TEST_EMAIL\",
        \"firstName\": \"$TEST_FIRSTNAME\",
        \"lastName\": \"$TEST_LASTNAME\"
      }
    ]
  }")

if [ $? -eq 0 ]; then
    echo "✅ Request sent successfully!"
    echo ""
    echo "Response:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
else
    echo "❌ Failed to send request"
    exit 1
fi

echo ""
echo "========================================="
echo "Please check your email inbox for the test message"
echo "========================================="
