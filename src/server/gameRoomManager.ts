import { prisma } from './utils/prismaClient';
import type { Room, Player } from '../types/game';

export class GameRoomManager {
  constructor() {
    // No longer needs PrismaClient as a dependency - uses singleton
  }

  async createRoom(name: string, maxPlayers: number, entryFee: number) {
    return await prisma.room.create({
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
            joinedAt: true
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
      playerCount: room._count.players
    }));
  }

  async joinRoom(roomId: string, walletAddress: string, isSpectator = false) {
    try {
      return await prisma.$transaction(async (tx) => {
        const room = await tx.room.findUnique({
          where: { id: roomId },
          include: { _count: { select: { players: true } } }
        });

        if (!room || !room.isActive) {
          throw new Error('Room not found or inactive');
        }

        // TESTING MODE: Remove player limit check to allow unlimited players
        // This allows for testing with any number of players
        // if (!isSpectator && room._count.players >= room.maxPlayers) {
        //   throw new Error('Room is full');
        // }

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
    return await prisma.player.upsert({
      where: { walletAddress },
      update: { lastActive: new Date() },
      create: { walletAddress }
    });
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

  // TESTING MODE: Allow single player games
  async canStartGame(roomId: string): Promise<boolean> {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { _count: { select: { players: true } } }
    });

    // In testing mode, allow games to start with just 1 player
    return room ? room._count.players >= 1 : false;
  }

  // TESTING MODE: Modified game state management for single players
  async updateGameState(roomId: string, gameState: string) {
    return await prisma.room.update({
      where: { id: roomId },
      data: { gameState: gameState as any }
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