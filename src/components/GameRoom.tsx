import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { GameBoard } from './GameBoard';
import { ChatPanel } from './ChatPanel';
import { BettingPanel } from './BettingPanel';
import { PlayerStats } from './PlayerStats';

export const GameRoom: React.FC = () => {
  const { roomId } = useParams();
  const { currentRoom, currentPlayer } = useGameStore();

  // Redirect to rooms if no current room
  if (!currentRoom) {
    return <Navigate to="/rooms" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Room Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {currentRoom.name}
          </h1>
          <p className="text-gray-400 mt-1">
            Round #{currentRoom.currentRound} • {currentRoom.playerCount}/{currentRoom.maxPlayers} players
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg">
            <span className="text-sm text-gray-400">Entry Fee: </span>
            <span className="text-yellow-400 font-semibold">{currentRoom.entryFee} GOR</span>
          </div>
          
          <div className={`
            px-4 py-2 rounded-lg font-semibold text-sm
            ${currentRoom.gameState === 'WAITING' ? 'bg-green-500/20 text-green-400' :
              currentRoom.gameState === 'BETTING' ? 'bg-yellow-500/20 text-yellow-400' :
              currentRoom.gameState === 'BALL_DROP' ? 'bg-red-500/20 text-red-400' :
              'bg-gray-500/20 text-gray-400'}
          `}>
            {currentRoom.gameState === 'WAITING' && 'Waiting for Players'}
            {currentRoom.gameState === 'BETTING' && 'Betting Open'}
            {currentRoom.gameState === 'BALL_DROP' && 'Ball Dropping'}
            {currentRoom.gameState === 'RESULTS' && 'Showing Results'}
          </div>
        </div>
      </div>

      {/* Main Game Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel - Player Stats */}
        <div className="lg:col-span-1">
          <PlayerStats />
        </div>

        {/* Center - Game Board */}
        <div className="lg:col-span-2">
          <GameBoard />
        </div>

        {/* Right Panel - Betting & Chat */}
        <div className="lg:col-span-1 space-y-6">
          <BettingPanel />
          <div className="h-96">
            <ChatPanel />
          </div>
        </div>
      </div>
    </div>
  );
};