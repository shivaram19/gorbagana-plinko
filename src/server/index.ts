import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import helmet from 'helmet';
// import jwt from 'jsonwebtoken';
import { prisma } from './utils/prismaClient';
import { GameRoomManager } from './gameRoomManager';
import { ChatManager } from './chatManager';
import { PhysicsEngine } from './physicsEngine';
import type { WebSocketMessage } from '../types/game';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Initialize managers using singleton pattern
const gameRoomManager = new GameRoomManager();
const chatManager = new ChatManager(wss);
const physicsEngine = new PhysicsEngine();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// WebSocket connection handling
wss.on('connection', async (ws, req) => {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const walletAddress = url.searchParams.get('address');
  
  if (!walletAddress) {
    ws.close(1008, 'Wallet address required');
    return;
  }

  console.log(`Player connected: ${walletAddress}`);
  
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
      await handleWebSocketMessage(ws, walletAddress, message);
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
    await gameRoomManager.handlePlayerDisconnect(walletAddress);
  });
});

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

          // TESTING MODE: Auto-start betting phase for single player
          if (room.playerCount >= 1 && room.gameState === 'WAITING') {
            setTimeout(async () => {
              await gameRoomManager.updateGameState(data.roomId, 'BETTING');
              await chatManager.handleSystemMessage(
                data.roomId, 
                '🎮 Betting phase started! Place your bets.'
              );
              
              // Broadcast game state change
              broadcastToRoom(data.roomId, {
                type: 'game_state_change',
                data: { gameState: 'BETTING' },
                timestamp: Date.now()
              });
            }, 2000); // 2 second delay
          }
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
      // TESTING MODE: Handle zero amount bets
      const betAmount = data.amount || 0; // Allow 0 bets
      console.log(`Bet placed by ${walletAddress}: ${betAmount} GOR on slot ${data.slotNumber}`);
      
      // Store the bet in database
      try {
        const player = await prisma.player.findUnique({
          where: { walletAddress }
        });

        if (player && player.roomId) {
          // Get or create current round
          let currentRound = await prisma.gameRound.findFirst({
            where: { 
              roomId: player.roomId,
              endTime: null
            }
          });

          if (!currentRound) {
            currentRound = await gameRoomManager.startGameRound(player.roomId);
          }

          // Create bet record (even for 0 amount)
          await prisma.bet.create({
            data: {
              playerId: player.id,
              roundId: currentRound.id,
              slotNumber: data.slotNumber,
              amount: betAmount,
              multiplier: getSlotMultiplier(data.slotNumber)
            }
          });

          // Notify room about bet
          await chatManager.handleSystemMessage(
            player.roomId,
            betAmount === 0 
              ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} placed a test bet on slot ${data.slotNumber}`
              : `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} bet ${betAmount} GOR on slot ${data.slotNumber}`
          );

          // TESTING MODE: Auto-trigger ball drop after bet (for single player testing)
          setTimeout(async () => {
            if (player.roomId) {
              await triggerBallDrop(player.roomId, currentRound.id);
            }
          }, 3000); // 3 second delay
        }
      } catch (error) {
        console.error('Error handling bet:', error);
      }
      break;

    default:
      console.log('Unknown message type:', type);
  }
}

// Helper function to get slot multiplier
function getSlotMultiplier(slotNumber: number): number {
  const multipliers: { [key: number]: number } = {
    1: 8, 2: 3, 3: 2, 4: 1.5, 5: 1.2, 6: 1.1, 7: 1, 8: 5,
    9: 1, 10: 1.1, 11: 1.2, 12: 1.5, 13: 2, 14: 3, 15: 8
  };
  return multipliers[slotNumber] || 1;
}

// TESTING MODE: Auto ball drop function
async function triggerBallDrop(roomId: string, roundId: string) {
  try {
    // Update game state to ball drop
    await gameRoomManager.updateGameState(roomId, 'BALL_DROP');
    
    // Generate ball physics
    const { path, winningSlot } = physicsEngine.generateBallPath(`test-${Date.now()}`);
    
    // Update round with results
    await prisma.gameRound.update({
      where: { id: roundId },
      data: {
        winningSlot,
        ballPath: path,
        endTime: new Date()
      }
    });

    // Broadcast ball drop
    broadcastToRoom(roomId, {
      type: 'ball_drop',
      data: { path, winningSlot },
      timestamp: Date.now()
    });

    // Calculate winnings and update bets
    const bets = await prisma.bet.findMany({
      where: { roundId },
      include: { player: true }
    });

    for (const bet of bets) {
      const isWinner = bet.slotNumber === winningSlot;
      const payout = isWinner ? bet.amount * bet.multiplier : 0;

      await prisma.bet.update({
        where: { id: bet.id },
        data: { isWinner, payout }
      });

      if (isWinner) {
        // Update player stats (even for 0 amount wins)
        await prisma.player.update({
          where: { id: bet.playerId },
          data: {
            totalGames: { increment: 1 },
            totalWinnings: { increment: Math.floor(payout) }
          }
        });
      }
    }

    // Show results
    setTimeout(async () => {
      await gameRoomManager.updateGameState(roomId, 'RESULTS');
      await chatManager.handleSystemMessage(
        roomId,
        `🎯 Ball landed in slot ${winningSlot}! ${bets.filter(b => b.slotNumber === winningSlot).length} winner(s)!`
      );

      // Reset to waiting after results
      setTimeout(async () => {
        await gameRoomManager.updateGameState(roomId, 'WAITING');
        broadcastToRoom(roomId, {
          type: 'game_state_change',
          data: { gameState: 'WAITING' },
          timestamp: Date.now()
        });
      }, 3000);
    }, 5000); // Show results for 5 seconds

  } catch (error) {
    console.error('Error in ball drop:', error);
  }
}

// Broadcast helper function
function broadcastToRoom(roomId: string, message: any) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify(message));
    }
  });
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
    // TESTING MODE: Allow 0 entry fee
    const room = await gameRoomManager.createRoom(name, maxPlayers, entryFee || 0);
    res.json(room);
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
    testingMode: true,
    features: {
      zeroBetting: true,
      singlePlayer: true,
      autoGameFlow: true
    }
  });
});

const PORT = process.env.VITE_SERVER_PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 WebSocket server ready`);
  console.log(`🧪 TESTING MODE: Zero betting & single player enabled`);
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