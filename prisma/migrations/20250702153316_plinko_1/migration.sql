-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "chat";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "game";

-- CreateEnum
CREATE TYPE "game"."GameState" AS ENUM ('WAITING', 'BETTING', 'BALL_DROP', 'RESULTS', 'FINISHED');

-- CreateEnum
CREATE TYPE "chat"."MessageType" AS ENUM ('CHAT', 'SYSTEM', 'BET_PLACED', 'GAME_EVENT');

-- CreateTable
CREATE TABLE "game"."rooms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "maxPlayers" INTEGER NOT NULL DEFAULT 12,
    "entryFee" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "currentRound" INTEGER NOT NULL DEFAULT 0,
    "gameState" "game"."GameState" NOT NULL DEFAULT 'WAITING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game"."players" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "displayName" TEXT,
    "roomId" TEXT,
    "isSpectator" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalGames" INTEGER NOT NULL DEFAULT 0,
    "totalWinnings" INTEGER NOT NULL DEFAULT 0,
    "favoriteSlots" JSONB,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat"."chat_messages" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "chat"."MessageType" NOT NULL DEFAULT 'CHAT',

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game"."game_rounds" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "randomSeed" TEXT,
    "winningSlot" INTEGER,
    "ballPath" JSONB,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),

    CONSTRAINT "game_rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game"."bets" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "slotNumber" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "multiplier" DOUBLE PRECISION NOT NULL,
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "payout" INTEGER NOT NULL DEFAULT 0,
    "placedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "players_walletAddress_key" ON "game"."players"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "game_rounds_roomId_roundNumber_key" ON "game"."game_rounds"("roomId", "roundNumber");

-- AddForeignKey
ALTER TABLE "game"."players" ADD CONSTRAINT "players_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "game"."rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat"."chat_messages" ADD CONSTRAINT "chat_messages_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "game"."rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat"."chat_messages" ADD CONSTRAINT "chat_messages_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "game"."players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game"."game_rounds" ADD CONSTRAINT "game_rounds_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "game"."rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game"."bets" ADD CONSTRAINT "bets_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "game"."players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game"."bets" ADD CONSTRAINT "bets_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "game"."game_rounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
