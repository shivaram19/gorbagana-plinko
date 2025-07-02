#!/bin/bash

echo "🔍 JWT Secret Security Checker"
echo "============================="

# Get the current JWT secret from .env
if [ -f .env ]; then
    JWT_SECRET=$(grep "JWT_SECRET" .env | cut -d'"' -f2)
    
    echo "📏 Current JWT Secret Analysis:"
    echo "Length: ${#JWT_SECRET} characters"
    
    # Check if it's the default placeholder
    if [ "$JWT_SECRET" = "your-super-secret-jwt-key-here" ]; then
        echo "❌ SECURITY RISK: Using default placeholder secret!"
        echo "🚨 This is NOT secure for production!"
    elif [ ${#JWT_SECRET} -lt 32 ]; then
        echo "⚠️ WARNING: Secret is too short (should be at least 32 characters)"
    elif [ ${#JWT_SECRET} -ge 64 ]; then
        echo "✅ EXCELLENT: Secret is sufficiently long"
    elif [ ${#JWT_SECRET} -ge 32 ]; then
        echo "✅ GOOD: Secret meets minimum length requirements"
    fi
    
    # Check for entropy (basic test)
    unique_chars=$(echo "$JWT_SECRET" | grep -o . | sort -u | wc -l | tr -d ' ')
    if [ "$unique_chars" -lt 10 ]; then
        echo "⚠️ WARNING: Low character diversity (only $unique_chars unique characters)"
    else
        echo "✅ GOOD: Good character diversity ($unique_chars unique characters)"
    fi
    
    echo ""
    echo "🎯 Recommendations:"
    if [ "$JWT_SECRET" = "your-super-secret-jwt-key-here" ] || [ ${#JWT_SECRET} -lt 32 ]; then
        echo "1. Generate a new secret using: ./generate-jwt-secret.sh"
        echo "2. Use at least 32 characters (64+ recommended)"
        echo "3. Include uppercase, lowercase, numbers, and symbols"
    else
        echo "✅ Your JWT secret appears to be secure!"
    fi
else
    echo "❌ No .env file found!"
    echo "Please create a .env file with JWT_SECRET"
fi