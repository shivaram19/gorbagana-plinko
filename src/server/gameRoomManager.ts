import { prisma } from './utils/prismaClient';
import type { Room, Player } from '../types/game';

export class GameRoomManager {
  constructor() {
    // No longer needs PrismaClient as a dependency - uses singleton
  }

  // Helper function to convert BigInt to string for JSON serialization
  private serializePlayer(player: any) {
    return {
      ...player,
      totalWinnings: player.totalWinnings ? player.totalWinnings.toString() : "0"
    };
  }

  async createRoom(name: string, maxPlayers: number, entryFee: number) {
    const room = await prisma.room.create({
      data: {
        name,
        maxPlayers,
        entryFee,
      },
      include: {
        players: true,
        _count: {
          select: { players: true }
        }
      }
    });

    return {
      ...room,
      players: room.players.map(player => this.serializePlayer(player))
    };
  }

  async getActiveRooms() {
    const rooms = await prisma.room.findMany({
      where: { isActive: true },
      include: {
        players: {
          select: {
            id: true,
            walletAddress: true,
            displayName: true,
            isSpectator: true,
            joinedAt: true,
            totalWinnings: true
          }
        },
        _count: {
          select: { players: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return rooms.map(room => ({
      ...room,
      playerCount: room._count.players,
      players: room.players.map(player => this.serializePlayer(player))
    }));
  }

  async joinRoom(roomId: string, walletAddress: string, isSpectator = false) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const room = await tx.room.findUnique({
          where: { id: roomId },
          include: { _count: { select: { players: true } } }
        });

        if (!room || !room.isActive) {
          throw new Error('Room not found or inactive');
        }

        if (!isSpectator && room._count.players >= room.maxPlayers) {
          throw new Error('Room is full');
        }

        // Update or create player
        const player = await tx.player.upsert({
          where: { walletAddress },
          update: { 
            roomId, 
            isSpectator, 
            lastActive: new Date() 
          },
          create: { 
            walletAddress, 
            roomId, 
            isSpectator 
          }
        });

        // Return updated room
        return await tx.room.findUnique({
          where: { id: roomId },
          include: {
            players: true,
            _count: { select: { players: true } }
          }
        });
      });

      if (result) {
        return {
          ...result,
          players: result.players.map(player => this.serializePlayer(player))
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error joining room:', error);
      return null;
    }
  }

  async leaveRoom(roomId: string, walletAddress: string) {
    try {
      await prisma.player.update({
        where: { walletAddress },
        data: { roomId: null }
      });
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  }

  async createOrUpdatePlayer(walletAddress: string) {
    console.log('👤 Creating/updating player in database...');
    
    try {
      const player = await prisma.player.upsert({
        where: { walletAddress },
        update: { 
          lastActive: new Date(),
          verified: true  // Mark as verified since they passed auth
        },
        create: { 
          walletAddress,
          verified: true,
          totalWinnings: BigInt(0) // Explicitly set BigInt
        }
      });

      console.log('✅ Raw player from database:', player);
      
      // Convert BigInt to string for JSON serialization
      const serializedPlayer = this.serializePlayer(player);
      
      console.log('✅ Serialized player:', serializedPlayer);
      
      return serializedPlayer;
    } catch (error) {
      console.error('❌ Error in createOrUpdatePlayer:', error);
      console.error('📚 Error details:', error.message);
      throw error;
    }
  }

  async handlePlayerDisconnect(walletAddress: string) {
    try {
      await prisma.player.update({
        where: { walletAddress },
        data: { lastActive: new Date() }
      });
    } catch (error) {
      console.error('Error handling player disconnect:', error);
    }
  }

  async startGameRound(roomId: string) {
    return await prisma.gameRound.create({
      data: {
        roomId,
        roundNumber: await this.getNextRoundNumber(roomId)
      }
    });
  }

  private async getNextRoundNumber(roomId: string): Promise<number> {
    const latestRound = await prisma.gameRound.findFirst({
      where: { roomId },
      orderBy: { roundNumber: 'desc' }
    });
    
    return (latestRound?.roundNumber || 0) + 1;
  }
}