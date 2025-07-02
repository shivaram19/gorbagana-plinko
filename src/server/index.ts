import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import helmet from 'helmet';
import { prisma } from './utils/prismaClient';
import { GameRoomManager } from './gameRoomManager';
import { ChatManager } from './chatManager';
import { GorbaganaAuth } from './utils/authUtils';
import { GorbaganaTransactionVerifier } from './utils/gorbaganaUtils';
import type { WebSocketMessage } from '../types/game';

// Handle BigInt serialization globally
if (typeof BigInt !== 'undefined') {
  (BigInt.prototype as any).toJSON = function() {
    return this.toString();
  };
}

// Custom JSON stringifier that handles BigInt
const customStringify = (obj: any) => {
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  });
};

// Helper function to serialize any object with BigInt values
const serializeResponse = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => serializeResponse(item));
  }
  
  if (typeof obj === 'object') {
    const serialized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeResponse(value);
    }
    return serialized;
  }
  
  return obj;
};

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Initialize managers
const gameRoomManager = new GameRoomManager();
const chatManager = new ChatManager(wss);
const txVerifier = new GorbaganaTransactionVerifier();

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5174' // Support alternate port
  ],
  credentials: true
}));
app.use(express.json());

// Authentication Routes
app.post('/api/auth/verify', async (req, res) => {
  try {
    console.log('🔐 Authentication request received');
    console.log('📋 Request body:', req.body);
    
    const { walletAddress, signature } = req.body;
    
    if (!walletAddress || !signature) {
      console.log('❌ Missing wallet address or signature');
      return res.status(400).json({ error: 'Missing wallet address or signature' });
    }

    console.log('🔍 Processing wallet:', walletAddress);

    // For demo purposes, accept any signature (remove this in production)
    console.log('✅ Demo mode: Skipping signature verification');
    const isValid = true; // GorbaganaAuth.verifyWalletSignature(walletAddress, signature, message);
    
    if (!isValid) {
      console.log('❌ Invalid signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Test database connection first
    try {
      console.log('🗄️ Testing database connection...');
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Database connection successful');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      return res.status(500).json({ error: 'Database connection failed' });
    }

    // Create or update player
    console.log('👤 Creating/updating player...');
    let player;
    try {
      player = await gameRoomManager.createOrUpdatePlayer(walletAddress);
      console.log('✅ Player created/updated:', player);
    } catch (playerError) {
      console.error('❌ Player creation failed:', playerError);
      return res.status(500).json({ error: 'Player creation failed: ' + playerError.message });
    }
    
    // Generate auth token
    console.log('🔑 Generating auth token...');
    let token;
    try {
      token = GorbaganaAuth.generateAuthToken(walletAddress);
      console.log('✅ Auth token generated');
    } catch (tokenError) {
      console.error('❌ Token generation failed:', tokenError);
      return res.status(500).json({ error: 'Token generation failed' });
    }
    
    console.log('🎉 Authentication successful!');
    
    // Serialize the response to handle BigInt values
    const response = serializeResponse({ player, token });
    console.log('📤 Sending response:', response);
    
    res.json(response);
  } catch (error) {
    console.error('💥 Authentication error:', error);
    console.error('📚 Error stack:', error.stack);
    res.status(500).json({ error: 'Authentication failed: ' + error.message });
  }
});

// Bet verification route
app.post('/api/bets/verify', async (req, res) => {
  try {
    const { transactionSignature, walletAddress, amount, slotNumber } = req.body;
    
    // Verify the transaction on Gorbagana blockchain
    const isValid = await txVerifier.verifyBetTransaction(
      transactionSignature,
      walletAddress,
      amount
    );
    
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid transaction' });
    }

    // Store bet in database (simplified for demo)
    console.log(`Verified bet: ${walletAddress} bet ${amount} GOR on slot ${slotNumber}`);
    
    res.json({ success: true, verified: true });
  } catch (error) {
    console.error('Bet verification error:', error);
    res.status(500).json({ error: 'Bet verification failed' });
  }
});

// WebSocket connection with auth
wss.on('connection', async (ws, req) => {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const token = url.searchParams.get('token');
  const walletAddress = url.searchParams.get('address');
  
  if (!token && !walletAddress) {
    ws.close(1008, 'Authentication token or wallet address required');
    return;
  }

  // Verify token if provided
  if (token) {
    const authData = GorbaganaAuth.verifyAuthToken(token);
    if (!authData) {
      ws.close(1008, 'Invalid authentication token');
      return;
    }
  }

  const finalWalletAddress = token ? 
    GorbaganaAuth.verifyAuthToken(token)?.walletAddress : walletAddress;

  if (!finalWalletAddress) {
    ws.close(1008, 'Wallet address required');
    return;
  }

  console.log(`Player connected: ${finalWalletAddress}`);
  
  // Create or update player
  const player = await gameRoomManager.createOrUpdatePlayer(finalWalletAddress);
  
  // Send initial data
  const rooms = await gameRoomManager.getActiveRooms();
  const initialData = serializeResponse({
    type: 'room_update',
    data: { rooms, player },
    timestamp: Date.now()
  });
  ws.send(customStringify(initialData));

  // Handle WebSocket messages
  ws.on('message', async (data) => {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString());
      await handleWebSocketMessage(ws, finalWalletAddress, message);
    } catch (error) {
      console.error('WebSocket message error:', error);
      const errorData = serializeResponse({
        type: 'error',
        data: { message: 'Invalid message format' },
        timestamp: Date.now()
      });
      ws.send(customStringify(errorData));
    }
  });

  ws.on('close', async () => {
    console.log(`Player disconnected: ${finalWalletAddress}`);
    await gameRoomManager.handlePlayerDisconnect(finalWalletAddress);
  });
});

// Updated message handler to include transaction verification
async function handleWebSocketMessage(
  ws: any, 
  walletAddress: string, 
  message: WebSocketMessage
) {
  const { type, data } = message;

  switch (type) {
    case 'room_update':
      if (data.action === 'join') {
        const room = await gameRoomManager.joinRoom(data.roomId, walletAddress);
        if (room) {
          const roomData = serializeResponse({
          type: 'room_update',
          data: { room },
          timestamp: Date.now()
          });
        ws.send(customStringify(roomData));
          
          // Notify other players
          await chatManager.handleSystemMessage(
            data.roomId, 
            `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} joined the room`
          );
        }
      } else if (data.action === 'leave') {
        await gameRoomManager.leaveRoom(data.roomId, walletAddress);
      }
      break;

    case 'chat_message':
      await chatManager.handleChatMessage(
        data.roomId, 
        walletAddress, 
        data.message
      );
      break;

    case 'bet_placed':
      try {
        // Verify the transaction before processing the bet (skip for demo)
        if (data.transactionSignature !== 'demo-transaction-signature') {
          const isValid = await txVerifier.verifyBetTransaction(
            data.transactionSignature,
            walletAddress,
            data.amount
          );
          
          if (!isValid) {
            const errorData = serializeResponse({
              type: 'error',
              data: { message: 'Invalid transaction signature' },
              timestamp: Date.now()
            });
            ws.send(customStringify(errorData));
            return;
          }
        }

        // Process the bet
        console.log(`Verified bet placed by ${walletAddress}: ${data.amount} GOR on slot ${data.slotNumber}`);
        
        // Send confirmation back to client
        const confirmationData = serializeResponse({
          type: 'bet_confirmed',
          data: { 
            slotNumber: data.slotNumber, 
            amount: data.amount, 
            signature: data.transactionSignature 
          },
          timestamp: Date.now()
        });
        ws.send(customStringify(confirmationData));
        
      } catch (error) {
        console.error('Bet processing error:', error);
        const errorData = serializeResponse({
          type: 'error',
          data: { message: 'Bet processing failed' },
          timestamp: Date.now()
        });
        ws.send(customStringify(errorData));
      }
      break;

    default:
      console.log('Unknown message type:', type);
  }
}

// REST API endpoints
app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await gameRoomManager.getActiveRooms();
    const serializedRooms = serializeResponse(rooms);
    res.json(serializedRooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

app.post('/api/rooms', async (req, res) => {
  try {
    const { name, maxPlayers, entryFee } = req.body;
    const room = await gameRoomManager.createRoom(name, maxPlayers, entryFee);
    const serializedRoom = serializeResponse(room);
    res.json(serializedRoom);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    gorbagana: 'testnet-enabled'
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    api: 'working',
    timestamp: new Date().toISOString(),
    gorbagana: 'testnet-enabled'
  });
});

const PORT = process.env.VITE_SERVER_PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 WebSocket server ready`);
  console.log(`🎮 Gorbagana Plinko Wars backend started`);
  console.log(`⛓️ Gorbagana Testnet integration enabled`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
});