#!/bin/bash

echo "🔐 Generating Secure JWT Secret Key"
echo "=================================="

echo "🎲 Method 1: OpenSSL (Recommended)"
echo "JWT_SECRET=\"$(openssl rand -base64 64)\""
echo ""

echo "🎲 Method 2: Node.js crypto"
node -e "console.log('JWT_SECRET=\"' + require('crypto').randomBytes(64).toString('base64') + '\"')"
echo ""

echo "🎲 Method 3: Strong Random String"
node -e "
const crypto = require('crypto');
const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
let result = '';
for (let i = 0; i < 64; i++) {
  result += charset.charAt(Math.floor(crypto.randomInt(0, charset.length)));
}
console.log('JWT_SECRET=\"' + result + '\"');
"
echo ""

echo "📋 Instructions:"
echo "1. Copy one of the JWT_SECRET lines above"
echo "2. Replace the current JWT_SECRET in your .env file"
echo "3. Keep this secret secure and never commit it to version control"
echo ""
echo "⚠️ Security Tips:"
echo "- Use at least 256 bits (32 bytes) of entropy"
echo "- Never use predictable values"
echo "- Different secret for each environment (dev, staging, prod)"
echo "- Rotate secrets periodically"