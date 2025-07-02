import dotenv from 'dotenv'
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import helmet from 'helmet';
// import jwt from 'jsonwebtoken';
import { prisma } from './utils/prismaClient';
import { GameRoomManager } from './gameRoomManager';
import { ChatManager } from './chatManager';
// import { PhysicsEngine } from './physicsEngine';
import type { WebSocketMessage } from '../types/game';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Initialize managers using singleton pattern
const gameRoomManager = new GameRoomManager();
const chatManager = new ChatManager(wss);
// const physicsEngine = new PhysicsEngine();

// Store WebSocket connections with room mapping
const connections = new Map<string, { ws: any, walletAddress: string, roomId?: string }>();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Broadcast to all connected clients
function broadcastToAll(message: any) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify(message));
    }
  });
}

// Broadcast to specific room
function broadcastToRoom(roomId: string, message: any) {
  connections.forEach((connection) => {
    if (connection.roomId === roomId && connection.ws.readyState === 1) {
      connection.ws.send(JSON.stringify(message));
    }
  });
}

// WebSocket connection handling
wss.on('connection', async (ws, req) => {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const walletAddress = url.searchParams.get('address');
  
  if (!walletAddress) {
    ws.close(1008, 'Wallet address required');
    return;
  }

  console.log(`Player connected: ${walletAddress}`);
  
  // Store connection
  const connectionId = `${walletAddress}-${Date.now()}`;
  connections.set(connectionId, { ws, walletAddress });
  
  // Create or update player
  const player = await gameRoomManager.createOrUpdatePlayer(walletAddress);
  
  // Send initial data
  const rooms = await gameRoomManager.getActiveRooms();
  ws.send(JSON.stringify({
    type: 'room_update',
    data: { rooms, player },
    timestamp: Date.now()
  }));

  // Handle WebSocket messages
  ws.on('message', async (data) => {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString());
      await handleWebSocketMessage(ws, walletAddress, message, connectionId);
    } catch (error) {
      console.error('WebSocket message error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: 'Invalid message format' },
        timestamp: Date.now()
      }));
    }
  });

  ws.on('close', async () => {
    console.log(`Player disconnected: ${walletAddress}`);
    connections.delete(connectionId);
    await gameRoomManager.handlePlayerDisconnect(walletAddress);
  });
});

async function handleWebSocketMessage(
  ws: any, 
  walletAddress: string, 
  message: WebSocketMessage,
  connectionId: string
) {
  const { type, data } = message;

  switch (type) {
    case 'room_update':
      if (data.action === 'join') {
        const room = await gameRoomManager.joinRoom(data.roomId, walletAddress);
        if (room) {
          // Update connection with room ID
          const connection = connections.get(connectionId);
          if (connection) {
            connection.roomId = data.roomId;
          }
          
          ws.send(JSON.stringify({
            type: 'room_update',
            data: { room },
            timestamp: Date.now()
          }));
          
          // Notify other players
          await chatManager.handleSystemMessage(
            data.roomId, 
            `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} joined the room`
          );
          
          // Broadcast updated room list to all clients
          const updatedRooms = await gameRoomManager.getActiveRooms();
          broadcastToAll({
            type: 'room_update',
            data: { rooms: updatedRooms },
            timestamp: Date.now()
          });
        }
      } else if (data.action === 'leave') {
        await gameRoomManager.leaveRoom(data.roomId, walletAddress);
        
        // Update connection
        const connection = connections.get(connectionId);
        if (connection) {
          connection.roomId = undefined;
        }
        
        // Broadcast updated room list to all clients
        const updatedRooms = await gameRoomManager.getActiveRooms();
        broadcastToAll({
          type: 'room_update',
          data: { rooms: updatedRooms },
          timestamp: Date.now()
        });
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
      // Handle bet placement logic
      console.log(`Bet placed by ${walletAddress}: ${data.amount} on slot ${data.slotNumber}`);
      break;

    default:
      console.log('Unknown message type:', type);
  }
}

// REST API endpoints
app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await gameRoomManager.getActiveRooms();
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

app.post('/api/rooms', async (req, res) => {
  try {
    const { name, maxPlayers, entryFee } = req.body;
    
    // Validate input
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Room name is required' });
    }
    
    if (!maxPlayers || maxPlayers < 2 || maxPlayers > 12) {
      return res.status(400).json({ error: 'Max players must be between 2 and 12' });
    }
    
    if (!entryFee || entryFee < 0) {
      return res.status(400).json({ error: 'Entry fee must be a positive number' });
    }
    
    console.log('Creating room:', { name, maxPlayers, entryFee });
    
    // Create the room
    const room = await gameRoomManager.createRoom(name.trim(), maxPlayers, entryFee);
    
    console.log('Room created successfully:', room.id);
    
    // Get updated room list
    const updatedRooms = await gameRoomManager.getActiveRooms();
    
    // Broadcast the updated room list to all connected clients
    broadcastToAll({
      type: 'room_update',
      data: { rooms: updatedRooms },
      timestamp: Date.now()
    });
    
    // Send system message to notify about new room
    console.log(`Broadcasting new room "${name}" to ${wss.clients.size} connected clients`);
    
    res.status(201).json(room);
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
    connections: connections.size,
    wsClients: wss.clients.size
  });
});

const PORT = process.env.VITE_SERVER_PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 WebSocket server ready`);
  console.log(`🎮 Gorbagana Plinko Wars backend started`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
});