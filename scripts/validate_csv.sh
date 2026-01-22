#!/bin/bash

# CSV Validation Script
# Validates mailing list CSV files

echo "========================================="
echo "Mailing List CSV Validator"
echo "========================================="
echo ""

CSV_FILE="${1:-data/mailing_lists/mailing_list_example.csv}"

if [ ! -f "$CSV_FILE" ]; then
    echo "❌ Error: File not found: $CSV_FILE"
    exit 1
fi

echo "Validating: $CSV_FILE"
echo ""

# Check if file is empty
if [ ! -s "$CSV_FILE" ]; then
    echo "❌ Error: File is empty"
    exit 1
fi

# Read header
HEADER=$(head -n 1 "$CSV_FILE")
echo "Header: $HEADER"
echo ""

# Check required fields
REQUIRED_FIELDS=("email" "firstName" "lastName")
MISSING_FIELDS=()

for field in "${REQUIRED_FIELDS[@]}"; do
    if ! echo "$HEADER" | grep -q "$field"; then
        MISSING_FIELDS+=("$field")
    fi
done

if [ ${#MISSING_FIELDS[@]} -gt 0 ]; then
    echo "❌ Error: Missing required fields:"
    for field in "${MISSING_FIELDS[@]}"; do
        echo "  - $field"
    done
    exit 1
fi

echo "✅ All required fields present"
echo ""

# Count records (excluding header)
RECORD_COUNT=$(($(wc -l < "$CSV_FILE") - 1))
echo "Total records: $RECORD_COUNT"
echo ""

# Validate email addresses
echo "Validating email addresses..."
INVALID_EMAILS=0
LINE_NUM=1

while IFS=, read -r email rest; do
    LINE_NUM=$((LINE_NUM + 1))
    
    # Skip header
    if [ $LINE_NUM -eq 2 ]; then
        continue
    fi
    
    # Simple email validation
    if ! echo "$email" | grep -qE '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'; then
        echo "⚠️  Line $LINE_NUM: Invalid email: $email"
        INVALID_EMAILS=$((INVALID_EMAILS + 1))
    fi
done < "$CSV_FILE"

echo ""
if [ $INVALID_EMAILS -eq 0 ]; then
    echo "✅ All email addresses are valid"
else
    echo "⚠️  Found $INVALID_EMAILS invalid email address(es)"
fi

echo ""

# Check for duplicates
echo "Checking for duplicate emails..."
DUPLICATES=$(tail -n +2 "$CSV_FILE" | cut -d',' -f1 | sort | uniq -d)

if [ -z "$DUPLICATES" ]; then
    echo "✅ No duplicate emails found"
else
    echo "⚠️  Found duplicate emails:"
    echo "$DUPLICATES"
fi

echo ""
echo "========================================="
echo "Validation complete!"
echo "========================================="
