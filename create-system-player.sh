#!/bin/bash

echo "🔧 Creating System Player for Chat Messages"
echo "=========================================="

# Create system player directly in database
npx prisma db execute --stdin <<EOF
INSERT INTO "game"."players" (
  id, 
  "walletAddress", 
  "displayName", 
  "isSpectator", 
  verified, 
  "joinedAt", 
  "lastActive"
) VALUES (
  'system-player-id',
  'SYSTEM_PLAYER',
  'System',
  true,
  true,
  NOW(),
  NOW()
) ON CONFLICT ("walletAddress") DO UPDATE SET
  "displayName" = 'System',
  "isSpectator" = true,
  verified = true;
EOF

echo "✅ System player created/updated successfully!"
echo ""
echo "🎯 This fixes the foreign key constraint error by:"
echo "- Creating a dedicated 'System' player"
echo "- Using this player for all system messages"
echo "- Maintaining database referential integrity"
echo ""
echo "🚀 Now you can run your application without chat errors!"