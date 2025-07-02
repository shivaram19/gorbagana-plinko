import { WebSocketServer } from 'ws';
import { prisma } from './utils/prismaClient';
import type { MessageType } from '../types/game';

export class ChatManager {
  constructor(private wss: WebSocketServer) {
    // No longer needs PrismaClient as a dependency - uses singleton
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
    }
  }

  async handleSystemMessage(roomId: string, message: string) {
    try {
      const systemMessage = await prisma.chatMessage.create({
        data: {
          roomId,
          playerId: 'system',
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
    }
  }

  async getChatHistory(roomId: string, limit = 50) {
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
  }

  private broadcastToRoom(roomId: string, message: any) {
    // This is a simplified broadcast - in production you'd want to 
    // maintain a mapping of WebSocket connections to rooms
    this.wss.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(JSON.stringify(message));
      }
    });
  }
}