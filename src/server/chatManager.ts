import { WebSocketServer } from 'ws';
import { prisma } from './utils/prismaClient';
import type { MessageType } from '../types/game';

export class ChatManager {
  constructor(private wss: WebSocketServer) {
    // Removed automatic system player creation to prevent startup errors
    // System player will be created when first needed
  }

  private async ensureSystemPlayer() {
    try {
      await prisma.player.upsert({
        where: { walletAddress: 'SYSTEM_PLAYER' },
        update: { 
          displayName: 'System',
          lastActive: new Date()
        },
        create: {
          walletAddress: 'SYSTEM_PLAYER',
          displayName: 'System',
          isSpectator: true,
          verified: true
        }
      });
    } catch (error) {
      console.error('Error ensuring system player exists:', error);
    }
  }

  async handleChatMessage(roomId: string, walletAddress: string, message: string) {
    try {
      // Get player
      const player = await prisma.player.findUnique({
        where: { walletAddress }
      });

      if (!player || player.roomId !== roomId) {
        throw new Error('Player not in room');
      }

      // Create chat message
      const chatMessage = await prisma.chatMessage.create({
        data: {
          roomId,
          playerId: player.id,
          message,
          type: 'CHAT'
        },
        include: {
          player: {
            select: {
              walletAddress: true,
              displayName: true
            }
          }
        }
      });

      // Broadcast to all room participants
      this.broadcastToRoom(roomId, {
        type: 'chat_message',
        data: chatMessage,
        timestamp: Date.now()
      });

      return chatMessage;
    } catch (error) {
      console.error('Error handling chat message:', error);
      throw error;
    }
  }

  async handleSystemMessage(roomId: string, message: string) {
    try {
      // Get or create system player
      const systemPlayer = await prisma.player.upsert({
        where: { walletAddress: 'SYSTEM_PLAYER' },
        update: { lastActive: new Date() },
        create: {
          walletAddress: 'SYSTEM_PLAYER',
          displayName: 'System',
          isSpectator: true,
          verified: true
        }
      });

      const systemMessage = await prisma.chatMessage.create({
        data: {
          roomId,
          playerId: systemPlayer.id,
          message,
          type: 'SYSTEM'
        },
        include: {
          player: {
            select: {
              walletAddress: true,
              displayName: true
            }
          }
        }
      });

      this.broadcastToRoom(roomId, {
        type: 'chat_message',
        data: systemMessage,
        timestamp: Date.now()
      });

      return systemMessage;
    } catch (error) {
      console.error('Error handling system message:', error);
      // Don't throw error for system messages - they're not critical
      return null;
    }
  }

  async getChatHistory(roomId: string, limit = 50) {
    try {
      return await prisma.chatMessage.findMany({
        where: { roomId },
        include: {
          player: {
            select: {
              walletAddress: true,
              displayName: true
            }
          }
        },
        orderBy: { timestamp: 'desc' },
        take: limit
      });
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }

  private broadcastToRoom(roomId: string, message: any) {
    // This is a simplified broadcast - in production you'd want to 
    // maintain a mapping of WebSocket connections to rooms
    this.wss.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        try {
          client.send(JSON.stringify(message));
        } catch (error) {
          console.error('Error broadcasting message:', error);
        }
      }
    });
  }
}